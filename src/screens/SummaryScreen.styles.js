import { CARD_RADIUS } from '../theme.js'

export const styles = {
  root: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, pt: 1, pb: 4 },
  header: { display: 'flex', alignItems: 'center', gap: 0.5, ml: -1.5 },
  back: { width: 44, height: 44, color: 'text.primary' },
  title: { typography: 'h1' },
  tiles: { display: 'flex', gap: 1 },
  tile: { flex: 1, borderRadius: CARD_RADIUS, px: 1.75, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 },
  tileLabel: { typography: 'caption', color: 'text.secondary' },
  count: { typography: 'h1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  grade: { display: 'flex', mt: 0.25 },
  list: { m: 0, p: 0, listStyle: 'none', borderRadius: CARD_RADIUS },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 1.75, py: 1.5,
    '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
  },
  name: { display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, typography: 'body1', fontWeight: 500, overflowWrap: 'anywhere' },
  swatch: {
    flexShrink: 0, width: 12, height: 12, borderRadius: '3px', bgcolor: 'brand.lime',
    boxShadow: (theme) => `0 0 0 1px ${theme.palette.brand.ink}`,
  },
  size: { typography: 'caption', color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  actions: { mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1.25 },
  caption: (failed) => ({ typography: 'caption', textAlign: 'center', color: failed ? 'error.main' : 'text.secondary', mb: 0.5 }),
}
