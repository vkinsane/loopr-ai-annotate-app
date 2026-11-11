import { CARD_RADIUS, CLEAR_OF_PANEL, COMPACT, INNER_RADIUS, ON_PHOTO_BUTTON, PHOTO_MAX_HEIGHT, PHOTO_PAGE, SIDE_DIVIDER } from '../theme.js'

export const styles = {
  // One window tall. Wide screens: photo on the left, result and buttons on the right.
  // Compact: the photo fills the card, with the result and buttons over it.
  root: { ...PHOTO_PAGE, gridTemplateRows: 'minmax(0, 1fr)' },
  headerWidth: { maxWidth: PHOTO_PAGE.maxWidth },
  // Sized from the measured photo before the image loads, so nothing moves when it appears.
  // `ratio` is null when the photo couldn't be read: a fixed-height frame is used instead.
  // Compact: the card fills the screen and is a size container, so the photo is the largest of its shape that fits,
  // centred in the part above the closed panel.
  photoFrame: (ratio) => ({
    position: 'relative', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised', mx: 'auto',
    alignSelf: 'start', width: ratio ? `min(100%, ${PHOTO_MAX_HEIGHT} * ${ratio})` : '100%', height: ratio ? 'auto' : PHOTO_MAX_HEIGHT,
    aspectRatio: ratio ? String(ratio) : 'auto',
    [COMPACT]: { alignSelf: 'stretch', width: '100%', height: '100%', aspectRatio: 'auto', display: 'grid', placeItems: 'center', containerType: 'size', ...CLEAR_OF_PANEL },
  }),
  // Compact: sized to the photo's own shape, so its rounded corners are the photo's. Until it is measured, it is fitted inside.
  photo: (ratio) => ({
    display: 'block', width: '100%', height: '100%', objectFit: 'contain',
    [COMPACT]: ratio ? { width: `min(100%, 100cqh * ${ratio})`, height: 'auto', aspectRatio: String(ratio), borderRadius: INNER_RADIUS } : {},
  }),
  // Compact: top right, clear of the result panel at the bottom.
  photoTools: { position: 'absolute', right: 10, bottom: 10, display: 'flex', gap: 1, [COMPACT]: { bottom: 'auto', top: 10 } },
  photoTool: {
    height: 44, px: 1.75, borderRadius: 999,
    ...ON_PHOTO_BUTTON, typography: 'button', fontSize: 14,
  },
  advice: { typography: 'body2' },
  side: { ...SIDE_DIVIDER, display: 'flex', flexDirection: 'column', gap: 1.5 },
  actions: { mt: 0.5, display: 'flex', gap: 1.5 },
  action: { flex: 1 },
}
