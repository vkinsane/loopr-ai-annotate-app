import { expect, test } from '@playwright/test'
import { annotate, boxesInPhotoPixels, downloadPhoto, drag, finishAnnotating, inspectJpeg, makePhoto, openAnnotate, openAnnotateWithBox, openBeforeYouStart, openPreview, PHOTO, pickFile } from './helpers.js'

const isLime = ([r, g, b]) => g > 180 && r > 120 && b < 170

test('camera flow: permission, capture, check, annotate, download', async ({ page }) => {
  await openBeforeYouStart(page)
  const openCamera = page.getByRole('button', { name: 'Open camera' })
  await expect(openCamera).toBeDisabled()
  await page.getByRole('button', { name: 'Allow camera permissions' }).click()
  await expect(page.getByText('Camera allowed')).toBeVisible()
  await openCamera.click()
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeEnabled()
  await page.getByRole('button', { name: 'Take photo' }).click()
  await expect(page.getByRole('heading', { name: 'Preview & quality' })).toBeVisible()
  await annotate(page)
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  const badge = await page.getByText(/^\d+ × \d+ px$/).textContent()
  const [width, height] = badge.match(/\d+/g).map(Number)

  await drag(page, [0.2, 0.3], [0.6, 0.7])
  await page.getByLabel('Name of annotation 1').fill('Dent')
  await finishAnnotating(page)
  await page.getByLabel('Photo name', { exact: true }).fill('check-1')
  const { name, jpeg } = await downloadPhoto(page)

  expect(name).toBe('check-1.jpg')
  const file = await inspectJpeg(page, jpeg)
  expect({ width: file.width, height: file.height }).toEqual({ width, height })
})

test('chosen photo flow: download has full size, box line and label', async ({ page }) => {
  await page.goto('/')
  const photo = await makePhoto(page, { kind: 'flat' })
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await pickFile(page, photo)
  await annotate(page)
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  await drag(page, [0.25, 0.25], [0.75, 0.75])
  const [box] = await boxesInPhotoPixels(page)
  await finishAnnotating(page)
  const { name, jpeg } = await downloadPhoto(page)

  expect(name).toBe('annotated-photo.jpg')
  const middle = Math.round(box.x + box.width / 2)
  const nearTopLine = Array.from({ length: 13 }, (_, i) => [middle, Math.round(box.y) - 6 + i])
  const insideBox = [middle, Math.round(box.y + box.height / 2)]
  const label = [Math.round(box.x + 4), Math.round(box.y - 12)]
  const file = await inspectJpeg(page, jpeg, [insideBox, label, ...nearTopLine])
  expect({ width: file.width, height: file.height }).toEqual(PHOTO)
  const [inside, labelColor, ...line] = file.colors
  expect(isLime(inside)).toBe(false)
  expect(isLime(labelColor)).toBe(true)
  expect(line.some(isLime)).toBe(true)
})

