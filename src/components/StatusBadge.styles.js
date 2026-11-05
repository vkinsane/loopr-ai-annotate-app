import { VISUALLY_HIDDEN } from '../theme.js'

const TEXT_COLORS = { good: 'success.light', warn: 'warning.light', poor: 'error.light' }
const PILL_COLORS = {
  good: { color: '#166534', bgcolor: '#dcfce7' },
  warn: { color: '#92400e', bgcolor: '#fef3c7' },
  poor: { color: '#991b1b', bgcolor: '#fee2e2' },
}

export const styles = {
  badge: (grade) => ({ color: TEXT_COLORS[grade], fontWeight: 600 }),
  pill: (grade) => ({ ...PILL_COLORS[grade], fontWeight: 600, fontSize: 13, borderRadius: 999, px: 1.25, py: 0.5, whiteSpace: 'nowrap' }),
  label: (theme) => ({ [theme.breakpoints.down('sm')]: VISUALLY_HIDDEN }),
}
