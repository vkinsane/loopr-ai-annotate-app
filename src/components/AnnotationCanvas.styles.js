const COLORS = {
  selected: { line: '#1d4ed8', fill: 'rgba(29, 78, 216, 0.12)' },
  other: { line: '#db2777', fill: 'rgba(219, 39, 119, 0.12)' },
}
const HANDLE = { hit: 44, dot: 14 }
const toPercent = (value, total) => `${(value / total) * 100}%`

export const styles = {
  // Largest box with the photo's shape that fits: full width, capped by screen height.
  frame: (ratio) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', borderRadius: 1, overflow: 'hidden', bgcolor: '#1f242b',
    width: { xs: `min(100%, 55dvh * ${ratio})`, md: `min(100%, (100dvh - 120px) * ${ratio})` },
    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
  }),
  photo: { display: 'block', width: '100%', height: '100%', pointerEvents: 'none' },
  // touch-action: none hands every touch on the photo to our gestures instead of scrolling or zooming the page.
  layer: { position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair' },
  box: (rect, size, variant) => {
    const { line, fill } = variant === 'other' ? COLORS.other : COLORS.selected
    return {
      position: 'absolute', boxSizing: 'border-box', cursor: 'move',
      left: toPercent(rect.x, size.width), top: toPercent(rect.y, size.height),
      width: toPercent(rect.width, size.width), height: toPercent(rect.height, size.height),
      border: `${variant === 'selected' ? 3 : 2}px ${variant === 'draft' ? 'dashed' : 'solid'} ${line}`,
      bgcolor: fill, zIndex: variant === 'other' ? 0 : 1,
    }
  },
  label: (selected, below) => ({
    position: 'absolute', left: -2, [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    fontSize: 11, fontWeight: 600, lineHeight: '16px', color: '#fff', bgcolor: selected ? COLORS.selected.line : COLORS.other.line,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none',
  }),
  // A 44 px touch target, centred on the corner, around a small visible dot.
  handle: (corner) => {
    const [vertical, horizontal] = corner.split('-')
    return {
      position: 'absolute', width: HANDLE.hit, height: HANDLE.hit, [vertical]: 0, [horizontal]: 0,
      transform: `translate(${horizontal === 'left' ? '-50%' : '50%'}, ${vertical === 'top' ? '-50%' : '50%'})`,
      cursor: corner === 'top-left' || corner === 'bottom-right' ? 'nwse-resize' : 'nesw-resize',
      '&::after': {
        content: '""', position: 'absolute', inset: (HANDLE.hit - HANDLE.dot) / 2, borderRadius: '50%',
        bgcolor: '#fff', border: `2.5px solid ${COLORS.selected.line}`, boxSizing: 'border-box',
      },
    }
  },
  sizeBadge: {
    position: 'absolute', right: 10, top: 10, px: 1, py: 0.5, borderRadius: '6px', pointerEvents: 'none',
    bgcolor: 'rgba(11, 13, 16, 0.8)', color: '#f8fafc', fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
  },
  hint: { mt: 1.25, fontSize: 14, color: 'text.secondary' },
}
