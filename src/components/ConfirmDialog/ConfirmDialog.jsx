import { useId } from 'react'
import { Close } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material'
import { styles } from './ConfirmDialog.styles.js'

/**
 * Asks before work is lost. Cancel is the safe choice, so it gets the first focus: the close button, Escape and
 * tapping outside all cancel. `secondary` ({ label, onClick, disabled }) replaces the cancel button with another action.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Keep photo', confirmColor = 'error', secondary, onConfirm, onCancel }) {
  const { label, onClick, disabled } = secondary ?? { label: cancelLabel, onClick: onCancel }
  // Unique per dialog, so two open at once never share a label.
  const id = useId()
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} slotProps={{ paper: { sx: styles.paper } }}>
      <DialogTitle id={`${id}-title`} sx={styles.title}>{title}</DialogTitle>
      <IconButton autoFocus aria-label="Close" onClick={onCancel} sx={styles.close}>
        <Close />
      </IconButton>
      <DialogContent>
        <DialogContentText id={`${id}-message`}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button disabled={disabled} onClick={onClick} sx={styles.action}>{label}</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} sx={styles.action}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
