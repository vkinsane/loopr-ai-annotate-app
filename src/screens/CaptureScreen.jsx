import { useRef, useState } from 'react'
import { FlashlightOff, FlashlightOn } from '@mui/icons-material'
import { Box, ButtonBase, CircularProgress, IconButton, ThemeProvider, Typography } from '@mui/material'
import BackButton from '../components/BackButton/BackButton.jsx'
import LiveQualityChips from '../components/LiveQualityChips/LiveQualityChips.jsx'
import { useCamera, useLiveQuality, useTorch } from '../hooks'
import { cameraTheme, CORNERS } from '../theme.js'
import { getCaptureHint } from '../utils'
import CameraErrorScreen from './CameraErrorScreen.jsx'
import { styles } from './CaptureScreen.styles.js'

const DEFAULT_ASPECT_RATIO = 4 / 3

/** `onCapture` and `onPickPhoto` both receive { blob, url, method }. */
export default function CaptureScreen({ onBack, onCapture, onPickPhoto }) {
  const videoRef = useRef(null)
  const { state, retry, capture } = useCamera(videoRef)
  const [capturing, setCapturing] = useState(false)
  const [captureFailed, setCaptureFailed] = useState(false)
  const live = state.status === 'live'
  const torch = useTorch(live ? state.track : null)
  const quality = useLiveQuality(videoRef, live && !capturing)

  if (state.status === 'error') {
    return (
      <ThemeProvider theme={cameraTheme}>
        <CameraErrorScreen error={state.error} onBack={onBack} onRetry={retry} onPickPhoto={onPickPhoto} />
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

  const aspectRatio = live ? state.width / state.height : DEFAULT_ASPECT_RATIO
  const hint = captureFailed ? { text: "Couldn't take the photo, so try again.", warn: true } : getCaptureHint(quality, torch)

  return (
    <ThemeProvider theme={cameraTheme}>
      <Box component="main" sx={styles.root}>
        <Box sx={styles.main}>
          <Box sx={styles.topBar}>
            <BackButton disabled={capturing} onClick={onBack} sx={styles.back} />
            <LiveQualityChips
              resolution={live ? { width: state.width, height: state.height } : null}
              quality={quality}
            />
          </Box>
          <Box sx={styles.viewport}>
            <Box sx={styles.frame(aspectRatio, live)}>
              {/* playsInline and muted are required for inline autoplay on iOS Safari. */}
              <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera view" style={styles.video} />
              {CORNERS.map(([vertical, horizontal]) => (
                <Box key={`${vertical}-${horizontal}`} aria-hidden sx={styles.guide(vertical, horizontal)} />
              ))}
              {capturing && (
                <Box role="status" sx={styles.saving}>
                  <CircularProgress color="inherit" size={32} />
                  Saving photo…
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={styles.controls}>
          <Typography sx={styles.hint(hint.warn)}>{hint.text}</Typography>
          <ButtonBase
            aria-label="Take photo"
            disabled={!live || capturing}
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
            <CircularProgress size={56} />
            <Typography component="h1" sx={styles.title}>Starting camera…</Typography>
            <Typography sx={styles.overlayText}>Opening the camera. Photos stay on this device.</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
