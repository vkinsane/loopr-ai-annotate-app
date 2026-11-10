// Rec. 601 luma weights
const LUMA = { r: 0.299, g: 0.587, b: 0.114 }
const RGBA_CHANNELS = 4
const JPEG_QUALITY = 0.92

/** A new canvas of the given size with `source` drawn on it. */
export function drawToCanvas(source, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context is not available')
  context.drawImage(source, 0, 0)
  return canvas
}

export function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Could not encode the photo'))), 'image/jpeg', JPEG_QUALITY)
  })
}

/** Returns { pixels, width, height } with one byte of luma per pixel. */
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

/**
 * Decodes a photo once. Returns { photoWidth, photoHeight, image }: the size after EXIF rotation,
 * and a grey image `width` pixels wide.
 */
export async function readPhotoGreyImage(blob, width) {
  const bitmap = await createImageBitmap(blob)
  try {
    const image = readGreyImage(document.createElement('canvas'), bitmap, bitmap.width, bitmap.height, width)
    return { photoWidth: bitmap.width, photoHeight: bitmap.height, image }
  } finally {
    bitmap.close()
  }
}

/** The photo's size after `rotation` (degrees, a multiple of 90). */
export function turnedSize({ width, height }, rotation) {
  return rotation % 180 === 0 ? { width, height } : { width: height, height: width }
}

/**
 * A new canvas with the photo turned `rotation` degrees clockwise, mirrored left to right if `flipped`, then cut to
 * `crop` (a rect in pixels of the turned photo). `scale` below 1 makes a smaller copy, for the on-screen preview.
 */
export function editPhoto(source, { rotation, flipped, crop }, scale = 1) {
  const turned = turnedSize(source, rotation)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(crop.width * scale)
  canvas.height = Math.round(crop.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context is not available')
  // Read bottom to top: the photo is turned about its centre, then mirrored on screen, then cut.
  context.scale(scale, scale)
  context.translate(turned.width / 2 - crop.x, turned.height / 2 - crop.y)
  if (flipped) context.scale(-1, 1)
  context.rotate((rotation * Math.PI) / 180)
  context.drawImage(source, -source.width / 2, -source.height / 2)
  return canvas
}
