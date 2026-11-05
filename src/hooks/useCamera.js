import { useEffect, useState } from 'react'
import { IN_USE_ERROR, UNSUPPORTED_ERROR, toCameraError } from '../utils'

// `ideal` never rejects, unlike `exact` or `min`. 4:3 matches most phone sensors, so nothing is cropped to 16:9.
const CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 4096 },
    height: { ideal: 3072 },
  },
}

const JPEG_QUALITY = 0.92

function canUseCamera() {
  return window.isSecureContext && navigator.mediaDevices?.getUserMedia !== undefined
}

function isPageVisible() {
  return document.visibilityState === 'visible'
}

/**
 * Streams the rear camera into `videoRef` while mounted and the page is visible.
 * `state` is one of { status: 'starting' }, { status: 'live', width, height, track }, { status: 'error', error }.
 */
export function useCamera(videoRef) {
  const [state, setState] = useState(() =>
    canUseCamera() ? { status: 'starting' } : { status: 'error', error: UNSUPPORTED_ERROR },
  )
  const [attempt, setAttempt] = useState(0)
  const [visible, setVisible] = useState(isPageVisible)

  // Release the camera while the page is hidden (tab switch, app in background, screen locked).
  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(isPageVisible())
      setState((current) => (current.status === 'error' ? current : { status: 'starting' }))
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // `attempt` is a dependency so that retry() runs the effect again.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !visible || !canUseCamera()) return

    const request = new AbortController()

    const updateSize = () => {
      const track = video.srcObject instanceof MediaStream ? video.srcObject.getVideoTracks()[0] : undefined
      if (track) setState({ status: 'live', width: video.videoWidth, height: video.videoHeight, track })
    }
    // 'ended' fires only when the browser or OS stops the camera, never after our own stop().
    const handleEnded = () => setState({ status: 'error', error: IN_USE_ERROR })

    video.addEventListener('loadedmetadata', updateSize)
    video.addEventListener('resize', updateSize)

    navigator.mediaDevices.getUserMedia(CONSTRAINTS).then(
      (stream) => {
        // StrictMode, or leaving the screen quickly, can run cleanup before the request finishes.
        if (request.signal.aborted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        stream.getVideoTracks()[0]?.addEventListener('ended', handleEnded)
        video.srcObject = stream
      },
      (error) => {
        if (request.signal.aborted) return
        console.error('Camera failed to start', error)
        setState({ status: 'error', error: toCameraError(error) })
      },
    )

    return () => {
      request.abort()
      video.removeEventListener('loadedmetadata', updateSize)
      video.removeEventListener('resize', updateSize)
      if (video.srcObject instanceof MediaStream) video.srcObject.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [videoRef, attempt, visible])

  function retry() {
    setState({ status: 'starting' })
    setAttempt((count) => count + 1)
  }

  /** Resolves with { blob, url, method }. The frame freezes while saving and resumes if capture fails. */
  async function capture() {
    const video = videoRef.current
    if (!video || state.status !== 'live') throw new Error('Camera is not ready')
    video.pause()

    try {
      // ImageCapture can use the full sensor (Chromium, Android). Elsewhere, including iPhone,
      // a full-size video frame is the best available.
      if ('ImageCapture' in window) {
        try {
          return toPhoto(await new ImageCapture(state.track).takePhoto(), 'image-capture')
        } catch (error) {
          console.warn('ImageCapture failed, using the video frame instead', error)
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas 2D context is not available')
      context.drawImage(video, 0, 0)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('Could not encode the photo'))),
          'image/jpeg',
          JPEG_QUALITY,
        )
      })
      return toPhoto(blob, 'canvas')
    } catch (error) {
      video.play().catch((playError) => console.warn('Could not resume the preview', playError))
      throw error
    }
  }

  return { state, retry, capture }
}

// Width and height come later from the quality check, which decodes the photo anyway.
function toPhoto(blob, method) {
  return { blob, url: URL.createObjectURL(blob), method }
}
