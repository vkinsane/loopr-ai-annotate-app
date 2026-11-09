import { CenterFocusStrongOutlined, WbSunnyOutlined } from '@mui/icons-material'
import { Box, Chip } from '@mui/material'
import { BRIGHTNESS, brightnessPercent, gradeBrightness, gradeResolution, gradeSharpness, megapixels, SHARPNESS_WORDS } from '../../utils'
import { styles } from './LiveQualityChips.styles.js'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'

const BRIGHTNESS_LABELS = {
  good: { dark: 'Good', bright: 'Good' },
  warn: { dark: 'Dark', bright: 'Bright' },
  poor: { dark: 'Too dark', bright: 'Too bright' },
}

/** `resolution` is { width, height } or null; `quality` is { brightness, sharpness } or null. */
export default function LiveQualityChips({ resolution, quality }) {
  return (
    <Box role="group" aria-label="Live quality" sx={styles.row}>
      {resolution && <ResolutionChip {...resolution} />}
      {quality && (
        <>
          <MetricChip icon={<WbSunnyOutlined />} name="Brightness">
            {brightnessPercent(quality.brightness)}%{' '}
            <StatusBadge
              grade={gradeBrightness(quality.brightness)}
              label={BRIGHTNESS_LABELS[gradeBrightness(quality.brightness)][quality.brightness < BRIGHTNESS.dim ? 'dark' : 'bright']}
            />
          </MetricChip>
          <MetricChip icon={<CenterFocusStrongOutlined />} name="Sharpness">
            {SHARPNESS_WORDS[gradeSharpness(quality.sharpness)]} <StatusBadge grade={gradeSharpness(quality.sharpness)} label="" />
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
