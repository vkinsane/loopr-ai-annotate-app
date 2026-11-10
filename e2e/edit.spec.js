// The photo editor on Preview: turn, mirror and crop. Each result is checked by the size Preview measures afterwards.
import { expect, test } from '@playwright/test'
import { annotate, canvasBoxes, openAnnotateWithBox, openPreview } from './helpers.js'

const editor = (page) => page.getByRole('dialog', { name: 'Edit photo' })
const done = (page) => editor(page).getByRole('button', { name: 'Done' })
const editorPhoto = (page) => editor(page).getByRole('img', { name: 'Photo being edited' })

async function openEditor(page) {
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(editorPhoto(page)).toBeVisible()
}

async function measuredSize(page) {
  const text = await page.getByText(/^\d+ × \d+ ·/).textContent()
  const [width, height] = text.match(/\d+/g).map(Number)
  return { width, height }
}

test.describe('editing a photo', () => {
  test.beforeEach(async ({ page }) => {
    await openPreview(page)
    await openEditor(page)
  })

  test('nothing changed: Done waits for an edit, and Cancel keeps the photo', async ({ page }) => {
    await expect(done(page)).toBeDisabled()
    await editor(page).getByRole('button', { name: 'Cancel editing' }).click()
    await expect(editor(page)).toHaveCount(0)
    expect(await measuredSize(page)).toEqual({ width: 1600, height: 1200 })
  })

  test('turning right swaps the width and height', async ({ page }) => {
    await editor(page).getByRole('button', { name: 'Right' }).click()
    await done(page).click()
    await expect(editor(page)).toHaveCount(0)
    await expect(page.getByText('1200 × 1600', { exact: false })).toBeVisible()
  })

  test('flip can be undone with Reset', async ({ page }) => {
    const flip = editor(page).getByRole('button', { name: 'Flip' })
    await flip.click()
    await expect(flip).toHaveAttribute('aria-pressed', 'true')
    await expect(done(page)).toBeEnabled()
    await editor(page).getByRole('button', { name: 'Reset' }).click()
    await expect(flip).toHaveAttribute('aria-pressed', 'false')
    await expect(done(page)).toBeDisabled()
  })

  test('dragging a corner to the middle keeps a quarter of the photo', async ({ page }) => {
    const box = await editorPhoto(page).boundingBox()
    await page.mouse.move(box.x + 2, box.y + 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await done(page).click()
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
    await expect(async () => {
      const { width, height } = await measuredSize(page)
      expect(Math.abs(width - 800)).toBeLessThan(8)
      expect(Math.abs(height - 600)).toBeLessThan(8)
    }).toPass()
  })
})

test('with boxes, editing asks first and then removes them', async ({ page }) => {
  await openAnnotateWithBox(page)
  await page.getByRole('button', { name: 'Back to Preview' }).click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('button', { name: 'Edit photo' }).click()
  await editor(page).getByRole('button', { name: 'Left' }).click()
  await done(page).click()
  await annotate(page)
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  await expect(canvasBoxes(page)).toHaveCount(0)
})
