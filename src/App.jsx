import { lazy, Suspense, useEffect, useReducer, useState } from 'react'
import ScreenLoader from './components/ScreenLoader/ScreenLoader.jsx'
import { useScreenHistory } from './hooks'
import CaptureScreen from './screens/CaptureScreen.jsx'
import HowItWorksScreen from './screens/HowItWorksScreen.jsx'
import LandingScreen from './screens/LandingScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'
import { annotationsReducer, initialAnnotations } from './utils'

// Loaded when first needed, so the first screen downloads less. Each takes a moment only the first time.
const AnnotateScreen = lazy(() => import('./screens/AnnotateScreen.jsx'))
const SummaryScreen = lazy(() => import('./screens/SummaryScreen.jsx'))

function App() {
  const [photo, setPhoto] = useState(null)
  const [quality, setQuality] = useState(null)
  const [photoName, setPhotoName] = useState('')
  // Everything lives here, not in the screens, so moving back and forward keeps the photo and the boxes.
  const [annotations, dispatch] = useReducer(annotationsReducer, initialAnnotations)
  const [screen, go] = useScreenHistory('landing', canShow)

  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  function canShow(target) {
    if (target === 'preview') return Boolean(photo)
    if (target === 'annotate' || target === 'summary') return Boolean(photo && quality)
    return true
  }

  function startOver() {
    setPhoto(null)
    setQuality(null)
    setPhotoName('')
    dispatch({ type: 'reset' })
    go('capture')
  }

  // A new photo replaces the old one and its boxes. A picked photo skips the camera.
  function handleNewPhoto(newPhoto) {
    setPhoto(newPhoto)
    setQuality(null)
    setPhotoName('')
    dispatch({ type: 'reset' })
    go('preview')
  }

  function handleMeasured(measured) {
    setQuality(measured)
    go('annotate')
  }

  if (screen === 'landing') return <LandingScreen onNext={() => go('how-it-works')} />
  if (screen === 'how-it-works') {
    return <HowItWorksScreen onBack={() => go('landing')} onStart={() => go('capture')} onPickPhoto={handleNewPhoto} />
  }
  if (screen === 'capture') {
    return <CaptureScreen onBack={() => go('how-it-works')} onCapture={handleNewPhoto} onPickPhoto={handleNewPhoto} />
  }
  if (screen === 'preview') return <PreviewScreen photo={photo} boxCount={annotations.items.length} onRetake={startOver} onAnnotate={handleMeasured} />

  return (
    <Suspense fallback={<ScreenLoader />}>
      {screen === 'summary' ? (
        <SummaryScreen
          photo={photo}
          quality={quality}
          items={annotations.items}
          photoName={photoName}
          onPhotoNameChange={setPhotoName}
          onBack={() => go('annotate')}
          onNewPhoto={startOver}
        />
      ) : (
        <AnnotateScreen
          photo={photo}
          quality={quality}
          annotations={annotations}
          dispatch={dispatch}
          onBack={() => go('preview')}
          onNewPhoto={startOver}
          onDone={() => go('summary')}
        />
      )}
    </Suspense>
  )
}

export default App
