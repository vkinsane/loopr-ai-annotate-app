import { useEffect, useState } from 'react'
import { IN_USE_ERROR, UNSUPPORTED_ERROR, toCameraError } from '../utils/cameraErrors.js'

// `ideal` asks for the best the device offers and never rejects, unlike `exact` or `min`.
// 4096×3072 is 4:3, the shape of most phone sensors, so the browser doesn't crop to 16:9.
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
  // mediaDevices is undefined on http:// pages and in old browsers.
  return window.isSecureContext && navigator.mediaDevices?.getUserMedia !== undefined
}

function initialState() {
  return canUseCamera() ? { status: 'starting' } : { status: 'error', error: UNSUPPORTED_ERROR }
}

function getVideoTrack(video) {
  return video.srcObject instanceof MediaStream ? (video.srcObject.getVideoTracks()[0] ?? null) : null
}

function stopTracks(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

/**
 * Streams the rear camera into `videoRef` while mounted and stops it on unmount.
 * `state` is one of { status: 'starting' }, { status: 'live', width, height, track }, { status: 'error', error }.
 */
export function useCamera(videoRef) {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  // `attempt` is a dependency so that retry() runs the effect again.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !canUseCamera()) return

    const request = new AbortController()

    // Fires for the first frame and again when the size changes, e.g. after rotating the device.
    const updateSize = () => {
      const track = getVideoTrack(video)
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
          stopTracks(stream)
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
      // Stopped tracks never fire 'ended', so its listener needs no removal.
      if (video.srcObject instanceof MediaStream) stopTracks(video.srcObject)
      video.srcObject = null
    }
  }, [videoRef, attempt])

  function retry() {
    setState({ status: 'starting' })
    setAttempt((count) => count + 1)
  }

  /** Resolves with { blob, url, width, height, method }. */
  function capture() {
    const video = videoRef.current
    if (!video || state.status !== 'live') return Promise.reject(new Error('Camera is not ready'))
    return takePhoto(video, state.track)
  }

  return { state, retry, capture }
}

/**
 * ImageCapture.takePhoto() can use the full sensor, above the video resolution (Chromium, Android).
 * Elsewhere, including iPhone Safari, a full-size video frame is the best available.
 */
async function takePhoto(video, track) {
  if ('ImageCapture' in window) {
    try {
      return await toPhoto(await new ImageCapture(track).takePhoto(), 'image-capture')
    } catch (error) {
      // Some desktop webcams reject takePhoto(); the video frame still works.
      console.warn('ImageCapture failed, using the video frame instead', error)
    }
  }
  return toPhoto(await grabVideoFrame(video), 'canvas')
}

function grabVideoFrame(video) {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Canvas 2D context is not available'))
  context.drawImage(video, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the photo'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

async function toPhoto(blob, method) {
  // Decoding gives the displayed size after EXIF rotation, which takePhoto() JPEGs can carry.
  const bitmap = await createImageBitmap(blob)
  const photo = { blob, url: URL.createObjectURL(blob), width: bitmap.width, height: bitmap.height, method }
  bitmap.close()
  return photo
}
