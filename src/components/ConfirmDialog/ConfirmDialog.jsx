import { Close } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material'
import { styles } from './ConfirmDialog.styles.js'

/**
 * Asks before work is lost. Cancel is the safe choice, so it gets the first focus: the close button, Escape and
 * tapping outside all cancel. `secondary` ({ label, onClick, disabled }) replaces the cancel button with another action.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Keep photo', confirmColor = 'error', secondary, onConfirm, onCancel }) {
  const { label, onClick, disabled } = secondary ?? { label: cancelLabel, onClick: onCancel }
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-title" aria-describedby="confirm-message" slotProps={{ paper: { sx: styles.paper } }}>
      <DialogTitle id="confirm-title" sx={styles.title}>{title}</DialogTitle>
      <IconButton autoFocus aria-label="Close" onClick={onCancel} sx={styles.close}>
        <Close />
      </IconButton>
      <DialogContent>
        <DialogContentText id="confirm-message">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button disabled={disabled} onClick={onClick} sx={styles.action}>{label}</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} sx={styles.action}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
