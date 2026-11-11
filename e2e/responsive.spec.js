import { expect, test } from '@playwright/test'
import { annotate, drag, finishAnnotating, openAnnotate, openPreview, pageOverflow, photoImage, SIZES } from './helpers.js'

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
      await drag(page, [0.25, 0.35], [0.7, 0.7]) // below the zoom tools, which are at the top on phones
      await expectFits(page, 'annotate')
      await expectButtonsReachable(page, 'annotate')
      await page.getByRole('button', { name: 'Back to Preview' }).click()
      await expectFits(page, 'preview')
      await expectButtonsReachable(page, 'preview')
      await annotate(page)
      await finishAnnotating(page)
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
    test.fail(true, 'Open finding: the Choose a photo link, New photo and the zoom tools are smaller.')
    await page.goto('/')
    await expectTouchSize(page, 'landing')
    await page.getByRole('button', { name: 'Start inspection' }).click()
    await heading(page, 'Allow the camera')
    await expectTouchSize(page, 'before you start')
    await openPreview(page, { width: 1000, height: 800 })
    await expectTouchSize(page, 'preview')
    await annotate(page)
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
    await drag(page, [0.2, 0.2], [0.7, 0.7])
    await expectTouchSize(page, 'annotate')
    await finishAnnotating(page)
    await expectTouchSize(page, 'summary')
  })
})

test.describe('phone details panel', () => {
  test.use({ viewport: { width: 390, height: 640 }, hasTouch: true })

  test('Preview and Summary show the details over the photo and can minimise them', async ({ page }) => {
    await openPreview(page)
    const checks = page.getByRole('list', { name: 'Quality checks' })
    await expect(checks).toBeVisible()
    await page.getByRole('button', { expanded: true }).click()
    await expect(checks).toBeHidden()
    await page.getByRole('button', { expanded: false }).click()
    await expect(checks).toBeVisible()
    await annotate(page)
    await drag(page, [0.3, 0.3], [0.7, 0.7]) // below the zoom tools, which sit over the photo
    await finishAnnotating(page)
    const name = page.getByRole('textbox', { name: 'Photo name' })
    await expect(name).toBeVisible()
    await page.getByRole('button', { name: /1 annotation/, expanded: true }).click()
    await expect(name).toBeHidden()
    await expectFits(page, 'summary')
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

// Sideways phones and tablets show the phone layout: the result and buttons over the bottom of the photo card.
for (const [name, [width, height]] of Object.entries({ 'phone held sideways': SIZES.landscapePhone, 'tablet held sideways': [1180, 820] })) {
  test.describe(name, () => {
    test.use({ viewport: { width, height }, hasTouch: true })

    test('the details sit over the photo, as on a phone', async ({ page }) => {
      await openPreview(page, { width: 900, height: 1200 })
      const card = await photoImage(page).locator('..').boundingBox() // the card around the photo
      const annotateButton = await page.getByRole('button', { name: 'Annotate' }).boundingBox()
      expect(annotateButton.x).toBeGreaterThan(card.x)
      expect(annotateButton.x + annotateButton.width).toBeLessThan(card.x + card.width)
      expect(annotateButton.y).toBeGreaterThan(card.y + card.height / 2)
      expect(annotateButton.y + annotateButton.height).toBeLessThanOrEqual(height)
    })
  })
}

test.describe('phone summary with many boxes', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('the list scrolls in its own box, and the photo name stays in view', async ({ page }) => {
    await openAnnotate(page, { width: 900, height: 1200 })
    for (let i = 0; i < 9; i++) {
      const [x, y] = [0.15 + (i % 3) * 0.25, 0.25 + Math.floor(i / 3) * 0.12]
      await drag(page, [x, y], [x + 0.15, y + 0.08])
    }
    await finishAnnotating(page)
    const list = page.getByRole('region', { name: 'Annotations' }).locator('ul')
    expect(await list.evaluate((ul) => ul.scrollHeight > ul.clientHeight)).toBe(true)
    await list.evaluate((ul) => { ul.scrollTop = ul.scrollHeight })
    await expect(page.getByRole('textbox', { name: 'Photo name' })).toBeInViewport()
    await expect(list.getByText('Annotation 9')).toBeInViewport()
  })
})
