export const styles = {
  root: {
    minHeight: '100dvh', maxWidth: 1200, mx: 'auto', p: 2, display: 'grid', gap: 2, alignContent: 'start',
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
  },
  header: { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.75 },
  title: { typography: 'h1' },
  newPhoto: (confirming) => ({ color: confirming ? 'error.main' : 'primary.main' }),
}
