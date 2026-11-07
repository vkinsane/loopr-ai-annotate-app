import { useRef } from 'react'
import { ImageOutlined } from '@mui/icons-material'
import { Button, Link } from '@mui/material'
import { styles } from './ChoosePhotoButton.styles.js'

/**
 * Fallback when the camera can't be used: picks an existing photo from the device.
 * `onPick` receives { blob, url, method: 'upload' }, the same shape as a camera capture.
 * `asLink` renders an inline text link; otherwise a full-width button with `variant`.
 */
export default function ChoosePhotoButton({ onPick, asLink = false, variant = 'outlined' }) {
  const inputRef = useRef(null)

  function handleChange(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again after Retake
    if (file) onPick({ blob: file, url: URL.createObjectURL(file), method: 'upload' })
  }

  const open = () => inputRef.current?.click()
  const label = 'Choose a photo instead'

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      {asLink ? (
        <Link component="button" type="button" onClick={open} sx={styles.link}>
          {label}
        </Link>
      ) : (
        <Button variant={variant} size="large" fullWidth startIcon={<ImageOutlined />} onClick={open}>
          {label}
        </Button>
      )}
    </>
  )
}
