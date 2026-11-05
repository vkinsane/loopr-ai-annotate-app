import { useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { clamp, isTooSmall, moveRect, rectFromPoints, resizeRect } from '../utils'
import { styles } from './AnnotationCanvas.styles.js'

const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
const MIN_BOX_SCREEN_PX = 12
const LABEL_BELOW_FROM_TOP = 0.08
const IDLE_HINT = 'Drag on the photo to mark a defect. Drag a box to move it, or a corner to resize.'
const DRAW_HINT = 'Release to add the box. Tiny boxes from a quick tap are ignored.'

/**
 * Boxes are stored in photo pixels and drawn as percentages of the frame, so they stay on the same
 * pixels at any screen size. The gesture is read from where it starts: corner, box or empty photo.
 */
export default function AnnotationCanvas({ photoUrl, size, items, selectedId, onAdd, onChange, onSelect }) {
  const layerRef = useRef(null)
  const gesture = useRef(null)
  const [draft, setDraft] = useState(null)

  function toPhotoPoint(event) {
    const bounds = layerRef.current.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - bounds.left) / bounds.width) * size.width, 0, size.width),
      y: clamp(((event.clientY - bounds.top) / bounds.height) * size.height, 0, size.height),
    }
  }

  function handlePointerDown(event) {
    // One gesture at a time: a second finger is ignored. Only the main mouse button draws.
    if (gesture.current || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = toPhotoPoint(event)
    const item = items.find((box) => box.id === event.target.closest('[data-id]')?.dataset.id)
    const corner = event.target.closest('[data-corner]')?.dataset.corner

    if (!item) {
      gesture.current = { type: 'draw', pointerId: event.pointerId, start }
      return
    }
    onSelect(item.id)
    gesture.current = { type: corner ? 'resize' : 'move', pointerId: event.pointerId, start, origin: item, corner }
  }

  function handlePointerMove(event) {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointerId) return
    const point = toPhotoPoint(event)
    if (current.type === 'draw') setDraft(rectFromPoints(current.start, point))
    else if (current.type === 'move') {
      onChange(current.origin.id, moveRect(current.origin, point.x - current.start.x, point.y - current.start.y, size))
    } else onChange(current.origin.id, resizeRect(current.origin, current.corner, point))
  }

  function endGesture(event, cancelled) {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointerId) return
    gesture.current = null
    const minSize = (MIN_BOX_SCREEN_PX / layerRef.current.clientWidth) * size.width

    if (current.type === 'draw') {
      setDraft(null)
      if (cancelled) return
      if (draft && !isTooSmall(draft, minSize)) onAdd(draft)
      else onSelect(null)
      return
    }
    const box = items.find((item) => item.id === current.origin.id)
    if (cancelled || (box && isTooSmall(box, minSize))) onChange(current.origin.id, current.origin)
  }

  return (
    <div>
      <Box sx={styles.frame(size.width / size.height)}>
        <img src={photoUrl} alt="Captured photo of the door panel" draggable={false} style={styles.photo} />
        <Box
          ref={layerRef}
          sx={styles.layer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => endGesture(event, false)}
          onPointerCancel={(event) => endGesture(event, true)}
        >
          {items.map((item) => {
            const selected = item.id === selectedId
            return (
              <Box key={item.id} data-id={item.id} sx={styles.box(item, size, selected ? 'selected' : 'other')}>
                <Box component="span" sx={styles.label(selected, item.y / size.height < LABEL_BELOW_FROM_TOP)}>
                  {item.label || 'Untitled'}
                </Box>
                {selected && CORNERS.map((corner) => <Box key={corner} data-corner={corner} sx={styles.handle(corner)} />)}
              </Box>
            )
          })}
          {draft && <Box sx={styles.box(draft, size, 'draft')} />}
        </Box>
        <Box component="span" sx={styles.sizeBadge}>{size.width} × {size.height} px</Box>
      </Box>
      <Typography sx={styles.hint}>{draft ? DRAW_HINT : IDLE_HINT}</Typography>
    </div>
  )
}
