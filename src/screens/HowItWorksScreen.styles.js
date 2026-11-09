import { CARD_RADIUS } from '../theme.js'

// Phone and tablet: one column, Open camera pinned to the bottom (tablet column 560 px).
// Desktop: the three steps side by side, tips and Open camera in one row at the bottom. Nothing is vertically centred: centring moves the page when a step grows.
export const styles = {
  root: {
    flex: 1, minHeight: 0, width: '100%', overflowY: 'auto', maxWidth: { xs: 480, sm: 608, md: 1168 }, mx: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 3 }, pb: { md: 5 },
    display: 'flex', flexDirection: 'column',
  },
  headerWidth: { maxWidth: { xs: 480, sm: 608, md: 1168 }, px: { xs: 2, sm: 3 } },
  steps: {
    listStyle: 'none', m: 0, mt: { xs: 1, sm: 0 }, p: 0, gap: { xs: 1.5, md: 2.5 },
    display: { xs: 'flex', md: 'grid' }, flexDirection: 'column', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  step: { borderRadius: CARD_RADIUS, p: { xs: 2, sm: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.75, md: 2 } },
  laterStep: (hideOnSmall) => ({ ...styles.step, display: { xs: hideOnSmall ? 'none' : 'flex', md: 'flex' } }),
  stepHeading: { display: 'flex', flexDirection: { md: 'column' }, gap: 1.75 },
  stepNumber: (done) => ({
    flexShrink: 0, width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
    typography: 'body1', fontWeight: 700,
    bgcolor: done ? 'success.tint' : 'brand.tint', color: done ? 'success.main' : 'primary.dark',
  }),
  stepTitle: { typography: 'h2', mb: 0.5 },
  stepText: { typography: 'body2', color: 'text.secondary' },
  // Each state is one 52 px control plus one line, so the page doesn't move when the state changes.
  permission: { display: 'flex', flexDirection: 'column', gap: 1.5 },
  noCamera: { typography: 'body2', color: 'text.secondary', textAlign: 'center' },
  allowed: {
    height: 52, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
    bgcolor: 'success.tint', color: 'success.dark', typography: 'button', fontSize: 15,
  },
  errorSteps: { m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.5 },
  // Desktop: tips and Open camera in one row at the bottom. Phone and tablet: the wrapper drops out of the layout
  // (display: contents) and Open camera is pinned to the bottom, so hiding steps for the blocked-camera help moves nothing.
  bottom: { display: { xs: 'contents', md: 'flex' }, alignItems: 'flex-end', gap: 3, mt: 'auto', pt: 2.5 },
  tips: (hideOnSmall) => ({
    display: { xs: hideOnSmall ? 'none' : 'flex', md: 'flex' }, flexGrow: { md: 1 }, mt: { xs: 1.5, md: 0 },
    px: { xs: 2, md: 3 }, py: { xs: 1.75, md: 0 }, height: { md: 52 }, borderRadius: CARD_RADIUS, bgcolor: 'brand.tint',
    flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: { xs: 1.5, md: 4 },
  }),
  tipsTitle: { typography: 'overline', textTransform: 'uppercase', color: 'primary.dark' },
  tipList: { listStyle: 'none', m: 0, p: 0, display: 'flex', gap: { xs: 1, md: 4 } },
  tip: {
    flex: { xs: 1, md: 'none' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center',
    gap: { xs: 0.75, md: 1.25 }, typography: 'caption', fontWeight: 500, textAlign: 'center',
  },
  tipIcon: { fontSize: 22, color: 'primary.dark' },
  footer: {
    mt: { xs: 'auto', md: 0 }, width: { md: 300 }, flexShrink: 0, pt: { xs: 2, md: 0 }, pb: { xs: 4, md: 0 },
    display: 'flex', flexDirection: 'column', gap: 1,
    // Phone and tablet: stays pinned to the bottom while the steps scroll on short screens.
    position: { xs: 'sticky', md: 'static' }, bottom: 0, zIndex: 1, bgcolor: { xs: 'background.default', md: 'transparent' },
    mx: { xs: -2, sm: -3, md: 0 }, px: { xs: 2, sm: 3, md: 0 },
  },
  footerHint: { typography: 'caption', color: 'text.secondary', textAlign: 'center' },
}
