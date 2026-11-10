import { useState } from 'react'
import { applyCameraSetting, clamp } from '../utils'

const EV_STEP = 1 / 3

/**
 * Exposure compensation in EV, where the camera offers it (mostly Android Chrome; iPhone Safari doesn't).
 * `value` is read from the track each render, like the torch, so it always shows the real setting.
 */
export function useExposure(track) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const range = track?.getCapabilities?.().exposureCompensation
  const supported = Boolean(range && range.max > range.min)
  const value = track?.getSettings().exposureCompensation ?? 0

  async function change(direction) {
    if (!supported || pending) return
    // A third of a stop per tap, snapped to the steps the camera takes.
    const step = Math.max(range.step || EV_STEP, EV_STEP)
    const next = clamp(Math.round((value + direction * step) / step) * step, range.min, range.max)
    setPending(true)
    setFailed(false)
    try {
      await applyCameraSetting(track, { exposureMode: 'continuous', exposureCompensation: next })
    } catch (error) {
      console.error('Exposure change failed', error)
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return { supported, value, atMin: supported && value <= range.min, atMax: supported && value >= range.max, pending, failed, change }
}
