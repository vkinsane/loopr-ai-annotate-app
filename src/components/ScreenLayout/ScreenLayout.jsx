import { Box, Typography } from '@mui/material'
import BackButton from '../BackButton/BackButton.jsx'
import { styles } from './ScreenLayout.styles.js'

/**
 * One window tall: a full-width header bar, and the screen below it. The screen's root fills the rest and does its own scrolling.
 * `headerSx` lines the bar's content up with the screen's width. `actions` go on the right of the bar.
 */
export default function ScreenLayout({ title, onBack, backLabel, actions, headerSx, children }) {
  return (
    <Box sx={styles.root}>
      <Box component="header" sx={styles.bar}>
        <Box sx={[styles.header, headerSx]}>
          {onBack && <BackButton label={backLabel} onClick={onBack} sx={styles.back} />}
          <Typography component="h1" sx={styles.title}>{title}</Typography>
          {actions}
        </Box>
      </Box>
      {children}
    </Box>
  )
}
