import { alpha } from '@mui/material'
import { CARD_RADIUS } from '../../theme.js'

// Selected and draft boxes use the brand indigo. Other boxes are lime with a navy outline so they show on any paint colour.
const lineColor = (variant) => (theme) => (variant === 'other' ? theme.palette.brand.lime : theme.palette.primary.main)
const HANDLE = { hit: 44, dot: 14 }
const toPercent = (value, total) => `${(value / total) * 100}%`
// Everything drawn on the zoomed photo uses these, so it keeps its size on screen.
const unzoomed = (px) => `calc(${px}px / var(--zoom, 1))`
const UNZOOM = 'scale(calc(1 / var(--zoom, 1)))'

export const styles = {
  // Desktop: the frame and hint join the screen's grid (areas "photo" and "hint"), so a sidebar can end where the photo ends.
  root: { display: { md: 'contents' } },
  // Largest box with the photo's shape that fits: full width, capped by screen height.
  frame: (ratio, moving) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', gridArea: { md: 'photo' }, alignSelf: 'start', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop',
    width: { xs: `min(100%, max(100px, min(50dvh, 100dvh - 360px)) * ${ratio})`, sm: `min(100%, 50dvh * ${ratio})`, md: `min(100%, (100dvh - 140px) * ${ratio})` },
    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none', cursor: moving ? 'grab' : 'auto',
  }),
  photo: { display: 'block', width: '100%', height: '100%', pointerEvents: 'none' },
  zoomArea: { width: '100%', height: '100%', position: 'relative' },
  // touch-action: none hands every touch on the photo to our gestures instead of scrolling or zooming the page.
  // While the hand is on, touches pass through to the zoom library.
  layer: (moving) => ({ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair', pointerEvents: moving ? 'none' : 'auto' }),
  box: (rect, size, variant) => ({
    position: 'absolute', boxSizing: 'border-box', cursor: 'move',
    left: toPercent(rect.x, size.width), top: toPercent(rect.y, size.height),
    width: toPercent(rect.width, size.width), height: toPercent(rect.height, size.height),
    border: `${unzoomed(variant === 'selected' ? 3 : 2)} ${variant === 'draft' ? 'dashed' : 'solid'}`, borderColor: lineColor(variant),
    bgcolor: (theme) => alpha(lineColor(variant)(theme), 0.14), zIndex: variant === 'other' ? 0 : 1,
    boxShadow: variant === 'other' ? (theme) => `0 0 0 ${unzoomed(1)} ${theme.palette.brand.ink}, inset 0 0 0 ${unzoomed(1)} ${theme.palette.brand.ink}` : 'none',
  }),
  label: (selected, below) => ({
    // The selected label starts after the corner handle's dot, so the dot stays visible.
    position: 'absolute', left: unzoomed(selected ? 10 : -2), [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    transform: UNZOOM, transformOrigin: `left ${below ? 'top' : 'bottom'}`,
    fontSize: 11, fontWeight: 600, lineHeight: '16px',
    color: selected ? 'primary.contrastText' : 'brand.ink', bgcolor: selected ? 'primary.main' : 'brand.lime',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none',
  }),
  // A 44 px touch target, centred on the corner, around a small visible dot.
  handle: (corner) => {
    const [vertical, horizontal] = corner.split('-')
    return {
      position: 'absolute', width: HANDLE.hit, height: HANDLE.hit, [vertical]: 0, [horizontal]: 0,
      transform: `translate(${horizontal === 'left' ? '-50%' : '50%'}, ${vertical === 'top' ? '-50%' : '50%'}) ${UNZOOM}`,
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
  toolbar: { position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 0.25, p: 0.25, borderRadius: 999, bgcolor: 'brand.scrim' },
  tool: (on) => ({
    width: 40, height: 40, color: on ? 'brand.ink' : 'brand.snow', bgcolor: on ? 'brand.lime' : 'transparent',
    '&:hover': { bgcolor: on ? 'brand.lime' : 'brand.carbon' }, '&.Mui-disabled': { color: 'brand.frost', opacity: 0.45 },
  }),
  hint: { mt: { xs: 1.25, md: 0 }, gridArea: { md: 'hint' }, typography: 'body2', color: 'text.secondary' },
}
