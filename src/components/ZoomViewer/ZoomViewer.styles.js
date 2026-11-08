export const styles = {
  paper: { bgcolor: 'background.default', color: 'text.primary', backgroundImage: 'none' },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 0.5, pr: 1.5, py: 1 },
  close: { width: 44, height: 44 },
  level: { typography: 'caption', fontWeight: 600, bgcolor: 'background.paper', borderRadius: 999, px: 1.5, py: 0.75, fontVariantNumeric: 'tabular-nums' },
  viewport: { flexGrow: 1, minHeight: 0, touchAction: 'none', cursor: 'grab', '&:active': { cursor: 'grabbing' } },
  zoomArea: { width: '100%', height: '100%' },
  photo: { width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' },
  controls: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, px: 2, pt: 2, pb: 4 },
  buttons: { display: 'flex', gap: 1 },
  control: { minWidth: 44, height: 44, px: 1.75, borderRadius: 999, bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'brand.carbonBorder' } },
  hint: { typography: 'caption', color: 'text.secondary', textAlign: 'center' },
}
