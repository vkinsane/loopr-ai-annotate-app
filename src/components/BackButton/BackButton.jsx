import { ArrowBackIosNew } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { styles } from './BackButton.styles.js'

/** The back arrow at the top left of a screen. `sx` adds placement. */
export default function BackButton({ label = 'Back', disabled, onClick, sx }) {
  return (
    <IconButton aria-label={label} disabled={disabled} onClick={onClick} sx={[styles.root, sx]}>
      <ArrowBackIosNew fontSize="small" />
    </IconButton>
  )
}
