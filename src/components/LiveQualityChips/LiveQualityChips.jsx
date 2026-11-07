import { CenterFocusStrongOutlined, WbSunnyOutlined } from '@mui/icons-material'
import { Box, Chip } from '@mui/material'
import { BRIGHTNESS, gradeBrightness, gradeResolution, gradeSharpness, megapixels } from '../../utils'
import { styles } from './LiveQualityChips.styles.js'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'

const BRIGHTNESS_LABELS = {
  good: { dark: 'Good', bright: 'Good' },
  warn: { dark: 'Dark', bright: 'Bright' },
  poor: { dark: 'Too dark', bright: 'Too bright' },
}
const SHARPNESS_LABELS = { good: 'Good', warn: 'A bit blurry', poor: 'Blurry' }

/** `resolution` is { width, height } or null; `quality` is { brightness, sharpness } or null. */
export default function LiveQualityChips({ resolution, quality }) {
  return (
    <Box role="group" aria-label="Live quality" sx={styles.row}>
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
            <StatusBadge grade={gradeSharpness(quality.sharpness)} label={SHARPNESS_LABELS[gradeSharpness(quality.sharpness)]} />
          </MetricChip>
        </>
      )}
    </Box>
  )
}

function MetricChip({ icon, name, children }) {
  return (
    <Chip
      sx={styles.chip}
      icon={<Box component="span" aria-hidden sx={styles.icon}>{icon}</Box>}
      label={
        <>
          <Box component="span" sx={styles.name}>{name}</Box>
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
      sx={styles.chip}
      icon={<Box component="span" sx={styles.dot(gradeResolution(width, height))} />}
      label={
        <>
          <Box component="span" sx={styles.dimensions}>{width} × {height} ·{' '}</Box>
          {megapixels(width, height).toFixed(1)} MP
        </>
      }
    />
  )
}
