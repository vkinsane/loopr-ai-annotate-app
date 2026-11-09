import { useRef, useState } from 'react'
import { EditOutlined, FileDownloadOutlined } from '@mui/icons-material'
import { Box, Button, IconButton, InputAdornment, Paper, TextField, Typography, useTheme } from '@mui/material'
import AnnotationList from '../components/AnnotationList/AnnotationList.jsx'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog.jsx'
import PhotoWithBoxes from '../components/PhotoWithBoxes/PhotoWithBoxes.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { exportAnnotatedPhoto, finishText, GRADE_LABELS, gradePhoto, TEXT_RULES, validateText } from '../utils'
import { styles } from './SummaryScreen.styles.js'

const DEFAULT_NAME = 'annotated-photo'
const NAME_RULE = TEXT_RULES.photoName
const REVOKE_URL_AFTER_MS = 1000

/** Read-only result: the annotated photo, a short summary, and a download of the photo with the boxes drawn on. */
export default function SummaryScreen({ photo, quality, items, photoName, onPhotoNameChange, onBack, onNewPhoto }) {
  const theme = useTheme()
  const [download, setDownload] = useState('idle') // 'idle' | 'working' | 'done' | 'failed'
  const [nameNote, setNameNote] = useState(null) // the message from validation: shown in place of the caption, so nothing moves
  const nameInput = useRef(null)
  const [confirming, setConfirming] = useState(false)
  const grade = gradePhoto({ bytes: photo.blob.size, ...quality }).grade

  function applyName({ value, message }) {
    onPhotoNameChange(value)
    setNameNote(message)
  }

  async function handleDownload() {
    setDownload('working')
    try {
      const { lime, ink } = theme.palette.brand
      const blob = await exportAnnotatedPhoto(photo.blob, items, { box: lime, outline: ink })
      const url = URL.createObjectURL(blob)
      const link = Object.assign(document.createElement('a'), { href: url, download: `${photoName.trim() || DEFAULT_NAME}.jpg` })
      link.click()
      // Some browsers start the download after click() returns, so the URL is freed a little later.
      window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_AFTER_MS)
      setDownload('done')
    } catch (error) {
      console.error('Photo download failed', error)
      setDownload('failed')
    }
  }

  return (
    <ScreenLayout title="Inspection summary" onBack={onBack} backLabel="Back to Annotate" headerSx={styles.headerWidth}>
      <Box component="main" sx={styles.root}>
        <ScrollThumb />
        <PhotoWithBoxes photoUrl={photo.url} size={quality} items={items} />

        <Box sx={styles.side}>
          <Box sx={styles.tiles}>
            <Paper variant="outlined" sx={styles.tile}>
              <Typography sx={styles.tileLabel}>Annotations</Typography>
              <Typography sx={styles.count}>{items.length}</Typography>
            </Paper>
            <Paper variant="outlined" sx={styles.tile}>
              <Typography sx={styles.tileLabel}>Photo quality</Typography>
              <Box sx={styles.grade}>
                <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill />
              </Box>
            </Paper>
          </Box>

          {items.length > 0 && <AnnotationList readOnly items={items} />}

          <Box sx={styles.actions}>
            <TextField
              label="Photo name"
              size="small"
              fullWidth
              value={photoName}
              placeholder={DEFAULT_NAME}
              inputRef={nameInput}
              onChange={(event) => applyName(validateText(event.target.value, NAME_RULE))}
              onBlur={() => applyName(finishText(photoName, NAME_RULE))}
              onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.querySelector('input')?.blur()}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { autoComplete: 'off', spellCheck: false, enterKeyHint: 'done' },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      .jpg
                      <IconButton
                        aria-label="Edit photo name"
                        edge="end"
                        onClick={() => {
                          nameInput.current.focus()
                          nameInput.current.select()
                        }}
                        sx={styles.editName}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<FileDownloadOutlined />}
              disabled={download === 'working'}
              onClick={handleDownload}
            >
              {download === 'working' ? 'Preparing photo…' : 'Download photo'}
            </Button>
            <Typography role={download === 'failed' ? 'alert' : undefined} aria-live="polite" sx={styles.caption(download === 'failed' || nameNote?.warn)}>
              {download === 'failed'
                ? "Couldn't make the photo, so try again."
                : (nameNote?.text ?? 'The photo includes the boxes and labels. Nothing is uploaded.')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => (items.length > 0 && download !== 'done' ? setConfirming(true) : onNewPhoto())}
            >
              Take new photo
            </Button>
          </Box>
        </Box>

        <ConfirmDialog
          open={confirming}
          title="Discard this photo?"
          message="You haven't downloaded it, so the photo and its boxes will be lost."
          confirmLabel="Discard"
          onConfirm={onNewPhoto}
          onCancel={() => setConfirming(false)}
        />
      </Box>
    </ScreenLayout>
  )
}
