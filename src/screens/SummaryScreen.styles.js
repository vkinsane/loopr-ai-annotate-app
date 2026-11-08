import { CARD_RADIUS, SCROLL_SHADOWS } from '../theme.js'

// One window tall, like Annotate: the photo shrinks to fit and the list scrolls inside.
// Phone and tablet: one column. Desktop: photo on the left, details and actions on the right.
export const styles = {
  root: {
    height: '100dvh', overflowY: 'auto', maxWidth: { xs: 600, md: 1200 }, mx: 'auto', p: 2, pt: 1, pb: { xs: 3, md: 2 },
    display: 'grid', gap: { xs: 1.5, md: 2 },
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 380px' },
    gridTemplateRows: { xs: 'auto max-content minmax(395px, 1fr)', md: 'auto minmax(0, 1fr)' },
  },
  header: { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 0.5, ml: -1.5 },
  title: { typography: 'h1' },
  side: { display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0 },
  tiles: { display: 'flex', gap: 1, flexShrink: 0 },
  tile: { flex: 1, borderRadius: CARD_RADIUS, px: 1.75, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 },
  tileLabel: { typography: 'caption', color: 'text.secondary' },
  count: { typography: 'h1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  grade: { display: 'flex', mt: 0.25 },
  list: (theme) => ({ m: 0, p: 0, listStyle: 'none', borderRadius: CARD_RADIUS, overflowY: 'auto', minHeight: 96, flexShrink: 1, ...SCROLL_SHADOWS(theme) }),
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 1.75, py: 1.5,
    '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
  },
  name: { display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, typography: 'body1', fontWeight: 500 },
  // Long names stay on one line and end in "…"; the full name shows on hover (title).
  nameText: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  swatch: {
    flexShrink: 0, width: 12, height: 12, borderRadius: '3px', bgcolor: 'brand.lime',
    boxShadow: (theme) => `0 0 0 1px ${theme.palette.brand.ink}`,
  },
  size: { typography: 'caption', color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  actions: { mt: { xs: 'auto', md: 0 }, pt: 1, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.25 },
  editName: { width: 36, height: 36, ml: 0.25, color: 'text.secondary' },
  // Two lines reserved: the normal and the failed text differ in length.
  caption: (failed) => ({ minHeight: '2.8em', typography: 'caption', textAlign: 'center', color: failed ? 'error.main' : 'text.secondary', mb: 0.5 }),
}
