import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { styles } from './ConfirmDialog.styles.js'

/** Asks before work is lost. Cancel is the safe choice: Escape and tapping outside also cancel. */
export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-title" aria-describedby="confirm-message" slotProps={{ paper: { sx: styles.paper } }}>
      <DialogTitle id="confirm-title" sx={styles.title}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-message">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button autoFocus onClick={onCancel} sx={styles.action}>Keep working</Button>
        <Button variant="contained" color="error" onClick={onConfirm} sx={styles.action}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
