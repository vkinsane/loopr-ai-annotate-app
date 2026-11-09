import { useRef, useState } from 'react'
import { Add, Close, Remove } from '@mui/icons-material'
import { Box, Button, Dialog, IconButton, ThemeProvider, Typography } from '@mui/material'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { cameraTheme } from '../../theme.js'
import { ZOOM } from '../../utils'
import { styles } from './ZoomViewer.styles.js'

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
            maxScale={ZOOM.max}
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
            <IconButton aria-label="Zoom out" disabled={zoom <= 1} onClick={() => controls.current.zoomOut(ZOOM.step, ZOOM.ms)} sx={styles.control}>
              <Remove />
            </IconButton>
            <Button disabled={zoom <= 1} onClick={() => controls.current.resetTransform(ZOOM.ms)} sx={styles.control}>
              Fit
            </Button>
            <IconButton aria-label="Zoom in" disabled={zoom >= ZOOM.max} onClick={() => controls.current.zoomIn(ZOOM.step, ZOOM.ms)} sx={styles.control}>
              <Add />
            </IconButton>
          </Box>
          <Typography sx={styles.hint}>Pinch or scroll to zoom · drag to move · double-tap to zoom</Typography>
        </Box>
      </Dialog>
    </ThemeProvider>
  )
}
