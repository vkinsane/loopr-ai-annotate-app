import { useEffect, useState } from 'react'
import AnnotateScreen from './screens/AnnotateScreen.jsx'
import CaptureScreen from './screens/CaptureScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'

function App() {
  const [photo, setPhoto] = useState(null)
  const [photoSize, setPhotoSize] = useState(null)

  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  function startOver() {
    setPhoto(null)
    setPhotoSize(null)
  }

  if (!photo) return <CaptureScreen onCapture={setPhoto} />
  if (!photoSize) return <PreviewScreen photo={photo} onRetake={startOver} onAnnotate={setPhotoSize} />
  return <AnnotateScreen photo={photo} size={photoSize} onNewPhoto={startOver} />
}

export default App
