import { CARD_RADIUS } from '../theme.js'

const LANDSCAPE = '@media (orientation: landscape)'
const GUIDE = { size: 32, inset: 24, line: '3px solid' }
const capitalize = (word) => word[0].toUpperCase() + word.slice(1)

export const styles = {
  root: {
    height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    bgcolor: 'background.default', color: 'text.primary',
    [LANDSCAPE]: { flexDirection: 'row' },
  },
  main: { flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'flex-start' },
  // Above the "Starting camera" overlay, so the user can leave if the camera never opens.
  back: { position: 'relative', zIndex: 1, flexShrink: 0, width: 44, height: 44, mt: 1.25, ml: 1, color: 'text.primary' },
  // Size container: the frame is the largest box with the camera's aspect ratio, so what you see is what gets captured.
  viewport: { flex: 1, minHeight: 0, mx: 2, containerType: 'size', display: 'grid', placeItems: 'center' },
  // Hidden until live: the real aspect ratio is only known then, and a visible resize would shift the layout.
  frame: (aspectRatio, live) => ({
    visibility: live ? 'visible' : 'hidden', position: 'relative', aspectRatio: String(aspectRatio), width: `min(100cqw, 100cqh * ${aspectRatio})`,
    borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'background.paper',
  }),
  video: { display: 'block', width: '100%', height: '100%' },
  guide: (vertical, horizontal) => ({
    position: 'absolute', [vertical]: GUIDE.inset, [horizontal]: GUIDE.inset, width: GUIDE.size, height: GUIDE.size,
    [`border${capitalize(vertical)}`]: GUIDE.line, [`border${capitalize(horizontal)}`]: GUIDE.line,
    [`border${capitalize(vertical)}${capitalize(horizontal)}Radius`]: 6, color: 'common.white',
  }),
  saving: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 1.5, bgcolor: 'brand.scrim', color: 'common.white', typography: 'subtitle1',
  },
  controls: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr', gridTemplateAreas: '"hint hint hint" ". shutter torch"',
    alignItems: 'center', justifyItems: 'center', gap: 2.5, px: 2, pt: 2.5, pb: 4.5,
    [LANDSCAPE]: {
      width: 140, gridTemplateColumns: 'auto', gridTemplateAreas: '"torch" "shutter" "hint"', alignContent: 'center', p: 2,
    },
  },
  // Two lines are always reserved, so a longer hint doesn't move the shutter.
  hint: (warn) => ({ gridArea: 'hint', minHeight: '2.9em', display: 'flex', alignItems: 'center', typography: 'body2', textAlign: 'center', color: warn ? 'warning.light' : 'text.secondary' }),
  shutter: {
    gridArea: 'shutter', width: 76, height: 76, p: 0.5,
    borderRadius: '50%', border: 4, borderColor: 'common.white', '&.Mui-disabled': { opacity: 0.4 },
  },
  shutterFill: { width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'common.white' },
  torch: (on) => ({
    gridArea: 'torch', width: 52, height: 52,
    color: on ? 'primary.contrastText' : 'text.primary', bgcolor: on ? 'primary.main' : 'action.selected',
    '&:hover': { bgcolor: on ? 'primary.dark' : 'action.focus' },
  }),
  overlay: {
    position: 'fixed', inset: 0, bgcolor: 'background.default', p: 4,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, textAlign: 'center',
  },
  title: { typography: 'h1' },
  overlayText: { color: 'text.secondary', maxWidth: 280 },
}
