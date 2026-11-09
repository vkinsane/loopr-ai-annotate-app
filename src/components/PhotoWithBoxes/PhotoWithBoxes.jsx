import { Box } from '@mui/material'
import { boxLabel, labelGoesBelow, plural } from '../../utils'
import { styles } from './PhotoWithBoxes.styles.js'

/** Read-only photo with every box in lime. Positions are percentages, like AnnotationCanvas, so they fit any width. */
export default function PhotoWithBoxes({ photoUrl, size, items }) {
  return (
    <Box sx={styles.frame(size.width / size.height)}>
      <img src={photoUrl} alt={`Photo with ${plural(items.length, 'annotation')}`} style={styles.photo} />
      {items.map((item) => (
        <Box key={item.id} aria-hidden title={boxLabel(item)} sx={styles.box(item, size)}>
          <Box component="span" sx={styles.label(labelGoesBelow(item, size))}>{boxLabel(item)}</Box>
        </Box>
      ))}
    </Box>
  )
}
