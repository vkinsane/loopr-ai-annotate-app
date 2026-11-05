import { VISUALLY_HIDDEN } from '../theme.js'

const GRADE_DOT_COLORS = { good: 'success.light', warn: 'warning.light', poor: 'error.light' }

export const styles = {
  row: { minHeight: 56, px: 2, pt: 2, pb: 1.5, display: 'flex', gap: 0.75, flexWrap: 'nowrap' },
  chip: { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  icon: { display: 'flex', '& svg': { fontSize: 16 } },
  name: (theme) => ({ fontWeight: 500, color: 'text.secondary', mr: 0.75, [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
  dot: (grade) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: GRADE_DOT_COLORS[grade] }),
  dimensions: { display: { xs: 'none', sm: 'inline' } },
}
