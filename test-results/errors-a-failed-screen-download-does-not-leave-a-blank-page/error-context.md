# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: errors.spec.js >> a failed screen download does not leave a blank page
- Location: e2e/errors.spec.js:17:1

# Error details

```
Error: expect(locator).not.toBeEmpty() failed

Locator:  locator('#root')
Expected: not empty
Received: empty
Timeout:  5000ms

Call log:
  - Expect "not toBeEmpty" locator('#root') with timeout 5000ms
  - waiting for locator('#root')
    14 × locator resolved to <div id="root"></div>
       - unexpected value "empty"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { downloadPhoto, drag, finishAnnotating, openAnnotateWithBox, openPreview } from './helpers.js'
  3  | 
  4  | const ANNOTATE_CHUNK = '**/assets/AnnotateScreen-*.js'
  5  | 
  6  | test('a slow screen download shows the loader', async ({ page }) => {
  7  |   await page.route(ANNOTATE_CHUNK, async (route) => {
  8  |     await new Promise((resolve) => setTimeout(resolve, 800))
  9  |     await route.continue()
  10 |   })
  11 |   await openPreview(page)
  12 |   await page.getByRole('button', { name: 'Annotate' }).click()
  13 |   await expect(page.getByRole('status').filter({ hasText: 'Loading…' })).toBeVisible()
  14 |   await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  15 | })
  16 | 
  17 | test('a failed screen download does not leave a blank page', async ({ page }) => {
  18 |   test.fail(true, 'Open finding: there is no error boundary around the lazy screens.')
  19 |   await page.route(ANNOTATE_CHUNK, (route) => route.abort())
  20 |   await openPreview(page)
  21 |   await page.getByRole('button', { name: 'Annotate' }).click()
  22 |   await page.waitForTimeout(1000)
> 23 |   await expect(page.locator('#root')).not.toBeEmpty()
     |                                           ^ Error: expect(locator).not.toBeEmpty() failed
  24 | })
  25 | 
  26 | test('screens already loaded keep working offline', async ({ page, context }) => {
  27 |   await openAnnotateWithBox(page)
  28 |   await finishAnnotating(page)
  29 |   await context.setOffline(true)
  30 |   await page.getByRole('button', { name: 'Back to Annotate' }).click()
  31 |   await drag(page, [0.6, 0.6], [0.8, 0.8])
  32 |   await finishAnnotating(page)
  33 |   expect((await downloadPhoto(page)).name).toBe('annotated-photo.jpg')
  34 | })
  35 | 
  36 | test('a failed download says so and can be retried', async ({ page }) => {
  37 |   await openAnnotateWithBox(page)
  38 |   await finishAnnotating(page)
  39 |   await page.evaluate(() => {
  40 |     window.__real = window.createImageBitmap
  41 |     window.createImageBitmap = () => Promise.reject(new Error('test'))
  42 |   })
  43 |   await page.getByRole('button', { name: 'Download photo' }).click()
  44 |   await expect(page.getByRole('alert')).toContainText("Couldn't make the photo")
  45 |   await page.evaluate(() => { window.createImageBitmap = window.__real })
  46 |   expect((await downloadPhoto(page)).name).toBe('annotated-photo.jpg')
  47 | })
  48 | 
  49 | test('no page errors in a full run', async ({ page }) => {
  50 |   const errors = []
  51 |   page.on('pageerror', (error) => errors.push(error.message))
  52 |   page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  53 |   await openAnnotateWithBox(page)
  54 |   await finishAnnotating(page)
  55 |   await downloadPhoto(page)
  56 |   expect(errors).toEqual([])
  57 | })
  58 | 
```