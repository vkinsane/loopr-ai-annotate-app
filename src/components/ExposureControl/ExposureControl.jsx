import { Add, Remove } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import { styles } from './ExposureControl.styles.js'

// +0.7 EV, −1 EV, 0 EV: the sign shows which way the picture was changed.
const formatEv = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Number(Math.abs(value).toFixed(1))} EV`

/** Darker / brighter buttons around the current exposure. `exposure` comes from useExposure. */
export default function ExposureControl({ exposure, disabled }) {
  const { value, atMin, atMax, pending, change } = exposure
  return (
    <Box role="group" aria-label="Exposure" sx={styles.root}>
      <IconButton aria-label="Darker" disabled={disabled || pending || atMin} onClick={() => change(-1)} sx={styles.button}>
        <Remove />
      </IconButton>
      <Box component="output" aria-live="polite" sx={styles.value}>{formatEv(value)}</Box>
      <IconButton aria-label="Brighter" disabled={disabled || pending || atMax} onClick={() => change(1)} sx={styles.button}>
        <Add />
      </IconButton>
    </Box>
  )
}
