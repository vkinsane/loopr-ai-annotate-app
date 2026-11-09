import { LockOutlined, NoPhotographyOutlined, PhotoCameraOutlined, ReportProblemOutlined, VideocamOff } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import BackButton from '../components/BackButton/BackButton.jsx'
import ChoosePhotoButton from '../components/ChoosePhotoButton/ChoosePhotoButton.jsx'
import { styles } from './CameraErrorScreen.styles.js'

const ICONS = {
  unsupported: { Icon: LockOutlined, color: 'error.light' },
  denied: { Icon: NoPhotographyOutlined, color: 'error.light' },
  'not-found': { Icon: VideocamOff, color: 'warning.light' },
  'in-use': { Icon: PhotoCameraOutlined, color: 'warning.light' },
  unknown: { Icon: ReportProblemOutlined, color: 'warning.light' },
}

/** When the camera can't be retried, choosing a photo becomes the main action. */
export default function CameraErrorScreen({ error, onBack, onRetry, onPickPhoto }) {
  const { Icon, color } = ICONS[error.kind]

  return (
    <Box sx={styles.root}>
      <BackButton onClick={onBack} sx={styles.back} />
      <Box role="alert" sx={styles.content}>
        <Box sx={styles.iconCircle}>
          <Icon sx={styles.icon(color)} />
        </Box>
        <Typography component="h1" sx={styles.title}>
          {error.title}
        </Typography>
        <Typography sx={styles.message}>{error.message}</Typography>
        {error.steps && (
          <Box component="ol" sx={styles.steps}>
            {error.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </Box>
        )}
      </Box>
      <Box sx={styles.actions}>
        {error.canRetry && (
          <Button variant="contained" size="large" fullWidth onClick={onRetry}>
            Try again
          </Button>
        )}
        <ChoosePhotoButton onPick={onPickPhoto} variant={error.canRetry ? 'outlined' : 'contained'} />
      </Box>
    </Box>
  )
}
