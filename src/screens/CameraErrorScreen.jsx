import LockOutlined from '@mui/icons-material/LockOutlined'
import NoPhotographyOutlined from '@mui/icons-material/NoPhotographyOutlined'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined'
import VideocamOff from '@mui/icons-material/VideocamOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Red when only the user or IT can fix it, amber when trying again may help.
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
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box
        role="alert"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
          maxWidth: 420,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon sx={{ fontSize: 32, color }} />
        </Box>
        <Typography component="h1" sx={{ fontSize: 22, fontWeight: 600 }}>
          {error.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 300 }}>{error.message}</Typography>
        {error.steps && (
          <Box
            component="ol"
            sx={{
              m: 0,
              mt: 1,
              py: 2,
              pr: 2,
              pl: 4.5,
              width: '100%',
              textAlign: 'left',
              fontSize: 14,
              lineHeight: '22px',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {error.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </Box>
        )}
      </Box>
      {error.canRetry && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onRetry}
          sx={{ height: 52, maxWidth: 420, mx: 'auto', mb: 1 }}
        >
          Try again
        </Button>
      )}
    </Box>
  )
}
