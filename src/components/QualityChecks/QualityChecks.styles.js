import { CARD_RADIUS, TABLE_BODY_RADIUS } from '../../theme.js'

const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }

const LIST = { m: 0, p: 0, listStyle: 'none' }

export const styles = {
  full: {
    list: { ...LIST, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS },
    row: { ...row, px: 1.75, py: 1.5, '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' } },
    label: { typography: 'caption', color: 'text.secondary' },
    value: { typography: 'body1', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  },
  // Tablet: 2 × 2 tiles under the list. Desktop: one bordered list in the sidebar.
  compact: {
    list: {
      ...LIST, display: 'grid', gap: { sm: 1.25, md: 0 }, gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
      border: { md: 1 }, borderColor: { md: 'divider' }, borderRadius: { md: TABLE_BODY_RADIUS }, bgcolor: { md: 'background.paper' },
    },
    row: {
      ...row, gap: 1, px: 1.5, py: { xs: 1, md: 0.75 },
      bgcolor: { sm: 'background.paper', md: 'transparent' }, border: { sm: 1, md: 0 }, borderColor: { sm: 'divider' }, borderRadius: { sm: 1, md: 0 },
      '&:not(:last-of-type)': { borderBottom: { md: 1 }, borderColor: { md: 'divider' } },
    },
    // Desktop rows are one line (label · value · grade) so the sidebar has more room for the annotation list.
    text: { minWidth: 0, display: { md: 'flex' }, alignItems: 'baseline', gap: 1 },
    label: { typography: 'caption', color: 'text.secondary', flexShrink: 0, width: { md: 72 } },
    value: {
      typography: 'body2', fontWeight: 500, fontVariantNumeric: 'tabular-nums',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { md: 'nowrap' },
    },
  },
}
