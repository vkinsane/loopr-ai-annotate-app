import { useEffect, useState } from 'react'
import { ANALYSIS_WIDTH, measureImage, readGreyImage } from '../utils'

const SAMPLE_INTERVAL_MS = 250

/** Returns { brightness, sharpness } while `active`, otherwise null. */
export function useLiveQuality(videoRef, active) {
  const [quality, setQuality] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!active || !video) return

    const canvas = document.createElement('canvas')
    const timer = window.setInterval(() => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
      setQuality(measureImage(readGreyImage(canvas, video, video.videoWidth, video.videoHeight, ANALYSIS_WIDTH)))
    }, SAMPLE_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [videoRef, active])

  return active ? quality : null
}
