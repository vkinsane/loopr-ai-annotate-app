import { CARD_RADIUS, PHOTO_PAGE } from '../theme.js'

// One window tall, like Annotate: the photo shrinks to fit and the list scrolls inside.
// Phone and tablet: one column. Desktop: photo on the left, details and actions on the right.
export const styles = {
  root: {
    ...PHOTO_PAGE, p: 2, pb: { xs: 3, md: 2 }, gap: 2,
    gridTemplateRows: { xs: 'max-content minmax(395px, 1fr)', md: 'minmax(0, 1fr)' },
  },
  headerWidth: { maxWidth: PHOTO_PAGE.maxWidth },
  side: { display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 },
  tiles: { display: 'flex', gap: 1, flexShrink: 0 },
  tile: { flex: 1, borderRadius: CARD_RADIUS, px: 1.75, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 },
  tileLabel: { typography: 'caption', color: 'text.secondary' },
  count: { typography: 'h1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  grade: { display: 'flex', mt: 0.25 },
  actions: { mt: { xs: 'auto', md: 0 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 },
  // 36 px to look at, 44 px to tap (::after).
  editName: { width: 36, height: 36, ml: 0.25, color: 'text.secondary', '&::after': { content: '""', position: 'absolute', inset: -4 } },
  // Two lines reserved: the normal and the failed text differ in length.
  caption: (failed) => ({ minHeight: '2.8em', typography: 'caption', textAlign: 'center', color: failed ? 'error.main' : 'text.secondary', mt: -0.5 }),
}
