import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { expect, test } from '@playwright/test'
import { annotate, canvasBoxes, downloadPhoto, drag, finishAnnotating, inspectJpeg, makePhoto, openAnnotate, pickFile } from './helpers.js'

const KB = 1024
const FIRST_LOAD_BUDGET_KB = 200
const LARGEST_LAZY_CHUNK_KB = 40
const MAX_LAYOUT_SHIFT = 0.01
const gzippedKb = (path) => gzipSync(readFileSync(path)).length / KB

test('the first download stays within budget', () => {
  const html = readFileSync('dist/index.html', 'utf8')
  const files = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1])
  expect(files.length).toBeGreaterThan(0)
  const total = files.reduce((sum, file) => sum + gzippedKb(`dist/${file}`), 0)
  expect(total).toBeLessThan(FIRST_LOAD_BUDGET_KB)
})

test('screens loaded later are small', () => {
  const entry = readFileSync('dist/index.html', 'utf8')
  const lazy = readdirSync('dist/assets').filter((file) => file.endsWith('.js') && !entry.includes(file))
  expect(lazy.length).toBeGreaterThan(0)
  for (const file of lazy) expect(gzippedKb(`dist/assets/${file}`), file).toBeLessThan(LARGEST_LAZY_CHUNK_KB)
})

test('nothing jumps while working', async ({ page }) => {
  await page.addInitScript(() => {
    window.__shift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await openAnnotate(page)
  await drag(page, [0.1, 0.1], [0.4, 0.4])
  await drag(page, [0.5, 0.5], [0.8, 0.8])
  await finishAnnotating(page)
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => window.__shift)).toBeLessThan(MAX_LAYOUT_SHIFT)
})

test('40 boxes can be drawn and all stay', async ({ page }) => {
  await openAnnotate(page)
  for (let i = 0; i < 40; i++) {
    const left = 0.02 + (i % 8) * 0.12
    const top = 0.02 + Math.floor(i / 8) * 0.19
    await drag(page, [left, top], [left + 0.08, top + 0.12])
  }
  await expect(canvasBoxes(page)).toHaveCount(40)
  await expect(page.getByRole('button', { name: 'Done · 40 annotations' })).toBeVisible()
})

test('a 27 MP photo goes through at full size', async ({ page }) => {
  const SIZE = { width: 6000, height: 4500 }
  await page.goto('/')
  const photo = await makePhoto(page, SIZE)
  await page.getByRole('button', { name: 'Start inspection' }).click()
  await pickFile(page, photo)
  await annotate(page)
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  await drag(page, [0.2, 0.2], [0.7, 0.7])
  await finishAnnotating(page)
  const { jpeg } = await downloadPhoto(page)
  const { width, height } = await inspectJpeg(page, jpeg)
  expect({ width, height }).toEqual(SIZE)
})
