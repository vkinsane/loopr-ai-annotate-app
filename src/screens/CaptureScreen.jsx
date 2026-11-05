import { useRef, useState } from 'react'
import CenterFocusStrongOutlined from '@mui/icons-material/CenterFocusStrongOutlined'
import FlashlightOff from '@mui/icons-material/FlashlightOff'
import FlashlightOn from '@mui/icons-material/FlashlightOn'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@mui/material/styles'
import StatusBadge from '../components/StatusBadge.jsx'
import { useCamera } from '../hooks/useCamera.js'
import { useLiveQuality } from '../hooks/useLiveQuality.js'
import { useTorch } from '../hooks/useTorch.js'
import { cameraTheme, VISUALLY_HIDDEN } from '../theme.js'
import {
  BRIGHTNESS,
  gradeBrightness,
  gradeResolution,
  gradeSharpness,
  megapixels,
} from '../utils/quality.js'
import CameraErrorScreen from './CameraErrorScreen.jsx'

const LANDSCAPE = '@media (orientation: landscape)'
const DEFAULT_ASPECT_RATIO = 4 / 3 // until the camera reports its real size
const GUIDE = { size: 32, inset: 24, line: '3px solid' }
const CORNERS = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
]
const DEFAULT_HINT = 'Fill the frame with the door panel and hold steady'
const GRADE_DOT_COLORS = {
  good: 'success.light',
  warn: 'warning.light',
  poor: 'error.light',
}

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
  const hint = captureFailed
    ? { text: "Couldn't take the photo. Try again.", warn: true }
    : getHint(quality, torch)

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
          <Box
            role="group"
            aria-label="Live quality"
            sx={{ minHeight: 56, px: 2, pt: 2, pb: 1.5, display: 'flex', gap: 0.75, flexWrap: 'nowrap' }}
          >
            {state.status === 'live' && <ResolutionChip width={state.width} height={state.height} />}
            {quality && <QualityChips quality={quality} />}
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

/** One actionable hint, worst problem first. */
function getHint(quality, torch) {
  if (torch.failed) return { text: "The torch didn't respond. Try again.", warn: true }
  if (!quality) return { text: DEFAULT_HINT, warn: false }

  if (gradeBrightness(quality.brightness) !== 'good') {
    if (quality.brightness > BRIGHTNESS.bright) {
      const text = torch.on ? 'Too bright. Turn off the torch or reduce glare.' : 'Too bright. Reduce glare.'
      return { text, warn: true }
    }
    if (!torch.supported) return { text: 'Too dim, and this device has no torch. Move to better light.', warn: true }
    const text = torch.on ? 'Too dim. Move to better light.' : 'Too dim. Turn on the torch.'
    return { text, warn: true }
  }

  if (gradeSharpness(quality.sharpness) !== 'good') return { text: 'Slightly blurry. Hold steady.', warn: true }
  return { text: DEFAULT_HINT, warn: false }
}

function brightnessLabel(value) {
  const grade = gradeBrightness(value)
  if (grade === 'good') return 'Good'
  const tooDark = value < BRIGHTNESS.dim
  if (grade === 'warn') return tooDark ? 'Dim' : 'Bright'
  return tooDark ? 'Too dark' : 'Too bright'
}

const SHARPNESS_LABELS = { good: 'Good', warn: 'Soft', poor: 'Blurry' }

function QualityChips({ quality }) {
  return (
    <>
      <MetricChip icon={<WbSunnyOutlined />} name="Brightness">
        {quality.brightness}{' '}
        <StatusBadge grade={gradeBrightness(quality.brightness)} label={brightnessLabel(quality.brightness)} />
      </MetricChip>
      <MetricChip icon={<CenterFocusStrongOutlined />} name="Sharpness">
        {quality.sharpness}{' '}
        <StatusBadge
          grade={gradeSharpness(quality.sharpness)}
          label={SHARPNESS_LABELS[gradeSharpness(quality.sharpness)]}
        />
      </MetricChip>
    </>
  )
}

/** Icon on phones, icon and name on wider screens. The name is always read by screen readers. */
function MetricChip({ icon, name, children }) {
  return (
    <Chip
      icon={<Box component="span" sx={{ display: 'flex', '& svg': { fontSize: 16 } }} aria-hidden>{icon}</Box>}
      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
      label={
        <>
          <Box
            component="span"
            sx={(theme) => ({
              fontWeight: 500,
              color: 'text.secondary',
              mr: 0.75,
              [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN,
            })}
          >
            {name}
          </Box>
          {children}
        </>
      }
    />
  )
}

function ResolutionChip({ width, height }) {
  return (
    <Chip
      title="Live preview resolution"
      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
      icon={
        <Box
          component="span"
          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GRADE_DOT_COLORS[gradeResolution(width, height)] }}
        />
      }
      label={
        <>
          {/* Phones show only megapixels so all chips fit on one line. */}
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {width} × {height} ·{' '}
          </Box>
          {megapixels(width, height).toFixed(1)} MP
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
