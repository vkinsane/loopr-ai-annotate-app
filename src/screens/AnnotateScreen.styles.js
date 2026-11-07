// Phone: one column, Done stuck to the bottom. Tablet: same column, quality as a 2 × 2 grid.
// Desktop: photo on the left; list, quality and Done in a 340 px sidebar.
export const styles = {
  root: {
    minHeight: '100dvh', maxWidth: 1200, mx: 'auto', p: 2, pb: { xs: 0, md: 2 }, display: 'grid', gap: 2,
    // Phone: the last row takes the spare height, so Done sits at the bottom of the screen. Desktop: Done lines up with the photo row.
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gridTemplateRows: { xs: 'auto auto 1fr', md: 'auto auto' }, alignContent: { md: 'start' },
  },
  header: { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1.5, mt: -0.75 },
  title: { typography: 'h1', flexGrow: 1 },
  qualityPill: { display: { xs: 'none', sm: 'block' } },
  newPhoto: (confirming) => ({ color: confirming ? 'error.main' : 'primary.main' }),
  sidebar: { display: 'flex', flexDirection: 'column', gap: 2 },
  quality: { display: { xs: 'none', sm: 'block' } },
  qualityTitle: { typography: 'h2', mb: 1 },
  doneBar: {
    position: { xs: 'sticky', md: 'static' }, bottom: 0, mt: 'auto', mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, pt: { xs: 1.5, md: 0 }, pb: { xs: 3, md: 0 },
    bgcolor: { xs: 'background.default', md: 'transparent' }, borderTop: { xs: 1, md: 0 }, borderColor: { xs: 'divider' },
  },
}
