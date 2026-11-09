import { expect, test } from '@playwright/test'
import { downloadPhoto, drag, openAnnotate, openPreview } from './helpers.js'

const ANNOTATE_CHUNK = '**/assets/AnnotateScreen-*.js'

test('a slow screen download shows the loader', async ({ page }) => {
  await page.route(ANNOTATE_CHUNK, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.continue()
  })
  await openPreview(page)
  await page.getByRole('button', { name: 'Annotate' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Loading…' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
})

test('a failed screen download does not leave a blank page', async ({ page }) => {
  test.fail(true, 'Open finding: there is no error boundary around the lazy screens.')
  await page.route(ANNOTATE_CHUNK, (route) => route.abort())
  await openPreview(page)
  await page.getByRole('button', { name: 'Annotate' }).click()
  await page.waitForTimeout(1000)
  await expect(page.locator('#root')).not.toBeEmpty()
})

test('screens already loaded keep working offline', async ({ page, context }) => {
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.5, 0.5])
  await page.getByRole('button', { name: /^Done/ }).click()
  await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Back to Annotate' }).click()
  await drag(page, [0.6, 0.6], [0.8, 0.8])
  await page.getByRole('button', { name: /^Done/ }).click()
  expect((await downloadPhoto(page)).name).toBe('annotated-photo.jpg')
})

test('a failed download says so and can be retried', async ({ page }) => {
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.5, 0.5])
  await page.getByRole('button', { name: /^Done/ }).click()
  await page.evaluate(() => {
    window.__real = window.createImageBitmap
    window.createImageBitmap = () => Promise.reject(new Error('test'))
  })
  await page.getByRole('button', { name: 'Download photo' }).click()
  await expect(page.getByRole('alert')).toContainText("Couldn't make the photo")
  await page.evaluate(() => { window.createImageBitmap = window.__real })
  expect((await downloadPhoto(page)).name).toBe('annotated-photo.jpg')
})

test('no page errors in a full run', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.5, 0.5])
  await page.getByRole('button', { name: /^Done/ }).click()
  await downloadPhoto(page)
  expect(errors).toEqual([])
})
