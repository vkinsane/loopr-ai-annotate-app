# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.js >> phone touch targets >> every button on every screen is at least 44 px
- Location: e2e/responsive.spec.js:81:3

# Error details

```
Error: before you start: under 44 px

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Choose a photo instead 159×20",
+ ]
```

```
Error: annotate: under 44 px

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 6

- Array []
+ Array [
+   "New photo 94×32",
+   "Move the photo 40×40",
+   "Zoom out 40×40",
+   "Zoom in 40×40",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - button "Back to Annotate" [ref=f1e6] [cursor=pointer]
      - heading "Inspection summary" [level=1] [ref=f1e9]
  - main [ref=f1e10]:
    - generic [ref=f1e11]:
      - img "Photo with 1 annotation" [ref=f1e12]
      - generic [ref=f1e14]: Annotation 1
    - generic [ref=f1e15]:
      - generic [ref=f1e16]:
        - generic [ref=f1e17]:
          - paragraph [ref=f1e18]: Annotations
          - paragraph [ref=f1e19]: "1"
        - generic [ref=f1e20]:
          - paragraph [ref=f1e21]: Photo quality
          - generic [ref=f1e23]:
            - text: ✕
            - generic [ref=f1e24]: Poor
      - region "Annotations" [ref=f1e25]:
        - list [ref=f1e26]:
          - listitem [ref=f1e27]:
            - generic "Annotation 1" [ref=f1e29]
            - paragraph [ref=f1e30]: 500 × 400 px
      - generic [ref=f1e31]:
        - generic [ref=f1e32]:
          - generic [ref=f1e33]: Photo name
          - generic [ref=f1e34]:
            - textbox "Photo name" [ref=f1e35]:
              - /placeholder: annotated-photo
            - generic [ref=f1e36]:
              - text: .jpg
              - button "Edit photo name" [ref=f1e37] [cursor=pointer]
            - group [aria-hidden]:
              - generic: Photo name
        - button [ref=f1e40] [cursor=pointer]
        - paragraph [ref=f1e44]: The photo includes the boxes and labels. Nothing is uploaded.
        - button "Take new photo" [ref=f1e45] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { drag, finishAnnotating, openAnnotate, openPreview, pageOverflow, SIZES } from './helpers.js'
  3   | 
  4   | const MIN_TOUCH_PX = 44
  5   | const ALL_SIZES = { ...SIZES, 'desktop at 200% zoom': [720, 450] }
  6   | const heading = (page, name) => expect(page.getByRole('heading', { name })).toBeVisible()
  7   | 
  8   | async function expectFits(page, screen) {
  9   |   const { x, y } = await pageOverflow(page)
  10  |   expect(x, `${screen}: sideways`).toBeLessThanOrEqual(0)
  11  |   expect(y, `${screen}: page height`).toBeLessThanOrEqual(0)
  12  | }
  13  | 
  14  | async function expectButtonsReachable(page, screen) {
  15  |   const buttons = await page.getByRole('button').all()
  16  |   for (const button of buttons) {
  17  |     if (!(await button.isVisible())) continue
  18  |     await button.scrollIntoViewIfNeeded()
  19  |     const box = await button.boundingBox()
  20  |     const { innerWidth, innerHeight } = await page.evaluate(() => ({ innerWidth: window.innerWidth, innerHeight: window.innerHeight }))
  21  |     expect(box.x, `${screen}: left of the window`).toBeGreaterThanOrEqual(-1)
  22  |     expect(box.y + box.height, `${screen}: below the window`).toBeLessThanOrEqual(innerHeight + 1)
  23  |     expect(box.x + box.width, `${screen}: right of the window`).toBeLessThanOrEqual(innerWidth + 1)
  24  |   }
  25  | }
  26  | 
  27  | for (const [name, [width, height]] of Object.entries(ALL_SIZES)) {
  28  |   test.describe(`${name} ${width} × ${height}`, () => {
  29  |     test.use({ viewport: { width, height } })
  30  | 
  31  |     test('no page scroll, and every button can be reached', async ({ page }) => {
  32  |       await page.goto('/')
  33  |       await expectFits(page, 'landing')
  34  |       await expectButtonsReachable(page, 'landing')
  35  |       await page.getByRole('button', { name: 'Start inspection' }).click()
  36  |       await heading(page, 'Allow the camera')
  37  |       await expectFits(page, 'before you start')
  38  |       await expectButtonsReachable(page, 'before you start')
  39  | 
  40  |       await openAnnotate(page)
  41  |       await expectFits(page, 'annotate empty')
  42  |       await drag(page, [0.2, 0.2], [0.7, 0.7])
  43  |       await expectFits(page, 'annotate')
  44  |       await expectButtonsReachable(page, 'annotate')
  45  |       await page.getByRole('button', { name: 'Back to Preview' }).click()
  46  |       await expectFits(page, 'preview')
  47  |       await expectButtonsReachable(page, 'preview')
  48  |       await page.getByRole('button', { name: 'Annotate' }).click()
  49  |       await finishAnnotating(page)
  50  |       await expectFits(page, 'summary')
  51  |       await expectButtonsReachable(page, 'summary')
  52  |     })
  53  | 
  54  |     test('the camera screen fits', async ({ page }) => {
  55  |       await page.goto('/')
  56  |       await page.getByRole('button', { name: 'Start inspection' }).click()
  57  |       await page.getByRole('button', { name: 'Allow camera permissions' }).click()
  58  |       await page.getByRole('button', { name: 'Open camera' }).click()
  59  |       await expect(page.getByRole('button', { name: 'Take photo' })).toBeEnabled()
  60  |       await expectFits(page, 'capture')
  61  |       await expectButtonsReachable(page, 'capture')
  62  |     })
  63  |   })
  64  | }
  65  | 
  66  | test.describe('phone touch targets', () => {
  67  |   test.use({ viewport: { width: 390, height: 844 } })
  68  | 
  69  |   async function expectTouchSize(page, screen) {
  70  |     const small = []
  71  |     for (const button of await page.getByRole('button').all()) {
  72  |       if (!(await button.isVisible())) continue
  73  |       const box = await button.boundingBox()
  74  |       // Some small buttons have a larger invisible touch area from an ::after element.
  75  |       const extra = await button.evaluate((element) => Math.max(0, -parseFloat(getComputedStyle(element, '::after').top) * 2 || 0))
  76  |       if (box.width + extra < MIN_TOUCH_PX || box.height + extra < MIN_TOUCH_PX) small.push(`${await button.getAttribute('aria-label') ?? await button.textContent()} ${Math.round(box.width)}×${Math.round(box.height)}`)
  77  |     }
> 78  |     expect.soft(small, `${screen}: under ${MIN_TOUCH_PX} px`).toEqual([])
      |                                                               ^ Error: annotate: under 44 px
  79  |   }
  80  | 
  81  |   test('every button on every screen is at least 44 px', async ({ page }) => {
  82  |     test.fail(true, 'Open finding: the Choose a photo link, New photo and the zoom tools are smaller.')
  83  |     await page.goto('/')
  84  |     await expectTouchSize(page, 'landing')
  85  |     await page.getByRole('button', { name: 'Start inspection' }).click()
  86  |     await heading(page, 'Allow the camera')
  87  |     await expectTouchSize(page, 'before you start')
  88  |     await openPreview(page, { width: 1000, height: 800 })
  89  |     await expectTouchSize(page, 'preview')
  90  |     await page.getByRole('button', { name: 'Annotate' }).click()
  91  |     await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  92  |     await drag(page, [0.2, 0.2], [0.7, 0.7])
  93  |     await expectTouchSize(page, 'annotate')
  94  |     await finishAnnotating(page)
  95  |     await expectTouchSize(page, 'summary')
  96  |   })
  97  | })
  98  | 
  99  | test.describe('scroll bars', () => {
  100 |   const list = (page) => page.getByRole('region', { name: 'Annotations' }).getByRole('list')
  101 |   const BORDERS_PX = 2
  102 |   const barWidth = (page) => list(page).evaluate((element) => element.offsetWidth - element.clientWidth)
  103 | 
  104 |   async function drawMany(page, count) {
  105 |     for (let i = 0; i < count; i++) {
  106 |       const left = 0.05 + (i % 4) * 0.22
  107 |       const top = 0.05 + Math.floor(i / 4) * 0.22
  108 |       await drag(page, [left, top], [left + 0.15, top + 0.15])
  109 |     }
  110 |   }
  111 | 
  112 |   test('a short list keeps no empty strip beside its rows', async ({ page }) => {
  113 |     await openAnnotate(page)
  114 |     await drawMany(page, 2)
  115 |     expect(await barWidth(page)).toBe(BORDERS_PX)
  116 |   })
  117 | 
  118 |   test('a long list shows a bar', async ({ page }) => {
  119 |     await openAnnotate(page)
  120 |     await drawMany(page, 14)
  121 |     expect(await barWidth(page)).toBeGreaterThan(BORDERS_PX)
  122 |   })
  123 | 
  124 |   test.describe('where the browser hides bars', () => {
  125 |     const thumb = (page) => list(page).locator('li[aria-hidden]')
  126 | 
  127 |     test.beforeEach(async ({ page }) => {
  128 |       const client = await page.context().newCDPSession(page)
  129 |       await client.send('Emulation.setScrollbarsHidden', { hidden: true })
  130 |     })
  131 | 
  132 |     test('the thumb shows only when the list overflows', async ({ page }) => {
  133 |       await openAnnotate(page)
  134 |       await drawMany(page, 1)
  135 |       await expect(thumb(page)).toBeHidden()
  136 |       await drawMany(page, 14)
  137 |       await expect(thumb(page)).toBeVisible()
  138 |     })
  139 |   })
  140 | })
  141 | 
```