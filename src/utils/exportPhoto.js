import { boxLabel } from './annotations.js'
import { canvasToJpeg, drawToCanvas } from './image.js'

export const DEFAULT_PHOTO_NAME = 'annotated-photo'
const REVOKE_URL_AFTER_MS = 1000

/**
 * Draws the boxes and labels onto the full-size photo and downloads it as `name`.jpg.
 * Lines and text scale with the photo width, so they look the same as on screen.
 */
export async function downloadAnnotatedPhoto(blob, items, colors, name) {
  const bitmap = await createImageBitmap(blob)
  const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')
  bitmap.close()

  const line = Math.max(2, Math.round(canvas.width / 400))
  const fontSize = Math.max(14, Math.round(canvas.width / 60))
  const padding = Math.round(fontSize / 3)
  context.font = `600 ${fontSize}px 'DM Sans', sans-serif`
  context.textBaseline = 'top'

  for (const item of items) {
    const { x, y, width, height } = item
    // Dark outline under the lime line, so the box shows on light and dark surfaces.
    context.lineWidth = line * 2.5
    context.strokeStyle = colors.outline
    context.strokeRect(x, y, width, height)
    context.lineWidth = line
    context.strokeStyle = colors.box
    context.strokeRect(x, y, width, height)

    const text = boxLabel(item)
    const labelHeight = fontSize + padding * 2
    const labelY = y >= labelHeight ? y - labelHeight : y + height
    context.fillStyle = colors.box
    context.fillRect(x, labelY, context.measureText(text).width + padding * 2, labelHeight)
    context.fillStyle = colors.outline
    context.fillText(text, x + padding, labelY + padding)
  }

  const url = URL.createObjectURL(await canvasToJpeg(canvas))
  Object.assign(document.createElement('a'), { href: url, download: `${name.trim() || DEFAULT_PHOTO_NAME}.jpg` }).click()
  // Some browsers start the download after click() returns, so the URL is freed a little later.
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_AFTER_MS)
}
