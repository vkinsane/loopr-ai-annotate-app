const JPEG_QUALITY = 0.92

/**
 * Draws the boxes and labels onto the full-size photo and returns a JPEG blob.
 * Lines and text scale with the photo width, so they look the same as on screen.
 */
export async function exportAnnotatedPhoto(blob, items, colors) {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context is not available')
  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  const line = Math.max(2, Math.round(canvas.width / 400))
  const fontSize = Math.max(14, Math.round(canvas.width / 60))
  const padding = Math.round(fontSize / 3)
  context.font = `600 ${fontSize}px 'DM Sans', sans-serif`
  context.textBaseline = 'top'

  for (const { label, x, y, width, height } of items) {
    // Dark outline under the lime line, so the box shows on light and dark surfaces.
    context.lineWidth = line * 2.5
    context.strokeStyle = colors.outline
    context.strokeRect(x, y, width, height)
    context.lineWidth = line
    context.strokeStyle = colors.box
    context.strokeRect(x, y, width, height)

    const text = label || 'Untitled'
    const labelHeight = fontSize + padding * 2
    const labelY = y >= labelHeight ? y - labelHeight : y + height
    context.fillStyle = colors.box
    context.fillRect(x, labelY, context.measureText(text).width + padding * 2, labelHeight)
    context.fillStyle = colors.outline
    context.fillText(text, x + padding, labelY + padding)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Could not encode the photo'))), 'image/jpeg', JPEG_QUALITY)
  })
}
