import { useEffect, useReducer, useState } from 'react'
import AnnotateScreen from './screens/AnnotateScreen.jsx'
import CaptureScreen from './screens/CaptureScreen.jsx'
import HowItWorksScreen from './screens/HowItWorksScreen.jsx'
import LandingScreen from './screens/LandingScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'
import SummaryScreen from './screens/SummaryScreen.jsx'
import { annotationsReducer, initialAnnotations } from './utils'

function App() {
  // 'landing' → 'how-it-works' → 'inspect'. Inside 'inspect', the state below picks the screen:
  // no photo → Capture, not measured → Preview, not finished → Annotate, finished → Summary.
  const [stage, setStage] = useState('landing')
  const [photo, setPhoto] = useState(null)
  const [quality, setQuality] = useState(null)
  const [finished, setFinished] = useState(false)
  // Lives here, not in Annotate, so going back from Summary keeps the boxes.
  const [annotations, dispatch] = useReducer(annotationsReducer, initialAnnotations)

  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.url)
  }, [photo])

  function startOver() {
    setPhoto(null)
    setQuality(null)
    setFinished(false)
    dispatch({ type: 'reset' })
  }

  // A picked photo skips the camera and goes straight to the quality check.
  function handlePickedPhoto(picked) {
    setPhoto(picked)
    setStage('inspect')
  }

  if (stage === 'landing') return <LandingScreen onNext={() => setStage('how-it-works')} />
  if (stage === 'how-it-works') {
    return (
      <HowItWorksScreen onBack={() => setStage('landing')} onStart={() => setStage('inspect')} onPickPhoto={handlePickedPhoto} />
    )
  }
  if (!photo) return <CaptureScreen onCapture={setPhoto} onPickPhoto={setPhoto} />
  if (!quality) return <PreviewScreen photo={photo} onRetake={startOver} onAnnotate={setQuality} />
  if (!finished) {
    return (
      <AnnotateScreen
        photo={photo}
        quality={quality}
        annotations={annotations}
        dispatch={dispatch}
        onNewPhoto={startOver}
        onDone={() => setFinished(true)}
      />
    )
  }
  return (
    <SummaryScreen photo={photo} quality={quality} items={annotations.items} onBack={() => setFinished(false)} onNewPhoto={startOver} />
  )
}

export default App
