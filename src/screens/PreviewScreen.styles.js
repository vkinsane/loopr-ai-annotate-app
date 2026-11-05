export const styles = {
  root: { minHeight: '100dvh', maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, pb: 4 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 600 },
  step: { fontSize: 13, color: 'text.secondary' },
  photoFrame: { borderRadius: 1, overflow: 'hidden', bgcolor: '#1f242b' },
  photo: { display: 'block', width: '100%', maxHeight: '45dvh', objectFit: 'contain' },
  checking: { display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, color: 'text.secondary' },
  checks: { m: 0, p: 0, listStyle: 'none' },
  check: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 1.75, py: 1.5,
    '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
  },
  checkLabel: { fontSize: 13, color: 'text.secondary' },
  checkValue: { fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  actions: { mt: 'auto', pt: 2, display: 'flex', gap: 1.5 },
  action: { flex: 1, height: 52, fontSize: 16, fontWeight: 600, textTransform: 'none' },
}
