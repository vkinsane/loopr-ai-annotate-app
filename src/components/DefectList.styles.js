export const styles = {
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 },
  title: { fontSize: 16, fontWeight: 600 },
  count: { fontSize: 13, color: 'text.secondary' },
  empty: {
    border: '1.5px dashed #cbd5e1', borderRadius: 1, px: 2.5, py: 3.5,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center',
  },
  emptyIcon: { fontSize: 28, color: '#64748b' },
  emptyTitle: { fontSize: 15, fontWeight: 600 },
  emptyText: { fontSize: 14, color: 'text.secondary' },
  list: {
    m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1,
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: '1fr' },
  },
  row: (selected) => ({
    display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1, pl: 1.5, pr: 0.5, cursor: 'pointer',
    bgcolor: selected ? '#eff6ff' : 'background.paper',
    border: selected ? '2px solid #1d4ed8' : '1px solid #e2e8f0', py: selected ? 0.5 : '5px',
  }),
  input: (selected) => ({ flexGrow: 1, minWidth: 0, height: 44, fontSize: 15, fontWeight: selected ? 600 : 400 }),
  size: { fontSize: 12, color: 'text.secondary', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  remove: (selected) => ({ width: 44, height: 44, borderRadius: '8px', color: selected ? '#b91c1c' : 'text.secondary' }),
}
