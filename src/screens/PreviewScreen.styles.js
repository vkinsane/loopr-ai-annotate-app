import { CARD_RADIUS, fitPhotoWidth, PHOTO_PAGE } from '../theme.js'

// The tallest the photo may be. Phones leave room for the result and buttons.
const PHOTO_HEIGHT = { xs: 'max(140px, min(45dvh, 100dvh - 600px))', sm: '45dvh', md: 'calc(100dvh - 90px)' }

export const styles = {
  // One window tall. Phone and tablet: one column, and on short screens the details scroll with the buttons pinned.
  // Desktop: photo on the left, result and buttons on the right.
  root: {
    ...PHOTO_PAGE, p: 2, pb: { xs: 0, md: 2 }, gap: { xs: 1.5, md: 2 },
    // max-content: the photo clips its overflow, so an `auto` row could collapse to nothing when space is short.
    gridTemplateRows: { xs: 'max-content 1fr', md: '1fr' },
  },
  headerWidth: { maxWidth: PHOTO_PAGE.maxWidth },
  // Sized from the measured photo before the image loads, so nothing below moves when it appears.
  // `ratio` is null when the photo couldn't be read: a fixed-height frame is used instead.
  photoFrame: (ratio) => ({
    position: 'relative', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised', mx: 'auto', alignSelf: 'start',
    ...(ratio ? { aspectRatio: String(ratio), width: fitPhotoWidth(PHOTO_HEIGHT, ratio) } : { width: '100%', height: PHOTO_HEIGHT }),
  }),
  photo: { display: 'block', width: '100%', height: '100%', objectFit: 'contain' },
  zoom: {
    position: 'absolute', right: 10, bottom: 10, height: 44, px: 1.75, borderRadius: 999,
    bgcolor: 'brand.scrim', color: 'brand.snow', typography: 'button', fontSize: 14, '&:hover': { bgcolor: 'brand.carbon' },
  },
  side: { display: 'flex', flexDirection: 'column', gap: 1.5 },
  // Pinned to the bottom of the screen while the details above scroll.
  actions: {
    mt: { xs: 'auto', md: 0.5 }, display: 'flex', gap: 1.5, position: 'sticky', bottom: 0, zIndex: 1, flexShrink: 0, bgcolor: 'background.default',
    mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, pt: { xs: 1.5, md: 0 }, pb: { xs: 3, md: 0 },
  },
  action: { flex: 1 },
}
