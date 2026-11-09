const PIXELS_PER_MEGAPIXEL = 1_000_000
const BYTES_PER_KB = 1024

// Live frames and photos are measured at the same width, so one set of sharpness thresholds fits both.
export const GRADE_LABELS = { good: 'Good', warn: 'Warning', poor: 'Poor' }
export const ANALYSIS_WIDTH = 320

export const RESOLUTION_MP = { poorBelow: 2, goodFrom: 8 }
export const FILE_SIZE_KB = { poorBelow: 150, goodFrom: 500 }

// Brightness is mean luma (0–255); sharpness is Laplacian variance at ANALYSIS_WIDTH.
// Both are uncalibrated starting values, to be replaced with values measured on real devices.
export const BRIGHTNESS = { tooDark: 40, dim: 70, bright: 190, tooBright: 220 }

export const SHARPNESS = { blurryBelow: 20, softBelow: 60 }
// The raw score has no meaning to people and no upper limit, so they see a word.
export const SHARPNESS_WORDS = { good: 'Sharp', warn: 'A bit blurry', poor: 'Blurry' }

export function megapixels(width, height) {
  return (width * height) / PIXELS_PER_MEGAPIXEL
}

export function meanBrightness(pixels) {
  let sum = 0
  for (const value of pixels) sum += value
  return pixels.length === 0 ? 0 : sum / pixels.length
}

// Sharp edges give strong Laplacian responses and blur flattens them, so the variance measures focus.
export function laplacianVariance({ pixels, width, height }) {
  let sum = 0
  let sumOfSquares = 0
  let count = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const response =
        pixels[i - width] + pixels[i + width] + pixels[i - 1] + pixels[i + 1] - 4 * pixels[i]
      sum += response
      sumOfSquares += response * response
      count++
    }
  }
  if (count === 0) return 0
  const mean = sum / count
  return sumOfSquares / count - mean * mean
}

export function gradeResolution(width, height) {
  const mp = megapixels(width, height)
  if (mp < RESOLUTION_MP.poorBelow) return 'poor'
  return mp < RESOLUTION_MP.goodFrom ? 'warn' : 'good'
}

export function gradeFileSize(bytes) {
  const kb = bytes / BYTES_PER_KB
  if (kb < FILE_SIZE_KB.poorBelow) return 'poor'
  return kb < FILE_SIZE_KB.goodFrom ? 'warn' : 'good'
}

export function gradeBrightness(value) {
  if (value < BRIGHTNESS.tooDark || value > BRIGHTNESS.tooBright) return 'poor'
  if (value < BRIGHTNESS.dim || value > BRIGHTNESS.bright) return 'warn'
  return 'good'
}

export function gradeSharpness(value) {
  if (value < SHARPNESS.blurryBelow) return 'poor'
  return value < SHARPNESS.softBelow ? 'warn' : 'good'
}

const DEFAULT_HINT = 'Fill the frame with the part and hold steady'

/** Worst problem first. `torch` is { supported, on, failed }. Returns { text, warn }. */
export function getCaptureHint(quality, torch) {
  if (torch.failed) return { text: "The torch didn't respond, so try again.", warn: true }
  if (!quality) return { text: DEFAULT_HINT, warn: false }

  if (gradeBrightness(quality.brightness) !== 'good') {
    if (quality.brightness > BRIGHTNESS.bright) {
      const text = torch.on ? 'Too bright, so turn off the torch or move away from strong light.' : 'Too bright, so move away from strong light.'
      return { text, warn: true }
    }
    if (!torch.supported) return { text: 'Too dark, so move to a brighter place.', warn: true }
    return { text: torch.on ? 'Too dark, so move to a brighter place.' : 'Too dark, so turn on the torch.', warn: true }
  }

  if (gradeSharpness(quality.sharpness) !== 'good') return { text: 'Slightly blurry, so hold the phone steady.', warn: true }
  return { text: DEFAULT_HINT, warn: false }
}

