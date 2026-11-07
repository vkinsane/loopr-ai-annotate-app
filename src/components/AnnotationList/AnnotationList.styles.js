import { CARD_RADIUS } from '../../theme.js'

export const styles = {
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 },
  title: { typography: 'h2' },
  count: { typography: 'caption', color: 'text.secondary' },
  empty: {
    border: '1.5px dashed', borderColor: 'primary.light', borderRadius: CARD_RADIUS, bgcolor: 'background.paper', px: 2.5, py: 3.5,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center',
  },
  emptyIcon: { fontSize: 28, color: 'primary.main' },
  emptyTitle: { typography: 'subtitle1' },
  emptyText: { typography: 'body2', color: 'text.secondary' },
  list: {
    m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1,
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
  },
  row: (selected) => ({
    display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1, pl: 1.5, pr: 0.5, cursor: 'pointer',
    bgcolor: selected ? 'brand.tint' : 'background.paper',
    border: selected ? 2 : 1, borderColor: selected ? 'primary.main' : 'divider', py: selected ? 0.5 : '5px',
  }),
  // Same colours as the box on the photo: indigo when selected, lime with a navy outline otherwise.
  swatch: (selected) => ({
    flexShrink: 0, width: 12, height: 12, borderRadius: '3px', bgcolor: selected ? 'primary.main' : 'brand.lime',
    boxShadow: selected ? 'none' : (theme) => `0 0 0 1px ${theme.palette.brand.ink}`,
  }),
  input: (selected) => ({ flexGrow: 1, minWidth: 0, height: 44, typography: 'body1', fontWeight: selected ? 600 : 400 }),
  size: { typography: 'caption', color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  remove: (selected) => ({ width: 44, height: 44, color: selected ? 'error.main' : 'text.secondary' }),
}
