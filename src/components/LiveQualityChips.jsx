import { CenterFocusStrongOutlined, WbSunnyOutlined } from '@mui/icons-material'
import { Box, Chip } from '@mui/material'
import { VISUALLY_HIDDEN } from '../theme.js'
import { BRIGHTNESS, gradeBrightness, gradeResolution, gradeSharpness, megapixels } from '../utils'
import StatusBadge from './StatusBadge.jsx'

const GRADE_DOT_COLORS = { good: 'success.light', warn: 'warning.light', poor: 'error.light' }
const BRIGHTNESS_LABELS = {
  good: { dark: 'Good', bright: 'Good' },
  warn: { dark: 'Dim', bright: 'Bright' },
  poor: { dark: 'Too dark', bright: 'Too bright' },
}
const SHARPNESS_LABELS = { good: 'Good', warn: 'Soft', poor: 'Blurry' }
const CHIP_SX = { fontWeight: 600, fontVariantNumeric: 'tabular-nums' }

/** `resolution` is { width, height } or null; `quality` is { brightness, sharpness } or null. */
export default function LiveQualityChips({ resolution, quality }) {
  return (
    <Box
      role="group"
      aria-label="Live quality"
      sx={{ minHeight: 56, px: 2, pt: 2, pb: 1.5, display: 'flex', gap: 0.75, flexWrap: 'nowrap' }}
    >
      {resolution && <ResolutionChip {...resolution} />}
      {quality && (
        <>
          <MetricChip icon={<WbSunnyOutlined />} name="Brightness">
            {quality.brightness}{' '}
            <StatusBadge
              grade={gradeBrightness(quality.brightness)}
              label={BRIGHTNESS_LABELS[gradeBrightness(quality.brightness)][quality.brightness < BRIGHTNESS.dim ? 'dark' : 'bright']}
            />
          </MetricChip>
          <MetricChip icon={<CenterFocusStrongOutlined />} name="Sharpness">
            {quality.sharpness}{' '}
            <StatusBadge
              grade={gradeSharpness(quality.sharpness)}
              label={SHARPNESS_LABELS[gradeSharpness(quality.sharpness)]}
            />
          </MetricChip>
        </>
      )}
    </Box>
  )
}

function MetricChip({ icon, name, children }) {
  return (
    <Chip
      icon={<Box component="span" sx={{ display: 'flex', '& svg': { fontSize: 16 } }} aria-hidden>{icon}</Box>}
      sx={CHIP_SX}
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
      sx={CHIP_SX}
      icon={
        <Box
          component="span"
          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GRADE_DOT_COLORS[gradeResolution(width, height)] }}
        />
      }
      label={
        <>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {width} × {height} ·{' '}
          </Box>
          {megapixels(width, height).toFixed(1)} MP
        </>
      }
    />
  )
}
