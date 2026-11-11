// The fake device covers a working camera. Failures that only real hardware produces are made with a mocked getUserMedia.
import { expect, test } from '@playwright/test'
import { allowCameraMock, failCamera, makePhoto, openBeforeYouStart, openCapture, pickFile } from './helpers.js'

const shutter = (page) => page.getByRole('button', { name: 'Take photo' })
const CAPTURE_ERRORS = { NotAllowedError: 'Camera access is blocked', NotFoundError: 'No camera found', NotReadableError: 'Camera is busy', OverconstrainedError: "Camera couldn't start" }
const firstTrackState = (page) => page.evaluate(() => window.__track.readyState)

async function rememberTrack(page) {
  await expect(shutter(page)).toBeEnabled()
  await page.evaluate(() => {
    window.__track = document.querySelector('video').srcObject.getVideoTracks()[0]
  })
}

async function openFailingCapture(page, errorName) {
  await openBeforeYouStart(page)
  await page.getByRole('button', { name: 'Allow camera permissions' }).click()
  await expect(page.getByText('Camera allowed')).toBeVisible()
  await failCamera(page, errorName)
  await page.getByRole('button', { name: 'Open camera' }).click()
}

async function mockTorch(page, fails) {
  await page.addInitScript((fails) => {
    let on = false
    const { getCapabilities, getSettings } = MediaStreamTrack.prototype
    MediaStreamTrack.prototype.getCapabilities = function () {
      return { ...getCapabilities.call(this), torch: true }
    }
    MediaStreamTrack.prototype.getSettings = function () {
      return { ...getSettings.call(this), torch: on }
    }
    MediaStreamTrack.prototype.applyConstraints = async function (constraints) {
      if (fails) throw new DOMException('test', 'OverconstrainedError')
      on = constraints.advanced[0].torch
    }
  }, fails)
}

const setHidden = (page, hidden) => page.evaluate((hidden) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') })
  document.dispatchEvent(new Event('visibilitychange'))
}, hidden)

test.describe('asking for permission', () => {
  test.beforeEach(({ page }) => allowCameraMock(page))

  test('denied shows the steps, and Try again recovers', async ({ page }) => {
    await openBeforeYouStart(page)
    await failCamera(page, 'NotAllowedError')
    await page.getByRole('button', { name: 'Allow camera permissions' }).click()
    await expect(page.getByRole('alert')).toContainText('Camera access is blocked')
    await expect(page.getByRole('alert').getByRole('listitem')).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Open camera' })).toBeDisabled()
    await page.evaluate(() => { window.__camera = null })
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByText('Camera allowed')).toBeVisible()
  })

  test('no camera still lets the user choose a photo', async ({ page }) => {
    await openBeforeYouStart(page)
    await failCamera(page, 'NotFoundError')
    await page.getByRole('button', { name: 'Allow camera permissions' }).click()
    await expect(page.getByRole('alert')).toContainText('No camera found')
    await pickFile(page, await makePhoto(page))
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
  })

  test('a slow answer shows a waiting state', async ({ page }) => {
    await openBeforeYouStart(page)
    await page.evaluate(() => { window.__camera = () => new Promise(() => {}) })
    await page.getByRole('button', { name: 'Allow camera permissions' }).click()
    await expect(page.getByRole('button', { name: 'Waiting for your answer…' })).toBeDisabled()
  })

  test('access granted on an earlier visit skips the question', async ({ page, context, baseURL }) => {
    await context.grantPermissions(['camera'], { origin: baseURL })
    await openBeforeYouStart(page)
    await expect(page.getByText('Camera allowed')).toBeVisible()
  })
})

