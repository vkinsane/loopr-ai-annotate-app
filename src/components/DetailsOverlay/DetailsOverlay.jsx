import { useId } from 'react'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { Box, ButtonBase, Collapse } from '@mui/material'
import ScrollThumb from '../ScrollThumb/ScrollThumb.jsx'
import { styles } from './DetailsOverlay.styles.js'

/**
 * Phones: a photo's details and `actions` float over its bottom edge, so the photo can fill the screen.
 * The details panel minimises to its header row. The screen owns `open`, so it can open the panel to show an error.
 * The parent needs position: relative.
 */
export default function DetailsOverlay({ title, open, onToggle, actions, children }) {
  const bodyId = useId()
  return (
    <Box sx={styles.root}>
      <Box component="section" sx={styles.panel}>
        <ButtonBase aria-expanded={open} aria-controls={bodyId} onClick={onToggle} sx={styles.header(open)}>
          <Box component="span" sx={styles.title}>{title}</Box>
          {open ? <ExpandMore aria-hidden /> : <ExpandLess aria-hidden />}
        </ButtonBase>
        <Collapse in={open}>
          <Box id={bodyId} sx={styles.body}>
            <ScrollThumb />
            {children}
          </Box>
        </Collapse>
      </Box>
      <Box sx={styles.actions}>{actions}</Box>
    </Box>
  )
}
