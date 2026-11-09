import { Box, Typography } from '@mui/material'
import { GRADE_LABELS } from '../../utils'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import { styles } from './QualityChecks.styles.js'

/**
 * The quality check rows from `qualityChecks()`. An (i) button after the pill of a row that isn't good says how to improve.
 * `compact` is the smaller version beside the Annotate photo: a list on desktop, a 2 × 2 grid on tablet.
 */
export default function QualityChecks({ checks, compact = false }) {
  const someHaveTips = checks.some(({ grade }) => grade && grade !== 'good')
  return (
    <Box component="ul" aria-label="Quality checks" sx={compact ? styles.compactList : styles.list}>
      {checks.map(({ label, value, grade, tip }) => (
        <Box component="li" key={label} sx={compact ? styles.compactRow : styles.row}>
          <Box sx={compact ? styles.compactText : undefined}>
            <Typography sx={compact ? styles.compactLabel : styles.label}>{label}</Typography>
            <Typography sx={compact ? styles.compactValue : styles.value}>{value}</Typography>
          </Box>
          {grade && <StatusBadge grade={grade} label={GRADE_LABELS[grade]} pill tip={grade === 'good' ? undefined : tip} reserveInfo={someHaveTips} />}
        </Box>
      ))}
    </Box>
  )
}
