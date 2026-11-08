import { CARD_RADIUS } from '../theme.js'

export const styles = {
  root: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, pb: 4 },
  title: { typography: 'h1' },
  // Sized from the measured photo before the image loads, so nothing below moves when it appears.
  // `ratio` is null when the photo couldn't be read: a fixed-height frame is used instead.
  photoFrame: (ratio) => ({
    position: 'relative', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop', mx: 'auto', flexShrink: 0,
    ...(ratio ? { aspectRatio: String(ratio), width: `min(100%, 45dvh * ${ratio})` } : { width: '100%', height: '45dvh' }),
  }),
  photo: { display: 'block', width: '100%', height: '100%', objectFit: 'contain' },
  zoom: {
    position: 'absolute', right: 10, bottom: 10, height: 44, px: 1.75, borderRadius: 999,
    bgcolor: 'brand.scrim', color: 'brand.snow', typography: 'button', fontSize: 14, '&:hover': { bgcolor: 'brand.carbon' },
  },
  // Same width and place as the page, so nothing moves when the page replaces it.
  checking: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, typography: 'subtitle1', color: 'text.secondary' },
  actions: { mt: 'auto', pt: 2, display: 'flex', gap: 1.5 },
  action: { flex: 1 },
}