test('Done with no boxes asks first', async ({ page }) => {
  await openAnnotate(page)
  const dialog = page.getByRole('dialog', { name: 'No annotations added' })

  await page.getByRole('button', { name: 'Done' }).click()
  await expect(dialog).toContainText('You have not added any annotations. Do you want to proceed?')
  await page.getByRole('button', { name: 'Add annotations' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Annotate' })).toBeVisible()

  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('button', { name: 'Proceed' }).click()
  await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
})

test('Done with a box goes straight to Summary', async ({ page }) => {
  await openAnnotateWithBox(page)
  await finishAnnotating(page)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test.describe('browser Back and Forward', () => {
  const leaveDialog = (page) => page.getByRole('dialog', { name: 'Start over?' })

  test('after the camera, they ask first, and Stay keeps everything', async ({ page }) => {
    await openAnnotateWithBox(page)
    await finishAnnotating(page)
    await page.goBack()
    await leaveDialog(page).getByRole('button', { name: 'Stay here' }).click()
    await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Annotations' })).toContainText('Annotation 1')
    // It asks again every time, and the screen still hasn't moved.
    await page.goBack()
    await expect(leaveDialog(page)).toBeVisible()
    // The open dialog hides the page from screen readers, so the heading is looked up among hidden elements.
    await expect(page.getByRole('heading', { name: 'Inspection summary', includeHidden: true })).toBeVisible()
  })

  test('Start over goes to the first page and keeps nothing', async ({ page }) => {
    await openAnnotateWithBox(page)
    await page.goBack()
    await leaveDialog(page).getByRole('button', { name: 'Start over' }).click()
    await expect(page.getByRole('button', { name: 'Start inspection' })).toBeVisible()
    // The old screens are gone: Forward and Back don't bring the photo back.
    await page.goBack()
    await expect(page.getByRole('img', { name: 'Captured photo' })).toHaveCount(0)
  })

  test('before the camera, they move without asking', async ({ page }) => {
    await openBeforeYouStart(page)
    await page.goBack()
    await expect(page.getByRole('button', { name: 'Start inspection' })).toBeVisible()
    await page.goForward()
    await expect(page.getByRole('heading', { name: 'Allow the camera' })).toBeVisible()
  })
})

test('reload mid-flow returns to a working start, not a broken screen', async ({ page }) => {
  await openAnnotate(page)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start inspection' })).toBeVisible()
})

test('New photo asks only when boxes would be lost', async ({ page }) => {
  await openAnnotateWithBox(page)
  const dialog = page.getByRole('dialog', { name: 'Discard this photo?' })
  await page.getByRole('button', { name: 'New photo' }).click()
  await expect(dialog).toContainText('1 box')
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByLabel('Name of annotation 1')).toBeVisible()
  await page.getByRole('button', { name: 'New photo' }).click()
  await page.getByRole('button', { name: 'Discard' }).click()
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
})

test('New photo can download the annotated photo, then start again', async ({ page }) => {
  await openAnnotateWithBox(page)
  await page.getByRole('button', { name: 'New photo' }).click()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download and start new' }).click()])
  expect(download.suggestedFilename()).toBe('annotated-photo.jpg')
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
})

test('New photo with no boxes does not ask', async ({ page }) => {
  await openAnnotate(page)
  await page.getByRole('button', { name: 'New photo' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
})

test('Retake on Preview asks when boxes exist', async ({ page }) => {
  await openAnnotateWithBox(page)
  await page.getByRole('button', { name: 'Back to Preview' }).click()
  await page.getByRole('button', { name: 'Retake' }).click()
  await expect(page.getByRole('dialog')).toContainText('boxes you drew')
})

test('Take new photo asks until the photo is downloaded', async ({ page }) => {
  await openAnnotateWithBox(page)
  await finishAnnotating(page)
  await page.getByRole('button', { name: 'Take new photo' }).click()
  await expect(page.getByRole('dialog')).toContainText("haven't downloaded")
  await page.getByRole('button', { name: 'Keep photo' }).click()
  await downloadPhoto(page)
  await page.getByRole('button', { name: 'Take new photo' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
})

test('going back to Preview shows the photo at once, without measuring again', async ({ page }) => {
  await openAnnotate(page)
  await page.getByRole('button', { name: 'Back to Preview' }).click()
  await expect(page.getByRole('img', { name: 'Captured photo' })).toBeVisible()
  await expect(page.getByText('Checking photo quality…')).toHaveCount(0)
})

test('while a name is typed, the pencil becomes a check that finishes it', async ({ page }) => {
  await openAnnotateWithBox(page)
  // With a mouse, a new box's name already has focus, with the default name selected.
  const name = page.getByLabel('Name of annotation 1')
  await expect(name).toBeFocused()
  await page.keyboard.type('Dent')
  await page.getByRole('button', { name: 'Finish editing Dent' }).click()
  await expect(name).not.toBeFocused()
  await page.getByRole('button', { name: 'Edit Dent' }).click()
  await expect(name).toBeFocused()
  await expect(page.getByRole('button', { name: 'Finish editing Dent' })).toBeVisible()

  await finishAnnotating(page)
  const photoName = page.getByRole('textbox', { name: 'Photo name' })
  await page.getByRole('button', { name: 'Edit photo name' }).click()
  await expect(photoName).toBeFocused()
  await page.getByRole('button', { name: 'Finish editing photo name' }).click()
  await expect(photoName).not.toBeFocused()
})

test('full screen view opens and closes on Preview', async ({ page }) => {
  await openPreview(page)
  await page.getByRole('button', { name: 'Expand photo' }).click()
  const close = page.getByRole('button', { name: /close/i })
  await expect(close).toBeVisible()
  await close.click()
  await expect(close).toBeHidden()
  await expect(page.getByRole('button', { name: 'Annotate' })).toBeVisible()
})
