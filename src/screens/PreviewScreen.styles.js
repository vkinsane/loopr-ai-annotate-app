import { CARD_RADIUS } from '../theme.js'

export const styles = {
  root: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, pb: 4 },
  title: { typography: 'h1' },
  photoFrame: { position: 'relative', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop' },
  photo: { display: 'block', width: '100%', maxHeight: '45dvh', objectFit: 'contain' },
  zoom: {
    position: 'absolute', right: 10, bottom: 10, height: 44, px: 1.75, borderRadius: 999,
    bgcolor: 'brand.scrim', color: 'brand.snow', typography: 'button', fontSize: 14, '&:hover': { bgcolor: 'brand.carbon' },
  },
  checking: { display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, color: 'text.secondary' },
  actions: { mt: 'auto', pt: 2, display: 'flex', gap: 1.5 },
  action: { flex: 1 },
}
