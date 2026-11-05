import { useEffect, useState, type RefObject } from 'react'
import type { CameraError } from '../types.ts'
import { IN_USE_ERROR, UNSUPPORTED_ERROR, toCameraError } from '../utils/cameraErrors.ts'

export type CameraState =
  | { status: 'starting' }
  | { status: 'live'; width: number; height: number }
  | { status: 'error'; error: CameraError }

// `ideal` asks for the best the device offers and never rejects, unlike `exact` or `min`.
// 4096×3072 is 4:3, the shape of most phone sensors, so the browser doesn't crop to 16:9.
const CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 4096 },
    height: { ideal: 3072 },
  },
}

function canUseCamera(): boolean {
  // mediaDevices is undefined on http:// pages and in old browsers.
  return window.isSecureContext && navigator.mediaDevices?.getUserMedia !== undefined
}

function initialState(): CameraState {
  return canUseCamera() ? { status: 'starting' } : { status: 'error', error: UNSUPPORTED_ERROR }
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

/** Streams the rear camera into `videoRef` while mounted and stops it on unmount. */
export function useCamera(videoRef: RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<CameraState>(initialState)
  const [attempt, setAttempt] = useState(0)

  // `attempt` is a dependency so that retry() runs the effect again.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !canUseCamera()) return

    const request = new AbortController()

    // Fires for the first frame and again when the size changes, e.g. after rotating the device.
    const updateSize = () =>
      setState({ status: 'live', width: video.videoWidth, height: video.videoHeight })
    // 'ended' fires only when the browser or OS stops the camera, never after our own stop().
    const handleEnded = () => setState({ status: 'error', error: IN_USE_ERROR })

    video.addEventListener('loadedmetadata', updateSize)
    video.addEventListener('resize', updateSize)

    navigator.mediaDevices.getUserMedia(CONSTRAINTS).then(
      (stream) => {
        // StrictMode, or leaving the screen quickly, can run cleanup before the request finishes.
        if (request.signal.aborted) {
          stopTracks(stream)
          return
        }
        stream.getVideoTracks()[0]?.addEventListener('ended', handleEnded)
        video.srcObject = stream
      },
      (error: unknown) => {
        if (request.signal.aborted) return
        console.error('Camera failed to start', error)
        setState({ status: 'error', error: toCameraError(error) })
      },
    )

    return () => {
      request.abort()
      video.removeEventListener('loadedmetadata', updateSize)
      video.removeEventListener('resize', updateSize)
      // Stopped tracks never fire 'ended', so its listener needs no removal.
      if (video.srcObject instanceof MediaStream) stopTracks(video.srcObject)
      video.srcObject = null
    }
  }, [videoRef, attempt])

  function retry() {
    setState({ status: 'starting' })
    setAttempt((count) => count + 1)
  }

  return { state, retry }
}
