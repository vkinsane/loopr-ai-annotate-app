import { useState } from 'react'

// `on` is read from the track each render, not stored, so it always shows the real hardware state.
export function useTorch(track) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const supported = Boolean(track?.getCapabilities?.().torch)
  const on = Boolean(track?.getSettings().torch)

  async function toggle() {
    if (!track || pending) return
    setPending(true)
    setFailed(false)
    try {
      // applyConstraints replaces all constraints, so pass the current ones (resolution, camera) back.
      await track.applyConstraints({ ...track.getConstraints(), advanced: [{ torch: !on }] })
    } catch (error) {
      console.error('Torch change failed', error)
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return { supported, on, pending, failed, toggle }
}
