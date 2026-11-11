import { useRef, useState } from 'react'
import { Exposure, FlashlightOff, FlashlightOn, StraightenOutlined } from '@mui/icons-material'
import { Box, Button, ButtonBase, CircularProgress, IconButton, ThemeProvider, Typography, useMediaQuery } from '@mui/material'
import BackButton from '../components/BackButton/BackButton.jsx'
import CameraMenu from '../components/CameraMenu/CameraMenu.jsx'
import ChoosePhotoButton from '../components/ChoosePhotoButton/ChoosePhotoButton.jsx'
import ExposureControl from '../components/ExposureControl/ExposureControl.jsx'
import LevelIndicator from '../components/LevelIndicator/LevelIndicator.jsx'
import LiveQualityChips from '../components/LiveQualityChips/LiveQualityChips.jsx'
import NotAvailable from '../components/NotAvailable/NotAvailable.jsx'
import { useCamera, useCameraList, useDeviceTilt, useExposure, useLiveQuality, useTorch } from '../hooks'
import { cameraTheme, CORNERS, TOUCH_QUERY } from '../theme.js'
import { getCaptureHint } from '../utils'
import CameraErrorScreen from './CameraErrorScreen.jsx'
import { styles } from './CaptureScreen.styles.js'

const DEFAULT_ASPECT_RATIO = 4 / 3

/** `onCapture` and `onPickPhoto` both receive { blob, url, method }. */
export default function CaptureScreen({ onBack, onCapture, onPickPhoto }) {
  const videoRef = useRef(null)
  const { state, retry, capture, selectCamera } = useCamera(videoRef)
  const [capturing, setCapturing] = useState(false)
  const [captureFailed, setCaptureFailed] = useState(false)
  const live = state.status === 'live'
  const torch = useTorch(live ? state.track : null)
  const exposure = useExposure(live ? state.track : null)
  const motion = useDeviceTilt(live)
  const cameras = useCameraList(live)
  const quality = useLiveQuality(videoRef, live && !capturing)
  // Computers rarely offer exposure and have no motion sensor. They say so, so every camera feature is visible.
  const computer = !useMediaQuery(TOUCH_QUERY, { noSsr: true })
  const noExposure = live && computer && !exposure.supported
  const noLevel = live && computer && !motion.tilt
  const rows = { exposure: exposure.supported || noExposure, level: noLevel }

  if (state.status === 'error') {
    return (
      <ThemeProvider theme={cameraTheme}>
        <CameraErrorScreen error={state.error} onBack={onBack} onRetry={retry} onPickPhoto={onPickPhoto} />
      </ThemeProvider>
    )
  }

  async function handleCapture() {
    setCapturing(true)
    setCaptureFailed(false)
    try {
      onCapture(await capture())
    } catch (error) {
      console.error('Capture failed', error)
      setCaptureFailed(true)
    } finally {
      setCapturing(false)
    }
  }

  const aspectRatio = live ? state.width / state.height : DEFAULT_ASPECT_RATIO
  const hint = captureFailed ? { text: "Couldn't take the photo, so try again.", warn: true }
    : exposure.failed ? { text: "The exposure didn't change, so try again.", warn: true }
      : getCaptureHint(quality, torch)

  return (
    <ThemeProvider theme={cameraTheme}>
      <Box component="main" sx={styles.root}>
        <Box sx={styles.main}>
          <Box sx={styles.topBar}>
            <BackButton disabled={capturing} onClick={onBack} sx={styles.back} />
            <LiveQualityChips
              resolution={live ? { width: state.width, height: state.height } : null}
              quality={quality}
            />
            <CameraMenu
              cameras={cameras}
              currentId={live ? state.track.getSettings().deviceId : null}
              disabled={capturing}
              onSelect={selectCamera}
            />
          </Box>
          <Box sx={styles.viewport}>
            <Box sx={styles.frame(aspectRatio, live)}>
              {/* playsInline and muted are required for inline autoplay on iOS Safari. */}
              <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera view" style={styles.video} />
              <Box aria-hidden sx={styles.gridLines} />
              {motion.tilt && <LevelIndicator tilt={motion.tilt} />}
              {/* iPhone gives the tilt only after a tap. The level then shows where this button was. */}
              {motion.needsTap && (
                <Button size="small" startIcon={<StraightenOutlined />} onClick={motion.requestPermission} sx={styles.levelButton}>
                  Show level
                </Button>
              )}
              {CORNERS.map(([vertical, horizontal]) => (
                <Box key={`${vertical}-${horizontal}`} aria-hidden sx={styles.guide(vertical, horizontal, Number(rows.exposure) + Number(rows.level))} />
              ))}
              {capturing && (
                <Box role="status" sx={styles.saving}>
                  <CircularProgress color="inherit" size={32} />
                  Saving photo…
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={styles.controls(rows)}>
          <Typography sx={styles.hint(hint.warn)}>{hint.text}</Typography>
          {exposure.supported && (
            <Box sx={styles.exposure}>
              <ExposureControl exposure={exposure} disabled={capturing} />
            </Box>
          )}
          {noExposure && <NotAvailable Icon={Exposure} label="Exposure not available" sx={styles.exposure} />}
          {noLevel && <NotAvailable Icon={StraightenOutlined} label="Level needs a motion sensor" sx={styles.level} />}
          {/* A photo from the device can be used even when the camera works. */}
          <Box sx={styles.gallery}>
            <ChoosePhotoButton asIcon disabled={capturing} onPick={onPickPhoto} sx={styles.round} />
          </Box>
          <ButtonBase
            aria-label="Take photo"
            disabled={!live || capturing}
            onClick={handleCapture}
            sx={styles.shutter}
          >
            <Box sx={styles.shutterFill} />
          </ButtonBase>
          {torch.supported ? (
            <IconButton
              aria-label="Torch"
              aria-pressed={torch.on}
              disabled={torch.pending || capturing}
              onClick={torch.toggle}
              sx={styles.torch(torch.on)}
            >
              {torch.on ? <FlashlightOn /> : <FlashlightOff />}
            </IconButton>
          ) : live && <NotAvailable Icon={FlashlightOff} label="Torch not available" sx={styles.torchSlot} />}
        </Box>

        {state.status === 'starting' && (
          <Box role="status" sx={styles.overlay}>
            <CircularProgress size={56} />
            <Typography component="h1" sx={styles.title}>Starting camera…</Typography>
            <Typography sx={styles.overlayText}>Opening the camera. Photos stay on this device.</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}
