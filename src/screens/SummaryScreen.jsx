import { useRef, useState } from 'react'
import { Check, EditOutlined, FileDownloadOutlined } from '@mui/icons-material'
import { Box, Button, IconButton, InputAdornment, Paper, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import AnnotationList from '../components/AnnotationList/AnnotationList.jsx'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog.jsx'
import DetailsOverlay from '../components/DetailsOverlay/DetailsOverlay.jsx'
import PhotoWithBoxes from '../components/PhotoWithBoxes/PhotoWithBoxes.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { DEFAULT_PHOTO_NAME, downloadAnnotatedPhoto, finishText, GRADE_LABELS, gradePhoto, plural, TEXT_RULES, validateText } from '../utils'
import { COMPACT_QUERY } from '../theme.js'
import { styles } from './SummaryScreen.styles.js'

const NAME_RULE = TEXT_RULES.photoName

/** Read-only result: the annotated photo, a short summary, and a download of the photo with the boxes drawn on. */
export default function SummaryScreen({ photo, quality, items, photoName, onPhotoNameChange, onBack, onNewPhoto }) {
  const theme = useTheme()
  const [download, setDownload] = useState('idle') // 'idle' | 'working' | 'done' | 'failed'
  const [nameNote, setNameNote] = useState(null) // the message from validation: shown in place of the caption, so nothing moves
  const nameInput = useRef(null)
  const [editingName, setEditingName] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const compact = useMediaQuery(COMPACT_QUERY, { noSsr: true })
  const grade = gradePhoto({ bytes: photo.blob.size, ...quality }).grade

  function applyName({ value, message }) {
    onPhotoNameChange(value)
    setNameNote(message)
  }

  async function handleDownload() {
    setDownload('working')
    try {
      const { lime, ink } = theme.palette.brand
      await downloadAnnotatedPhoto(photo.blob, items, { box: lime, outline: ink }, photoName)
      setDownload('done')
    } catch (error) {
      console.error('Photo download failed', error)
      setDownload('failed')
      setDetailsOpen(true) // the message is on the panel
    }
  }

  const nameField = (
    <TextField
      label="Photo name"
      size="small"
      sx={styles.nameField}
      fullWidth
      value={photoName}
      placeholder={DEFAULT_PHOTO_NAME}
      inputRef={nameInput}
      onChange={(event) => applyName(validateText(event.target.value, NAME_RULE))}
      onFocus={() => setEditingName(true)}
      onBlur={() => {
        setEditingName(false)
        applyName(finishText(photoName, NAME_RULE))
      }}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.querySelector('input')?.blur()}
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { autoComplete: 'off', spellCheck: false, enterKeyHint: 'done' },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              .jpg
              {/* While typing, the pencil becomes a check that finishes. mousedown keeps the focus, so the tap reaches it. */}
              <IconButton
                aria-label={editingName ? 'Finish editing photo name' : 'Edit photo name'}
                edge="end"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (editingName) return nameInput.current.blur()
                  nameInput.current.focus()
                  nameInput.current.select()
                }}
                sx={styles.editName}
              >
                {editingName ? <Check fontSize="small" /> : <EditOutlined fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
  const downloadButton = (
    <Button variant="outlined" size="large" fullWidth startIcon={<FileDownloadOutlined />} disabled={download === 'working'} onClick={handleDownload}>
      {download === 'working' ? 'Preparing photo…' : compact ? 'Download' : 'Download photo'}
    </Button>
  )
  const caption = (
    <Typography role={download === 'failed' ? 'alert' : undefined} aria-live="polite" sx={styles.caption(download === 'failed' || nameNote?.warn)}>
      {download === 'failed'
        ? "Couldn't make the photo, so try again."
        : (nameNote?.text ?? 'The photo includes the boxes and labels. Nothing is uploaded.')}
    </Typography>
  )
  const newPhotoButton = (
    <Button variant="contained" size="large" fullWidth onClick={() => (items.length > 0 && download !== 'done' ? setConfirming(true) : onNewPhoto())}>
      {compact ? 'New photo' : 'Take new photo'}
    </Button>
  )

  return (
    <ScreenLayout title="Inspection summary" onBack={onBack} backLabel="Back to Annotate" headerSx={styles.headerWidth}>
      <Box component="main" sx={styles.root}>
        <ScrollThumb />
        {/* Phones: the photo fills the screen, and the details and buttons sit over it. */}
        <Box sx={styles.photoArea}>
          <PhotoWithBoxes photoUrl={photo.url} size={quality} items={items} />
          {compact && (
            <DetailsOverlay
              title={<>{plural(items.length, 'annotation')} <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill /></>}
              open={detailsOpen}
              onToggle={() => setDetailsOpen(!detailsOpen)}
              actions={<>{downloadButton}{newPhotoButton}</>}
            >
              {nameField}
              {caption}
              {items.length > 0 && <AnnotationList readOnly items={items} />}
            </DetailsOverlay>
          )}
        </Box>

        {!compact && (
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
              {nameField}
              {downloadButton}
              {caption}
              {newPhotoButton}
            </Box>
          </Box>
        )}

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