const ISSUES = {
  resolution: { problem: 'low resolution', advice: 'move closer to the part', tip: 'This photo has low resolution, so move closer to the part.' },
  fileSize: { problem: 'low on detail', advice: 'move closer to the part', tip: 'This file is small, so fine details may be missing.' },
  dark: { problem: 'too dark', advice: 'turn on the torch or add more light', tip: 'This photo is too dark, so turn on the torch or add more light.' },
  bright: { problem: 'too bright', advice: 'turn off the torch or move away from strong light', tip: 'This photo is too bright, so turn off the torch or move away from strong light.' },
  blurry: { problem: 'blurry', advice: 'hold the phone steady', tip: 'This photo is blurry, so hold the phone steady.' },
}

const joinList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
// Two checks can share the same advice, and it should only be said once.
const joinAdvice = (issues) => joinList([...new Set(issues.map((issue) => issue.advice))])

/**
 * Takes { width, height, bytes, brightness, sharpness }.
 * Returns { grades: { resolution, fileSize, brightness, sharpness }, summary: { grade, title, advice } }.
 */
export function gradePhoto({ width, height, bytes, brightness, sharpness }) {
  const grades = {
    resolution: gradeResolution(width, height),
    fileSize: gradeFileSize(bytes),
    brightness: gradeBrightness(brightness),
    sharpness: gradeSharpness(sharpness),
  }
  const issues = [
    { grade: grades.resolution, ...ISSUES.resolution },
    { grade: grades.fileSize, ...ISSUES.fileSize },
    { grade: grades.brightness, ...(brightness < BRIGHTNESS.dim ? ISSUES.dark : ISSUES.bright) },
    { grade: grades.sharpness, ...ISSUES.blurry },
  ].filter((issue) => issue.grade !== 'good')

  const poor = issues.filter((issue) => issue.grade === 'poor')
  if (poor.length > 0) {
    const list = joinList(poor.map((issue) => issue.problem))
    return { grades, summary: { grade: 'poor', title: `Photo is ${list}`, advice: `Take the photo again and ${joinAdvice(poor)}.` } }
  }
  if (issues.length > 0) {
    const title = issues.length === 1 ? 'Usable, with one warning' : `Usable, with ${issues.length} warnings`
    return { grades, summary: { grade: 'warn', title, advice: `You can continue, or take the photo again and ${joinAdvice(issues)}.` } }
  }
  return { grades, summary: { grade: 'good', title: 'Photo looks good', advice: 'Ready to annotate.' } }
}

function formatFileSize(bytes) {
  const kb = bytes / BYTES_PER_KB
  return kb < BYTES_PER_KB ? `${Math.round(kb)} KB` : `${(kb / BYTES_PER_KB).toFixed(1)} MB`
}

/** Brightness is measured 0–255 and shown to people as 0–100%. */
export const brightnessPercent = (value) => Math.round((value / 255) * 100)

/**
 * One row per check for display: { label, value, grade, tip }. `quality` is the measured
 * { width, height, brightness, sharpness }, or null while measuring (only file size is known then).
 * `tip` says how to improve the check.
 */
export function qualityChecks(bytes, quality) {
  const measured = Boolean(quality)
  return [
    {
      label: 'Resolution',
      value: measured ? `${quality.width} × ${quality.height} · ${megapixels(quality.width, quality.height).toFixed(1)} MP` : '–',
      grade: measured ? gradeResolution(quality.width, quality.height) : null,
      tip: ISSUES.resolution.tip,
    },
    {
      label: 'File size',
      value: formatFileSize(bytes),
      grade: gradeFileSize(bytes),
      tip: ISSUES.fileSize.tip,
    },
    {
      label: 'Brightness',
      value: measured ? `${brightnessPercent(quality.brightness)}%` : '–',
      grade: measured ? gradeBrightness(quality.brightness) : null,
      tip: measured ? (quality.brightness < BRIGHTNESS.dim ? ISSUES.dark : ISSUES.bright).tip : null,
    },
    {
      label: 'Sharpness',
      value: measured ? SHARPNESS_WORDS[gradeSharpness(quality.sharpness)] : '–',
      grade: measured ? gradeSharpness(quality.sharpness) : null,
      tip: ISSUES.blurry.tip,
    },
  ]
}
