import { useRef, useState } from 'react'
import { ImageOutlined } from '@mui/icons-material'
import { Alert, Button, IconButton, Link, Snackbar } from '@mui/material'
import { validatePhotoFile } from '../../utils'
import { styles } from './ChoosePhotoButton.styles.js'

// The picker shows only these; `validatePhotoFile` still checks the file's content, since `accept` is only a hint.
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
const ERROR_SHOW_MS = 6000
const ERROR_POSITION = { vertical: 'bottom', horizontal: 'center' }

/**
 * Fallback when the camera can't be used: picks an existing photo from the device.
 * `onPick` receives { blob, url, method: 'upload' }, the same shape as a camera capture.
 * `asLink` renders an inline text link, `asIcon` a round icon button styled by `sx`; otherwise a full-width button with `variant`.
 */
export default function ChoosePhotoButton({ onPick, asLink = false, asIcon = false, variant = 'outlined', disabled, sx }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  async function handleChange(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again after Retake
    if (!file) return
    try {
      const { message } = await validatePhotoFile(file)
      setError(message?.text ?? null)
      if (!message) onPick({ blob: file, url: URL.createObjectURL(file), method: 'upload' })
    } catch (readError) {
      console.error('Could not read the picked file', readError)
      setError("Couldn't open this file, so choose another photo.")
    }
  }

  const open = () => inputRef.current?.click()
  const label = 'Choose a photo instead'

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={handleChange} />
      {asIcon ? (
        <IconButton aria-label={label} disabled={disabled} onClick={open} sx={sx}>
          <ImageOutlined />
        </IconButton>
      ) : asLink ? (
        <Link component="button" type="button" onClick={open} sx={styles.link}>
          {label}
        </Link>
      ) : (
        <Button variant={variant} size="large" fullWidth startIcon={<ImageOutlined />} onClick={open}>
          {label}
        </Button>
      )}
      {/* Floats over the page, so showing it moves nothing. The Alert's role="alert" reads it out. */}
      <Snackbar open={Boolean(error)} autoHideDuration={ERROR_SHOW_MS} onClose={() => setError(null)} anchorOrigin={ERROR_POSITION}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={styles.error}>{error}</Alert>
      </Snackbar>
    </>
  )
}
