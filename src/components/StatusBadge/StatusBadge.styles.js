import { VISUALLY_HIDDEN } from '../../theme.js'

const INFO_PX = 28
const INFO_GAP_PX = 2
const PALETTE_KEYS = { good: 'success', warn: 'warning', poor: 'error' }

export const styles = {
  badge: (grade) => ({ color: `${PALETTE_KEYS[grade]}.light`, fontWeight: 600 }),
  pill: (grade) => ({
    color: `${PALETTE_KEYS[grade]}.dark`, bgcolor: `${PALETTE_KEYS[grade]}.tint`,
    typography: 'caption', fontWeight: 600, borderRadius: 999, px: 1.25, py: 0.5, whiteSpace: 'nowrap' }),
  withInfo: { display: 'inline-flex', alignItems: 'center', flexShrink: 0 },
  // 28 px to look at, 44 px to tap (::after). The negative margin keeps the row as tall as the pill.
  info: {
    width: INFO_PX, height: INFO_PX, ml: `${INFO_GAP_PX}px`, my: '-2px', color: 'text.secondary',
    '& svg': { fontSize: 18 }, '&::after': { content: '""', position: 'absolute', inset: -8 },
  },
  infoSlot: { width: INFO_PX, ml: `${INFO_GAP_PX}px` },
  // Line breaks in `tip` are kept.
  tip: { maxWidth: { xs: 240, sm: 280 }, whiteSpace: 'pre-line', typography: 'caption' },
  label: (theme) => ({ [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
}
