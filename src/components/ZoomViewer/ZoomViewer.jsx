import { useRef, useState } from 'react'
import { Add, Close, Remove } from '@mui/icons-material'
import { Box, Button, Dialog, IconButton, ThemeProvider, Typography } from '@mui/material'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { cameraTheme } from '../../theme.js'
import { styles } from './ZoomViewer.styles.js'

const MAX_ZOOM = 8
const ZOOM_STEP = 0.4
const ZOOM_MS = 150

/** Full-screen photo viewer: pinch or scroll to zoom (1×–8×), drag to move, double-tap to zoom in and out. */
export default function ZoomViewer({ photoUrl, onClose }) {
  const controls = useRef(null)
  const [zoom, setZoom] = useState(1)

  return (
    <ThemeProvider theme={cameraTheme}>
      <Dialog fullScreen open onClose={onClose} aria-label="Zoomed photo" slotProps={{ paper: { sx: styles.paper } }}>
        <Box sx={styles.top}>
          <IconButton aria-label="Close zoom" onClick={onClose} sx={styles.close}>
            <Close />
          </IconButton>
          <Typography aria-live="polite" sx={styles.level}>{Math.round(zoom * 100)}%</Typography>
        </Box>

        <Box sx={styles.viewport}>
          <TransformWrapper
            ref={controls}
            minScale={1}
            maxScale={MAX_ZOOM}
            doubleClick={{ mode: 'toggle' }}
            onTransform={(_, { scale }) => setZoom(scale)}
          >
            <TransformComponent wrapperStyle={styles.zoomArea} contentStyle={styles.zoomArea}>
              <img src={photoUrl} alt="Captured photo, zoomed" draggable={false} style={styles.photo} />
            </TransformComponent>
          </TransformWrapper>
        </Box>

        <Box sx={styles.controls}>
          <Box sx={styles.buttons}>
            <IconButton aria-label="Zoom out" disabled={zoom <= 1} onClick={() => controls.current.zoomOut(ZOOM_STEP, ZOOM_MS)} sx={styles.control}>
              <Remove />
            </IconButton>
            <Button disabled={zoom <= 1} onClick={() => controls.current.resetTransform(ZOOM_MS)} sx={styles.control}>
              Fit
            </Button>
            <IconButton aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => controls.current.zoomIn(ZOOM_STEP, ZOOM_MS)} sx={styles.control}>
              <Add />
            </IconButton>
          </Box>
          <Typography sx={styles.hint}>Pinch or scroll to zoom · drag to move · double-tap to zoom</Typography>
        </Box>
      </Dialog>
    </ThemeProvider>
  )
}
