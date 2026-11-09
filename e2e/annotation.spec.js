import { expect, test } from '@playwright/test'
import { boxesInPhotoPixels, canvasBoxes, drag, dragScreen, expectRect, openAnnotate, PHOTO, photoImage, screenPoint } from './helpers.js'

const px = ([fx, fy]) => ({ x: fx * PHOTO.width, y: fy * PHOTO.height })
const rectBetween = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) })
const A = [0.2, 0.3]
const B = [0.6, 0.8]
const DIRECTIONS = { 'down-right': [A, B], 'up-left': [B, A], 'down-left': [[B[0], A[1]], [A[0], B[1]]], 'up-right': [[A[0], B[1]], [B[0], A[1]]] }
const EXPECTED = rectBetween(px(A), px(B))
const corner = (page, name) => page.locator(`[data-corner="${name}"]`)
const centre = async (locator) => {
  const { x, y, width, height } = await locator.boundingBox()
  return { x: x + width / 2, y: y + height / 2 }
}

test.describe('with a mouse', () => {
  test.beforeEach(async ({ page }) => openAnnotate(page))

  for (const [name, [from, to]] of Object.entries(DIRECTIONS)) {
    test(`drawing ${name} stores the same photo pixels`, async ({ page }) => {
      await drag(page, from, to)
      expectRect((await boxesInPhotoPixels(page))[0], EXPECTED)
    })
  }

  test('list shows the size in photo pixels', async ({ page }) => {
    await drag(page, A, B)
    const text = await page.getByText(/^\d+ × \d+$/).textContent()
    const [width, height] = text.match(/\d+/g).map(Number)
    expect(Math.abs(width - EXPECTED.width)).toBeLessThanOrEqual(6)
    expect(Math.abs(height - EXPECTED.height)).toBeLessThanOrEqual(6)
  })

  test('drawing past the edge stops at the photo', async ({ page }) => {
    const area = await photoImage(page).boundingBox()
    await dragScreen(page, await screenPoint(page, [0.8, 0.8]), { x: area.x + area.width + 150, y: area.y + area.height + 150 })
    const [box] = await boxesInPhotoPixels(page)
    expectRect(box, { x: 0.8 * PHOTO.width, y: 0.8 * PHOTO.height, width: 0.2 * PHOTO.width, height: 0.2 * PHOTO.height })
  })

  test('a very small drag and a tap make no box', async ({ page }) => {
    const start = await screenPoint(page, [0.5, 0.5])
    await dragScreen(page, start, { x: start.x + 6, y: start.y + 6 })
    await page.mouse.click(start.x, start.y)
    await expect(canvasBoxes(page)).toHaveCount(0)
  })

  test('tapping empty photo clears the selection', async ({ page }) => {
    await drag(page, A, B)
    await expect(corner(page, 'top-left')).toBeVisible()
    const empty = await screenPoint(page, [0.9, 0.1])
    await page.mouse.click(empty.x, empty.y)
    await expect(corner(page, 'top-left')).toHaveCount(0)
    await expect(canvasBoxes(page)).toHaveCount(1)
  })

  test('moving keeps the size and stops at the edge', async ({ page }) => {
    await drag(page, A, B)
    await drag(page, [0.4, 0.55], [0.5, 0.6])
    expectRect((await boxesInPhotoPixels(page))[0], { ...EXPECTED, x: EXPECTED.x + 0.1 * PHOTO.width, y: EXPECTED.y + 0.05 * PHOTO.height })
    await drag(page, [0.5, 0.6], [1.6, 1.6])
    const [box] = await boxesInPhotoPixels(page)
    expectRect(box, { x: PHOTO.width - EXPECTED.width, y: PHOTO.height - EXPECTED.height, width: EXPECTED.width, height: EXPECTED.height })
  })

  for (const [name, target, expected] of [
    ['top-left', [0.1, 0.1], { x: 0.1, y: 0.1, width: 0.5, height: 0.7 }],
    ['top-right', [0.8, 0.1], { x: 0.2, y: 0.1, width: 0.6, height: 0.7 }],
    ['bottom-left', [0.1, 0.9], { x: 0.1, y: 0.3, width: 0.5, height: 0.6 }],
    ['bottom-right', [0.8, 0.9], { x: 0.2, y: 0.3, width: 0.6, height: 0.6 }],
  ]) {
    test(`resizing from ${name} keeps the opposite corner`, async ({ page }) => {
      await drag(page, A, B)
      await dragScreen(page, await centre(corner(page, name)), await screenPoint(page, target))
      expectRect((await boxesInPhotoPixels(page))[0], { x: expected.x * PHOTO.width, y: expected.y * PHOTO.height, width: expected.width * PHOTO.width, height: expected.height * PHOTO.height })
    })
  }

  test('resizing to almost nothing puts the box back', async ({ page }) => {
    await drag(page, A, B)
    const fixed = await screenPoint(page, A)
    await dragScreen(page, await centre(corner(page, 'bottom-right')), { x: fixed.x + 3, y: fixed.y + 3 })
    expectRect((await boxesInPhotoPixels(page))[0], EXPECTED)
  })

  test('a box stays on its pixels when the window changes size', async ({ page }) => {
    await drag(page, A, B)
    for (const [width, height] of [[1024, 768], [820, 1180], [390, 844], [844, 390], [1440, 900]]) {
      await page.setViewportSize({ width, height })
      await expect.poll(async () => (await photoImage(page).boundingBox()).width).toBeGreaterThan(0)
      expectRect((await boxesInPhotoPixels(page))[0], EXPECTED, 16)
    }
  })

  test('zooming in and moving the photo make no box', async ({ page }) => {
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await page.getByRole('button', { name: 'Move the photo' }).click()
    await drag(page, [0.5, 0.5], [0.4, 0.4])
    await expect(canvasBoxes(page)).toHaveCount(0)
  })

  test('scroll-wheel zoom makes no box', async ({ page }) => {
    const middle = await screenPoint(page, [0.5, 0.5])
    await page.mouse.move(middle.x, middle.y)
    await page.mouse.wheel(0, -400)
    await expect(canvasBoxes(page)).toHaveCount(0)
  })

  test('a box drawn while zoomed is on the right pixels', async ({ page }) => {
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await expect.poll(async () => page.getByRole('button', { name: 'Zoom out' }).isEnabled()).toBe(true)
    await page.waitForTimeout(300)
    await drag(page, [0.4, 0.4], [0.6, 0.6])
    const [box] = await boxesInPhotoPixels(page)
    expectRect(box, { x: 0.4 * PHOTO.width, y: 0.4 * PHOTO.height, width: 0.2 * PHOTO.width, height: 0.2 * PHOTO.height })
  })

  test('Delete and Backspace remove the selected box', async ({ page }) => {
    await drag(page, [0.1, 0.1], [0.3, 0.3])
    await drag(page, [0.5, 0.5], [0.7, 0.7])
    await page.keyboard.press('Delete')
    await expect(canvasBoxes(page)).toHaveCount(1)
    await page.getByLabel(/Name of annotation 1/).click()
    await page.getByLabel(/Name of annotation 1/).blur()
    await page.keyboard.press('Backspace')
    await expect(canvasBoxes(page)).toHaveCount(0)
  })

  test('Escape deselects and keeps the box', async ({ page }) => {
    await drag(page, A, B)
    await page.keyboard.press('Escape')
    await expect(corner(page, 'top-left')).toHaveCount(0)
    await expect(canvasBoxes(page)).toHaveCount(1)
  })

  test('Delete while typing a name edits the text only', async ({ page }) => {
    await drag(page, A, B)
    await page.getByLabel('Name of annotation 1').focus()
    await page.keyboard.press('Delete')
    await page.keyboard.press('Backspace')
    await expect(canvasBoxes(page)).toHaveCount(1)
  })

  test('selecting a list row selects its box; delete button removes it', async ({ page }) => {
    await drag(page, [0.1, 0.1], [0.3, 0.3])
    await drag(page, [0.5, 0.5], [0.7, 0.7])
    await page.getByLabel('Name of annotation 1').click()
    const first = await corner(page, 'top-left').boundingBox()
    const point = await screenPoint(page, [0.1, 0.1])
    expect(Math.abs(first.x + first.width / 2 - point.x)).toBeLessThanOrEqual(4)
    await page.getByRole('button', { name: 'Delete Annotation 1' }).click()
    await expect(canvasBoxes(page)).toHaveCount(1)
  })

  test('the box label shows the name', async ({ page }) => {
    await drag(page, A, B)
    await page.getByLabel('Name of annotation 1').fill('Scratch')
    await expect(canvasBoxes(page).first()).toContainText('Scratch')
  })
})

