import { CARD_RADIUS } from '../theme.js'

export const styles = {
  root: { height: '100dvh', display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'background.default', color: 'text.primary' },
  content: {
    flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, maxWidth: 420, mx: 'auto', textAlign: 'center',
  },
  iconCircle: { width: 72, height: 72, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center' },
  icon: (color) => ({ fontSize: 32, color }),
  title: { typography: 'h1' },
  message: { color: 'text.secondary', maxWidth: 300 },
  steps: {
    m: 0, mt: 1, p: 2, pl: 4.5, width: '100%',
    textAlign: 'left', typography: 'body2',
    bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS,
  },
  actions: { width: '100%', maxWidth: 420, mx: 'auto', mb: 1, display: 'flex', flexDirection: 'column', gap: 1.25 },
}
