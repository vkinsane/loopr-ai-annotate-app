import { useRef, useState } from 'react'
import { FlashlightOff, FlashlightOn } from '@mui/icons-material'
import { Box, ButtonBase, CircularProgress, IconButton, ThemeProvider, Typography } from '@mui/material'
import LiveQualityChips from '../components/LiveQualityChips.jsx'
import { useCamera, useLiveQuality, useTorch } from '../hooks'
import { cameraTheme } from '../theme.js'
import { getCaptureHint } from '../utils'
import CameraErrorScreen from './CameraErrorScreen.jsx'

const LANDSCAPE = '@media (orientation: landscape)'
const DEFAULT_ASPECT_RATIO = 4 / 3
const GUIDE = { size: 32, inset: 24, line: '3px solid' }
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
      <Box
        component="main"
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
          [LANDSCAPE]: { flexDirection: 'row' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <LiveQualityChips
            resolution={state.status === 'live' ? { width: state.width, height: state.height } : null}
            quality={quality}
          />

          {/* Size container: the frame is the largest box with the camera's aspect ratio, so what you see is what gets captured. */}
          <Box
            sx={{ flex: 1, minHeight: 0, mx: 2, containerType: 'size', display: 'grid', placeItems: 'center' }}
          >
            <Box
              sx={{
                position: 'relative',
                aspectRatio: String(aspectRatio),
                width: `min(100cqw, 100cqh * ${aspectRatio})`,
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              {/* playsInline and muted are required for inline autoplay on iOS Safari. */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Live camera view"
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
              <FrameGuides />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gridTemplateAreas: '"hint hint hint" ". shutter torch"',
            alignItems: 'center',
            justifyItems: 'center',
            gap: 2.5,
            px: 2,
            pt: 2.5,
            pb: 4.5,
            [LANDSCAPE]: {
              width: 140,
              gridTemplateColumns: 'auto',
              gridTemplateAreas: '"torch" "shutter" "hint"',
              alignContent: 'center',
              p: 2,
            },
          }}
        >
          <Typography
            sx={{
              gridArea: 'hint',
              fontSize: 14,
              textAlign: 'center',
              color: hint.warn ? 'warning.light' : 'text.secondary',
            }}
          >
            {hint.text}
          </Typography>
          <ShutterButton disabled={state.status !== 'live' || capturing} onClick={handleCapture} />
          {torch.supported && (
            <IconButton
              aria-label="Torch"
              aria-pressed={torch.on}
              disabled={torch.pending || capturing}
              onClick={torch.toggle}
              sx={{
                gridArea: 'torch',
                width: 52,
                height: 52,
                color: torch.on ? 'background.default' : 'text.primary',
                bgcolor: torch.on ? 'common.white' : 'action.selected',
                '&:hover': { bgcolor: torch.on ? 'grey.300' : 'action.focus' },
              }}
            >
              {torch.on ? <FlashlightOn /> : <FlashlightOff />}
            </IconButton>
          )}
        </Box>

        {state.status === 'starting' && <StartingOverlay />}
      </Box>
    </ThemeProvider>
  )
}

function FrameGuides() {
  return CORNERS.map(([vertical, horizontal]) => (
    <Box
      key={`${vertical}-${horizontal}`}
      aria-hidden
      sx={{
        position: 'absolute',
        [vertical]: GUIDE.inset,
        [horizontal]: GUIDE.inset,
        width: GUIDE.size,
        height: GUIDE.size,
        [`border-${vertical}`]: GUIDE.line,
        [`border-${horizontal}`]: GUIDE.line,
        [`border-${vertical}-${horizontal}-radius`]: 6,
        color: 'common.white',
      }}
    />
  ))
}

function ShutterButton({ disabled, onClick }) {
  return (
    <ButtonBase
      aria-label="Take photo"
      disabled={disabled}
      onClick={onClick}
      sx={{
        gridArea: 'shutter',
        width: 76,
        height: 76,
        p: 0.5,
        borderRadius: '50%',
        border: 4,
        borderColor: 'common.white',
        '&.Mui-disabled': { opacity: 0.4 },
      }}
    >
      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'common.white' }} />
    </ButtonBase>
  )
}

function StartingOverlay() {
  return (
    <Box
      role="status"
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        p: 4,
        textAlign: 'center',
      }}
    >
      <CircularProgress color="inherit" size={56} />
      <Typography component="h1" sx={{ fontSize: 22, fontWeight: 600 }}>
        Starting camera…
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: 280 }}>
        Allow camera access when your browser asks. Photos stay on this device.
      </Typography>
    </Box>
  )
}
