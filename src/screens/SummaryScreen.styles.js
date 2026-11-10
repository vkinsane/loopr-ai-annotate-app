import { CARD_RADIUS, CLEAR_OF_PANEL, COMPACT, PHOTO_PAGE } from '../theme.js'

// One window tall, like Annotate: the photo shrinks to fit and the list scrolls inside.
// Wide screens: photo on the left, details and actions on the right. Compact: the details sit over the photo.
export const styles = {
  root: { ...PHOTO_PAGE, p: 2, gap: 2, gridTemplateRows: 'minmax(0, 1fr)' },
  // Wide screens: no box of its own; the photo is the card.
  // Compact: the card fills the screen and is a size container, so the photo is the largest of its shape that fits,
  // centred in the part above the closed panel.
  photoArea: {
    display: 'contents',
    [COMPACT]: {
      position: 'relative', minHeight: 0, display: 'grid', placeItems: 'center', containerType: 'size',
      border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised', ...CLEAR_OF_PANEL,
    },
  },
  headerWidth: { maxWidth: PHOTO_PAGE.maxWidth },
  side: { display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 },
  tiles: { display: 'flex', gap: 1, flexShrink: 0 },
  tile: { flex: 1, borderRadius: CARD_RADIUS, px: 1.75, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 },
  tileLabel: { typography: 'caption', color: 'text.secondary' },
  count: { typography: 'h1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  grade: { display: 'flex', mt: 0.25 },
  actions: { flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 },
  // 36 px to look at, 44 px to tap (::after).
  editName: { width: 36, height: 36, ml: 0.25, color: 'text.secondary', '&::after': { content: '""', position: 'absolute', inset: -4 } },
  // Two lines reserved: the normal and the failed text differ in length.
  // Compact: on the see-through panel, so full-contrast text, lined up with the field's text above it.
  caption: (failed) => ({
    minHeight: '2.8em', typography: 'caption', textAlign: 'center', color: failed ? 'error.main' : 'text.secondary', mt: -0.5,
    [COMPACT]: { textAlign: 'left', px: 1.75, ...(!failed && { color: 'text.primary' }) },
  }),
  // A solid field, so its border and text read on the see-through panel too. The default name is a placeholder, so it is a shade lighter.
  // The label sits on the top border, half over the panel, so it gets the field's background too.
  // Compact: the top margin keeps the floating label clear of the panel's divider.
  nameField: {
    [COMPACT]: { mt: 0.75 },
    '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' }, '& input::placeholder': { color: 'text.secondary', opacity: 1 },
    '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.75, ml: -0.75, borderRadius: 1 }, // the field's corner radius
  },
}
