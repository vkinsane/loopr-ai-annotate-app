import { LockOutlined, NoPhotographyOutlined, PhotoCameraOutlined, ReportProblemOutlined, VideocamOff } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { styles } from './CameraErrorScreen.styles.js'

const ICONS = {
  unsupported: { Icon: LockOutlined, color: 'error.light' },
  denied: { Icon: NoPhotographyOutlined, color: 'error.light' },
  'not-found': { Icon: VideocamOff, color: 'warning.light' },
  'in-use': { Icon: PhotoCameraOutlined, color: 'warning.light' },
  unknown: { Icon: ReportProblemOutlined, color: 'warning.light' },
}

export default function CameraErrorScreen({ error, onRetry }) {
  const { Icon, color } = ICONS[error.kind]

  return (
    <Box sx={styles.root}>
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
      {error.canRetry && (
        <Button variant="contained" size="large" fullWidth onClick={onRetry} sx={styles.retry}>
          Try again
        </Button>
      )}
    </Box>
  )
}
