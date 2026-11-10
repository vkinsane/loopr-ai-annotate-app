import { Box } from '@mui/material'
import { styles } from './DrawHint.styles.js'

/**
 * Touch screens only: a finger drags across the empty photo and a box grows behind it, twice, then fades.
 * Decoration: the empty annotation list says the same, so it's hidden from screen readers and lets touches through.
 */
export default function DrawHint() {
  return (
    <Box aria-hidden sx={styles.root}>
      <Box sx={styles.box} />
      <Box sx={styles.finger} />
      <Box component="span" sx={styles.caption}>Drag to draw a box</Box>
    </Box>
  )
}
