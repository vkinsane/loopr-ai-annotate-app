import { useState } from 'react'

/**
 * Torch control for a camera track. `on` is read from the track on every render rather than
 * stored, so it shows what the hardware reports, e.g. after a phone turns the torch off during capture.
 */
export function useTorch(track) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  // getCapabilities() is missing in some older browsers.
  const supported = Boolean(track?.getCapabilities?.().torch)
  const on = Boolean(track?.getSettings().torch)

  async function toggle() {
    if (!track || pending) return
    setPending(true)
    setFailed(false)
    try {
      // applyConstraints replaces all constraints, so keep the current ones (resolution, camera).
      await track.applyConstraints({ ...track.getConstraints(), advanced: [{ torch: !on }] })
    } catch (error) {
      console.error('Torch change failed', error)
      setFailed(true)
    } finally {
      setPending(false) // re-render reads the new state from getSettings()
    }
  }

  return { supported, on, pending, failed, toggle }
}
