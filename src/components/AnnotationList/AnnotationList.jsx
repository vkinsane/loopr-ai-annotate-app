import { useEffect, useRef, useState } from 'react'
import { AddBoxOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material'
import { Box, IconButton, InputBase, Tooltip, Typography } from '@mui/material'
import { VISUALLY_HIDDEN } from '../../theme.js'
import { boxLabel, finishText, TEXT_RULES, validateText } from '../../utils'
import ScrollThumb from '../ScrollThumb/ScrollThumb.jsx'
import { styles } from './AnnotationList.styles.js'

const RULE = TEXT_RULES.annotationName

/**
 * One row per box: editable label, size in photo pixels, delete. Focusing a row selects its box.
 * Labels are checked with `validateText` while typing or pasting and `finishText` on blur. Their message floats as a
 * tooltip under the field, so no row moves; a hidden live region reads it to screen readers.
 * `readOnly` shows only the names and sizes, for the Summary screen.
 */
export default function AnnotationList({ items, selectedId, readOnly = false, onSelect, onRename, onRemove }) {
  const listRef = useRef(null)
  const labelBeforeEdit = useRef('')
  const [note, setNote] = useState(null) // { id, text, warn }: the message from validation

  // A new or selected box may be below the fold of the scrolling list.
  useEffect(() => {
    listRef.current?.querySelector(`[data-id="${selectedId}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  const showNote = (item, message) => setNote(message && { id: item.id, ...message })

  function handleChange(item, raw) {
    const { value, message } = validateText(raw, RULE)
    onRename(item.id, value)
    showNote(item, message)
  }

  function handleBlur(item) {
    const others = items.filter((other) => other.id !== item.id).map((other) => other.label)
    const { value, message } = finishText(item.label, RULE, { previous: labelBeforeEdit.current, others })
    if (value !== item.label) onRename(item.id, value)
    showNote(item, message)
  }

  return (
    <Box component="section" aria-label="Annotations" sx={styles.root(readOnly)}>
      {!readOnly && (
        <Box sx={styles.header}>
          <Typography component="h2" sx={styles.title}>Annotations</Typography>
          <Typography sx={styles.count}>{items.length}</Typography>
        </Box>
      )}

      {items.length === 0 ? (
        <Box sx={styles.empty}>
          <AddBoxOutlined aria-hidden sx={styles.emptyIcon} />
          <Typography sx={styles.emptyTitle}>No annotations yet</Typography>
          <Typography sx={styles.emptyText}>Drag on the photo to draw a box.</Typography>
        </Box>
      ) : (
        <Box component="ul" ref={listRef} sx={styles.list(readOnly)}>
          <ScrollThumb component="li" />
          {items.map((item, index) => {
            if (readOnly) {
              return (
                <Box component="li" key={item.id} sx={styles.readOnlyRow}>
                  <Box component="span" aria-hidden sx={styles.swatch(false)} />
                  <Box component="span" title={boxLabel(item)} sx={styles.readOnlyName}>{boxLabel(item)}</Box>
                  <Typography sx={styles.readOnlySize}>{Math.round(item.width)} × {Math.round(item.height)} px</Typography>
                </Box>
              )
            }
            const selected = item.id === selectedId
            const name = item.label || `annotation ${index + 1}`
            const noteId = `annotation-note-${item.id}`
            const rowNote = note?.id === item.id ? note : null
            return (
              <Box component="li" key={item.id} data-id={item.id} sx={styles.row(selected)} onClick={() => onSelect(item.id)}>
                <Box component="span" aria-hidden sx={styles.swatch(selected)} />
                <Tooltip
                  open={Boolean(rowNote)}
                  title={rowNote?.text ?? ''}
                  placement="bottom-start"
                  describeChild
                  disableHoverListener
                  disableFocusListener
                  disableTouchListener
                  slotProps={{ tooltip: { sx: styles.note(rowNote) } }}
                >
                  <InputBase
                    value={item.label}
                    placeholder="Untitled"
                    onChange={(event) => handleChange(item, event.target.value)}
                    onFocus={() => {
                      labelBeforeEdit.current = item.label
                      onSelect(item.id)
                    }}
                    onBlur={() => handleBlur(item)}
                    onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                    inputProps={{
                      'aria-label': `Name of annotation ${index + 1}`,
                      title: item.label,
                      'aria-describedby': noteId,
                      enterKeyHint: 'done',
                      autoComplete: 'off',
                      spellCheck: false,
                    }}
                    sx={styles.input(selected)}
                  />
                </Tooltip>
                <Typography sx={styles.size}>{Math.round(item.width)} × {Math.round(item.height)}</Typography>
                <IconButton
                  aria-label={`Edit ${name}`}
                  onClick={(event) => {
                    const input = event.currentTarget.closest('li').querySelector('input')
                    input.focus()
                    input.select()
                  }}
                  sx={styles.edit}
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  aria-label={`Delete ${name}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(item.id)
                  }}
                  sx={styles.remove(selected)}
                >
                  <DeleteOutlined />
                </IconButton>
                {/* Always in the DOM, so screen readers announce a note when it appears. */}
                <Box component="span" id={noteId} aria-live="polite" sx={VISUALLY_HIDDEN}>{rowNote?.text}</Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
