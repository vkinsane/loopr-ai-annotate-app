import { useEffect, useState } from 'react'
import { readGreyImage } from '../utils/image.js'
import { laplacianVariance, meanBrightness } from '../utils/quality.js'

// 4 samples a second on a 160 px frame: responsive enough to guide the operator, about 20k pixels per sample.
const SAMPLE_INTERVAL_MS = 250
const SAMPLE_WIDTH = 160

/** Returns { brightness, sharpness } of the live video while `active`, otherwise null. */
export function useLiveQuality(videoRef, active) {
  const [quality, setQuality] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!active || !video) return

    const canvas = document.createElement('canvas')
    const timer = window.setInterval(() => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
      const image = readGreyImage(canvas, video, video.videoWidth, video.videoHeight, SAMPLE_WIDTH)
      setQuality({
        brightness: Math.round(meanBrightness(image.pixels)),
        sharpness: Math.round(laplacianVariance(image)),
      })
    }, SAMPLE_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [videoRef, active])

  return active ? quality : null
}
