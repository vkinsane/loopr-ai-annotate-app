import { Box } from '@mui/material'
import { styles } from './StatusBadge.styles.js'

const SYMBOLS = { good: '✓', warn: '!', poor: '✕' }

/** Plain: coloured text, label hidden on phones. Pill: tinted background, label always shown. */
export default function StatusBadge({ grade, label, pill = false }) {
  return (
    <Box component="span" sx={pill ? styles.pill(grade) : styles.badge(grade)}>
      <span aria-hidden>{SYMBOLS[grade]}</span>
      <Box component="span" sx={pill ? undefined : styles.label}>
        {' '}
        {label}
      </Box>
    </Box>
  )
}
