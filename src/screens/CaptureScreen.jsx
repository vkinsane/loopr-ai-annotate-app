import { useRef, useState } from 'react'
import { FlashlightOff, FlashlightOn } from '@mui/icons-material'
import { Box, ButtonBase, CircularProgress, IconButton, ThemeProvider, Typography } from '@mui/material'
import LiveQualityChips from '../components/LiveQualityChips.jsx'
import { useCamera, useLiveQuality, useTorch } from '../hooks'
import { cameraTheme } from '../theme.js'
import { getCaptureHint } from '../utils'
import CameraErrorScreen from './CameraErrorScreen.jsx'
import { styles } from './CaptureScreen.styles.js'

const DEFAULT_ASPECT_RATIO = 4 / 3
const CORNERS = [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']]

export default function CaptureScreen({ onCapture }) {
  const videoRef = useRef(null)
  const { state, retry, capture } = useCamera(videoRef)
  const [capturing, setCapturing] = useState(false)
  const [captureFailed, setCaptureFailed] = useState(false)
  const torch = useTorch(state.status === 'live' ? state.track : null)
  const quality = useLiveQuality(videoRef, state.status === 'live' && !capturing)

  if (state.status === 'error') {
    return (
      <ThemeProvider theme={cameraTheme}>
        <CameraErrorScreen error={state.error} onRetry={retry} />
      </ThemeProvider>
    )
  }

  async function handleCapture() {
    setCapturing(true)
    setCaptureFailed(false)
    try {
      onCapture(await capture())
    } catch (error) {
      console.error('Capture failed', error)
      setCaptureFailed(true)
    } finally {
      setCapturing(false)
    }
  }

  const aspectRatio = state.status === 'live' ? state.width / state.height : DEFAULT_ASPECT_RATIO
  const hint = captureFailed ? { text: "Couldn't take the photo. Try again.", warn: true } : getCaptureHint(quality, torch)

  return (
    <ThemeProvider theme={cameraTheme}>
      <Box component="main" sx={styles.root}>
        <Box sx={styles.main}>
          <LiveQualityChips
            resolution={state.status === 'live' ? { width: state.width, height: state.height } : null}
            quality={quality}
          />
          <Box sx={styles.viewport}>
            <Box sx={styles.frame(aspectRatio)}>
              {/* playsInline and muted are required for inline autoplay on iOS Safari. */}
              <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera view" style={styles.video} />
              {CORNERS.map(([vertical, horizontal]) => (
                <Box key={`${vertical}-${horizontal}`} aria-hidden sx={styles.guide(vertical, horizontal)} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={styles.controls}>
          <Typography sx={styles.hint(hint.warn)}>{hint.text}</Typography>
          <ButtonBase
            aria-label="Take photo"
            disabled={state.status !== 'live' || capturing}
            onClick={handleCapture}
            sx={styles.shutter}
          >
            <Box sx={styles.shutterFill} />
          </ButtonBase>
          {torch.supported && (
            <IconButton
              aria-label="Torch"
              aria-pressed={torch.on}
              disabled={torch.pending || capturing}
              onClick={torch.toggle}
              sx={styles.torch(torch.on)}
            >
              {torch.on ? <FlashlightOn /> : <FlashlightOff />}
            </IconButton>
          )}
        </Box>

        {state.status === 'starting' && (
          <Box role="status" sx={styles.overlay}>
            <CircularProgress color="inherit" size={56} />
            <Typography component="h1" sx={styles.title}>Starting camera…</Typography>
            <Typography sx={styles.overlayText}>
              Allow camera access when your browser asks. Photos stay on this device.
            </Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
