import { lazy, Suspense, useState } from 'react'
import { CropRotate, OpenInFull } from '@mui/icons-material'
import { Alert, AlertTitle, Box, Button, Typography, useMediaQuery } from '@mui/material'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog.jsx'
import DetailsOverlay from '../components/DetailsOverlay/DetailsOverlay.jsx'
import QualityChecks from '../components/QualityChecks/QualityChecks.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScreenLoader from '../components/ScreenLoader/ScreenLoader.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { GRADE_COLORS, gradePhoto, qualityChecks } from '../utils'
import { COMPACT_QUERY, SHORT_QUERY } from '../theme.js'
import { styles } from './PreviewScreen.styles.js'

// Loaded on the first tap; most photos are never opened full screen or edited.
const ZoomViewer = lazy(() => import('../components/ZoomViewer/ZoomViewer.jsx'))
const PhotoEditor = lazy(() => import('../components/PhotoEditor/PhotoEditor.jsx'))
const MEASURE_FAILED = { grade: 'poor', title: "Couldn't read this photo", advice: 'Take the photo again to continue.' }
const TITLE = 'Preview & quality'

/** `photo` is { blob, url, method }; `quality` is what usePhotoQuality returns for it. `onEdit` gets the edited photo's blob. */
export default function PreviewScreen({ photo, quality, boxCount, onRetake, onAnnotate, onEdit }) {
  const [zooming, setZooming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(null) // 'retake' | 'edit' (both lose the boxes) | 'quality'
  // Phones show the result over the photo, so the photo can fill the screen.
  const compact = useMediaQuery(COMPACT_QUERY, { noSsr: true })
  // On short screens, such as a phone held sideways, the open panel would cover the photo, so it starts closed.
  const short = useMediaQuery(SHORT_QUERY, { noSsr: true })
  const [detailsOpen, setDetailsOpen] = useState(!short)
  const measured = quality && !quality.failed ? quality : null
  const summary = quality?.failed ? MEASURE_FAILED : measured && gradePhoto({ bytes: photo.blob.size, ...measured })
  const poor = summary?.grade === 'poor'

  // Drawn only once measured: the summary can be 1–4 lines, so showing it later would move the page.
  if (!quality) {
    return (
      <ScreenLayout title={TITLE} headerSx={styles.headerWidth}>
        <ScreenLoader label="Checking photo quality…" />
      </ScreenLayout>
    )
  }

  const checks = qualityChecks(photo.blob.size, measured)
  const retakeOrAsk = () => (boxCount > 0 ? setConfirming('retake') : onRetake())
  const retake = (
    <Button variant={poor ? 'contained' : 'outlined'} size="large" onClick={retakeOrAsk} sx={styles.action}>
      Retake
    </Button>
  )
  const annotate = (
    <Button variant={poor ? 'outlined' : 'contained'} size="large" onClick={() => (summary.grade === 'good' ? onAnnotate() : setConfirming('quality'))} disabled={!measured} sx={styles.action}>
      Annotate
    </Button>
  )

  // The recommended action is always on the right, as the filled button.
  const actions = (
    <>
      {poor ? annotate : retake}
      {poor ? retake : annotate}
    </>
  )

  return (
    <ScreenLayout title={TITLE} headerSx={styles.headerWidth}>
      <Box component="main" sx={styles.root}>
        <ScrollThumb />
        <Box sx={styles.photoFrame(measured && measured.width / measured.height)}>
          <Box component="img" src={photo.url} alt="Captured photo" sx={styles.photo} />
          {measured && (
            <Box sx={styles.photoTools}>
              <Button startIcon={<CropRotate />} onClick={() => (boxCount > 0 ? setConfirming('edit') : setEditing(true))} sx={styles.photoTool}>
                Edit
              </Button>
              <Button aria-label="Open photo full screen" startIcon={<OpenInFull />} onClick={() => setZooming(true)} sx={styles.photoTool}>
                Full screen
              </Button>
            </Box>
          )}
          {compact && (
            <DetailsOverlay
              title={<StatusBadge grade={summary.grade} label={summary.title} pill />}
              open={detailsOpen}
              onToggle={() => setDetailsOpen(!detailsOpen)}
              actions={actions}
            >
              <Typography role={poor ? 'alert' : 'status'} sx={styles.advice}>{summary.advice}</Typography>
              <QualityChecks checks={checks} compact />
            </DetailsOverlay>
          )}
        </Box>

        {!compact && (
          <Box sx={styles.side}>
            <Alert severity={GRADE_COLORS[summary.grade]} role={poor ? 'alert' : 'status'}>
              <AlertTitle>{summary.title}</AlertTitle>
              {summary.advice}
            </Alert>
            <QualityChecks checks={checks} />
            <Box sx={styles.actions}>{actions}</Box>
          </Box>
        )}

        <ConfirmDialog
          open={confirming === 'retake'}
          title="Discard this photo?"
          message="The boxes you drew on this photo will be lost."
          confirmLabel="Discard"
          onConfirm={onRetake}
          onCancel={() => setConfirming(null)}
        />
        <ConfirmDialog
          open={confirming === 'quality'}
          title="Annotate this photo?"
          message={`${summary.title}. ${summary.advice} Boxes on a weak photo can be harder to place.`}
          confirmLabel="Annotate anyway"
          confirmColor="primary"
          secondary={{ label: 'Retake', onClick: retakeOrAsk }}
          onConfirm={onAnnotate}
          onCancel={() => setConfirming(null)}
        />
        {/* Boxes are stored in photo pixels, so after a crop or turn they would sit in the wrong place. */}
        <ConfirmDialog
          open={confirming === 'edit'}
          title="Edit this photo?"
          message="The boxes you drew will be removed, because they won't match the edited photo."
          confirmLabel="Edit photo"
          onConfirm={() => {
            setConfirming(null)
            setEditing(true)
          }}
          onCancel={() => setConfirming(null)}
        />

        {zooming && (
          <Suspense fallback={null}>
            <ZoomViewer photoUrl={photo.url} onClose={() => setZooming(false)} />
          </Suspense>
        )}
        {editing && (
          <Suspense fallback={null}>
            <PhotoEditor
              blob={photo.blob}
              onClose={() => setEditing(false)}
              onApply={(blob) => {
                setEditing(false)
                onEdit(blob)
              }}
            />
          </Suspense>
        )}
      </Box>
    </ScreenLayout>
  )
}
