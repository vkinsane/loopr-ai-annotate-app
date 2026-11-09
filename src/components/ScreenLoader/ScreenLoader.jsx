import { Box, CircularProgress } from '@mui/material'
import { styles } from './ScreenLoader.styles.js'

/** Fills the window while the next screen's code downloads. */
export default function ScreenLoader() {
  return (
    <Box role="status" sx={styles.root}>
      <CircularProgress />
      Loading…
    </Box>
  )
}
