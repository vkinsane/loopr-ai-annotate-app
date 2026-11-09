import { Box, CircularProgress } from '@mui/material'
import { styles } from './ScreenLoader.styles.js'

/** Fills the window, or the area below a ScreenLayout header, while something loads. */
export default function ScreenLoader({ label = 'Loading…' }) {
  return (
    <Box component="main" role="status" sx={styles.root}>
      <CircularProgress />
      {label}
    </Box>
  )
}
