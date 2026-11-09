# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: errors.spec.js >> a failed screen download does not leave a blank page
- Location: e2e/errors.spec.js:17:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type=file]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - button "Back" [ref=e6] [cursor=pointer]
      - heading "Before you start" [level=1] [ref=e9]
  - generic [ref=e10]:
    - list [ref=e11]:
      - listitem [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Step 1 done
          - generic [ref=e18]:
            - heading "Allow the camera" [level=2] [ref=e19]
            - paragraph [ref=e20]: Used only to take inspection photos. Photos stay on this device.
        - generic [ref=e21]:
          - generic [ref=e22]: Camera allowed
          - paragraph [ref=e25]: You are ready. Tap Open camera.
      - listitem [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: "2"
          - generic [ref=e29]:
            - heading "Capture & check" [level=2] [ref=e30]
            - paragraph [ref=e31]: You get tips while you aim. After you take the photo, the app checks its resolution, file size, brightness and sharpness.
      - listitem [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: "3"
          - generic [ref=e35]:
            - heading "Annotate the photo" [level=2] [ref=e36]
            - paragraph [ref=e37]: Drag on the photo to draw a box, then give it a name. Drag a box to move it, or a corner to resize it.
    - generic [ref=e38]:
      - region "For a good photo" [ref=e39]:
        - heading "For a good photo" [level=2] [ref=e40]
        - list [ref=e41]:
          - listitem [ref=e42]: Good light
          - listitem [ref=e45]: Hold steady
          - listitem [ref=e48]: Fill the frame
      - generic [ref=e51]:
        - paragraph [ref=e52]: Your camera is ready.
        - button "Open camera" [ref=e53] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect } from '@playwright/test'
  2   | 
  3   | export const SIZES = { smallPhone: [320, 568], phone: [390, 844], tablet: [820, 1180], desktop: [1440, 900], landscapePhone: [844, 390] }
  4   | export const PHOTO = { width: 1600, height: 1200 }
  5   | 
  6   | /**
  7   |  * A JPEG made in the page's canvas, as a Buffer. `kind` sets what the quality check sees:
  8   |  * sharp (random blocks), dark, bright, flat (no detail, so blurry).
  9   |  */
  10  | export async function makePhoto(page, { width = PHOTO.width, height = PHOTO.height, kind = 'sharp' } = {}) {
  11  |   const dataUrl = await page.evaluate(({ width, height, kind }) => {
  12  |     const LEVELS = { sharp: [50, 200], dark: [0, 45], bright: [225, 255], flat: [128, 128] }
  13  |     const BLOCK_PX = Math.max(4, Math.round(width / 160))
  14  |     const [low, high] = LEVELS[kind]
  15  |     const canvas = Object.assign(document.createElement('canvas'), { width, height })
  16  |     const context = canvas.getContext('2d')
  17  |     let seed = 7
  18  |     for (let y = 0; y < height; y += BLOCK_PX) {
  19  |       for (let x = 0; x < width; x += BLOCK_PX) {
  20  |         seed = (seed * 16807) % 2147483647
  21  |         const level = seed % 2 ? low : high
  22  |         context.fillStyle = `rgb(${level},${level},${level})`
  23  |         context.fillRect(x, y, BLOCK_PX, BLOCK_PX)
  24  |       }
  25  |     }
  26  |     return canvas.toDataURL('image/jpeg', 0.92)
  27  |   }, { width, height, kind })
  28  |   return Buffer.from(dataUrl.split(',')[1], 'base64')
  29  | }
  30  | 
  31  | /** Adds an EXIF block saying "rotate 90°" to a JPEG, as phones do for portrait photos. */
  32  | export function withExifRotation(jpeg) {
  33  |   const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0]
  34  |   const payload = [...Buffer.from('Exif\0\0', 'latin1'), ...tiff]
  35  |   const length = payload.length + 2
  36  |   return Buffer.concat([jpeg.subarray(0, 2), Buffer.from([0xff, 0xe1, length >> 8, length & 0xff, ...payload]), jpeg.subarray(2)])
  37  | }
  38  | 
  39  | export async function openBeforeYouStart(page) {
  40  |   await page.goto('/')
  41  |   await page.getByRole('button', { name: 'Start inspection' }).click()
  42  |   await expect(page.getByRole('heading', { name: 'Allow the camera' })).toBeVisible()
  43  | }
  44  | 
  45  | export async function pickFile(page, buffer, name = 'photo.jpg', mimeType = 'image/jpeg') {
> 46  |   await page.locator('input[type=file]').setInputFiles({ name, mimeType, buffer })
      |   ^ Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
  47  | }
  48  | 
  49  | /** Goes to Preview with a generated photo. */
  50  | export async function openPreview(page, options) {
  51  |   await page.goto('/')
  52  |   const photo = await makePhoto(page, options)
  53  |   await page.getByRole('button', { name: 'Start inspection' }).click()
  54  |   await pickFile(page, photo)
  55  |   await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible()
  56  | }
  57  | 
  58  | export async function openAnnotate(page, options) {
  59  |   await openPreview(page, options)
  60  |   await page.getByRole('button', { name: 'Annotate' }).click()
  61  |   await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  62  | }
  63  | 
  64  | /** Annotate with one box already drawn. */
  65  | export async function openAnnotateWithBox(page, options) {
  66  |   await openAnnotate(page, options)
  67  |   await drag(page, [0.2, 0.2], [0.5, 0.5])
  68  | }
  69  | 
  70  | export async function finishAnnotating(page) {
  71  |   await page.getByRole('button', { name: /^Done/ }).click()
  72  |   await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
  73  | }
  74  | 
  75  | export async function openCapture(page) {
  76  |   await openBeforeYouStart(page)
  77  |   await page.getByRole('button', { name: 'Allow camera permissions' }).click()
  78  |   await page.getByRole('button', { name: 'Open camera' }).click()
  79  | }
  80  | 
  81  | export const photoImage = (page) => page.getByAltText('Captured photo')
  82  | export const canvasBoxes = (page) => page.locator('div[data-id]')
  83  | 
  84  | /** Screen position of a point given as fractions of the photo. */
  85  | export async function screenPoint(page, [fx, fy]) {
  86  |   const area = await photoImage(page).boundingBox()
  87  |   return { x: area.x + fx * area.width, y: area.y + fy * area.height }
  88  | }
  89  | 
  90  | export async function dragScreen(page, from, to) {
  91  |   await page.mouse.move(from.x, from.y)
  92  |   await page.mouse.down()
  93  |   await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2)
  94  |   await page.mouse.move(to.x, to.y)
  95  |   await page.mouse.up()
  96  | }
  97  | 
  98  | /** Drags between two points given as fractions of the photo. */
  99  | export async function drag(page, from, to) {
  100 |   await dragScreen(page, await screenPoint(page, from), await screenPoint(page, to))
  101 | }
  102 | 
  103 | /** Each box as { x, y, width, height } in photo pixels, read from where it is on screen. */
  104 | export async function boxesInPhotoPixels(page, photo = PHOTO) {
  105 |   const area = await photoImage(page).boundingBox()
  106 |   const scale = photo.width / area.width
  107 |   const boxes = await canvasBoxes(page).evaluateAll((elements) => elements.map((element) => {
  108 |     const { x, y, width, height } = element.getBoundingClientRect()
  109 |     return { x, y, width, height }
  110 |   }))
  111 |   return boxes.map((box) => ({ x: (box.x - area.x) * scale, y: (box.y - area.y) * scale, width: box.width * scale, height: box.height * scale }))
  112 | }
  113 | 
  114 | /** Box positions on screen include the line width and rounding, so a few photo pixels of tolerance are needed. */
  115 | export function expectRect(actual, expected, tolerance = 8) {
  116 |   for (const key of ['x', 'y', 'width', 'height']) {
  117 |     expect(Math.abs(actual[key] - expected[key]), `${key}: ${actual[key]} vs ${expected[key]}`).toBeLessThanOrEqual(tolerance)
  118 |   }
  119 | }
  120 | 
  121 | export async function pageOverflow(page) {
  122 |   return page.evaluate(() => ({
  123 |     x: document.documentElement.scrollWidth - window.innerWidth,
  124 |     y: document.documentElement.scrollHeight - window.innerHeight,
  125 |   }))
  126 | }
  127 | 
  128 | /** Reads a JPEG in the page: its size, and the colour at each [x, y] in `points`. */
  129 | export async function inspectJpeg(page, jpeg, points = []) {
  130 |   return page.evaluate(async ({ base64, points }) => {
  131 |     const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  132 |     const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }))
  133 |     const canvas = Object.assign(document.createElement('canvas'), { width: bitmap.width, height: bitmap.height })
  134 |     const context = canvas.getContext('2d')
  135 |     context.drawImage(bitmap, 0, 0)
  136 |     return { width: bitmap.width, height: bitmap.height, colors: points.map(([x, y]) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3)) }
  137 |   }, { base64: jpeg.toString('base64'), points })
  138 | }
  139 | 
  140 | export async function downloadPhoto(page) {
  141 |   const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download photo' }).click()])
  142 |   const chunks = []
  143 |   for await (const chunk of await download.createReadStream()) chunks.push(chunk)
  144 |   return { name: download.suggestedFilename(), jpeg: Buffer.concat(chunks) }
  145 | }
  146 | 
```