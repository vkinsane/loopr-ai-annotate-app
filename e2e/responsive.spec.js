import { expect, test } from '@playwright/test'
import { drag, openAnnotate, openPreview, pageOverflow, SIZES } from './helpers.js'

const MIN_TOUCH_PX = 44
const ALL_SIZES = { ...SIZES, 'desktop at 200% zoom': [720, 450] }
const heading = (page, name) => expect(page.getByRole('heading', { name })).toBeVisible()

async function expectFits(page, screen) {
  const { x, y } = await pageOverflow(page)
  expect(x, `${screen}: sideways`).toBeLessThanOrEqual(0)
  expect(y, `${screen}: page height`).toBeLessThanOrEqual(0)
}

async function expectButtonsReachable(page, screen) {
  const buttons = await page.getByRole('button').all()
  for (const button of buttons) {
    if (!(await button.isVisible())) continue
    await button.scrollIntoViewIfNeeded()
    const box = await button.boundingBox()
    const { innerWidth, innerHeight } = await page.evaluate(() => ({ innerWidth: window.innerWidth, innerHeight: window.innerHeight }))
    expect(box.x, `${screen}: left of the window`).toBeGreaterThanOrEqual(-1)
    expect(box.y + box.height, `${screen}: below the window`).toBeLessThanOrEqual(innerHeight + 1)
    expect(box.x + box.width, `${screen}: right of the window`).toBeLessThanOrEqual(innerWidth + 1)
  }
}

for (const [name, [width, height]] of Object.entries(ALL_SIZES)) {
  test.describe(`${name} ${width} × ${height}`, () => {
    test.use({ viewport: { width, height } })

    test('no page scroll, and every button can be reached', async ({ page }) => {
      await page.goto('/')
      await expectFits(page, 'landing')
      await expectButtonsReachable(page, 'landing')
      await page.getByRole('button', { name: 'Start inspection' }).click()
      await heading(page, 'Allow the camera')
      await expectFits(page, 'before you start')
      await expectButtonsReachable(page, 'before you start')

      await openAnnotate(page)
      await expectFits(page, 'annotate empty')
      await drag(page, [0.2, 0.2], [0.7, 0.7])
      await expectFits(page, 'annotate')
      await expectButtonsReachable(page, 'annotate')
      await page.getByRole('button', { name: 'Back to Preview' }).click()
      await expectFits(page, 'preview')
      await expectButtonsReachable(page, 'preview')
      await page.getByRole('button', { name: 'Annotate' }).click()
      await page.getByRole('button', { name: /^Done/ }).click()
      await heading(page, 'Inspection summary')
      await expectFits(page, 'summary')
      await expectButtonsReachable(page, 'summary')
    })

    test('the camera screen fits', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Start inspection' }).click()
      await page.getByRole('button', { name: 'Allow camera permissions' }).click()
      await page.getByRole('button', { name: 'Open camera' }).click()
      await expect(page.getByRole('button', { name: 'Take photo' })).toBeEnabled()
      await expectFits(page, 'capture')
      await expectButtonsReachable(page, 'capture')
    })
  })
}

test.describe('phone touch targets', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  async function expectTouchSize(page, screen) {
    const small = []
    for (const button of await page.getByRole('button').all()) {
      if (!(await button.isVisible())) continue
      const box = await button.boundingBox()
      // Some small buttons have a larger invisible touch area from an ::after element.
      const extra = await button.evaluate((element) => Math.max(0, -parseFloat(getComputedStyle(element, '::after').top) * 2 || 0))
      if (box.width + extra < MIN_TOUCH_PX || box.height + extra < MIN_TOUCH_PX) small.push(`${await button.getAttribute('aria-label') ?? await button.textContent()} ${Math.round(box.width)}×${Math.round(box.height)}`)
    }
    expect.soft(small, `${screen}: under ${MIN_TOUCH_PX} px`).toEqual([])
  }

  test('every button on every screen is at least 44 px', async ({ page }) => {
    test.fail(true, 'Open finding: the Choose a photo link, New photo, the zoom tools and Edit photo name are smaller.')
    await page.goto('/')
    await expectTouchSize(page, 'landing')
    await page.getByRole('button', { name: 'Start inspection' }).click()
    await heading(page, 'Allow the camera')
    await expectTouchSize(page, 'before you start')
    await openPreview(page, { width: 1000, height: 800 })
    await expectTouchSize(page, 'preview')
    await page.getByRole('button', { name: 'Annotate' }).click()
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
    await drag(page, [0.2, 0.2], [0.7, 0.7])
    await expectTouchSize(page, 'annotate')
    await page.getByRole('button', { name: /^Done/ }).click()
    await heading(page, 'Inspection summary')
    await expectTouchSize(page, 'summary')
  })
})

test.describe('scroll bars', () => {
  const list = (page) => page.getByRole('region', { name: 'Annotations' }).getByRole('list')
  const BORDERS_PX = 2
  const barWidth = (page) => list(page).evaluate((element) => element.offsetWidth - element.clientWidth)

  async function drawMany(page, count) {
    for (let i = 0; i < count; i++) {
      const left = 0.05 + (i % 4) * 0.22
      const top = 0.05 + Math.floor(i / 4) * 0.22
      await drag(page, [left, top], [left + 0.15, top + 0.15])
    }
  }

  test('a short list keeps no empty strip beside its rows', async ({ page }) => {
    await openAnnotate(page)
    await drawMany(page, 2)
    expect(await barWidth(page)).toBe(BORDERS_PX)
  })

  test('a long list shows a bar', async ({ page }) => {
    await openAnnotate(page)
    await drawMany(page, 14)
    expect(await barWidth(page)).toBeGreaterThan(BORDERS_PX)
  })

  test.describe('where the browser hides bars', () => {
    const thumb = (page) => list(page).locator('li[aria-hidden]')

    test.beforeEach(async ({ page }) => {
      const client = await page.context().newCDPSession(page)
      await client.send('Emulation.setScrollbarsHidden', { hidden: true })
    })

    test('the thumb shows only when the list overflows', async ({ page }) => {
      await openAnnotate(page)
      await drawMany(page, 1)
      await expect(thumb(page)).toBeHidden()
      await drawMany(page, 14)
      await expect(thumb(page)).toBeVisible()
    })
  })
})
