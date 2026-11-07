// The frost-to-mist fade echoes the hero sections on loopr.ai.
const HERO_FADE_PX = { xs: 420, md: 560 }
const CONTENT_WIDTH = { xs: 480, sm: 608, md: 1168 } // 24px gutters inside → 560 tablet, 1120 desktop

export const styles = {
  root: (theme) => ({
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    background: `linear-gradient(180deg, ${theme.palette.brand.frost} 0px, ${theme.palette.background.default} ${HERO_FADE_PX.xs}px)`,
    [theme.breakpoints.up('md')]: {
      background: `linear-gradient(180deg, ${theme.palette.brand.frost} 0px, ${theme.palette.background.default} ${HERO_FADE_PX.md}px)`,
    },
  }),
  header: { width: '100%', maxWidth: CONTENT_WIDTH, mx: 'auto', display: 'flex', alignItems: 'center', gap: 1.25, px: 3, py: { xs: 2, sm: 2.5 } },
  logo: { width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.main', display: 'grid', placeItems: 'center' },
  logoIcon: { fontSize: 20, color: 'primary.contrastText' },
  brand: { typography: 'h2' },
  // Phone: copy and demo centred, button pinned to the bottom. Tablet: the whole group centred.
  // Desktop: copy and button on the left, demo on the right.
  main: {
    flexGrow: 1, width: '100%', maxWidth: CONTENT_WIDTH, mx: 'auto', px: 3, pb: { xs: 4, sm: 8 },
    display: 'grid', columnGap: 8, rowGap: { xs: 2.25, sm: 3 },
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 520px' },
    gridTemplateRows: { xs: '1fr auto auto 1fr auto', sm: '1fr auto auto auto 1fr', md: '1fr auto auto 1fr' },
    gridTemplateAreas: {
      xs: '"." "copy" "demo" "." "cta"',
      sm: '"." "copy" "demo" "cta" "."',
      md: '". demo" "copy demo" "cta demo" ". demo"',
    },
  },
  copy: { gridArea: 'copy', display: 'flex', flexDirection: 'column', gap: 2.25 },
  demo: { gridArea: 'demo', alignSelf: 'center' },
  overline: { typography: 'overline', textTransform: 'uppercase', color: 'primary.dark' },
  // clamp keeps the second line on one row on narrow (360 px) phones.
  headline: {
    typography: 'h1', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.18,
    fontSize: { xs: 'clamp(28px, 8.6vw, 34px)', sm: 44, md: 48 },
  },
  // Negative margin keeps the text aligned with the line above while the lime block extends past it.
  highlight: { bgcolor: 'brand.lime', px: 0.75, ml: -0.75, boxDecorationBreak: 'clone' },
  intro: { color: 'text.secondary', fontSize: { sm: 17, md: 18 }, lineHeight: 1.55, maxWidth: { md: 440 } },
  cta: {
    gridArea: 'cta', display: 'flex', gap: 1.5, mt: { sm: 1.5, md: 1 },
    flexDirection: { xs: 'column', md: 'column-reverse' }, alignItems: { md: 'flex-start' },
  },
  button: { width: { md: 'auto' }, px: { md: 4 } },
  privacy: {
    display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 0.75,
    typography: 'caption', color: 'text.secondary',
  },
  privacyIcon: { fontSize: 16 },
}
