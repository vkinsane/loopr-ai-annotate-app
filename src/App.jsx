import { useEffect, useState } from 'react'
import CaptureScreen from './screens/CaptureScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'

function App() {
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  if (!photo) return <CaptureScreen onCapture={setPhoto} />
  return <PreviewScreen photo={photo} onRetake={() => setPhoto(null)} />
}

export default App
