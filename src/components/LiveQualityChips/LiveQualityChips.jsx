import { CenterFocusStrongOutlined, WbSunnyOutlined } from '@mui/icons-material'
import { Box, Chip } from '@mui/material'
import { BRIGHTNESS, brightnessPercent, gradeBrightness, gradeResolution, gradeSharpness, megapixels, SHARPNESS_WORDS } from '../../utils'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import { styles } from './LiveQualityChips.styles.js'

const BRIGHTNESS_LABELS = {
  good: { dark: 'Good', bright: 'Good' },
  warn: { dark: 'Dark', bright: 'Bright' },
  poor: { dark: 'Too dark', bright: 'Too bright' },
}

/** `resolution` is { width, height } or null; `quality` is { brightness, sharpness } or null. */
export default function LiveQualityChips({ resolution, quality }) {
  const brightness = quality && gradeBrightness(quality.brightness)
  const sharpness = quality && gradeSharpness(quality.sharpness)
  return (
    <Box role="group" aria-label="Live quality" sx={styles.row}>
      {resolution && (
        <MetricChip title="Live preview resolution" icon={<Box component="span" sx={styles.dot(gradeResolution(resolution.width, resolution.height))} />}>
          <Box component="span" sx={styles.dimensions}>{resolution.width} × {resolution.height} ·{' '}</Box>
          {megapixels(resolution.width, resolution.height).toFixed(1)} MP
        </MetricChip>
      )}
      {quality && (
        <>
          <MetricChip icon={<WbSunnyOutlined />} name="Brightness">
            {brightnessPercent(quality.brightness)}%{' '}
            <StatusBadge grade={brightness} label={BRIGHTNESS_LABELS[brightness][quality.brightness < BRIGHTNESS.dim ? 'dark' : 'bright']} />
          </MetricChip>
          <MetricChip icon={<CenterFocusStrongOutlined />} name="Sharpness">
            {SHARPNESS_WORDS[sharpness]} <StatusBadge grade={sharpness} label="" />
          </MetricChip>
        </>
      )}
    </Box>
  )
}

function MetricChip({ icon, name, title, children }) {
  return (
    <Chip
      title={title}
      sx={styles.chip}
      icon={<Box component="span" aria-hidden sx={styles.icon}>{icon}</Box>}
      label={
        <>
          {name && <Box component="span" sx={styles.name}>{name}</Box>}
          {children}
        </>
      }
    />
  )
}