test('an insecure page explains why and offers a photo instead', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'mediaDevices', { value: undefined }))
  await openBeforeYouStart(page)
  await expect(page.getByRole('alert')).toContainText("Camera isn't available here")
  await expect(page.getByRole('button', { name: 'Open camera' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Choose a photo instead' })).toBeVisible()
})

test.describe('on the camera screen', () => {
  test.beforeEach(({ page }) => allowCameraMock(page))

  for (const [errorName, title] of Object.entries(CAPTURE_ERRORS)) {
    test(`${errorName} shows "${title}", and Try again recovers`, async ({ page }) => {
      await openFailingCapture(page, errorName)
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
      await page.evaluate(() => { window.__camera = null })
      await page.getByRole('button', { name: 'Try again' }).click()
      await expect(shutter(page)).toBeEnabled()
    })
  }

  test('a photo can be chosen from the error screen', async ({ page }) => {
    await openFailingCapture(page, 'NotFoundError')
    await pickFile(page, await makePhoto(page))
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
  })

  test('the camera stopping mid-use shows the busy screen', async ({ page }) => {
    await openCapture(page)
    await rememberTrack(page)
    await page.evaluate(() => window.__track.dispatchEvent(new Event('ended')))
    await expect(page.getByRole('heading', { name: 'Camera is busy' })).toBeVisible()
  })

  test('leaving the screen stops the camera', async ({ page }) => {
    await openCapture(page)
    await rememberTrack(page)
    await page.getByRole('button', { name: /back/i }).click()
    await expect.poll(() => firstTrackState(page)).toBe('ended')
  })

  test('the camera is released while the page is hidden and resumes after', async ({ page }) => {
    await openCapture(page)
    await rememberTrack(page)
    await setHidden(page, true)
    await expect.poll(() => firstTrackState(page)).toBe('ended')
    await setHidden(page, false)
    await expect(shutter(page)).toBeEnabled()
    expect(await page.evaluate(() => document.querySelector('video').srcObject.getVideoTracks()[0].readyState)).toBe('live')
  })

  test('live chips show the real stream size', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    const { videoWidth, videoHeight } = await page.evaluate(() => {
      const { videoWidth, videoHeight } = document.querySelector('video')
      return { videoWidth, videoHeight }
    })
    expect(videoWidth * videoHeight).toBeGreaterThan(0)
    await expect(page.getByRole('main')).toContainText(`${(videoWidth * videoHeight / 1e6).toFixed(1)}`)
  })
})

test.describe('photo capture', () => {
  async function capture(page) {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await shutter(page).click()
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
  }

  test('falls back to a video frame when takePhoto fails', async ({ page }) => {
    await page.addInitScript(() => {
      ImageCapture.prototype.takePhoto = () => Promise.reject(new Error('test'))
    })
    await capture(page)
  })

  test('works where ImageCapture does not exist', async ({ page }) => {
    await page.addInitScript(() => delete window.ImageCapture)
    await capture(page)
  })

  test('a failed capture says so and the camera keeps working', async ({ page }) => {
    await page.addInitScript(() => {
      delete window.ImageCapture
      HTMLCanvasElement.prototype.toBlob = (callback) => callback(null)
    })
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await shutter(page).click()
    await expect(page.getByText("Couldn't take the photo, so try again.")).toBeVisible()
    await expect(shutter(page)).toBeEnabled()
  })
})

