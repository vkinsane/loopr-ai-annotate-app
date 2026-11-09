import { expect, test } from '@playwright/test'
import { downloadPhoto, drag, openAnnotate } from './helpers.js'

const XSS = '<img src=x onerror="window.__xss=1">'

test('markup in a box name is never run', async ({ page }) => {
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.7, 0.7])
  await page.getByLabel('Name of annotation 1').fill(XSS)
  await page.getByLabel('Name of annotation 1').blur()
  await page.getByRole('button', { name: /^Done/ }).click()
  await expect(page.getByRole('heading', { name: 'Inspection summary' })).toBeVisible()
  expect(await page.evaluate(() => window.__xss)).toBeUndefined()
  await expect(page.locator('img[src="x"]')).toHaveCount(0)
})

test('markup in the photo name is never run', async ({ page }) => {
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.7, 0.7])
  await page.getByRole('button', { name: /^Done/ }).click()
  const name = page.getByLabel('Photo name', { exact: true })
  await name.fill(XSS)
  expect(await name.inputValue()).not.toMatch(/[<>"=]/)
  expect(await page.evaluate(() => window.__xss)).toBeUndefined()
})

test('the photo never leaves the device and nothing is stored', async ({ page }) => {
  const sent = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' || request.postData()) sent.push(`${request.method()} ${request.url()}`)
  })
  await openAnnotate(page)
  const url = page.url()
  await drag(page, [0.2, 0.2], [0.7, 0.7])
  await page.getByLabel('Name of annotation 1').fill('secret name')
  await page.getByRole('button', { name: /^Done/ }).click()
  await downloadPhoto(page)

  expect(sent).toEqual([])
  expect(page.url()).toBe(url)
  expect(new URL(page.url()).search).toBe('')
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }))).toEqual({ local: 0, session: 0, cookie: '' })
  expect(await page.evaluate(async () => (await indexedDB.databases()).length)).toBe(0)
})

test('names are not written to the console', async ({ page }) => {
  const logs = []
  page.on('console', (message) => logs.push(message.text()))
  await openAnnotate(page)
  await drag(page, [0.2, 0.2], [0.7, 0.7])
  await page.getByLabel('Name of annotation 1').fill('secret name')
  await page.getByRole('button', { name: /^Done/ }).click()
  expect(logs.filter((line) => line.includes('secret'))).toEqual([])
})
