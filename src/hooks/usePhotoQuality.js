import { useEffect, useState } from 'react'
import { ANALYSIS_WIDTH, measureImage, readPhotoGreyImage } from '../utils'

/** Returns { width, height, brightness, sharpness }, { failed: true }, or null while measuring or with no photo. */
export function usePhotoQuality(photo) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!photo) return
    const request = new AbortController()
    readPhotoGreyImage(photo.blob, ANALYSIS_WIDTH).then(
      ({ photoWidth, photoHeight, image }) => {
        if (request.signal.aborted) return
        setResult({ photo, quality: { width: photoWidth, height: photoHeight, ...measureImage(image) } })
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
  return photo && result?.photo === photo ? result.quality : null
}
