// The screen is exactly one window tall: the photo shrinks to fit and the annotation list scrolls inside.
// Phone: one column, Done at the bottom. Tablet: same column, quality as a 2 × 2 grid.
// Desktop: photo on the left; list, quality and Done in a 340 px sidebar whose bottom lines up with the photo's.
export const styles = {
  root: {
    height: '100dvh', overflowY: 'auto', maxWidth: 1200, mx: 'auto', p: 2, pb: { xs: 0, md: 2 }, display: 'grid', gap: 2,
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
    // The minimums stop the sidebar being squeezed on very short screens: the screen scrolls instead of overlapping.
    gridTemplateRows: { xs: 'auto auto minmax(201px, 1fr)', sm: 'auto auto minmax(381px, 1fr)', md: 'auto auto auto' }, alignContent: { md: 'start' },
    gridTemplateAreas: { md: '"header header" "photo side" "hint ."' },
  },
  header: { gridColumn: '1 / -1', gridArea: { md: 'header' }, display: 'flex', alignItems: 'center', gap: 0.5, mt: -0.75, ml: -1.5 },
  back: { width: 44, height: 44, color: 'text.primary' },
  title: { typography: 'h1', flexGrow: 1 },
  qualityPill: { display: { xs: 'none', sm: 'block' } },
  // Fits "Discard 99 boxes?", so the longer label doesn't push the quality pill.
  newPhoto: (confirming) => ({ minWidth: 150, ml: 1, justifyContent: 'flex-end', color: confirming ? 'error.main' : 'primary.main' }),
  // Desktop: height 0 + min-height 100% means the photo alone sets the row height; a long list scrolls instead of growing it.
  sidebar: { display: 'flex', flexDirection: 'column', gap: 2, minHeight: { xs: 0, md: '100%' }, height: { md: 0 }, gridArea: { md: 'side' } },
  quality: { display: { xs: 'none', sm: 'block' }, flexShrink: 0 },
  qualityTitle: { typography: 'h2', mb: 1 },
  doneBar: {
    flexShrink: 0, mt: 'auto', mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, pt: { xs: 1.5, md: 0 }, pb: { xs: 3, md: 0 },
    borderTop: { xs: 1, md: 0 }, borderColor: { xs: 'divider' },
  },
}
