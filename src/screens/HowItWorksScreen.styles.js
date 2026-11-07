import { CARD_RADIUS } from '../theme.js'

// Phone: one column, Get started pinned to the bottom. Tablet: the phone column at 560 px, centred on the screen.
// Desktop: the three steps side by side, tips and Get started in one row below.
export const styles = {
  root: {
    minHeight: '100dvh', maxWidth: { xs: 480, sm: 608, md: 1168 }, mx: 'auto', px: { xs: 2, sm: 3 }, py: { sm: 5 },
    display: 'flex', flexDirection: 'column', justifyContent: { sm: 'center' },
  },
  header: { display: 'flex', alignItems: 'center', gap: 0.5, ml: -1.5, py: 1, mb: { sm: 1.5, md: 2.5 } },
  back: { width: 44, height: 44, color: 'text.primary' },
  title: { typography: 'h1', fontSize: { md: 28 } },
  steps: {
    listStyle: 'none', m: 0, mt: { xs: 1, sm: 0 }, p: 0, gap: { xs: 1.5, md: 2.5 },
    display: { xs: 'flex', md: 'grid' }, flexDirection: 'column', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  step: { borderRadius: CARD_RADIUS, p: { xs: 2, sm: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.75, md: 2 } },
  stepHeading: { display: 'flex', flexDirection: { md: 'column' }, gap: 1.75 },
  stepNumber: (done) => ({
    flexShrink: 0, width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
    typography: 'body1', fontWeight: 700,
    bgcolor: done ? 'success.tint' : 'brand.tint', color: done ? 'success.main' : 'primary.dark',
  }),
  stepTitle: { typography: 'h2', mb: 0.5 },
  stepText: { typography: 'body2', color: 'text.secondary' },
  permission: { display: 'flex', flexDirection: 'column', gap: 1.5 },
  noCamera: { typography: 'body2', color: 'text.secondary', textAlign: 'center' },
  allowed: {
    height: 48, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
    bgcolor: 'success.tint', color: 'success.dark', typography: 'button', fontSize: 15,
  },
  errorSteps: { m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.5 },
  // On phones this grows to fill the screen so the footer's auto margin can push Get started to the bottom.
  bottom: {
    flexGrow: { xs: 1, sm: 0 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' },
    gap: { md: 3 }, mt: { xs: 1.5, md: 2.5 },
  },
  tips: (hideOnSmall) => ({
    display: { xs: hideOnSmall ? 'none' : 'flex', md: 'flex' }, flexGrow: { md: 1 },
    px: { xs: 2, md: 3 }, py: { xs: 1.75, md: 2.25 }, borderRadius: CARD_RADIUS, bgcolor: 'brand.tint',
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
    mt: { xs: 'auto', sm: 4, md: 0 }, width: { md: 300 }, flexShrink: 0, pt: { xs: 2, sm: 0 }, pb: { xs: 4, sm: 0 },
    display: 'flex', flexDirection: 'column', gap: 1,
  },
  footerHint: { typography: 'caption', color: 'text.secondary', textAlign: 'center' },
}
