// Rec. 601 luma weights: how bright each channel looks to the eye.
const LUMA = { r: 0.299, g: 0.587, b: 0.114 }
const RGBA_CHANNELS = 4

/**
 * Draws `source` scaled to `width` and returns { pixels, width, height }: one byte of luma per pixel.
 * Reuses `canvas` to avoid an allocation per frame.
 */
export function readGreyImage(canvas, source, sourceWidth, sourceHeight, width) {
  const height = Math.round((sourceHeight / sourceWidth) * width)
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas 2D context is not available')
  context.drawImage(source, 0, 0, width, height)
  const { data } = context.getImageData(0, 0, width, height)

  const pixels = new Uint8ClampedArray(width * height)
  for (let i = 0; i < pixels.length; i++) {
    const offset = i * RGBA_CHANNELS
    pixels[i] = LUMA.r * data[offset] + LUMA.g * data[offset + 1] + LUMA.b * data[offset + 2]
  }
  return { pixels, width, height }
}
