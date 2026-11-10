import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { finishAnnotating, openAnnotate, openAnnotateWithBox, openBeforeYouStart, openCapture, openPreview } from './helpers.js'

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function expectNoViolations(page) {
  // The screens fade in; axe would measure the contrast half-way through.
  await page.waitForTimeout(500)
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze()
  expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target).join(' | ')}`)).toEqual([])
}

const focusedName = (page) => page.evaluate(() => document.activeElement.getAttribute('aria-label') ?? document.activeElement.textContent)

test.describe('axe, WCAG 2.1 AA', () => {
  test('Landing', async ({ page }) => {
    await page.goto('/')
    await expectNoViolations(page)
  })
  test('Before you start', async ({ page }) => {
    await openBeforeYouStart(page)
    await expectNoViolations(page)
  })
  test('Capture', async ({ page }) => {
    await openCapture(page)
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeEnabled()
    await expectNoViolations(page)
  })
  test('Preview', async ({ page }) => {
    await openPreview(page, { width: 1000, height: 800 })
    await expectNoViolations(page)
  })
  test('Annotate with boxes', async ({ page }) => {
    await openAnnotateWithBox(page)
    await expectNoViolations(page)
  })
  test('Summary', async ({ page }) => {
    await openAnnotateWithBox(page)
    await finishAnnotating(page)
    await expectNoViolations(page)
  })
  test('Dialog', async ({ page }) => {
    await openAnnotate(page)
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expectNoViolations(page)
  })
})

test('the first steps work with the keyboard alone', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  expect(await focusedName(page)).toContain('Start inspection')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Allow the camera' })).toBeVisible()
})

test('a dialog starts on the safe choice, traps focus and closes on Escape', async ({ page }) => {
  await openAnnotateWithBox(page)
  const newPhoto = page.getByRole('button', { name: 'New photo' })
  await newPhoto.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused()
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('[role=dialog]') || document.activeElement.hasAttribute('data-testid')))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(newPhoto).toBeFocused()
})

test('a box can be renamed and deleted from the keyboard', async ({ page }) => {
  await openAnnotateWithBox(page)
  const name = page.getByLabel('Name of annotation 1')
  await name.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Dent')
  await page.keyboard.press('Enter')
  await expect(name).toHaveValue('Dent')
  await page.getByRole('button', { name: 'Delete Dent' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('No annotations yet')).toBeVisible()
})

test('the info tooltip opens with the keyboard', async ({ page }) => {
  await openPreview(page, { width: 1000, height: 800 })
  await page.getByRole('button', { name: 'Open photo full screen' }).focus()
  await page.keyboard.press('Tab')
  expect(await focusedName(page)).toBe('More information')
  await expect(page.getByRole('tooltip')).toBeVisible()
})

test('errors are announced', async ({ page }) => {
  await openPreview(page, { kind: 'dark' })
  await expect(page.getByRole('alert')).toHaveCount(1)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the Landing demo does not animate', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Start inspection' })).toBeVisible()
    expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.effect.getTiming().iterations === Infinity).length)).toBe(0)
  })
})
