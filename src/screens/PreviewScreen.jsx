import { Alert, AlertTitle, Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import StatusBadge from '../components/StatusBadge.jsx'
import { usePhotoQuality } from '../hooks'
import { gradeFileSize, gradePhoto, gradeResolution, megapixels } from '../utils'
import { styles } from './PreviewScreen.styles.js'

const BYTES_PER_KB = 1024
const SEVERITY = { good: 'success', warn: 'warning', poor: 'error' }
const GRADE_LABELS = { good: 'Good', warn: 'Warning', poor: 'Poor' }
const MEASURE_FAILED = {
  grade: 'warn',
  title: "Couldn't check brightness and sharpness",
  advice: 'Check the photo yourself before marking defects.',
}

/** `photo` is { blob, url, width, height }. Annotate is disabled until `onAnnotate` is provided. */
export default function PreviewScreen({ photo, onRetake, onAnnotate }) {
  const quality = usePhotoQuality(photo)
  const { width, height, blob } = photo
  const measured = quality && !quality.failed
  const report = measured ? gradePhoto({ width, height, bytes: blob.size, ...quality }) : null
  const summary = quality?.failed ? MEASURE_FAILED : report?.summary
  const kb = blob.size / BYTES_PER_KB

  const checks = [
    { label: 'Resolution', value: `${width} × ${height} · ${megapixels(width, height).toFixed(1)} MP`, grade: gradeResolution(width, height) },
    { label: 'File size', value: kb < BYTES_PER_KB ? `${Math.round(kb)} KB` : `${(kb / BYTES_PER_KB).toFixed(1)} MB`, grade: gradeFileSize(blob.size) },
    { label: 'Brightness', value: measured ? `${quality.brightness} / 255` : '–', grade: report?.grades.brightness },
    { label: 'Sharpness', value: measured ? String(quality.sharpness) : '–', grade: report?.grades.sharpness },
  ]
  const poor = summary?.grade === 'poor'

  const retake = (
    <Button variant={poor ? 'contained' : 'outlined'} onClick={onRetake} sx={styles.action}>
      Retake
    </Button>
  )
  const annotate = (
    <Button variant={poor ? 'outlined' : 'contained'} onClick={onAnnotate} disabled={!onAnnotate} sx={styles.action}>
      {poor ? 'Annotate anyway' : 'Annotate'}
    </Button>
  )

  return (
    <Box component="main" sx={styles.root}>
      <Box sx={styles.header}>
        <Typography component="h1" sx={styles.title}>Preview &amp; quality</Typography>
        <Typography sx={styles.step}>Step 2 of 3</Typography>
      </Box>

      <Box sx={styles.photoFrame}>
        <Box component="img" src={photo.url} alt="Captured photo of the door panel" sx={styles.photo} />
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

      <Paper variant="outlined" component="ul" aria-label="Quality checks" sx={styles.checks}>
        {checks.map(({ label, value, grade }) => (
          <Box component="li" key={label} sx={styles.check}>
            <div>
              <Typography sx={styles.checkLabel}>{label}</Typography>
              <Typography sx={styles.checkValue}>{value}</Typography>
            </div>
            {grade && <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill />}
          </Box>
        ))}
      </Paper>

      {/* The recommended action is always on the right, as the filled button. */}
      <Box sx={styles.actions}>
        {poor ? annotate : retake}
        {poor ? retake : annotate}
      </Box>
    </Box>
  )
}
