import { useEffect, useReducer, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import AnnotationCanvas from '../components/AnnotationCanvas/AnnotationCanvas.jsx'
import DefectList from '../components/DefectList/DefectList.jsx'
import { annotationsReducer, initialAnnotations } from '../utils'
import { styles } from './AnnotateScreen.styles.js'

const CONFIRM_TIMEOUT_MS = 4000

/** `photo` is { url }, `size` is { width, height } in photo pixels. */
export default function AnnotateScreen({ photo, size, onNewPhoto }) {
  const [{ items, selectedId }, dispatch] = useReducer(annotationsReducer, initialAnnotations)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  // Delete removes the selected box and Escape deselects, except while typing a label.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest?.('input, textarea')) return
      if (event.key === 'Escape') dispatch({ type: 'select', id: null })
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) dispatch({ type: 'remove', id: selectedId })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  // Discarding boxes takes a second tap, without a dialog. The first tap expires.
  useEffect(() => {
    if (!confirmingDiscard) return
    const timer = window.setTimeout(() => setConfirmingDiscard(false), CONFIRM_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [confirmingDiscard])

  function handleNewPhoto() {
    if (items.length === 0 || confirmingDiscard) onNewPhoto()
    else setConfirmingDiscard(true)
  }

  return (
    <Box component="main" sx={styles.root}>
      <Box sx={styles.header}>
        <Typography component="h1" sx={styles.title}>Annotate</Typography>
        <Button onClick={handleNewPhoto} sx={styles.newPhoto(confirmingDiscard)}>
          {confirmingDiscard ? `Discard ${items.length} ${items.length === 1 ? 'box' : 'boxes'}?` : 'New photo'}
        </Button>
      </Box>

      <AnnotationCanvas
        photoUrl={photo.url}
        size={size}
        items={items}
        selectedId={selectedId}
        onAdd={(rect) => dispatch({ type: 'add', id: crypto.randomUUID(), rect })}
        onChange={(id, rect) => dispatch({ type: 'change', id, rect })}
        onSelect={(id) => dispatch({ type: 'select', id })}
      />

      <DefectList
        items={items}
        selectedId={selectedId}
        onSelect={(id) => dispatch({ type: 'select', id })}
        onRename={(id, label) => dispatch({ type: 'rename', id, label })}
        onRemove={(id) => dispatch({ type: 'remove', id })}
      />
    </Box>
  )
}
