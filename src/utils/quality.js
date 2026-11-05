const PIXELS_PER_MEGAPIXEL = 1_000_000

export const RESOLUTION_MP = { poorBelow: 2, goodFrom: 8 }

// Brightness is mean luma (0–255); sharpness is Laplacian variance on a 160 px wide frame.
// Both are uncalibrated starting values, to be replaced with values measured on real devices.
export const BRIGHTNESS = { tooDark: 40, dim: 70, bright: 190, tooBright: 220 }

export const SHARPNESS = { blurryBelow: 20, softBelow: 60 }

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

export function gradeBrightness(value) {
  if (value < BRIGHTNESS.tooDark || value > BRIGHTNESS.tooBright) return 'poor'
  if (value < BRIGHTNESS.dim || value > BRIGHTNESS.bright) return 'warn'
  return 'good'
}

export function gradeSharpness(value) {
  if (value < SHARPNESS.blurryBelow) return 'poor'
  return value < SHARPNESS.softBelow ? 'warn' : 'good'
}

const DEFAULT_HINT = 'Fill the frame with the door panel and hold steady'

/** Worst problem first. `torch` is { supported, on, failed }. Returns { text, warn }. */
export function getCaptureHint(quality, torch) {
  if (torch.failed) return { text: "The torch didn't respond. Try again.", warn: true }
  if (!quality) return { text: DEFAULT_HINT, warn: false }

  if (gradeBrightness(quality.brightness) !== 'good') {
    if (quality.brightness > BRIGHTNESS.bright) {
      const text = torch.on ? 'Too bright. Turn off the torch or reduce glare.' : 'Too bright. Reduce glare.'
      return { text, warn: true }
    }
    if (!torch.supported) return { text: 'Too dim, and this device has no torch. Move to better light.', warn: true }
    return { text: torch.on ? 'Too dim. Move to better light.' : 'Too dim. Turn on the torch.', warn: true }
  }

  if (gradeSharpness(quality.sharpness) !== 'good') return { text: 'Slightly blurry. Hold steady.', warn: true }
  return { text: DEFAULT_HINT, warn: false }
}
