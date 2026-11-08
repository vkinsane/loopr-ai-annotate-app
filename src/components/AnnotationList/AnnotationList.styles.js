import { CARD_RADIUS, SCROLL_SHADOWS } from '../../theme.js'

export const styles = {
  // Inside a fixed-height sidebar, the list scrolls on its own and the heading stays.
  // Takes all spare height, empty or not, so adding the first box doesn't move what is below.
  root: { display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 0' },
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 },
  title: { typography: 'h2' },
  count: { typography: 'caption', color: 'text.secondary' },
  empty: {
    border: '1.5px dashed', borderColor: 'primary.light', borderRadius: CARD_RADIUS, bgcolor: 'background.paper', px: 2.5, py: 3.5,
    flex: 1, minHeight: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, textAlign: 'center',
  },
  emptyIcon: { fontSize: 28, color: 'primary.main' },
  emptyTitle: { typography: 'subtitle1' },
  emptyText: { typography: 'body2', color: 'text.secondary' },
  // One bordered card with a line between rows, like the Photo quality card.
  // position: relative keeps the visually hidden notes inside the scroll area, so they can't make the page taller.
  list: (theme) => ({
    position: 'relative', m: 0, p: 0, listStyle: 'none', overflowY: 'auto', minHeight: 96, flex: 1, alignContent: 'start',
    border: 1, borderColor: 'divider', borderRadius: 1, ...SCROLL_SHADOWS(theme),
  }),
  // The selected row is tinted, with an indigo bar on its left edge.
  row: (selected) => ({
    display: 'flex', alignItems: 'center', columnGap: 1, pl: 1.5, pr: 0.5, cursor: 'pointer',
    bgcolor: selected ? 'brand.tint' : 'transparent',
    boxShadow: selected ? (theme) => `inset 3px 0 0 ${theme.palette.primary.main}` : 'none',
    '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
  }),
  // Same colours as the box on the photo: indigo when selected, lime with a navy outline otherwise.
  swatch: (selected) => ({
    flexShrink: 0, width: 12, height: 12, borderRadius: '3px', bgcolor: selected ? 'primary.main' : 'brand.lime',
    boxShadow: selected ? 'none' : (theme) => `0 0 0 1px ${theme.palette.brand.ink}`,
  }),
  input: (selected) => ({
    flexGrow: 1, minWidth: 0, height: { xs: 44, md: 40 }, typography: { xs: 'body1', md: 'body2' }, fontWeight: selected ? 600 : 500,
    '& input': { textOverflow: 'ellipsis' }, // "…" when not being edited; full name on hover (title)
  }),
  size: { typography: 'caption', color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  note: (note) => ({ typography: 'caption', fontSize: 13, bgcolor: note?.warn ? 'warning.dark' : 'brand.ink', color: 'common.white' }),
  remove: (selected) => ({ width: { xs: 44, md: 36 }, height: { xs: 44, md: 36 }, color: selected ? 'error.main' : 'text.secondary', '& svg': { fontSize: { md: 20 } } }),
}
