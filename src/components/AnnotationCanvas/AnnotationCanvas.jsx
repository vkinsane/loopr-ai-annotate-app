import { useRef, useState } from 'react'
import { Add, PanToolOutlined, Remove } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { clamp, isTooSmall, moveRect, rectFromPoints, resizeRect } from '../../utils'
import { styles } from './AnnotationCanvas.styles.js'

const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
const MIN_BOX_SCREEN_PX = 12
const LABEL_BELOW_FROM_TOP = 0.08
const IDLE_HINT = 'Drag on the photo to add an annotation. Drag a box to move it, or a corner to resize it.'
const DRAW_HINT = 'Lift your finger to add the box. Very small boxes are not added.'
const MOVE_HINT = 'Drag to move the photo, or pinch to zoom. Tap the hand again to draw and edit boxes.'
const MAX_ZOOM = 8
const ZOOM_STEP = 0.4
const ZOOM_MS = 150

/**
 * Boxes are stored in photo pixels and drawn as percentages of the frame, so they stay on the same
 * pixels at any screen size. The gesture is read from where it starts: corner, box or empty photo.
 * Pinch, scroll or the + and − buttons zoom; the hand button makes one finger or the mouse move the photo instead of drawing.
 */
export default function AnnotationCanvas({ photoUrl, size, items, selectedId, onAdd, onChange, onSelect }) {
  const layerRef = useRef(null)
  const gesture = useRef(null)
  const zoomRef = useRef(null)
  const [draft, setDraft] = useState(null)
  const [zoomLevel, setZoomLevel] = useState('fit') // 'fit' | 'zoomed' | 'max': changes rarely, so pinching doesn't re-render each frame
  const [handOn, setHandOn] = useState(false)
  const moving = handOn && zoomLevel !== 'fit'

  // Lines, labels and handles divide by --zoom, so they stay the same size on screen.
  function handleTransform(_, { scale }) {
    layerRef.current?.style.setProperty('--zoom', scale)
    setZoomLevel(scale <= 1.01 ? 'fit' : scale >= MAX_ZOOM - 0.01 ? 'max' : 'zoomed')
  }

  function toPhotoPoint(event) {
    const bounds = layerRef.current.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - bounds.left) / bounds.width) * size.width, 0, size.width),
      y: clamp(((event.clientY - bounds.top) / bounds.height) * size.height, 0, size.height),
    }
  }

  function handlePointerDown(event) {
    // A second finger means a pinch, so whatever the first finger started is undone.
    if (!event.isPrimary) {
      cancelGesture()
      return
    }
    // Only the main mouse button draws.
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

  function cancelGesture() {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    setDraft(null)
    if (current.origin) onChange(current.origin.id, current.origin)
  }

  function endGesture(event, cancelled) {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointerId) return
    gesture.current = null
    const minSize = (MIN_BOX_SCREEN_PX / layerRef.current.getBoundingClientRect().width) * size.width

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
    <Box sx={styles.root}>
      <Box sx={styles.frame(size.width / size.height, moving)}>
        <TransformWrapper
          ref={zoomRef}
          minScale={1}
          maxScale={MAX_ZOOM}
          doubleClick={{ disabled: true }}
          panning={{ disabled: !moving, velocityDisabled: true }}
          onTransform={handleTransform}
        >
          <TransformComponent wrapperStyle={styles.zoomArea} contentStyle={styles.zoomArea}>
            <img src={photoUrl} alt="Captured photo" draggable={false} style={styles.photo} />
            <Box
              ref={layerRef}
              sx={styles.layer(moving)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => endGesture(event, false)}
              onPointerCancel={(event) => endGesture(event, true)}
            >
              {items.map((item) => {
                const selected = item.id === selectedId
                return (
                  <Box key={item.id} data-id={item.id} title={item.label || 'Untitled'} sx={styles.box(item, size, selected ? 'selected' : 'other')}>
                    <Box component="span" sx={styles.label(selected, item.y / size.height < LABEL_BELOW_FROM_TOP)}>
                      {item.label || 'Untitled'}
                    </Box>
                    {selected && CORNERS.map((corner) => <Box key={corner} data-corner={corner} sx={styles.handle(corner)} />)}
                  </Box>
                )
              })}
              {draft && <Box sx={styles.box(draft, size, 'draft')} />}
            </Box>
          </TransformComponent>
        </TransformWrapper>
        <Box component="span" sx={styles.sizeBadge}>{size.width} × {size.height} px</Box>
        <Box sx={styles.toolbar}>
          <IconButton aria-label="Move the photo" aria-pressed={moving} disabled={zoomLevel === 'fit'} onClick={() => setHandOn(!handOn)} sx={styles.tool(moving)}>
            <PanToolOutlined fontSize="small" />
          </IconButton>
          <IconButton aria-label="Zoom out" disabled={zoomLevel === 'fit'} onClick={() => zoomRef.current.zoomOut(ZOOM_STEP, ZOOM_MS)} sx={styles.tool(false)}>
            <Remove fontSize="small" />
          </IconButton>
          <IconButton aria-label="Zoom in" disabled={zoomLevel === 'max'} onClick={() => zoomRef.current.zoomIn(ZOOM_STEP, ZOOM_MS)} sx={styles.tool(false)}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography sx={styles.hint}>{moving ? MOVE_HINT : draft ? DRAW_HINT : IDLE_HINT}</Typography>
    </Box>
  )
}
