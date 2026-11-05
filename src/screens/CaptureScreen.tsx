import { useRef } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@mui/material/styles'
import { useCamera } from '../hooks/useCamera.ts'
import { cameraTheme } from '../theme.ts'
import CameraErrorScreen from './CameraErrorScreen.tsx'

const LANDSCAPE = '@media (orientation: landscape)'
const DEFAULT_ASPECT_RATIO = 4 / 3 // until the camera reports its real size
const PIXELS_PER_MEGAPIXEL = 1_000_000
const GUIDE = { size: 32, inset: 24, line: '3px solid' }
const CORNERS = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
] as const

export default function CaptureScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { state, retry } = useCamera(videoRef)

  if (state.status === 'error') {
    return (
      <ThemeProvider theme={cameraTheme}>
        <CameraErrorScreen error={state.error} onRetry={retry} />
      </ThemeProvider>
    )
  }

  const aspectRatio = state.status === 'live' ? state.width / state.height : DEFAULT_ASPECT_RATIO

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
          <Box role="group" aria-label="Live quality" sx={{ minHeight: 56, px: 2, pt: 2, pb: 1.5 }}>
            {state.status === 'live' && <ResolutionChip width={state.width} height={state.height} />}
          </Box>

          {/* A size container lets the frame be the largest box with the camera's aspect ratio,
              so the operator sees exactly the area that will be captured. */}
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
          <Typography sx={{ gridArea: 'hint', fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>
            Fill the frame with the door panel and hold steady
          </Typography>
          {/* Wired up in the capture step. */}
          <ShutterButton disabled />
        </Box>

        {state.status === 'starting' && <StartingOverlay />}
      </Box>
    </ThemeProvider>
  )
}

function ResolutionChip({ width, height }: { width: number; height: number }) {
  const megapixels = ((width * height) / PIXELS_PER_MEGAPIXEL).toFixed(1)

  return (
    <Chip
      title="Live preview resolution"
      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
      label={
        <>
          {/* Phones show only megapixels so all chips fit on one line. */}
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {width} × {height} ·{' '}
          </Box>
          {megapixels} MP
        </>
      }
    />
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

function ShutterButton({ disabled }: { disabled: boolean }) {
  return (
    <ButtonBase
      aria-label="Take photo"
      disabled={disabled}
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
