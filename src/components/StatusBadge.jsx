import { Box } from '@mui/material'
import { VISUALLY_HIDDEN } from '../theme.js'

const SYMBOLS = {
  good: { symbol: '✓', color: 'success.light' },
  warn: { symbol: '!', color: 'warning.light' },
  poor: { symbol: '✕', color: 'error.light' },
}

export default function StatusBadge({ grade, label }) {
  const { symbol, color } = SYMBOLS[grade]

  return (
    <Box component="span" sx={{ color, fontWeight: 600 }}>
      <span aria-hidden>{symbol}</span>
      <Box component="span" sx={(theme) => ({ [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN })}>
        {' '}
        {label}
      </Box>
    </Box>
  )
}
