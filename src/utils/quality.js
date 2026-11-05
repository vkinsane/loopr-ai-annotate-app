// Grades are 'good' | 'warn' | 'poor'.

const PIXELS_PER_MEGAPIXEL = 1_000_000

export const RESOLUTION_MP = { poorBelow: 2, goodFrom: 8 }

// Mean luma, 0–255. Starting values from the plan, to be checked against real photos.
export const BRIGHTNESS = { tooDark: 40, dim: 70, bright: 190, tooBright: 220 }

// Laplacian variance on a 160 px wide frame. Uncalibrated starting values:
// to be replaced with values measured from sharp and blurred photos on real devices.
export const SHARPNESS = { blurryBelow: 20, softBelow: 60 }

export function megapixels(width, height) {
  return (width * height) / PIXELS_PER_MEGAPIXEL
}

export function meanBrightness(pixels) {
  let sum = 0
  for (const value of pixels) sum += value
  return pixels.length === 0 ? 0 : sum / pixels.length
}

/**
 * Variance of the Laplacian: a sharp edge gives strong responses, blur flattens them.
 * Kernel [0 1 0; 1 -4 1; 0 1 0], border pixels skipped.
 */
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
