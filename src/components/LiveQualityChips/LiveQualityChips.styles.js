import { VISUALLY_HIDDEN } from '../../theme.js'
import { GRADE_COLORS } from '../../utils'

export const styles = {
  // Reserves the chips' height (32 + padding), so they appear without moving the camera view.
  row: { minHeight: 60, minWidth: 0, pl: 0.5, pr: 2, pt: 2, pb: 1.5, display: 'flex', gap: 0.75, flexWrap: 'nowrap' },
  chip: { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  icon: { display: 'flex', '& svg': { fontSize: 16 } },
  name: (theme) => ({ fontWeight: 500, color: 'text.secondary', mr: 0.75, [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
  dot: (grade) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: `${GRADE_COLORS[grade]}.light` }),
  dimensions: { display: { xs: 'none', sm: 'inline' } },
}
