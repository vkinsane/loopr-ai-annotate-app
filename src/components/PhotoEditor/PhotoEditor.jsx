import { useEffect, useId, useRef, useState } from 'react'
import { Close, Flip, RestartAlt, RotateLeft, RotateRight } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, IconButton, ThemeProvider, Typography } from '@mui/material'
import { useCropDrag } from '../../hooks'
import { cameraTheme, CORNERS } from '../../theme.js'
import { canvasToJpeg, editPhoto, turnedSize } from '../../utils'
import { styles } from './PhotoEditor.styles.js'

const PREVIEW_MAX_PX = 1600
const NO_EDIT = { rotation: 0, flipped: false }

const fullCrop = ({ width, height }) => ({ x: 0, y: 0, width, height })
const percent = (value, total) => `${(value / total) * 100}%`

/**
 * Full-screen editor: turn left or right, mirror, and crop by dragging the corners or the crop box,
 * or by dragging a new box. `onApply` gets the edited photo as a JPEG blob.
 */
export default function PhotoEditor({ blob, onApply, onClose }) {
  const canvasRef = useRef(null)
  const titleId = useId()
  const [bitmap, setBitmap] = useState(null)
  const [edit, setEdit] = useState(NO_EDIT)
  const [crop, setCrop] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | saving | failed

  // Decoded once; every preview and the final photo are drawn from it.
  useEffect(() => {
    let image = null
    createImageBitmap(blob)
      .then((decoded) => {
        image = decoded
        setBitmap(decoded)
        setCrop(fullCrop(decoded))
        setStatus('ready')
      })
      .catch((error) => {
        console.error('Photo decode failed', error)
        setStatus('failed')
      })
    return () => image?.close()
  }, [blob])

  const size = bitmap && turnedSize(bitmap, edit.rotation)
  const cropDrag = useCropDrag(crop, size, setCrop)

  // The preview shows the whole turned photo; the crop box sits over it.
  useEffect(() => {
    if (!bitmap) return
    const scale = Math.min(1, PREVIEW_MAX_PX / Math.max(bitmap.width, bitmap.height))
    const preview = editPhoto(bitmap, { ...edit, crop: fullCrop(turnedSize(bitmap, edit.rotation)) }, scale)
    const canvas = canvasRef.current
    canvas.width = preview.width
    canvas.height = preview.height
    canvas.getContext('2d').drawImage(preview, 0, 0)
  }, [bitmap, edit])

  // A turn or flip changes what the crop box covers, so it starts again from the whole photo.
  function change(next) {
    setEdit(next)
    setCrop(fullCrop(turnedSize(bitmap, next.rotation)))
  }
  // A mirrored photo turns the other way, so "right" still turns what's on screen to the right.
  const turn = (direction) => change({ ...edit, rotation: (edit.rotation + direction * (edit.flipped ? -90 : 90) + 360) % 360 })

  const edited = edit.rotation !== 0 || edit.flipped || crop?.width !== size?.width || crop?.height !== size?.height

  async function apply() {
    setStatus('saving')
    try {
      onApply(await canvasToJpeg(editPhoto(bitmap, { ...edit, crop })))
    } catch (error) {
      console.error('Photo edit failed', error)
      setStatus('failed')
    }
  }

  const busy = status !== 'ready'
  return (
    <ThemeProvider theme={cameraTheme}>
      <Dialog fullScreen open onClose={onClose} aria-labelledby={titleId} slotProps={{ paper: { sx: styles.paper } }}>
        <Box sx={styles.top}>
          <IconButton aria-label="Cancel editing" onClick={onClose} sx={styles.close}>
            <Close />
          </IconButton>
          <Typography component="h2" id={titleId} sx={styles.title}>Edit photo</Typography>
          <Button variant="contained" disabled={busy || !edited} onClick={apply} sx={styles.done}>
            {status === 'saving' ? 'Saving…' : 'Done'}
          </Button>
        </Box>

        <Box sx={styles.viewport}>
          {status === 'loading' && <CircularProgress aria-label="Opening photo" />}
          {status === 'failed' && <Typography role="alert">Couldn't edit this photo, so close and try again.</Typography>}
          <Box sx={styles.frame(size, status === 'failed')} {...(!busy && cropDrag)}>
            <Box component="canvas" ref={canvasRef} role="img" aria-label="Photo being edited" sx={styles.canvas} />
            {crop && size && (
              <Box
                aria-hidden
                sx={styles.crop}
                style={{ left: percent(crop.x, size.width), top: percent(crop.y, size.height), width: percent(crop.width, size.width), height: percent(crop.height, size.height) }}
              >
                {CORNERS.map(([vertical, horizontal]) => (
                  <Box key={`${vertical}-${horizontal}`} data-corner={`${vertical}-${horizontal}`} sx={styles.handle(vertical, horizontal)} />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={styles.controls}>
          <Box sx={styles.tools}>
            <Button disabled={busy} startIcon={<RotateLeft />} onClick={() => turn(-1)} sx={styles.tool}>Left</Button>
            <Button disabled={busy} startIcon={<RotateRight />} onClick={() => turn(1)} sx={styles.tool}>Right</Button>
            <Button disabled={busy} startIcon={<Flip />} aria-pressed={edit.flipped} onClick={() => change({ ...edit, flipped: !edit.flipped })} sx={styles.tool}>
              Flip
            </Button>
            <Button disabled={busy || !edited} startIcon={<RestartAlt />} onClick={() => change(NO_EDIT)} sx={styles.tool}>Reset</Button>
          </Box>
          <Typography sx={styles.hint}>Drag the corners to crop, or drag a new box.</Typography>
        </Box>
      </Dialog>
    </ThemeProvider>
  )
}
