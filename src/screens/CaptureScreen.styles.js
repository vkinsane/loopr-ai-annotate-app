import { CARD_RADIUS, cornerLines, NARROW_QUERY, ON_PHOTO_BUTTON, SHORT_QUERY, TOUCH_QUERY } from '../theme.js'

const LANDSCAPE = '@media (orientation: landscape)'
// Phones and tablets held upright: the camera view fills the screen, and the top bar and controls sit over it.
const PHONE = `@media (orientation: portrait) and ${NARROW_QUERY}, (orientation: portrait) and ${TOUCH_QUERY}`
// Phones and tablets held sideways: the whole view, as tall as the screen, with the top bar and the controls column over it.
// Not cropped to fill the width: a 4:3 view on a wide screen would lose more than a third.
const SIDEWAYS = `@media (orientation: landscape) and ${SHORT_QUERY}, (orientation: landscape) and ${TOUCH_QUERY}`
const CONTROLS_PX = 180
const GUIDE = { size: 32, inset: 24, line: '3px solid' }
// On phones the guides frame the part of the view that the top bar and controls don't cover.
const PHONE_GUIDE_INSET = { top: 84, bottom: 216 }
const SIDEWAYS_GUIDE_TOP = 72
const EXTRA_ROW_PX = 64 // an exposure or level row plus the gap above it
const fade = (direction) => ({ backgroundImage: (theme) => `linear-gradient(${direction}, ${theme.palette.brand.scrim}, transparent)` })

export const styles = {
  root: {
    position: 'relative', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    bgcolor: 'background.default', color: 'text.primary',
    [LANDSCAPE]: { flexDirection: 'row' },
  },
  main: {
    flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column',
    [PHONE]: { position: 'absolute', inset: 0 }, [SIDEWAYS]: { position: 'absolute', inset: 0 },
  },
  topBar: {
    display: 'flex', alignItems: 'flex-start',
    [PHONE]: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, ...fade('to bottom') },
    [SIDEWAYS]: { position: 'absolute', top: 0, left: 0, right: CONTROLS_PX, zIndex: 1, ...fade('to bottom') },
  },
  // Above the "Starting camera" overlay, so the user can leave if the camera never opens.
  back: { position: 'relative', zIndex: 1, mt: 1.25, ml: 1 },
  // Size container: the frame is the largest box with the camera's aspect ratio, so what you see is what gets captured.
  viewport: { flex: 1, minHeight: 0, mx: 2, containerType: 'size', display: 'grid', placeItems: 'center', [PHONE]: { mx: 0 }, [SIDEWAYS]: { mx: 0 } },
  // Hidden until live: the real aspect ratio is only known then, and a visible resize would shift the layout.
  frame: (aspectRatio, live) => ({
    visibility: live ? 'visible' : 'hidden', position: 'relative', aspectRatio: String(aspectRatio), width: `min(100cqw, 100cqh * ${aspectRatio})`,
    borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'background.paper',
    // The view is cropped to the screen's shape, so the photo shows a little more at the sides than the screen.
    [PHONE]: { width: '100%', height: '100%', aspectRatio: 'auto', borderRadius: 0, '& video': { objectFit: 'cover' } },
    [SIDEWAYS]: { borderRadius: 0 },
  }),
  video: { display: 'block', width: '100%', height: '100%' },
  // Rule of thirds: two lines each way.
  gridLines: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    '&::before, &::after': { content: '""', position: 'absolute', borderStyle: 'solid', borderWidth: 0, borderColor: 'brand.gridLine' },
    '&::before': { top: 0, bottom: 0, left: '33.333%', right: '33.333%', borderLeftWidth: 1, borderRightWidth: 1 },
    '&::after': { left: 0, right: 0, top: '33.333%', bottom: '33.333%', borderTopWidth: 1, borderBottomWidth: 1 },
  },
  guide: (vertical, horizontal, extraRows) => ({
    position: 'absolute', [vertical]: GUIDE.inset, [horizontal]: GUIDE.inset, width: GUIDE.size, height: GUIDE.size,
    ...cornerLines(vertical, horizontal, GUIDE.line, 6), color: 'common.white',
    [PHONE]: { [vertical]: PHONE_GUIDE_INSET[vertical] + (vertical === 'bottom' ? extraRows * EXTRA_ROW_PX : 0) },
    [SIDEWAYS]: vertical === 'top' ? { top: SIDEWAYS_GUIDE_TOP } : {},
  }),
  saving: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 1.5, bgcolor: 'brand.scrim', color: 'common.white', typography: 'subtitle1',
  },
  // The exposure and level rows are only there when they show something, so no gap is left without them.
  controls: ({ exposure, level }) => ({
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    gridTemplateAreas: [...['hint', exposure && 'exposure', level && 'level'].filter(Boolean).map((area) => `"${area} ${area} ${area}"`), '"gallery shutter torch"'].join(' '),
    alignItems: 'center', justifyItems: 'center', gap: 2.5, px: 2, pt: 2.5, pb: 4.5,
    [LANDSCAPE]: {
      width: CONTROLS_PX, gridTemplateColumns: 'auto', alignContent: 'center', p: 2,
      gridTemplateAreas: ['torch', 'shutter', 'gallery', exposure && 'exposure', level && 'level', 'hint'].filter(Boolean).map((area) => `"${area}"`).join(' '),
    },
    [PHONE]: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, pt: 6, ...fade('to top') },
    [SIDEWAYS]: { position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 1, ...fade('to left') },
  }),
  // Two lines are always reserved, so a longer hint doesn't move the shutter.
  hint: (warn) => ({
    gridArea: 'hint', minHeight: '2.9em', display: 'flex', alignItems: 'center', typography: 'body2', textAlign: 'center',
    color: warn ? 'warning.light' : 'text.secondary',
    [PHONE]: { color: warn ? 'warning.light' : 'common.white' }, [SIDEWAYS]: { color: warn ? 'warning.light' : 'common.white' },
  }),
  shutter: {
    gridArea: 'shutter', width: 76, height: 76, p: 0.5,
    borderRadius: '50%', border: 4, borderColor: 'common.white', '&.Mui-disabled': { opacity: 0.4 },
  },
  exposure: { gridArea: 'exposure' },
  level: { gridArea: 'level' },
  gallery: { gridArea: 'gallery' },
  // The gallery button matches the torch button on the other side of the shutter.
  round: { width: 52, height: 52, color: 'text.primary', bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.focus' } },
  levelButton: {
    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', minHeight: 44, px: 1.5, borderRadius: 999,
    ...ON_PHOTO_BUTTON,
  },
  shutterFill: { width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'common.white' },
  torch: (on) => ({
    gridArea: 'torch', width: 52, height: 52,
    color: on ? 'primary.contrastText' : 'text.primary', bgcolor: on ? 'primary.main' : 'action.selected',
    '&:hover': { bgcolor: on ? 'primary.dark' : 'action.focus' },
  }),
  torchSlot: { gridArea: 'torch' },
  overlay: {
    position: 'fixed', inset: 0, bgcolor: 'background.default', p: 4,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, textAlign: 'center',
  },
  title: { typography: 'h1' },
  overlayText: { color: 'text.secondary', maxWidth: 280 },
}
