import { CARD_RADIUS } from '../theme.js'

export const styles = {
  root: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, pb: 4 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { typography: 'h1' },
  step: { typography: 'overline', color: 'primary.main' },
  photoFrame: { borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop' },
  photo: { display: 'block', width: '100%', maxHeight: '45dvh', objectFit: 'contain' },
  checking: { display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, color: 'text.secondary' },
  checks: { m: 0, p: 0, listStyle: 'none', borderRadius: CARD_RADIUS },
  check: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 1.75, py: 1.5,
    '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
  },
  checkLabel: { typography: 'caption', color: 'text.secondary' },
  checkValue: { typography: 'body1', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  actions: { mt: 'auto', pt: 2, display: 'flex', gap: 1.5 },
  action: { flex: 1 },
}
