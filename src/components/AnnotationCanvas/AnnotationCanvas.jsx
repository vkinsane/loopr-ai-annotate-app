import { useRef, useState } from 'react'
import { Add, PanToolOutlined, Remove } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { CORNERS } from '../../theme.js'
import { boxLabel, clamp, isTooSmall, labelGoesBelow, moveRect, rectFromPoints, resizeRect, ZOOM } from '../../utils'
import DrawHint from '../DrawHint/DrawHint.jsx'
import { styles } from './AnnotationCanvas.styles.js'

const MIN_BOX_SCREEN_PX = 12
const MOVE_HINT = 'Drag to move the photo. Tap the hand again to draw.'

/**
 * Boxes are stored in photo pixels and drawn as percentages of the frame, so they stay on the same
 * pixels at any screen size. The gesture is read from where it starts: corner, box or empty photo.
 * Pinch, scroll or the + and − buttons zoom; the hand button makes one finger or the mouse move the photo instead of drawing.
 * `overlay` is drawn over the card, outside the zoomed photo: on phones, the annotation panel and Done.
 */
export default function AnnotationCanvas({ photoUrl, size, items, selectedId, overlay, onAdd, onChange, onSelect }) {
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
    setZoomLevel(scale <= 1.01 ? 'fit' : scale >= ZOOM.max - 0.01 ? 'max' : 'zoomed')
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
          maxScale={ZOOM.max}
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
                  <Box key={item.id} data-id={item.id} title={boxLabel(item)} sx={styles.box(item, size, selected ? 'selected' : 'other')}>
                    <Box component="span" sx={styles.label(selected, labelGoesBelow(item, size))}>
                      {boxLabel(item)}
                    </Box>
                    {selected && CORNERS.map(([vertical, horizontal]) => <Box key={vertical + horizontal} data-corner={`${vertical}-${horizontal}`} sx={styles.handle(vertical, horizontal)} />)}
                  </Box>
                )
              })}
              {draft && <Box sx={styles.box(draft, size, 'draft')} />}
            </Box>
          </TransformComponent>
        </TransformWrapper>
        {items.length === 0 && !draft && !moving && <DrawHint />}
        {/* Move mode stops drawing, so it says how to get back. */}
        {moving && <Box component="span" role="status" sx={styles.moveHint}>{MOVE_HINT}</Box>}
        <Box component="span" sx={styles.sizeBadge}>{size.width} × {size.height} px</Box>
        <Box sx={styles.toolbar}>
          <IconButton aria-label="Move the photo" aria-pressed={moving} disabled={zoomLevel === 'fit'} onClick={() => setHandOn(!handOn)} sx={styles.tool(moving)}>
            <PanToolOutlined fontSize="small" />
          </IconButton>
          <IconButton aria-label="Zoom out" disabled={zoomLevel === 'fit'} onClick={() => zoomRef.current.zoomOut(ZOOM.step, ZOOM.ms)} sx={styles.tool(false)}>
            <Remove fontSize="small" />
          </IconButton>
          <IconButton aria-label="Zoom in" disabled={zoomLevel === 'max'} onClick={() => zoomRef.current.zoomIn(ZOOM.step, ZOOM.ms)} sx={styles.tool(false)}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {overlay}
    </Box>
  )
}
