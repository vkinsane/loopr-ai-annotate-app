import { Box } from '@mui/material'
import { styles } from './NotAvailable.styles.js'

/**
 * A greyed icon and label in place of a camera control the device doesn't offer,
 * so users know it is missing rather than looking for it. `Icon` is an MUI icon component.
 */
export default function NotAvailable({ Icon, label, sx }) {
  return (
    <Box sx={[styles.root, sx]}>
      <Icon aria-hidden sx={styles.icon} />
      {label}
    </Box>
  )
}
