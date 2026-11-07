import { AddBoxOutlined, DeleteOutlined } from '@mui/icons-material'
import { Box, IconButton, InputBase, Typography } from '@mui/material'
import { styles } from './AnnotationList.styles.js'

/** One row per box: editable label, size in photo pixels, delete. Focusing a row selects its box. */
export default function AnnotationList({ items, selectedId, onSelect, onRename, onRemove }) {
  return (
    <section aria-labelledby="annotations-heading">
      <Box sx={styles.header}>
        <Typography id="annotations-heading" component="h2" sx={styles.title}>Annotations</Typography>
        <Typography sx={styles.count}>{items.length}</Typography>
      </Box>

      {items.length === 0 ? (
        <Box sx={styles.empty}>
          <AddBoxOutlined aria-hidden sx={styles.emptyIcon} />
          <Typography sx={styles.emptyTitle}>No annotations yet</Typography>
          <Typography sx={styles.emptyText}>Drag on the photo to draw a box.</Typography>
        </Box>
      ) : (
        <Box component="ul" sx={styles.list}>
          {items.map((item, index) => {
            const selected = item.id === selectedId
            const name = item.label || `annotation ${index + 1}`
            return (
              <Box component="li" key={item.id} sx={styles.row(selected)} onClick={() => onSelect(item.id)}>
                <Box component="span" aria-hidden sx={styles.swatch(selected)} />
                <InputBase
                  value={item.label}
                  placeholder="Untitled"
                  onChange={(event) => onRename(item.id, event.target.value)}
                  onFocus={() => onSelect(item.id)}
                  inputProps={{ 'aria-label': `Name of annotation ${index + 1}` }}
                  sx={styles.input(selected)}
                />
                <Typography sx={styles.size}>{Math.round(item.width)} × {Math.round(item.height)}</Typography>
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
              </Box>
            )
          })}
        </Box>
      )}
    </section>
  )
}
