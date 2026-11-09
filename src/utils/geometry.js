// A rect is { x, y, width, height } in photo pixels; a point is { x, y }; a corner is 'top-left' etc.

export const ZOOM = { max: 8, step: 0.4, ms: 150 }

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/** Works for a drag in any direction. */
export function rectFromPoints(a, b) {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

/** Moves without leaving the photo: at an edge the box stops instead of shrinking. */
export function moveRect(rect, dx, dy, size) {
  return { ...rect, x: clamp(rect.x + dx, 0, size.width - rect.width), y: clamp(rect.y + dy, 0, size.height - rect.height) }
}

/** The opposite corner stays fixed; dragging past it flips the box. */
export function resizeRect(rect, corner, point) {
  const fixed = {
    x: corner.endsWith('left') ? rect.x + rect.width : rect.x,
    y: corner.startsWith('top') ? rect.y + rect.height : rect.y,
  }
  return rectFromPoints(fixed, point)
}

export function isTooSmall(rect, minSize) {
  return rect.width < minSize || rect.height < minSize
}
