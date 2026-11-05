import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CaptureScreen from './screens/CaptureScreen.jsx'

function App() {
  const [photo, setPhoto] = useState(null)

  // Photos are several MB; free each one when it is replaced or discarded.
  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  if (!photo) return <CaptureScreen onCapture={setPhoto} />

  // Temporary until PreviewScreen is built: shows the photo so capture can be checked end to end.
  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2, justifyItems: 'center' }}>
      <img src={photo.url} alt="Captured photo" style={{ maxWidth: '100%', maxHeight: '80dvh' }} />
      <span>
        {photo.width} × {photo.height} · {(photo.blob.size / 1024).toFixed(0)} KB · {photo.method}
      </span>
      <Button variant="contained" onClick={() => setPhoto(null)}>
        Retake
      </Button>
    </Box>
  )
}

export default App
