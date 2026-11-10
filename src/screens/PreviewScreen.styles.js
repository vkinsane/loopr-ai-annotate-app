import { CARD_RADIUS, CLEAR_OF_PANEL, COMPACT, PHOTO_PAGE } from '../theme.js'

// The tallest the photo may be beside the sidebar.
const PHOTO_HEIGHT = 'calc(100dvh - 90px)'

export const styles = {
  // One window tall. Wide screens: photo on the left, result and buttons on the right.
  // Compact: the photo fills the card, with the result and buttons over it.
  root: { ...PHOTO_PAGE, p: 2, gap: 2, gridTemplateRows: 'minmax(0, 1fr)' },
  headerWidth: { maxWidth: PHOTO_PAGE.maxWidth },
  // Sized from the measured photo before the image loads, so nothing moves when it appears.
  // `ratio` is null when the photo couldn't be read: a fixed-height frame is used instead.
  // Compact: the card fills the screen, and the photo is centred in the part above the closed panel.
  photoFrame: (ratio) => ({
    position: 'relative', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised', mx: 'auto',
    alignSelf: 'start', width: ratio ? `min(100%, ${PHOTO_HEIGHT} * ${ratio})` : '100%', height: ratio ? 'auto' : PHOTO_HEIGHT,
    aspectRatio: ratio ? String(ratio) : 'auto',
    [COMPACT]: { alignSelf: 'stretch', width: '100%', height: '100%', aspectRatio: 'auto', ...CLEAR_OF_PANEL },
  }),
  photo: { display: 'block', width: '100%', height: '100%', objectFit: 'contain' },
  // Compact: top right, clear of the result panel at the bottom.
  photoTools: { position: 'absolute', right: 10, bottom: 10, display: 'flex', gap: 1, [COMPACT]: { bottom: 'auto', top: 10 } },
  photoTool: {
    height: 44, px: 1.75, borderRadius: 999,
    bgcolor: 'brand.scrim', color: 'brand.snow', typography: 'button', fontSize: 14, '&:hover': { bgcolor: 'brand.carbon' },
  },
  advice: { typography: 'body2' },
  side: { display: 'flex', flexDirection: 'column', gap: 1.5 },
  actions: { mt: 0.5, display: 'flex', gap: 1.5 },
  action: { flex: 1 },
}
