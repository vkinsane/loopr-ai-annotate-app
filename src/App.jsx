import { lazy, Suspense, useEffect, useReducer, useState } from 'react'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog.jsx'
import ScreenLoader from './components/ScreenLoader/ScreenLoader.jsx'
import { usePhotoQuality, useScreenHistory } from './hooks'
import CaptureScreen from './screens/CaptureScreen.jsx'
import BeforeYouStartScreen from './screens/BeforeYouStartScreen.jsx'
import LandingScreen from './screens/LandingScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'
import { annotationsReducer, initialAnnotations } from './utils'

// Not in the first download. Fetched while Preview shows, so moving on doesn't wait for them.
const loadAnnotate = () => import('./screens/AnnotateScreen.jsx')
const loadSummary = () => import('./screens/SummaryScreen.jsx')
const AnnotateScreen = lazy(loadAnnotate)
const SummaryScreen = lazy(loadSummary)
// From the camera on, the browser's Back and Forward ask first, then start again from the first page.
const STARTED_SCREENS = ['capture', 'preview', 'annotate', 'summary']
const hasStarted = (screen) => STARTED_SCREENS.includes(screen)

function App() {
  const [photo, setPhoto] = useState(null)
  // Measured once per photo here, not in Preview, so going back to Preview shows the photo at once.
  const photoQuality = usePhotoQuality(photo)
  const quality = photoQuality && !photoQuality.failed ? photoQuality : null
  const [photoName, setPhotoName] = useState('')
  // Everything lives here, not in the screens, so moving back and forward keeps the photo and the boxes.
  const [annotations, dispatch] = useReducer(annotationsReducer, initialAnnotations)
  const { screen, go, leaving, stay } = useScreenHistory('landing', canShow, hasStarted)

  useEffect(() => {
    if (!photo) return
    loadAnnotate()
    loadSummary()
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  function canShow(target) {
    if (target === 'preview') return Boolean(photo)
    if (target === 'annotate' || target === 'summary') return Boolean(photo && quality)
    return true
  }

  // A new photo replaces the old one and its boxes.
  function replacePhoto(newPhoto, nextScreen) {
    setPhoto(newPhoto)
    setPhotoName('')
    dispatch({ type: 'reset' })
    go(nextScreen)
  }

  // An edited photo keeps its name. Its boxes were cleared first, since they no longer match it.
  function handleEditedPhoto(blob) {
    setPhoto({ ...photo, blob, url: URL.createObjectURL(blob) })
    dispatch({ type: 'reset' })
  }

  const startOver = () => replacePhoto(null, 'capture')
  const restart = () => replacePhoto(null, 'landing')
  // A picked photo skips the camera.
  const handleNewPhoto = (newPhoto) => replacePhoto(newPhoto, 'preview')

  function renderScreen() {
    if (screen === 'landing') return <LandingScreen onNext={() => go('before-you-start')} />
    if (screen === 'before-you-start') {
      return <BeforeYouStartScreen onBack={() => go('landing')} onStart={() => go('capture')} onPickPhoto={handleNewPhoto} />
    }
    if (screen === 'capture') {
      return <CaptureScreen onBack={() => go('before-you-start')} onCapture={handleNewPhoto} onPickPhoto={handleNewPhoto} />
    }
    if (screen === 'preview') return <PreviewScreen photo={photo} quality={photoQuality} boxCount={annotations.items.length} onRetake={startOver} onAnnotate={() => go('annotate')} onEdit={handleEditedPhoto} />

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
            photoName={photoName}
            onBack={() => go('preview')}
            onNewPhoto={startOver}
            onDone={() => go('summary')}
          />
        )}
      </Suspense>
    )
  }

  return (
    <>
      {renderScreen()}
      <ConfirmDialog
        open={leaving}
        title="Start over?"
        message="Going back or forward in the browser starts a new inspection from the first page. The photo and boxes won't be kept."
        confirmLabel="Start over"
        cancelLabel="Stay here"
        onConfirm={restart}
        onCancel={stay}
      />
    </>
  )
}

export default App
