// Pure rules from utils/, run without a browser. Exact boundaries are cheaper and clearer here than through images.
import { expect, test } from '@playwright/test'
import { finishText, readTilt, TEXT_RULES, tiltAdvice, toCameraError, validatePhotoFile, validateText } from '../src/utils/index.js'
import { annotationsReducer, initialAnnotations } from '../src/utils/annotations.js'
import { clamp, isTooSmall, moveRect, rectFromPoints, resizeRect } from '../src/utils/geometry.js'
import { getCaptureHint, gradeBrightness, gradeFileSize, gradePhoto, gradeResolution, gradeSharpness, laplacianVariance, meanBrightness, qualityChecks } from '../src/utils/quality.js'

const SIZE = { width: 1000, height: 800 }
const KB = 1024
const NAME = TEXT_RULES.annotationName
const PHOTO_NAME = TEXT_RULES.photoName

test.describe('geometry', () => {
  test('a drag in any direction gives the same rect', () => {
    const expected = { x: 10, y: 20, width: 90, height: 60 }
    expect(rectFromPoints({ x: 10, y: 20 }, { x: 100, y: 80 })).toEqual(expected)
    expect(rectFromPoints({ x: 100, y: 80 }, { x: 10, y: 20 })).toEqual(expected)
    expect(rectFromPoints({ x: 10, y: 80 }, { x: 100, y: 20 })).toEqual(expected)
    expect(rectFromPoints({ x: 100, y: 20 }, { x: 10, y: 80 })).toEqual(expected)
  })
  test('moving stops at every edge and keeps the size', () => {
    const rect = { x: 100, y: 100, width: 200, height: 100 }
    expect(moveRect(rect, -500, -500, SIZE)).toEqual({ x: 0, y: 0, width: 200, height: 100 })
    expect(moveRect(rect, 5000, 5000, SIZE)).toEqual({ x: 800, y: 700, width: 200, height: 100 })
  })
  test('resizing keeps the opposite corner fixed and can flip', () => {
    const rect = { x: 100, y: 100, width: 200, height: 100 }
    expect(resizeRect(rect, 'bottom-right', { x: 400, y: 300 })).toEqual({ x: 100, y: 100, width: 300, height: 200 })
    expect(resizeRect(rect, 'top-left', { x: 50, y: 50 })).toEqual({ x: 50, y: 50, width: 250, height: 150 })
    expect(resizeRect(rect, 'bottom-right', { x: 50, y: 50 })).toEqual({ x: 50, y: 50, width: 50, height: 50 })
  })
  test('minimum size and clamp', () => {
    expect(isTooSmall({ width: 11, height: 50 }, 12)).toBe(true)
    expect(isTooSmall({ width: 12, height: 12 }, 12)).toBe(false)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

test.describe('annotations reducer', () => {
  const rect = { x: 1, y: 2, width: 30, height: 40 }
  const withBox = annotationsReducer(initialAnnotations, { type: 'add', id: 'a', rect })

  test('add numbers, selects and stores the rect', () => {
    expect(withBox.items).toEqual([{ id: 'a', label: 'Annotation 1', ...rect }])
    expect(withBox.selectedId).toBe('a')
    const two = annotationsReducer(withBox, { type: 'add', id: 'b', rect })
    expect(two.items[1].label).toBe('Annotation 2')
  })
  test('numbers are not reused after a delete', () => {
    const removed = annotationsReducer(withBox, { type: 'remove', id: 'a' })
    expect(annotationsReducer(removed, { type: 'add', id: 'b', rect }).items[0].label).toBe('Annotation 2')
  })
  test('change and rename touch only their box', () => {
    const two = annotationsReducer(withBox, { type: 'add', id: 'b', rect })
    const changed = annotationsReducer(two, { type: 'change', id: 'a', rect: { ...rect, x: 9 } })
    expect(changed.items.map((item) => item.x)).toEqual([9, 1])
    const renamed = annotationsReducer(two, { type: 'rename', id: 'b', label: 'Dent' })
    expect(renamed.items.map((item) => item.label)).toEqual(['Annotation 1', 'Dent'])
  })
  test('removing the selected box clears the selection; reset empties', () => {
    expect(annotationsReducer(withBox, { type: 'remove', id: 'a' }).selectedId).toBeNull()
    expect(annotationsReducer(withBox, { type: 'reset' })).toEqual(initialAnnotations)
  })
})

test.describe('quality grades', () => {
  const rows = [
    ['resolution 1.99 MP', () => gradeResolution(1990, 1000), 'poor'],
    ['resolution 2 MP', () => gradeResolution(2000, 1000), 'warn'],
    ['resolution 7.99 MP', () => gradeResolution(7990, 1000), 'warn'],
    ['resolution 8 MP', () => gradeResolution(8000, 1000), 'good'],
    ['file 149 KB', () => gradeFileSize(149 * KB), 'poor'],
    ['file 150 KB', () => gradeFileSize(150 * KB), 'warn'],
    ['file 499 KB', () => gradeFileSize(499 * KB), 'warn'],
    ['file 500 KB', () => gradeFileSize(500 * KB), 'good'],
    ['brightness 39', () => gradeBrightness(39), 'poor'],
    ['brightness 40', () => gradeBrightness(40), 'warn'],
    ['brightness 69', () => gradeBrightness(69), 'warn'],
    ['brightness 70', () => gradeBrightness(70), 'good'],
    ['brightness 190', () => gradeBrightness(190), 'good'],
    ['brightness 191', () => gradeBrightness(191), 'warn'],
    ['brightness 220', () => gradeBrightness(220), 'warn'],
    ['brightness 221', () => gradeBrightness(221), 'poor'],
    ['sharpness 19', () => gradeSharpness(19), 'poor'],
    ['sharpness 20', () => gradeSharpness(20), 'warn'],
    ['sharpness 59', () => gradeSharpness(59), 'warn'],
    ['sharpness 60', () => gradeSharpness(60), 'good'],
  ]
  for (const [name, grade, expected] of rows) test(`${name} is ${expected}`, () => expect(grade()).toBe(expected))

  const good = { bytes: 800 * KB, width: 4000, height: 3000, brightness: 120, sharpness: 200 }
  test('overall grade is the worst check, with advice', () => {
    expect(gradePhoto(good).grade).toBe('good')
    const dark = gradePhoto({ ...good, brightness: 10 })
    expect(dark.grade).toBe('poor')
    expect(dark.title.toLowerCase()).toContain('dark')
    expect(dark.advice.length).toBeGreaterThan(0)
  })
  test('unmeasured photo still shows its file size', () => {
    const checks = qualityChecks(800 * KB, null)
    expect(checks.map((check) => check.grade)).toEqual([null, 'good', null, null])
    expect(checks[0].value).toBe('–')
  })
  test('file size switches from KB to MB', () => {
    expect(qualityChecks(800 * KB, null)[1].value).toBe('800 KB')
    expect(qualityChecks(2048 * KB, null)[1].value).toBe('2.0 MB')
  })
  test('measurements on known pixels', () => {
    expect(meanBrightness(new Uint8Array([0, 100, 200]))).toBe(100)
    expect(meanBrightness(new Uint8Array())).toBe(0)
    const flat = { pixels: new Uint8Array(25).fill(90), width: 5, height: 5 }
    expect(laplacianVariance(flat)).toBe(0)
    const checker = { pixels: Uint8Array.from({ length: 25 }, (_, i) => (i % 2 ? 255 : 0)), width: 5, height: 5 }
    expect(laplacianVariance(checker)).toBeGreaterThan(1000)
  })
  test('live hint picks the problem and the right fix', () => {
    const torch = { supported: true, on: false, failed: false }
    const measure = (brightness, sharpness) => getCaptureHint({ brightness, sharpness }, torch)
    expect(getCaptureHint(null, torch)).toEqual({ text: 'Fill the frame and hold steady', warn: false })
    expect(measure(10, 200).text).toContain('turn on the torch')
    expect(getCaptureHint({ brightness: 10, sharpness: 200 }, { ...torch, supported: false }).text).toContain('brighter place')
    expect(measure(250, 200).text).toContain('Too bright')
    expect(measure(120, 5).text).toContain('blurry')
    expect(getCaptureHint(null, { ...torch, failed: true }).warn).toBe(true)
  })
})

test.describe('text validation', () => {
  test('removes characters that are not allowed and says so', () => {
    const { value, message } = validateText('Dent<b>/#1', NAME)
    expect(value).toBe('Dentb1')
    expect(message.warn).toBe(true)
  })
  test('keeps letters in any language', () => {
    expect(validateText('डेंट côté 傷', NAME).value).toBe('डेंट côté 傷')
    expect(validateText('डेंट côté 傷', NAME).message).toBeNull()
  })
  test('cuts at the limit and counts code points', () => {
    expect(validateText('a'.repeat(41), NAME).value).toHaveLength(40)
    expect(validateText('a'.repeat(41), NAME).message.warn).toBe(true)
    expect(Array.from(validateText('𝒜'.repeat(41), NAME).value)).toHaveLength(40)
  })
  test('shows a count near the limit', () => {
    expect(validateText('a'.repeat(30), NAME).message).toEqual({ text: '30 / 40 characters', warn: false })
  })
  test('collapses spaces and turns tabs and line breaks into spaces', () => {
    expect(validateText('  a  \t\n b', NAME).value).toBe('a b')
  })
  test('photo names cannot hold dots or slashes', () => {
    expect(validateText('../../evil.exe', PHOTO_NAME).value).toBe('evilexe')
  })
  test('blur trims, restores an empty name and warns on duplicates', () => {
    expect(finishText('  a ', NAME).value).toBe('a')
    expect(finishText('   ', NAME, { previous: 'old' }).value).toBe('old')
    expect(finishText('DENT', NAME, { others: [' dent '] }).message.warn).toBe(true)
    expect(finishText('Dent', NAME, { others: ['Scratch'] }).message).toBeNull()
  })
})

test.describe('picked files', () => {
  const file = (bytes, size) => {
    const blob = new File([new Uint8Array(bytes)], 'x.jpg')
    return size ? Object.defineProperty(blob, 'size', { value: size }) : blob
  }
  const JPEG = [0xff, 0xd8, 0xff, 0xe0]
  test('accepts each signature', async () => {
    const ascii = (text) => [...Buffer.from(text, 'latin1')]
    for (const bytes of [JPEG, [0x89, 0x50, 0x4e, 0x47], ascii('RIFF0000WEBP'), ascii('0000ftypheic')]) {
      expect((await validatePhotoFile(file(bytes))).message).toBeNull()
    }
  })
  test('refuses empty, oversized and non-photo files', async () => {
    expect((await validatePhotoFile(file([]))).message.text).toContain('empty')
    expect((await validatePhotoFile(file(JPEG, 31 * KB * KB))).message.text).toContain('30 MB')
    expect((await validatePhotoFile(file([1, 2, 3, 4]))).message.text).toContain('not a photo')
  })
  test('a 30 MB file is allowed', async () => {
    expect((await validatePhotoFile(file(JPEG, 30 * KB * KB))).message).toBeNull()
  })
})

test.describe('camera errors', () => {
  const kinds = { NotAllowedError: 'denied', SecurityError: 'denied', NotFoundError: 'not-found', NotReadableError: 'in-use', AbortError: 'in-use', OverconstrainedError: 'unknown' }
  for (const [name, kind] of Object.entries(kinds)) {
    test(`${name} maps to ${kind}`, () => expect(toCameraError(new DOMException('x', name)).kind).toBe(kind))
  }
  test('something that is not an Error maps to unknown', () => expect(toCameraError('boom').kind).toBe('unknown'))
})

test.describe('level', () => {
  const G = 9.8
  const near = (actual, expected) => expect(Math.abs(actual - expected)).toBeLessThan(0.5)

  test('upright and straight reads 0, 0', () => {
    const { roll, pitch } = readTilt({ x: 0, y: G, z: 0 }, 0)
    near(roll, 0)
    near(pitch, 0)
  })
  test('flipped signs give the same tilt', () => {
    const tilt = readTilt({ x: 1, y: 9, z: 2 }, 0)
    const flipped = readTilt({ x: -1, y: -9, z: -2 }, 0)
    near(flipped.roll, tilt.roll)
    near(flipped.pitch, tilt.pitch)
  })
  test('a phone held sideways is level when the screen has turned too', () => {
    near(readTilt({ x: G, y: 0, z: 0 }, 90).roll, 0)
  })
  test('advice names the way to turn, then how to hold', () => {
    expect(tiltAdvice({ roll: -10, pitch: 0 }).text).toBe('Turn left 10°')
    expect(tiltAdvice({ roll: 6, pitch: 0 }).text).toBe('Turn right 6°')
    expect(tiltAdvice({ roll: 0, pitch: 8 }).text).toBe('Hold upright: 8° off')
    expect(tiltAdvice({ roll: 0, pitch: 80 }).text).toBe('Hold flat: 10° off')
    expect(tiltAdvice({ roll: 1, pitch: 89 })).toEqual({ level: true, text: 'Level' })
  })
})
