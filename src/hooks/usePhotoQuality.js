import { useEffect, useState } from 'react'
import { ANALYSIS_WIDTH, laplacianVariance, meanBrightness, readPhotoGreyImage } from '../utils'

/** Returns { brightness, sharpness }, { failed: true }, or null while measuring. */
export function usePhotoQuality(photo) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    const request = new AbortController()
    readPhotoGreyImage(photo.blob, ANALYSIS_WIDTH).then(
      (image) => {
        if (request.signal.aborted) return
        const quality = { brightness: Math.round(meanBrightness(image.pixels)), sharpness: Math.round(laplacianVariance(image)) }
        setResult({ photo, quality })
      },
      (error) => {
        if (request.signal.aborted) return
        console.error('Photo quality check failed', error)
        setResult({ photo, quality: { failed: true } })
      },
    )
    return () => request.abort()
  }, [photo])

  // A result for an earlier photo must not show while the new one is measured.
  return result?.photo === photo ? result.quality : null
}
