import { CARD_RADIUS, COMPACT, TABLE_BODY_RADIUS } from '../../theme.js'

const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }

const LIST = { m: 0, p: 0, listStyle: 'none' }

export const styles = {
  full: {
    list: { ...LIST, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS },
    row: { ...row, px: 1.75, py: 1.5, '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' } },
    label: { typography: 'caption', color: 'text.secondary' },
    value: { typography: 'body1', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  },
  // Wide screens: one bordered list in the Annotate sidebar. Compact: rows in the details panel.
  compact: {
    list: {
      ...LIST, border: 1, borderColor: 'divider', borderRadius: TABLE_BODY_RADIUS, bgcolor: 'background.paper',
      [COMPACT]: { border: 0, bgcolor: 'transparent' },
    },
    row: {
      ...row, gap: 1, px: 1.5, py: 0.75, '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
      // Inside the details panel, whose padding lines the rows up with the text above them.
      [COMPACT]: { px: 0, py: 1, '&:not(:last-of-type)': { borderBottom: 0 } },
    },
    // Wide rows are one line (label · value · grade), so the sidebar has more room for the annotation list.
    text: { minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 1, [COMPACT]: { display: 'block' } },
    label: { typography: 'caption', color: 'text.secondary', flexShrink: 0, width: 72, [COMPACT]: { width: 'auto' } },
    value: {
      typography: 'body2', fontWeight: 500, fontVariantNumeric: 'tabular-nums',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', [COMPACT]: { whiteSpace: 'normal' },
    },
  },
}
