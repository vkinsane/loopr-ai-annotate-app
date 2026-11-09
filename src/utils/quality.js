const PIXELS_PER_MEGAPIXEL = 1_000_000
const BYTES_PER_KB = 1024

export const GRADE_LABELS = { good: 'Good', warn: 'Warning', poor: 'Poor' }
/** The MUI palette name for each grade. */
export const GRADE_COLORS = { good: 'success', warn: 'warning', poor: 'error' }
// Live frames and photos are measured at the same width, so one set of sharpness thresholds fits both.
export const ANALYSIS_WIDTH = 320

const RESOLUTION_MP = { poorBelow: 2, goodFrom: 8 }
const FILE_SIZE_KB = { poorBelow: 150, goodFrom: 500 }

// Brightness is mean luma (0–255); sharpness is Laplacian variance at ANALYSIS_WIDTH.
// Both are uncalibrated starting values, to be replaced with values measured on real devices.
export const BRIGHTNESS = { tooDark: 40, dim: 70, bright: 190, tooBright: 220 }

const SHARPNESS = { poorBelow: 20, goodFrom: 60 }
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

/** Takes a grey image from `readGreyImage`. */
export const measureImage = (image) => ({ brightness: Math.round(meanBrightness(image.pixels)), sharpness: Math.round(laplacianVariance(image)) })

function gradeByFloor(value, { poorBelow, goodFrom }) {
  if (value < poorBelow) return 'poor'
  return value < goodFrom ? 'warn' : 'good'
}

export const gradeResolution = (width, height) => gradeByFloor(megapixels(width, height), RESOLUTION_MP)
export const gradeFileSize = (bytes) => gradeByFloor(bytes / BYTES_PER_KB, FILE_SIZE_KB)
export const gradeSharpness = (value) => gradeByFloor(value, SHARPNESS)

export function gradeBrightness(value) {
  if (value < BRIGHTNESS.tooDark || value > BRIGHTNESS.tooBright) return 'poor'
  if (value < BRIGHTNESS.dim || value > BRIGHTNESS.bright) return 'warn'
  return 'good'
}

const DEFAULT_HINT = 'Fill the frame and hold steady'
const warning = (text) => ({ text, warn: true })

/** Worst problem first. `torch` is { supported, on, failed }. Returns { text, warn }. */
export function getCaptureHint(quality, torch) {
  if (torch.failed) return warning("The torch didn't respond, so try again.")
  if (quality && gradeBrightness(quality.brightness) !== 'good') {
    if (quality.brightness > BRIGHTNESS.bright) return warning(torch.on ? 'Too bright, so turn off the torch or move away from strong light.' : 'Too bright, so move away from strong light.')
    return warning(torch.supported && !torch.on ? 'Too dark, so turn on the torch.' : 'Too dark, so move to a brighter place.')
  }
  if (quality && gradeSharpness(quality.sharpness) !== 'good') return warning('Slightly blurry, so hold the camera steady.')
  return { text: DEFAULT_HINT, warn: false }
}

const ISSUES = {
  resolution: { problem: 'low resolution', advice: 'move closer', tip: 'This photo has low resolution, so move closer.' },
  fileSize: { problem: 'low on detail', advice: 'move closer', tip: 'This file is small, so fine details may be missing.' },
  dark: { problem: 'too dark', advice: 'add more light', tip: 'This photo is too dark, so add more light.' },
  bright: { problem: 'too bright', advice: 'move away from strong light', tip: 'This photo is too bright, so move away from strong light.' },
  blurry: { problem: 'blurry', advice: 'hold the camera steady', tip: 'This photo is blurry, so hold the camera steady.' },
}
const brightnessIssue = (value) => (value < BRIGHTNESS.dim ? ISSUES.dark : ISSUES.bright)

const joinList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
// Two checks can share the same advice, and it should only be said once.
const joinAdvice = (issues) => joinList([...new Set(issues.map((issue) => issue.advice))])

/** Takes { width, height, bytes, brightness, sharpness }. Returns the overall { grade, title, advice }. */
export function gradePhoto({ width, height, bytes, brightness, sharpness }) {
  const issues = [
    { grade: gradeResolution(width, height), ...ISSUES.resolution },
    { grade: gradeFileSize(bytes), ...ISSUES.fileSize },
    { grade: gradeBrightness(brightness), ...brightnessIssue(brightness) },
    { grade: gradeSharpness(sharpness), ...ISSUES.blurry },
  ].filter((issue) => issue.grade !== 'good')

  const poor = issues.filter((issue) => issue.grade === 'poor')
  if (poor.length > 0) {
    const list = joinList(poor.map((issue) => issue.problem))
    return { grade: 'poor', title: `Photo is ${list}`, advice: `Take the photo again and ${joinAdvice(poor)}.` }
  }
  if (issues.length > 0) {
    const title = issues.length === 1 ? 'Usable, with one warning' : `Usable, with ${issues.length} warnings`
    return { grade: 'warn', title, advice: `You can continue, or take the photo again and ${joinAdvice(issues)}.` }
  }
  return { grade: 'good', title: 'Photo looks good', advice: 'Ready to annotate.' }
}

/** Brightness is measured 0–255 and shown to people as 0–100%. */
export const brightnessPercent = (value) => Math.round((value / 255) * 100)

const UNMEASURED = { value: '–', grade: null, tip: null }

/**
 * One row per check for display: { label, value, grade, tip }. `tip` says how to improve the check. `quality` is the measured
 * { width, height, brightness, sharpness }, or null if the photo couldn't be read (only file size is known then).
 */
export function qualityChecks(bytes, quality) {
  const kb = bytes / BYTES_PER_KB
  const fileSize = { label: 'File size', value: kb < BYTES_PER_KB ? `${Math.round(kb)} KB` : `${(kb / BYTES_PER_KB).toFixed(1)} MB`, grade: gradeFileSize(bytes), tip: ISSUES.fileSize.tip }
  if (!quality) return [{ label: 'Resolution', ...UNMEASURED }, fileSize, { label: 'Brightness', ...UNMEASURED }, { label: 'Sharpness', ...UNMEASURED }]

  const { width, height, brightness, sharpness } = quality
  return [
    { label: 'Resolution', value: `${width} × ${height} · ${megapixels(width, height).toFixed(1)} MP`, grade: gradeResolution(width, height), tip: ISSUES.resolution.tip },
    fileSize,
    { label: 'Brightness', value: `${brightnessPercent(brightness)}%`, grade: gradeBrightness(brightness), tip: brightnessIssue(brightness).tip },
    { label: 'Sharpness', value: SHARPNESS_WORDS[gradeSharpness(sharpness)], grade: gradeSharpness(sharpness), tip: ISSUES.blurry.tip },
  ]
}
