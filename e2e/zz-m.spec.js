import { test } from '@playwright/test'
import { annotate, openPreview } from './helpers.js'
test.use({ viewport: { width: 1440, height: 900 } })
test('m', async ({ page }) => {
  const m = () => page.evaluate(() => {
    const h = document.querySelector('header')?.getBoundingClientRect().height
    const img = document.querySelector('img[alt="Captured photo"], img')?.getBoundingClientRect()
    const main = document.querySelector('main')
    return { h, imgTop: img?.top, imgH: img?.height, mainPad: main && getComputedStyle(main).padding }
  })
  await openPreview(page, { width: 1200, height: 1600 })
  console.log('preview', JSON.stringify(await m()))
  await annotate(page); await page.waitForTimeout(500)
  console.log('annotate', JSON.stringify(await m()))
})
