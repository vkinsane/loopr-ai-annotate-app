import { useState } from 'react'
import { ChevronLeft, FileDownloadOutlined } from '@mui/icons-material'
import { Box, Button, IconButton, Paper, Typography, useTheme } from '@mui/material'
import PhotoWithBoxes from '../components/PhotoWithBoxes/PhotoWithBoxes.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { useConfirmTap } from '../hooks'
import { exportAnnotatedPhoto, gradePhoto } from '../utils'
import { styles } from './SummaryScreen.styles.js'

const GRADE_LABELS = { good: 'Good', warn: 'Warning', poor: 'Poor' }
const DOWNLOAD_NAME = 'annotated-photo.jpg'

/** Read-only result: the annotated photo, a short summary, and a download of the photo with the boxes drawn on. */
export default function SummaryScreen({ photo, quality, items, onBack, onNewPhoto }) {
  const theme = useTheme()
  const [download, setDownload] = useState('idle') // 'idle' | 'working' | 'done' | 'failed'
  const { confirming, confirm } = useConfirmTap()
  const grade = gradePhoto({ bytes: photo.blob.size, ...quality }).summary.grade

  async function handleDownload() {
    setDownload('working')
    try {
      const { lime, ink } = theme.palette.brand
      const blob = await exportAnnotatedPhoto(photo.blob, items, { box: lime, outline: ink })
      const url = URL.createObjectURL(blob)
      const link = Object.assign(document.createElement('a'), { href: url, download: DOWNLOAD_NAME })
      link.click()
      // Some browsers start the download after click() returns, so the URL is freed a little later.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownload('done')
    } catch (error) {
      console.error('Photo download failed', error)
      setDownload('failed')
    }
  }

  return (
    <Box component="main" sx={styles.root}>
      <Box sx={styles.header}>
        <IconButton aria-label="Back to Annotate" onClick={onBack} sx={styles.back}>
          <ChevronLeft />
        </IconButton>
        <Typography component="h1" sx={styles.title}>Inspection summary</Typography>
      </Box>

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

        {items.length > 0 && (
          <Paper variant="outlined" component="ul" aria-label="Annotations" sx={styles.list}>
            {items.map((item) => (
              <Box component="li" key={item.id} sx={styles.row}>
                <Box component="span" sx={styles.name}>
                  <Box component="span" aria-hidden sx={styles.swatch} />
                  <Box component="span" title={item.label || 'Untitled'} sx={styles.nameText}>{item.label || 'Untitled'}</Box>
                </Box>
                <Typography sx={styles.size}>{Math.round(item.width)} × {Math.round(item.height)} px</Typography>
              </Box>
            ))}
          </Paper>
        )}

        <Box sx={styles.actions}>
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
          <Typography role={download === 'failed' ? 'alert' : undefined} sx={styles.caption(download === 'failed')}>
            {download === 'failed'
              ? "Couldn't make the photo. Try again."
              : 'The photo includes the boxes and labels. Nothing is uploaded.'}
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            color={confirming ? 'error' : 'primary'}
            onClick={() => confirm(onNewPhoto, items.length > 0 && download !== 'done')}
          >
            {confirming ? 'Discard this photo?' : 'Take new photo'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
