import { useState } from 'react'
import { ZoomIn } from '@mui/icons-material'
import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from '@mui/material'
import QualityChecks from '../components/QualityChecks/QualityChecks.jsx'
import ZoomViewer from '../components/ZoomViewer/ZoomViewer.jsx'
import { usePhotoQuality } from '../hooks'
import { gradePhoto, qualityChecks } from '../utils'
import { styles } from './PreviewScreen.styles.js'

const SEVERITY = { good: 'success', warn: 'warning', poor: 'error' }
const MEASURE_FAILED = { grade: 'poor', title: "Couldn't read this photo", advice: 'Take the photo again to continue.' }

/** `photo` is { blob, url, method }. `onAnnotate` receives the measured quality { width, height, brightness, sharpness }. */
export default function PreviewScreen({ photo, onRetake, onAnnotate }) {
  const [zooming, setZooming] = useState(false)
  const quality = usePhotoQuality(photo)
  const measured = quality && !quality.failed ? quality : null
  const summary = quality?.failed ? MEASURE_FAILED : measured && gradePhoto({ bytes: photo.blob.size, ...measured }).summary
  const poor = summary?.grade === 'poor'

  const retake = (
    <Button variant={poor ? 'contained' : 'outlined'} size="large" onClick={onRetake} sx={styles.action}>
      Retake
    </Button>
  )
  const annotate = (
    <Button variant={poor ? 'outlined' : 'contained'} size="large" onClick={() => onAnnotate(measured)} disabled={!measured} sx={styles.action}>
      Annotate
    </Button>
  )

  return (
    <Box component="main" sx={styles.root}>
      <Typography component="h1" sx={styles.title}>Preview &amp; quality</Typography>

      <Box sx={styles.photoFrame}>
        <Box component="img" src={photo.url} alt="Captured photo" sx={styles.photo} />
        {measured && (
          <Button aria-label="Zoom photo" startIcon={<ZoomIn />} onClick={() => setZooming(true)} sx={styles.zoom}>
            Zoom
          </Button>
        )}
      </Box>

      {summary ? (
        <Alert severity={SEVERITY[summary.grade]} role={poor ? 'alert' : 'status'}>
          <AlertTitle>{summary.title}</AlertTitle>
          {summary.advice}
        </Alert>
      ) : (
        <Box role="status" sx={styles.checking}>
          <CircularProgress size={20} color="inherit" />
          Checking photo quality…
        </Box>
      )}

      <QualityChecks checks={qualityChecks(photo.blob.size, measured)} />

      {/* The recommended action is always on the right, as the filled button. */}
      <Box sx={styles.actions}>
        {poor ? annotate : retake}
        {poor ? retake : annotate}
      </Box>

      {zooming && <ZoomViewer photoUrl={photo.url} size={measured} onClose={() => setZooming(false)} />}
    </Box>
  )
}
