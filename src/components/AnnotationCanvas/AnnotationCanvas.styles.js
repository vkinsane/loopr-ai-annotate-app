import { alpha } from '@mui/material'
import { BOX_LABEL_TEXT, CARD_RADIUS, CLEAR_OF_PANEL, COMPACT, INK_OUTLINE, ON_PHOTO, PHOTO_MAX_HEIGHT } from '../../theme.js'
import { percentRect } from '../../utils'

// Selected and draft boxes use the brand indigo. Other boxes are lime with a navy outline so they show on any paint colour.
const lineColor = (variant) => (theme) => (variant === 'other' ? theme.palette.brand.lime : theme.palette.primary.main)
const HANDLE = { hit: 44, dot: 14 }
// Wide screens: capped by the screen height, less the card's border, which sits outside the frame here.
// Compact: the full height of the card, which fills the screen.
const PHOTO_HEIGHT = `max(240px, ${PHOTO_MAX_HEIGHT} - 2px)`
// Everything drawn on the zoomed photo uses these, so it keeps its size on screen.
const unzoomed = (px) => `calc(${px}px / var(--zoom, 1))`
const UNZOOM = 'scale(calc(1 / var(--zoom, 1)))'

export const styles = {
  // One bordered card around the photo. The backdrop fills the sides of a portrait photo.
  // Compact: the card fills the screen and is a size container, so the photo is the largest of its shape that fits,
  // centred in the part above the closed panel.
  root: {
    position: 'relative', gridArea: 'photo', alignSelf: 'start', minHeight: 0,
    border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised',
    [COMPACT]: { gridArea: 'auto', alignSelf: 'stretch', display: 'grid', placeItems: 'center', containerType: 'size', ...CLEAR_OF_PANEL },
  },
  // Largest box with the photo's shape that fits: full width, capped by the height.
  frame: (ratio, moving) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', overflow: 'hidden',
    width: `min(100%, ${PHOTO_HEIGHT} * ${ratio})`, [COMPACT]: { width: `min(100%, 100cqh * ${ratio})` },
    userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none', cursor: moving ? 'grab' : 'auto',
  }),
  photo: { display: 'block', width: '100%', height: '100%', pointerEvents: 'none' },
  zoomArea: { width: '100%', height: '100%', position: 'relative' },
  // touch-action: none hands every touch on the photo to our gestures instead of scrolling or zooming the page.
  // While the hand is on, touches pass through to the zoom library.
  layer: (moving) => ({ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair', pointerEvents: moving ? 'none' : 'auto' }),
  box: (rect, size, variant) => ({
    position: 'absolute', boxSizing: 'border-box', cursor: 'move', ...percentRect(rect, size),
    border: `${unzoomed(variant === 'selected' ? 3 : 2)} ${variant === 'draft' ? 'dashed' : 'solid'}`, borderColor: lineColor(variant),
    bgcolor: (theme) => alpha(lineColor(variant)(theme), 0.14), zIndex: variant === 'other' ? 0 : 1,
    boxShadow: variant === 'other' ? (theme) => INK_OUTLINE(theme, unzoomed(1)) : 'none',
  }),
  label: (selected, below) => ({
    // The selected label starts after the corner handle's dot, so the dot stays visible.
    position: 'absolute', left: unzoomed(selected ? 10 : -2), [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    transform: UNZOOM, transformOrigin: `left ${below ? 'top' : 'bottom'}`,
    ...BOX_LABEL_TEXT,
    color: selected ? 'primary.contrastText' : 'brand.ink', bgcolor: selected ? 'primary.main' : 'brand.lime',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none',
  }),
  // A 44 px touch target, centred on the corner, around a small visible dot.
  handle: (vertical, horizontal) => ({
    position: 'absolute', width: HANDLE.hit, height: HANDLE.hit, [vertical]: 0, [horizontal]: 0,
    transform: `translate(${horizontal === 'left' ? '-50%' : '50%'}, ${vertical === 'top' ? '-50%' : '50%'}) ${UNZOOM}`,
    cursor: (vertical === 'top') === (horizontal === 'left') ? 'nwse-resize' : 'nesw-resize',
    '&::after': {
      content: '""', position: 'absolute', inset: (HANDLE.hit - HANDLE.dot) / 2, borderRadius: '50%',
      bgcolor: 'common.white', border: '2.5px solid', borderColor: 'primary.main', boxSizing: 'border-box',
    },
  }),
  sizeBadge: {
    position: 'absolute', right: 10, top: 10, px: 1, py: 0.5, borderRadius: '6px', pointerEvents: 'none',
    bgcolor: (theme) => alpha(theme.palette.brand.carbon, 0.8), color: 'brand.snow', typography: 'caption', fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // Compact: at the top, clear of the annotation panel at the bottom.
  toolbar: { position: 'absolute', left: 8, bottom: 8, [COMPACT]: { bottom: 'auto', top: 8 }, display: 'flex', gap: 0.25, p: 0.25, borderRadius: 999, ...ON_PHOTO },
  tool: (on) => ({
    width: 40, height: 40, color: on ? 'brand.ink' : 'brand.snow', bgcolor: on ? 'brand.lime' : 'transparent',
    '&:hover': { bgcolor: on ? 'brand.lime' : 'brand.carbon' }, '&.Mui-disabled': { color: 'brand.frost', opacity: 0.45 },
  }),
  // Top left (under the zoom tools on compact screens), clear of the size badge on the right.
  moveHint: {
    position: 'absolute', left: 10, top: 10, [COMPACT]: { top: 58 }, maxWidth: 'calc(100% - 150px)', px: 1, py: 0.5, borderRadius: '6px', pointerEvents: 'none',
    ...ON_PHOTO, typography: 'caption', fontWeight: 500,
  },
}
