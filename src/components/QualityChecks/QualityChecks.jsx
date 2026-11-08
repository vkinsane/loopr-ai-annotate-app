import { Box, Typography } from '@mui/material'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import { styles } from './QualityChecks.styles.js'

const GRADE_LABELS = { good: 'Good', warn: 'Warning', poor: 'Poor' }

/**
 * The quality check rows from `qualityChecks()`. Rows that aren't good show their target, so the number makes sense.
 * `compact` is the smaller version beside the Annotate photo: a list on desktop, a 2 × 2 grid on tablet.
 */
export default function QualityChecks({ checks, compact = false }) {
  return (
    <Box component="ul" aria-label="Quality checks" sx={compact ? styles.compactList : styles.list}>
      {checks.map(({ label, value, grade, target }) => (
        <Box component="li" key={label} sx={compact ? styles.compactRow : styles.row}>
          <Box sx={compact ? styles.compactText : undefined}>
            <Typography sx={compact ? styles.compactLabel : styles.label}>{label}</Typography>
            <Typography sx={compact ? styles.compactValue : styles.value}>{value}</Typography>
            {!compact && grade && grade !== 'good' && <Typography sx={styles.target}>Good at {target}</Typography>}
          </Box>
          {grade && <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill />}
        </Box>
      ))}
    </Box>
  )
}
