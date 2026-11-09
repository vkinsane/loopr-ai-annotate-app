import { expect, test } from '@playwright/test'
import { downloadPhoto, drag, openAnnotate, openBeforeYouStart, pickFile } from './helpers.js'

const MB = 1024 * 1024
const label = (page, number = 1) => page.getByLabel(`Name of annotation ${number}`)
const tooltip = (page) => page.getByRole('tooltip')

test.describe('annotation names', () => {
  test.beforeEach(async ({ page }) => {
    await openAnnotate(page)
    await drag(page, [0.1, 0.1], [0.3, 0.3])
  })

  test('characters that are not allowed are removed, with a note', async ({ page }) => {
    await label(page).fill('Dent<#>')
    await expect(label(page)).toHaveValue('Dent')
    await expect(tooltip(page)).toContainText('Only letters, numbers')
  })

  test('pasted text is cleaned too', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.evaluate(() => navigator.clipboard.writeText('one\ttwo $three'))
    await label(page).fill('')
    await page.keyboard.press('ControlOrMeta+V')
    await expect(label(page)).toHaveValue('one two three')
  })

  test('stops at 40 characters', async ({ page }) => {
    await label(page).fill('a'.repeat(50))
    await expect(label(page)).toHaveValue('a'.repeat(40))
    await expect(tooltip(page)).toContainText('up to 40')
  })

  test('other languages are kept', async ({ page }) => {
    await label(page).fill('डेंट côté')
    await expect(label(page)).toHaveValue('डेंट côté')
  })

  test('an emptied name goes back to the old one', async ({ page }) => {
    await label(page).fill('   ')
    await label(page).blur()
    await expect(label(page)).toHaveValue('Annotation 1')
  })

  test('spaces around a name are removed on blur', async ({ page }) => {
    await label(page).fill('Dent ')
    await label(page).press('Enter')
    await expect(label(page)).toHaveValue('Dent')
  })

  test('a repeated name is kept, with a warning', async ({ page }) => {
    await drag(page, [0.5, 0.5], [0.7, 0.7])
    await label(page, 2).fill('annotation 1')
    await label(page, 2).blur()
    await expect(label(page, 2)).toHaveValue('annotation 1')
    await expect(tooltip(page)).toContainText('same name')
  })

  test('a note does not move the rows', async ({ page }) => {
    const before = await label(page).boundingBox()
    await label(page).fill('Dent#')
    await expect(tooltip(page)).toBeVisible()
    expect(await label(page).boundingBox()).toEqual(before)
  })
})

test.describe('photo name', () => {
  test.beforeEach(async ({ page }) => {
    await openAnnotate(page)
    await drag(page, [0.1, 0.1], [0.3, 0.3])
    await page.getByRole('button', { name: /^Done/ }).click()
  })
  const name = (page) => page.getByLabel('Photo name', { exact: true })

  test('path characters are removed, so the file stays in Downloads', async ({ page }) => {
    await name(page).fill('../../evil.exe')
    await expect(name(page)).toHaveValue('evilexe')
    expect((await downloadPhoto(page)).name).toBe('evilexe.jpg')
  })

  test('stops at 60 characters', async ({ page }) => {
    await name(page).fill('b'.repeat(70))
    await expect(name(page)).toHaveValue('b'.repeat(60))
  })

  test('survives going back to Annotate', async ({ page }) => {
    await name(page).fill('front-door')
    await page.getByRole('button', { name: 'Back to Annotate' }).click()
    await page.getByRole('button', { name: /^Done/ }).click()
    await expect(name(page)).toHaveValue('front-door')
  })
})

test.describe('picked files', () => {
  test.beforeEach(({ page }) => openBeforeYouStart(page))
  const expectRefused = async (page, text) => {
    await expect(page.getByRole('alert')).toContainText(text)
    await expect(page.getByRole('button', { name: 'Retake' })).toHaveCount(0)
  }

  test('a text file named .jpg is refused', async ({ page }) => {
    await pickFile(page, Buffer.from('this is not a photo'))
    await expectRefused(page, 'not a photo')
  })
  test('an empty file is refused', async ({ page }) => {
    await pickFile(page, Buffer.alloc(0))
    await expectRefused(page, 'empty')
  })
  test('a file over 30 MB is refused', async ({ page }) => {
    const buffer = Buffer.alloc(31 * MB)
    buffer.set([0xff, 0xd8, 0xff, 0xe0])
    await pickFile(page, buffer)
    await expectRefused(page, '30 MB')
  })
})
