import { useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import AnnotationCanvas from '../components/AnnotationCanvas/AnnotationCanvas.jsx'
import AnnotationList from '../components/AnnotationList/AnnotationList.jsx'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog.jsx'
import QualityChecks from '../components/QualityChecks/QualityChecks.jsx'
import ScreenLayout from '../components/ScreenLayout/ScreenLayout.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import StatusBadge from '../components/StatusBadge/StatusBadge.jsx'
import { gradePhoto, plural, qualityChecks } from '../utils'
import { styles } from './AnnotateScreen.styles.js'

/**
 * `photo` is { blob, url }, `quality` the measured { width, height, brightness, sharpness }.
 * `annotations` and `dispatch` come from App's annotations reducer.
 */
export default function AnnotateScreen({ photo, quality, annotations, dispatch, onBack, onNewPhoto, onDone }) {
  const { items, selectedId } = annotations
  const [confirming, setConfirming] = useState(false)
  const [confirmingNoBoxes, setConfirmingNoBoxes] = useState(false)
  const checks = qualityChecks(photo.blob.size, quality)
  const issues = checks.filter((check) => check.grade !== 'good')
  const overall = gradePhoto({ bytes: photo.blob.size, ...quality }).grade
  const select = (id) => dispatch({ type: 'select', id })

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

  const actions = (
    <>
      {issues.length > 0 && (
        <Box sx={styles.qualityPill}>
          <StatusBadge
            grade={overall}
            label={`Quality: ${plural(issues.length, 'warning')}`}
            pill
            tip={issues.map((check) => check.tip).join('\n')}
          />
        </Box>
      )}
      <Button onClick={() => (items.length > 0 ? setConfirming(true) : onNewPhoto())} sx={styles.newPhoto}>New photo</Button>
    </>
  )

  return (
    <ScreenLayout title="Annotate" onBack={onBack} backLabel="Back to Preview" actions={actions} headerSx={styles.headerWidth}>
      <Box component="main" sx={styles.root}>
        <ScrollThumb />
        <AnnotationCanvas
          photoUrl={photo.url}
          size={quality}
          items={items}
          selectedId={selectedId}
          onAdd={(rect) => dispatch({ type: 'add', id: crypto.randomUUID(), rect })}
          onChange={(id, rect) => dispatch({ type: 'change', id, rect })}
          onSelect={select}
        />

        <Box sx={styles.sidebar}>
          <AnnotationList
            items={items}
            selectedId={selectedId}
            onSelect={select}
            onRename={(id, label) => dispatch({ type: 'rename', id, label })}
            onRemove={(id) => dispatch({ type: 'remove', id })}
          />

          <Box component="section" aria-labelledby="quality-heading" sx={styles.quality}>
            <Typography id="quality-heading" component="h2" sx={styles.qualityTitle}>Photo quality</Typography>
            <QualityChecks checks={checks} compact />
          </Box>

          <Box sx={styles.doneBar}>
            <Button variant="contained" size="large" fullWidth onClick={() => (items.length > 0 ? onDone() : setConfirmingNoBoxes(true))}>
              {items.length > 0 ? `Done · ${plural(items.length, 'annotation')}` : 'Done'}
            </Button>
          </Box>
        </Box>

        <ConfirmDialog
          open={confirming}
          title="Discard this photo?"
          message={`This photo and its ${plural(items.length, 'box', 'boxes')} will be lost.`}
          confirmLabel="Discard"
          onConfirm={onNewPhoto}
          onCancel={() => setConfirming(false)}
        />

        <ConfirmDialog
          open={confirmingNoBoxes}
          title="No annotations added"
          message="You have not added any annotations. Do you want to proceed?"
          confirmLabel="Proceed"
          confirmColor="primary"
          cancelLabel="Add annotations"
          onConfirm={onDone}
          onCancel={() => setConfirmingNoBoxes(false)}
        />
      </Box>
    </ScreenLayout>
  )
}
