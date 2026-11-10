import { VISUALLY_HIDDEN } from '../../theme.js'
import { GRADE_COLORS } from '../../utils'

const INFO_PX = 28
const INFO_GAP_PX = 2

export const styles = {
  badge: (grade) => ({ color: `${GRADE_COLORS[grade]}.light`, fontWeight: 600 }),
  pill: (grade) => ({
    color: `${GRADE_COLORS[grade]}.dark`, bgcolor: `${GRADE_COLORS[grade]}.tint`,
    typography: 'caption', fontWeight: 600, borderRadius: 999, px: 1.25, py: 0.5, whiteSpace: 'nowrap' }),
  withInfo: { display: 'inline-flex', alignItems: 'center', flexShrink: 0 },
  // 28 px to look at, 44 px to tap (::after). The negative margin keeps the row as tall as the pill.
  info: {
    width: INFO_PX, height: INFO_PX, mr: `${INFO_GAP_PX}px`, my: '-2px', color: 'text.secondary',
    '& svg': { fontSize: 18 }, '&::after': { content: '""', position: 'absolute', inset: -8 },
  },
  // Line breaks in `tip` are kept.
  tip: { maxWidth: { xs: 240, sm: 280 }, whiteSpace: 'pre-line', typography: 'caption' },
  label: (theme) => ({ [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
}