test.describe('with touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  async function touch(client, type, points) {
    await client.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(({ x, y }, id) => ({ x, y, id })) })
  }

  test('one finger draws a box on the right pixels', async ({ page }) => {
    await openAnnotate(page)
    const client = await page.context().newCDPSession(page)
    const from = await screenPoint(page, A)
    const to = await screenPoint(page, B)
    await touch(client, 'touchStart', [from])
    await touch(client, 'touchMove', [{ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }])
    await touch(client, 'touchMove', [to])
    await touch(client, 'touchEnd', [])
    expectRect((await boxesInPhotoPixels(page))[0], EXPECTED, 16)
  })

  test('two fingers (emulated pinch) make no box', async ({ page }) => {
    await openAnnotate(page)
    const client = await page.context().newCDPSession(page)
    const a = await screenPoint(page, [0.45, 0.5])
    const b = await screenPoint(page, [0.55, 0.5])
    await touch(client, 'touchStart', [a, b])
    await touch(client, 'touchMove', [{ x: a.x - 40, y: a.y }, { x: b.x + 40, y: b.y }])
    await touch(client, 'touchMove', [{ x: a.x - 80, y: a.y }, { x: b.x + 80, y: b.y }])
    await touch(client, 'touchEnd', [])
    await expect(canvasBoxes(page)).toHaveCount(0)
  })
})
