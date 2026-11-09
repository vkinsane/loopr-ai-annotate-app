import { expect } from '@playwright/test'

export const SIZES = { smallPhone: [320, 568], phone: [390, 844], tablet: [820, 1180], desktop: [1440, 900], landscapePhone: [844, 390] }
export const PHOTO = { width: 1600, height: 1200 }

/**
 * A JPEG made in the page's canvas, as a Buffer. `kind` sets what the quality check sees:
 * sharp (random blocks), dark, bright, flat (no detail, so blurry).
 */
export async function makePhoto(page, { width = PHOTO.width, height = PHOTO.height, kind = 'sharp' } = {}) {
  const dataUrl = await page.evaluate(({ width, height, kind }) => {
    const LEVELS = { sharp: [50, 200], dark: [0, 45], bright: [225, 255], flat: [128, 128] }
    const BLOCK_PX = Math.max(4, Math.round(width / 160))
    const [low, high] = LEVELS[kind]
    const canvas = Object.assign(document.createElement('canvas'), { width, height })
    const context = canvas.getContext('2d')
    let seed = 7
    for (let y = 0; y < height; y += BLOCK_PX) {
      for (let x = 0; x < width; x += BLOCK_PX) {
        seed = (seed * 16807) % 2147483647
        const level = seed % 2 ? low : high
        context.fillStyle = `rgb(${level},${level},${level})`
        context.fillRect(x, y, BLOCK_PX, BLOCK_PX)
      }
    }
    return canvas.toDataURL('image/jpeg', 0.92)
  }, { width, height, kind })
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

/** Adds an EXIF block saying "rotate 90°" to a JPEG, as phones do for portrait photos. */
export function withExifRotation(jpeg) {
  const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0]
  const payload = [...Buffer.from('Exif\0\0', 'latin1'), ...tiff]
  const length = payload.length + 2
  return Buffer.concat([jpeg.subarray(0, 2), Buffer.from([0xff, 0xe1, length >> 8, length & 0xff, ...payload]), jpeg.subarray(2)])
}

export async function openBeforeYouStart(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await expect(page.getByRole('heading', { name: 'Allow the camera' })).toBeVisible()
}

export async function pickFile(page, buffer, name = 'photo.jpg', mimeType = 'image/jpeg') {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType, buffer })
}

/** Goes to Preview with a generated photo. */
export async function openPreview(page, options) {
  await page.goto('/')
  const photo = await makePhoto(page, options)
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await pickFile(page, photo)
  await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
}

export async function openAnnotate(page, options) {
  await openPreview(page, options)
  await page.getByRole('button', { name: 'Annotate' }).click()
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
}

/** Annotate with one box already drawn. */
export async function openAnnotateWithBox(page, options) {
  await openAnnotate(page, options)
  await drag(page, [0.2, 0.2], [0.5, 0.5])
}

export async function finishAnnotating(page) {
  await page.getByRole('button', { name: /^Done/ }).click()
  await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
}

export async function openCapture(page) {
  await openBeforeYouStart(page)
  await page.getByRole('button', { name: 'Allow camera permissions' }).click()
  await page.getByRole('button', { name: 'Open camera' }).click()
}

export const photoImage = (page) => page.getByAltText('Captured photo')
export const canvasBoxes = (page) => page.locator('div[data-id]')

/** Screen position of a point given as fractions of the photo. */
export async function screenPoint(page, [fx, fy]) {
  const area = await photoImage(page).boundingBox()
  return { x: area.x + fx * area.width, y: area.y + fy * area.height }
}

export async function dragScreen(page, from, to) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2)
  await page.mouse.move(to.x, to.y)
  await page.mouse.up()
}

/** Drags between two points given as fractions of the photo. */
export async function drag(page, from, to) {
  await dragScreen(page, await screenPoint(page, from), await screenPoint(page, to))
}

/** Each box as { x, y, width, height } in photo pixels, read from where it is on screen. */
export async function boxesInPhotoPixels(page, photo = PHOTO) {
  const area = await photoImage(page).boundingBox()
  const scale = photo.width / area.width
  const boxes = await canvasBoxes(page).evaluateAll((elements) => elements.map((element) => {
    const { x, y, width, height } = element.getBoundingClientRect()
    return { x, y, width, height }
  }))
  return boxes.map((box) => ({ x: (box.x - area.x) * scale, y: (box.y - area.y) * scale, width: box.width * scale, height: box.height * scale }))
}

/** Box positions on screen include the line width and rounding, so a few photo pixels of tolerance are needed. */
export function expectRect(actual, expected, tolerance = 8) {
  for (const key of ['x', 'y', 'width', 'height']) {
    expect(Math.abs(actual[key] - expected[key]), `${key}: ${actual[key]} vs ${expected[key]}`).toBeLessThanOrEqual(tolerance)
  }
}

export async function pageOverflow(page) {
  return page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight,
  }))
}

/** Reads a JPEG in the page: its size, and the colour at each [x, y] in `points`. */
export async function inspectJpeg(page, jpeg, points = []) {
  return page.evaluate(async ({ base64, points }) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }))
    const canvas = Object.assign(document.createElement('canvas'), { width: bitmap.width, height: bitmap.height })
    const context = canvas.getContext('2d')
    context.drawImage(bitmap, 0, 0)
    return { width: bitmap.width, height: bitmap.height, colors: points.map(([x, y]) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3)) }
  }, { base64: jpeg.toString('base64'), points })
}

export async function downloadPhoto(page) {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download photo' }).click()])
  const chunks = []
  for await (const chunk of await download.createReadStream()) chunks.push(chunk)
  return { name: download.suggestedFilename(), jpeg: Buffer.concat(chunks) }
}

/** Replaces getUserMedia with `window.__camera` when a test sets it, so a test can make the camera fail. */
export async function allowCameraMock(page) {
  await page.addInitScript(() => {
    const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = (constraints) => (window.__camera ? window.__camera() : real(constraints))
  })
}

export async function failCamera(page, errorName) {
  await page.evaluate((name) => {
    window.__camera = () => Promise.reject(new DOMException('test', name))
  }, errorName)
}