test.describe('torch', () => {
  const torch = (page) => page.getByRole('button', { name: 'Torch' })

  test('is hidden when the camera has none', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await expect(torch(page)).toHaveCount(0)
    await expect(page.getByText('Torch not available')).toBeVisible()
  })

  test('shows the state the track reports', async ({ page }) => {
    await mockTorch(page, false)
    await openCapture(page)
    await expect(torch(page)).toHaveAttribute('aria-pressed', 'false')
    await torch(page).click()
    await expect(torch(page)).toHaveAttribute('aria-pressed', 'true')
    await torch(page).click()
    await expect(torch(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('a failed switch says so and stays off', async ({ page }) => {
    await mockTorch(page, true)
    await openCapture(page)
    await torch(page).click()
    await expect(page.getByText("The torch didn't respond, so try again.")).toBeVisible()
    await expect(torch(page)).toHaveAttribute('aria-pressed', 'false')
  })
})

// A camera that offers exposure from −1 to +1 EV in thirds, like many Android phones.
async function mockExposure(page, fails) {
  await page.addInitScript((fails) => {
    let value = 0
    const { getCapabilities, getSettings } = MediaStreamTrack.prototype
    MediaStreamTrack.prototype.getCapabilities = function () {
      return { ...getCapabilities.call(this), exposureCompensation: { min: -1, max: 1, step: 1 / 3 } }
    }
    MediaStreamTrack.prototype.getSettings = function () {
      return { ...getSettings.call(this), exposureCompensation: value }
    }
    MediaStreamTrack.prototype.applyConstraints = async function (constraints) {
      if (fails) throw new DOMException('test', 'OverconstrainedError')
      value = constraints.advanced[0].exposureCompensation
    }
  }, fails)
}

test.describe('exposure', () => {
  const brighter = (page) => page.getByRole('button', { name: 'Brighter' })
  const value = (page) => page.getByRole('group', { name: 'Exposure' }).locator('output')

  test('says it is not available when the camera has none', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await expect(page.getByRole('group', { name: 'Exposure' })).toHaveCount(0)
    await expect(page.getByText('Exposure not available')).toBeVisible()
  })

  test('steps by a third and stops at the limit', async ({ page }) => {
    await mockExposure(page, false)
    await openCapture(page)
    await expect(value(page)).toHaveText('0 EV')
    await brighter(page).click()
    await expect(value(page)).toHaveText('+0.3 EV')
    await brighter(page).click()
    await brighter(page).click()
    await expect(value(page)).toHaveText('+1 EV')
    await expect(brighter(page)).toBeDisabled()
    await page.getByRole('button', { name: 'Darker' }).click()
    await expect(value(page)).toHaveText('+0.7 EV')
  })

  test('a failed change says so', async ({ page }) => {
    await mockExposure(page, true)
    await openCapture(page)
    await brighter(page).click()
    await expect(page.getByText("The exposure didn't change, so try again.")).toBeVisible()
    await expect(value(page)).toHaveText('0 EV')
  })
})

test.describe('level', () => {
  const tiltPhone = (page, gravity) => page.evaluate((gravity) => {
    window.dispatchEvent(new DeviceMotionEvent('devicemotion', { accelerationIncludingGravity: gravity }))
  }, gravity)

  test('is hidden until the phone reports its tilt', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await expect(page.getByText('Level', { exact: true })).toHaveCount(0)
    await tiltPhone(page, { x: -1.7, y: 9.65, z: 0 }) // turned 10° clockwise
    await expect(page.getByText('Turn left 10°')).toBeVisible()
    await tiltPhone(page, { x: 0, y: 9.8, z: 0 })
    await expect(page.getByText('Level', { exact: true })).toBeVisible()
  })

  test('on a computer, says it needs a motion sensor', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Show level' })).toHaveCount(0)
    await expect(page.getByText('Level needs a motion sensor')).toBeVisible()
    await tiltPhone(page, { x: 0, y: 9.8, z: 0 }) // a laptop that does have a sensor
    await expect(page.getByText('Level needs a motion sensor')).toHaveCount(0)
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

    test('a tap asks for motion first, as iPhone needs', async ({ page }) => {
      await page.addInitScript(() => {
        DeviceMotionEvent.requestPermission = async () => 'granted'
      })
      await openCapture(page)
      await page.getByRole('button', { name: 'Show level' }).click()
      await tiltPhone(page, { x: 0, y: 2, z: 9.6 }) // nearly flat on a table
      await expect(page.getByText('Hold flat: 12° off')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Show level' })).toHaveCount(0)
    })
  })
})

test.describe('choosing a camera', () => {
  const switchButton = (page) => page.getByRole('button', { name: 'Choose camera' })

  test('with only one camera, the list shows it as the one in use', async ({ page }) => {
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await switchButton(page).click()
    await expect(page.getByRole('menuitem')).toHaveCount(1)
    await expect(page.getByRole('menuitem')).toHaveClass(/Mui-selected/)
  })

  test('another camera can be picked from the list', async ({ page }) => {
    // A second camera next to the fake one. Asking for it opens the fake one, and the request is kept to check.
    await page.addInitScript(() => {
      const { enumerateDevices, getUserMedia } = MediaDevices.prototype
      MediaDevices.prototype.enumerateDevices = async function () {
        const devices = await enumerateDevices.call(this)
        return [...devices, { kind: 'videoinput', deviceId: 'second', label: 'Front camera', groupId: '' }]
      }
      MediaDevices.prototype.getUserMedia = function (constraints) {
        window.__lastVideo = constraints.video
        const { deviceId, ...video } = constraints.video
        return getUserMedia.call(this, { ...constraints, video: deviceId?.exact === 'second' ? video : constraints.video })
      }
    })
    await openCapture(page)
    await expect(shutter(page)).toBeEnabled()
    await switchButton(page).click()
    await page.getByRole('menuitem', { name: 'Front camera' }).click()
    await expect(shutter(page)).toBeEnabled()
    expect(await page.evaluate(() => window.__lastVideo.deviceId)).toEqual({ exact: 'second' })
  })
})

test('a photo from the device can be chosen on the camera screen', async ({ page }) => {
  await openCapture(page)
  await expect(shutter(page)).toBeEnabled()
  await pickFile(page, await makePhoto(page))
  await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
})

test('two tabs can open the camera without breaking each other', async ({ page, context }) => {
  await openCapture(page)
  await expect(shutter(page)).toBeEnabled()
  const second = await context.newPage()
  await openCapture(second)
  await expect(shutter(second)).toBeEnabled()
  await expect(shutter(page)).toBeEnabled()
})
