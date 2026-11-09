import { useEffect, useState } from 'react'
import { UNSUPPORTED_ERROR, canUseCamera, toCameraError } from '../utils'

/**
 * Asks for camera access before the camera screen opens.
 * `state` is one of { status: 'idle' }, { status: 'asking' }, { status: 'allowed' }, { status: 'error', error }.
 */
export function useCameraPermission() {
  const [state, setState] = useState(() =>
    canUseCamera() ? { status: 'idle' } : { status: 'error', error: UNSUPPORTED_ERROR },
  )

  // Skip the prompt when access was granted on an earlier visit. Firefox and older Safari reject the 'camera' query.
  useEffect(() => {
    if (!canUseCamera() || !navigator.permissions) return
    const lookup = new AbortController()
    navigator.permissions.query({ name: 'camera' }).then(
      (permission) => {
        if (!lookup.signal.aborted && permission.state === 'granted') setState({ status: 'allowed' })
      },
      (error) => console.warn('Camera permission state is not available', error),
    )
    return () => lookup.abort()
  }, [])

  async function request() {
    setState({ status: 'asking' })
    try {
      // Only the permission is needed here; the camera screen opens its own stream.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } })
      stream.getTracks().forEach((track) => track.stop())
      setState({ status: 'allowed' })
    } catch (error) {
      console.error('Camera permission request failed', error)
      setState({ status: 'error', error: toCameraError(error) })
    }
  }

  return { state, request }
}
