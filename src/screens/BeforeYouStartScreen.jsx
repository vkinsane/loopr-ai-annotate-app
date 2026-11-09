import { Check, CheckCircleOutlined, CropFree, PanToolOutlined, PhotoCameraOutlined, WbSunnyOutlined } from '@mui/icons-material'
import { Alert, AlertTitle, Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import ChoosePhotoButton from '../components/ChoosePhotoButton/ChoosePhotoButton.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import { useCameraPermission } from '../hooks'
import { VISUALLY_HIDDEN } from '../theme.js'
import { styles } from './BeforeYouStartScreen.styles.js'

const LATER_STEPS = [
  {
    title: 'Capture & check',
    text: 'You get tips while you aim. After you take the photo, the app checks its resolution, file size, brightness and sharpness.',
  },
  {
    title: 'Annotate the photo',
    text: 'Drag on the photo to draw a box, then give it a name. Drag a box to move it, or a corner to resize it.',
  },
]

const TIPS = [
  { Icon: WbSunnyOutlined, label: 'Good light' },
  { Icon: PanToolOutlined, label: 'Hold steady' },
  { Icon: CropFree, label: 'Fill the frame' },
]

/** Explains the flow and asks for the camera here, so the camera screen opens without a prompt. */
export default function BeforeYouStartScreen({ onBack, onStart, onPickPhoto }) {
  const { state, request } = useCameraPermission()
  const allowed = state.status === 'allowed'

  const noCamera = (
    <Typography sx={styles.helperText}>
      No camera? <ChoosePhotoButton asLink onPick={onPickPhoto} />
    </Typography>
  )

  return (
    <ScreenLayout title="Before you start" onBack={onBack} headerSx={styles.headerWidth}>
      <Box sx={styles.root}>
        <ScrollThumb />
        <Box component="ol" sx={styles.steps}>
          <Paper component="li" variant="outlined" sx={styles.step}>
            <StepHeading number={1} done={allowed} title="Allow the camera" text="Used only to take inspection photos. Photos stay on this device." />

            <Box aria-live="polite" sx={styles.permission}>
              {state.status === 'idle' && (
                <>
                  <Button variant="contained" size="large" startIcon={<PhotoCameraOutlined />} onClick={request}>
                    Allow camera permissions
                  </Button>
                  {noCamera}
                </>
              )}
              {state.status === 'asking' && (
                <>
                  <Button variant="outlined" size="large" disabled startIcon={<CircularProgress size={18} color="inherit" />}>
                    Waiting for your answer…
                  </Button>
                  <Typography sx={styles.helperText}>
                    Choose <strong>Allow</strong> in the pop-up.
                  </Typography>
                </>
              )}
              {allowed && (
                <>
                  <Box sx={styles.allowed}>
                    <CheckCircleOutlined fontSize="small" />
                    Camera allowed
                  </Box>
                  <Typography sx={styles.helperText}>You are ready. Tap Open camera.</Typography>
                </>
              )}
              {state.status === 'error' && (
                <>
                  <Alert severity="error">
                    <AlertTitle>{state.error.title}</AlertTitle>
                    {state.error.steps ? (
                      <Box component="ol" sx={styles.errorSteps}>
                        {state.error.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </Box>
                    ) : (
                      state.error.message
                    )}
                  </Alert>
                  {state.error.canRetry ? (
                    <>
                      <Button variant="contained" size="large" onClick={request}>
                        Try again
                      </Button>
                      {noCamera}
                    </>
                  ) : (
                    <ChoosePhotoButton variant="contained" onPick={onPickPhoto} />
                  )}
                </>
              )}
            </Box>
          </Paper>

          {LATER_STEPS.map(({ title, text }, index) => (
            <Paper component="li" variant="outlined" key={title} sx={styles.laterStep(state.status === 'error')}>
              <StepHeading number={index + 2} title={title} text={text} />
            </Paper>
          ))}
        </Box>

        <Box sx={styles.bottom}>
          {/* On small screens the blocked-camera help needs the room, so steps 2–3 and the tips step aside while it shows. */}
          <Box component="section" aria-labelledby="tips-title" sx={styles.tips(state.status === 'error')}>
            <Typography id="tips-title" component="h2" sx={styles.tipsTitle}>
              For a good photo
            </Typography>
            <Box component="ul" sx={styles.tipList}>
              {TIPS.map(({ Icon, label }) => (
                <Box component="li" key={label} sx={styles.tip}>
                  <Icon sx={styles.tipIcon} />
                  {label}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={styles.footer}>
            <Typography sx={styles.footerHint}>{allowed ? 'Your camera is ready.' : 'Allow the camera to continue.'}</Typography>
            <Button variant="contained" size="large" fullWidth disabled={!allowed} onClick={onStart}>
              Open camera
            </Button>
          </Box>
        </Box>
      </Box>
    </ScreenLayout>
  )
}

function StepHeading({ number, done = false, title, text }) {
  return (
    <Box sx={styles.stepHeading}>
      <Box component="span" sx={styles.stepNumber(done)}>
        {done ? <Check fontSize="small" /> : number}
        {done && <Box component="span" sx={VISUALLY_HIDDEN}>Step {number} done</Box>}
      </Box>
      <Box>
        <Typography component="h2" sx={styles.stepTitle}>{title}</Typography>
        <Typography sx={styles.stepText}>{text}</Typography>
      </Box>
    </Box>
  )
}
