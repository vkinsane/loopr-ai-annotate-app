import { useRef } from 'react'
import { clamp, isTooSmall, moveRect, rectFromPoints, resizeRect } from '../utils'

const MIN_CROP_SHARE = 0.05 // of the photo's shorter side

/**
 * Pointer handlers for the element a photo of `size` fills, that change `crop` (both in photo pixels) through `onChange`.
 * On a corner (an element with data-corner): resize. Inside the box: move it. Elsewhere: draw a new box.
 */
export function useCropDrag(crop, size, onChange) {
  const drag = useRef(null)

  function toPhotoPoint(event) {
    const box = event.currentTarget.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - box.left) / box.width) * size.width, 0, size.width),
      y: clamp(((event.clientY - box.top) / box.height) * size.height, 0, size.height),
    }
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = toPhotoPoint(event)
    const corner = event.target.dataset.corner
    const inside = start.x > crop.x && start.x < crop.x + crop.width && start.y > crop.y && start.y < crop.y + crop.height
    drag.current = { start, rect: crop, mode: corner ?? (inside ? 'move' : 'draw') }
  }

  function onPointerMove(event) {
    if (!drag.current) return
    const { start, rect, mode } = drag.current
    const point = toPhotoPoint(event)
    const next = mode === 'move' ? moveRect(rect, point.x - start.x, point.y - start.y, size)
      : mode === 'draw' ? rectFromPoints(start, point)
        : resizeRect(rect, mode, point)
    // A box too small to see is ignored, so a tap doesn't lose the crop.
    if (!isTooSmall(next, MIN_CROP_SHARE * Math.min(size.width, size.height))) onChange(next)
  }

  const end = () => (drag.current = null)
  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end }
}
