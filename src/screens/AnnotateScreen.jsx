import { useEffect } from 'react'
import { ChevronLeft } from '@mui/icons-material'
import { Box, Button, IconButton, Typography } from '@mui/material'
import AnnotationCanvas from '../components/AnnotationCanvas/AnnotationCanvas.jsx'
import AnnotationList from '../components/AnnotationList/AnnotationList.jsx'
import QualityChecks from '../components/QualityChecks/QualityChecks.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { useConfirmTap } from '../hooks'
import { gradePhoto, qualityChecks } from '../utils'
import { styles } from './AnnotateScreen.styles.js'

const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

/**
 * `photo` is { blob, url }, `quality` the measured { width, height, brightness, sharpness }.
 * `annotations` and `dispatch` come from App's annotations reducer.
 */
export default function AnnotateScreen({ photo, quality, annotations, dispatch, onBack, onNewPhoto, onDone }) {
  const { items, selectedId } = annotations
  const { confirming, confirm } = useConfirmTap()
  const checks = qualityChecks(photo.blob.size, quality)
  const issues = checks.filter((check) => check.grade !== 'good').length
  const overall = gradePhoto({ bytes: photo.blob.size, ...quality }).summary.grade

  // Delete removes the selected box and Escape deselects, except while typing a label.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest?.('input, textarea')) return
      if (event.key === 'Escape') dispatch({ type: 'select', id: null })
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) dispatch({ type: 'remove', id: selectedId })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, dispatch])

  return (
    <Box component="main" sx={styles.root}>
      <Box sx={styles.header}>
        <IconButton aria-label="Back to Preview" onClick={onBack} sx={styles.back}>
          <ChevronLeft />
        </IconButton>
        <Typography component="h1" sx={styles.title}>Annotate</Typography>
        {issues > 0 && (
          <Box sx={styles.qualityPill}>
            <StatusBadge grade={overall} label={`Quality: ${plural(issues, 'warning')}`} pill />
          </Box>
        )}
        <Button onClick={() => confirm(onNewPhoto, items.length > 0)} sx={styles.newPhoto(confirming)}>
          {confirming ? `Discard ${plural(items.length, 'box', 'boxes')}?` : 'New photo'}
        </Button>
      </Box>

      <AnnotationCanvas
        photoUrl={photo.url}
        size={quality}
        items={items}
        selectedId={selectedId}
        onAdd={(rect) => dispatch({ type: 'add', id: crypto.randomUUID(), rect })}
        onChange={(id, rect) => dispatch({ type: 'change', id, rect })}
        onSelect={(id) => dispatch({ type: 'select', id })}
      />

      <Box sx={styles.sidebar}>
        <AnnotationList
          items={items}
          selectedId={selectedId}
          onSelect={(id) => dispatch({ type: 'select', id })}
          onRename={(id, label) => dispatch({ type: 'rename', id, label })}
          onRemove={(id) => dispatch({ type: 'remove', id })}
        />

        <Box component="section" aria-labelledby="quality-heading" sx={styles.quality}>
          <Typography id="quality-heading" component="h2" sx={styles.qualityTitle}>Photo quality</Typography>
          <QualityChecks checks={checks} compact />
        </Box>

        <Box sx={styles.doneBar}>
          <Button variant="contained" size="large" fullWidth onClick={onDone}>
            {items.length > 0 ? `Done · ${plural(items.length, 'annotation')}` : 'Done'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
