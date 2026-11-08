import { Box } from '@mui/material'
import { styles } from './PhotoWithBoxes.styles.js'

const LABEL_BELOW_FROM_TOP = 0.08

/** Read-only photo with every box in lime. Positions are percentages, like AnnotationCanvas, so they fit any width. */
export default function PhotoWithBoxes({ photoUrl, size, items }) {
  return (
    <Box sx={styles.frame(size.width / size.height)}>
      <img src={photoUrl} alt={`Photo with ${items.length} ${items.length === 1 ? 'annotation' : 'annotations'}`} style={styles.photo} />
      {items.map((item) => (
        <Box key={item.id} aria-hidden title={item.label || 'Untitled'} sx={styles.box(item, size)}>
          <Box component="span" sx={styles.label(item.y / size.height < LABEL_BELOW_FROM_TOP)}>{item.label || 'Untitled'}</Box>
        </Box>
      ))}
    </Box>
  )
}
