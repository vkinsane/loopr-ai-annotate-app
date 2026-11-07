import { alpha } from '@mui/material'
import { CARD_RADIUS } from '../../theme.js'

// Selected and draft boxes use the brand indigo. Other boxes are lime with a navy outline so they show on any paint colour.
const lineColor = (variant) => (theme) => (variant === 'other' ? theme.palette.brand.lime : theme.palette.primary.main)
const HANDLE = { hit: 44, dot: 14 }
const toPercent = (value, total) => `${(value / total) * 100}%`

export const styles = {
  // Largest box with the photo's shape that fits: full width, capped by screen height.
  frame: (ratio) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop',
    width: { xs: `min(100%, 55dvh * ${ratio})`, md: `min(100%, (100dvh - 120px) * ${ratio})` },
    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
  }),
  photo: { display: 'block', width: '100%', height: '100%', pointerEvents: 'none' },
  // touch-action: none hands every touch on the photo to our gestures instead of scrolling or zooming the page.
  layer: { position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair' },
  box: (rect, size, variant) => ({
    position: 'absolute', boxSizing: 'border-box', cursor: 'move',
    left: toPercent(rect.x, size.width), top: toPercent(rect.y, size.height),
    width: toPercent(rect.width, size.width), height: toPercent(rect.height, size.height),
    border: `${variant === 'selected' ? 3 : 2}px ${variant === 'draft' ? 'dashed' : 'solid'}`, borderColor: lineColor(variant),
    bgcolor: (theme) => alpha(lineColor(variant)(theme), 0.14), zIndex: variant === 'other' ? 0 : 1,
    boxShadow: variant === 'other' ? (theme) => `0 0 0 1px ${theme.palette.brand.ink}, inset 0 0 0 1px ${theme.palette.brand.ink}` : 'none',
  }),
  label: (selected, below) => ({
    position: 'absolute', left: -2, [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    fontSize: 11, fontWeight: 600, lineHeight: '16px',
    color: selected ? 'primary.contrastText' : 'brand.ink', bgcolor: selected ? 'primary.main' : 'brand.lime',
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
        bgcolor: 'common.white', border: '2.5px solid', borderColor: 'primary.main', boxSizing: 'border-box',
      },
    }
  },
  sizeBadge: {
    position: 'absolute', right: 10, top: 10, px: 1, py: 0.5, borderRadius: '6px', pointerEvents: 'none',
    bgcolor: (theme) => alpha(theme.palette.brand.carbon, 0.8), color: 'brand.snow', typography: 'caption', fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  hint: { mt: 1.25, typography: 'body2', color: 'text.secondary' },
}
