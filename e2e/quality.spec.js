import { expect, test } from '@playwright/test'
import { makePhoto, openBeforeYouStart, openPreview, pickFile, withExifRotation } from './helpers.js'

const row = (page, label) => page.getByRole('list', { name: 'Quality checks' }).getByRole('listitem').filter({ hasText: label })
const BIG = { width: 4000, height: 3000 }

test('a detailed, well-lit 12 MP photo is all Good', async ({ page }) => {
  await openPreview(page, BIG)
  for (const label of ['Resolution', 'File size', 'Brightness', 'Sharpness']) await expect(row(page, label)).toContainText('Good')
  await expect(row(page, 'Resolution')).toContainText('4000 × 3000 · 12.0 MP')
  await expect(row(page, 'Sharpness')).toContainText('Sharp')
  await expect(page.getByRole('button', { name: 'Annotate' })).toHaveClass(/contained/)
})

test('a dark photo is Poor, with advice, and Retake becomes the main button', async ({ page }) => {
  await openPreview(page, { ...BIG, kind: 'dark' })
  await expect(row(page, 'Brightness')).toContainText('Poor')
  await expect(page.getByRole('alert')).toContainText(/dark/i)
  await expect(page.getByRole('button', { name: 'Retake' })).toHaveClass(/contained/)
  await expect(page.getByRole('button', { name: 'Annotate' })).toBeEnabled()
})

test('a very bright photo is Poor', async ({ page }) => {
  await openPreview(page, { ...BIG, kind: 'bright' })
  await expect(row(page, 'Brightness')).toContainText('Poor')
  await expect(page.getByRole('alert')).toContainText(/bright/i)
})

test('a photo with no detail is graded Blurry', async ({ page }) => {
  await openPreview(page, { ...BIG, kind: 'flat' })
  await expect(row(page, 'Sharpness')).toContainText('Blurry')
  await expect(row(page, 'Sharpness')).toContainText('Poor')
})

test('a low-resolution photo is Poor', async ({ page }) => {
  await openPreview(page, { width: 1000, height: 800 })
  await expect(row(page, 'Resolution')).toContainText('Poor')
})

test('the info button explains how to improve', async ({ page }) => {
  await openPreview(page, { width: 1000, height: 800 })
  await row(page, 'Resolution').getByRole('button', { name: 'More information' }).hover()
  await expect(page.getByRole('tooltip')).toContainText(/\w+/)
})

test('a damaged photo reports that it cannot be read and blocks Annotate', async ({ page }) => {
  await openBeforeYouStart(page)
  await pickFile(page, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8]))
  await expect(page.getByRole('alert')).toContainText("Couldn't read this photo")
  await expect(page.getByRole('button', { name: 'Annotate' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Retake' })).toBeEnabled()
})

test('a portrait photo keeps its shape', async ({ page }) => {
  await openPreview(page, { width: 1200, height: 1600 })
  await expect(row(page, 'Resolution')).toContainText('1200 × 1600')
})

test('EXIF rotation is applied to the measured size', async ({ page }) => {
  await page.goto('/')
  const photo = withExifRotation(await makePhoto(page, { width: 1600, height: 1200 }))
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await pickFile(page, photo)
  await expect(row(page, 'Resolution')).toContainText('1200 × 1600')
})

test('PNG and WebP photos are accepted', async ({ page }) => {
  await page.goto('/')
  const [png, webp] = await page.evaluate(() => ['image/png', 'image/webp'].map((type) => {
    const canvas = Object.assign(document.createElement('canvas'), { width: 400, height: 300 })
    canvas.getContext('2d').fillRect(0, 0, 200, 150)
    return canvas.toDataURL(type).split(',')[1]
  }))
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await pickFile(page, Buffer.from(png, 'base64'), 'a.png', 'image/png')
  await expect(row(page, 'Resolution')).toContainText('400 × 300')
  await page.getByRole('button', { name: 'Retake' }).click()
  await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
  await page.goBack()
  await openBeforeYouStart(page)
  await pickFile(page, Buffer.from(webp, 'base64'), 'a.webp', 'image/webp')
  await expect(row(page, 'Resolution')).toContainText('400 × 300')
})
