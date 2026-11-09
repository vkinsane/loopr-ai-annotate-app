import { lazy, Suspense, useState } from 'react'
import { ZoomIn } from '@mui/icons-material'
import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog.jsx'
import QualityChecks from '../components/QualityChecks/QualityChecks.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import { usePhotoQuality } from '../hooks'
import { gradePhoto, qualityChecks } from '../utils'
import { styles } from './PreviewScreen.styles.js'

// Loaded on the first Zoom tap; most photos are never zoomed.
const ZoomViewer = lazy(() => import('../components/ZoomViewer/ZoomViewer.jsx'))
const SEVERITY = { good: 'success', warn: 'warning', poor: 'error' }
const MEASURE_FAILED = { grade: 'poor', title: "Couldn't read this photo", advice: 'Take the photo again to continue.' }

/** `photo` is { blob, url, method }. `onAnnotate` receives the measured quality { width, height, brightness, sharpness }. */
const TITLE = 'Preview & quality'

export default function PreviewScreen({ photo, boxCount, onRetake, onAnnotate }) {
  const [zooming, setZooming] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const quality = usePhotoQuality(photo)
  const measured = quality && !quality.failed ? quality : null
  const summary = quality?.failed ? MEASURE_FAILED : measured && gradePhoto({ bytes: photo.blob.size, ...measured }).summary
  const poor = summary?.grade === 'poor'

  // Drawn only once measured: the summary can be 1–4 lines, so showing it later would move the page.
  if (!quality) {
    return (
      <ScreenLayout title={TITLE} headerSx={styles.headerWidth}>
        <Box component="main" role="status" sx={styles.checking}>
          <CircularProgress />
          Checking photo quality…
        </Box>
      </ScreenLayout>
    )
  }

  const retake = (
    <Button variant={poor ? 'contained' : 'outlined'} size="large" onClick={() => (boxCount > 0 ? setConfirming(true) : onRetake())} sx={styles.action}>
      Retake
    </Button>
  )
  const annotate = (
    <Button variant={poor ? 'outlined' : 'contained'} size="large" onClick={() => onAnnotate(measured)} disabled={!measured} sx={styles.action}>
      Annotate
    </Button>
  )

  return (
    <ScreenLayout title={TITLE} headerSx={styles.headerWidth}>
      <Box component="main" sx={styles.root}>
        <ScrollThumb />
        <Box sx={styles.photoFrame(measured && measured.width / measured.height)}>
          <Box component="img" src={photo.url} alt="Captured photo" sx={styles.photo} />
          {measured && (
            <Button aria-label="Zoom photo" startIcon={<ZoomIn />} onClick={() => setZooming(true)} sx={styles.zoom}>
              Zoom
            </Button>
          )}
        </Box>

        <Box sx={styles.side}>
          <Alert severity={SEVERITY[summary.grade]} role={poor ? 'alert' : 'status'}>
            <AlertTitle>{summary.title}</AlertTitle>
            {summary.advice}
          </Alert>

          <QualityChecks checks={qualityChecks(photo.blob.size, measured)} />

          {/* The recommended action is always on the right, as the filled button. */}
          <Box sx={styles.actions}>
            {poor ? annotate : retake}
            {poor ? retake : annotate}
          </Box>
        </Box>

        <ConfirmDialog
          open={confirming}
          title="Discard this photo?"
          message="The boxes you drew on this photo will be lost."
          confirmLabel="Discard"
          onConfirm={onRetake}
          onCancel={() => setConfirming(false)}
        />

        {zooming && (
          <Suspense fallback={null}>
            <ZoomViewer photoUrl={photo.url} onClose={() => setZooming(false)} />
          </Suspense>
        )}
      </Box>
    </ScreenLayout>
  )
}
