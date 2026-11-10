import { Box } from '@mui/material'
import { tiltAdvice } from '../../utils'
import { styles } from './LevelIndicator.styles.js'

/**
 * A line across the middle of the camera view that stays level with the real horizon, between two fixed marks.
 * It turns lime when the phone is straight. `tilt` is { roll, pitch } from useDeviceTilt.
 */
export default function LevelIndicator({ tilt }) {
  const { level, text } = tiltAdvice(tilt)
  return (
    <Box aria-hidden sx={styles.root}>
      <Box sx={styles.mark('left', level)} />
      <Box sx={styles.line(level)} style={{ transform: `rotate(${tilt.roll}deg)` }} />
      <Box sx={styles.mark('right', level)} />
      <Box component="span" sx={styles.text(level)}>{text}</Box>
    </Box>
  )
}
