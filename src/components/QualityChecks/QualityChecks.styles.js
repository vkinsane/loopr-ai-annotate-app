import { CARD_RADIUS } from '../../theme.js'

const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }

export const styles = {
  list: { m: 0, p: 0, listStyle: 'none', bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS },
  row: { ...row, px: 1.75, py: 1.5, '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' } },
  label: { typography: 'caption', color: 'text.secondary' },
  value: { typography: 'body1', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  target: { typography: 'caption', fontSize: 12, color: 'text.secondary', mt: 0.25 },
  // Tablet: 2 × 2 tiles under the list. Desktop: one bordered list in the sidebar.
  compactList: {
    m: 0, p: 0, listStyle: 'none', display: 'grid', gap: { sm: 1.25, md: 0 },
    gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
    border: { md: 1 }, borderColor: { md: 'divider' }, borderRadius: { md: 1 }, bgcolor: { md: 'background.paper' },
  },
  compactRow: {
    ...row, px: 1.5, py: 1,
    bgcolor: { sm: 'background.paper', md: 'transparent' }, border: { sm: 1, md: 0 }, borderColor: { sm: 'divider' }, borderRadius: { sm: 1, md: 0 },
    '&:not(:last-of-type)': { borderBottom: { md: 1 }, borderColor: { md: 'divider' } },
  },
  compactValue: { typography: 'body2', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
}
