import { VISUALLY_HIDDEN } from '../../theme.js'

const PALETTE_KEYS = { good: 'success', warn: 'warning', poor: 'error' }

export const styles = {
  badge: (grade) => ({ color: `${PALETTE_KEYS[grade]}.light`, fontWeight: 600 }),
  pill: (grade) => ({
    color: `${PALETTE_KEYS[grade]}.dark`, bgcolor: `${PALETTE_KEYS[grade]}.tint`,
    typography: 'caption', fontWeight: 600, borderRadius: 999, px: 1.25, py: 0.5, whiteSpace: 'nowrap' }),
  label: (theme) => ({ [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
}
