import { useEffect, useRef, useState } from 'react'
import { Add, Close, Remove } from '@mui/icons-material'
import { Box, Button, Dialog, IconButton, ThemeProvider, Typography } from '@mui/material'
import { cameraTheme } from '../../theme.js'
import { clamp } from '../../utils'
import { styles } from './ZoomViewer.styles.js'

const MAX_ZOOM = 8
const BUTTON_STEP = 1.5
const DOUBLE_TAP = { ms: 300, px: 24, zoom: 3 }
const WHEEL_SPEED = 0.002

/**
 * Full-screen photo viewer: pinch or scroll to zoom (1×–8× of "fit"), drag to pan, double-tap toggles fit ↔ 3×.
 * Mount it only while open, so it starts at "fit" every time. Points are in px from the viewport centre.
 */
export default function ZoomViewer({ photoUrl, size, onClose }) {
  const [viewport, setViewport] = useState(null)
  const [bounds, setBounds] = useState(null)
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })
  const pointers = useRef(new Map())
  const pinch = useRef(null)
  const tap = useRef({ start: null, last: null })

  useEffect(() => {
    if (!viewport) return
    const observer = new ResizeObserver(([entry]) => setBounds({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [viewport])

  const fit = bounds ? Math.min(bounds.width / size.width, bounds.height / size.height) : 0

  // The photo never leaves a gap at an edge it could cover; a photo smaller than the screen stays centred.
  function limit({ zoom, x, y }) {
    const maxX = Math.max(0, (size.width * fit * zoom - bounds.width) / 2)
    const maxY = Math.max(0, (size.height * fit * zoom - bounds.height) / 2)
    return { zoom, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) }
  }

  // The photo spot under `point` stays under it while zooming.
  function zoomAt(factor, point = { x: 0, y: 0 }) {
    setView((current) => {
      const zoom = clamp(current.zoom * factor, 1, MAX_ZOOM)
      const ratio = zoom / current.zoom
      return limit({ zoom, x: point.x - (point.x - current.x) * ratio, y: point.y - (point.y - current.y) * ratio })
    })
  }

  function fromCentre(event) {
    const rect = viewport.getBoundingClientRect()
    return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }
  }

  // React's wheel listener is passive, and a trackpad pinch (ctrl + wheel) would zoom the whole page without preventDefault.
  useEffect(() => {
    if (!viewport) return
    const handleWheel = (event) => {
      event.preventDefault()
      zoomAt(Math.exp(-event.deltaY * WHEEL_SPEED), fromCentre(event))
    }
    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  })

  function pinchOf() {
    const [a, b] = [...pointers.current.values()]
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
  }

  function handlePointerDown(event) {
    viewport.setPointerCapture(event.pointerId)
    const point = fromCentre(event)
    pointers.current.set(event.pointerId, point)
    tap.current.start = pointers.current.size === 1 ? point : null
    if (pointers.current.size === 2) pinch.current = pinchOf()
  }

  function handlePointerMove(event) {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    const point = fromCentre(event)
    pointers.current.set(event.pointerId, point)

    if (pinch.current && pointers.current.size === 2) {
      const next = pinchOf()
      zoomAt(next.distance / pinch.current.distance, next.mid)
      setView((current) => limit({ ...current, x: current.x + next.mid.x - pinch.current.mid.x, y: current.y + next.mid.y - pinch.current.mid.y }))
      pinch.current = next
    } else if (pointers.current.size === 1) {
      setView((current) => limit({ ...current, x: current.x + point.x - previous.x, y: current.y + point.y - previous.y }))
    }
  }

  function handlePointerEnd(event, cancelled) {
    if (!pointers.current.delete(event.pointerId)) return
    if (pointers.current.size < 2) pinch.current = null
    const { start, last } = tap.current
    if (cancelled || !start || pointers.current.size > 0) return

    const point = fromCentre(event)
    if (Math.hypot(point.x - start.x, point.y - start.y) > DOUBLE_TAP.px) return // it was a drag
    const now = performance.now()
    if (last && now - last.time < DOUBLE_TAP.ms && Math.hypot(point.x - last.x, point.y - last.y) < DOUBLE_TAP.px) {
      tap.current.last = null
      if (view.zoom > 1) setView({ zoom: 1, x: 0, y: 0 })
      else zoomAt(DOUBLE_TAP.zoom, point)
    } else tap.current.last = { ...point, time: now }
  }

  return (
    <ThemeProvider theme={cameraTheme}>
      <Dialog fullScreen open onClose={onClose} aria-label="Zoomed photo" slotProps={{ paper: { sx: styles.paper } }}>
        <Box sx={styles.top}>
          <IconButton aria-label="Close zoom" onClick={onClose} sx={styles.close}>
            <Close />
          </IconButton>
          <Typography aria-live="polite" sx={styles.level}>{Math.round(view.zoom * 100)}%</Typography>
        </Box>

        <Box
          ref={setViewport}
          sx={styles.viewport}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => handlePointerEnd(event, false)}
          onPointerCancel={(event) => handlePointerEnd(event, true)}
        >
          {bounds && (
            <img src={photoUrl} alt="Captured photo, zoomed" draggable={false} style={styles.photo(size, fit, view)} />
          )}
        </Box>

        <Box sx={styles.controls}>
          <Box sx={styles.buttons}>
            <IconButton aria-label="Zoom out" disabled={view.zoom <= 1} onClick={() => zoomAt(1 / BUTTON_STEP)} sx={styles.control}>
              <Remove />
            </IconButton>
            <Button disabled={view.zoom === 1} onClick={() => setView({ zoom: 1, x: 0, y: 0 })} sx={styles.control}>
              Fit
            </Button>
            <IconButton aria-label="Zoom in" disabled={view.zoom >= MAX_ZOOM} onClick={() => zoomAt(BUTTON_STEP)} sx={styles.control}>
              <Add />
            </IconButton>
          </Box>
          <Typography sx={styles.hint}>Pinch or scroll to zoom · drag to move · double-tap to fit</Typography>
        </Box>
      </Dialog>
    </ThemeProvider>
  )
}
