import { Box, Typography } from '@mui/material'
import { GRADE_LABELS } from '../../utils'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import { styles } from './QualityChecks.styles.js'

/**
 * The quality check rows from `qualityChecks()`. An (i) button before the pill of a row that isn't good says how to improve.
 * `compact` is the smaller version beside the Annotate photo: a list on desktop, a 2 × 2 grid on tablet.
 */
export default function QualityChecks({ checks, compact = false }) {
  const look = compact ? styles.compact : styles.full
  return (
    <Box component="ul" aria-label="Quality checks" sx={look.list}>
      {checks.map(({ label, value, grade, tip }) => (
        <Box component="li" key={label} sx={look.row}>
          <Box sx={look.text}>
            <Typography sx={look.label}>{label}</Typography>
            <Typography sx={look.value}>{value}</Typography>
          </Box>
          {grade && <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill tip={grade === 'good' ? undefined : tip} />}
        </Box>
      ))}
    </Box>
  )
}
