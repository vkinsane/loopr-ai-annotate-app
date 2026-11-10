import { alpha } from '@mui/material'
import { CARD_RADIUS, OVERLAY } from '../../theme.js'

// The panel and buttons sit inside the photo card, so their corners follow its curve: card radius minus the inset.
const RADIUS = `calc(${CARD_RADIUS} - ${OVERLAY.inset}px)`
const ROW_PX = OVERLAY.row
const MAX_WIDTH = 560 // tablets and phones held sideways: a readable width, centred, instead of the whole screen

export const styles = {
  root: {
    position: 'absolute', left: OVERLAY.inset, right: OVERLAY.inset, bottom: OVERLAY.inset, zIndex: 2, maxWidth: MAX_WIDTH, mx: 'auto',
    display: 'flex', flexDirection: 'column', gap: `${OVERLAY.gap}px`,
  },
  // Frosted glass, like the iPhone camera: the photo shows through, blurred, so the text stays readable.
  panel: {
    borderRadius: RADIUS, overflow: 'hidden', color: 'text.primary',
    bgcolor: (theme) => alpha(theme.palette.grey[100], 0.6), backdropFilter: 'blur(20px) saturate(180%)',
  },
  // The line under the header shows only while open. Transparent when closed, so the header keeps its height.
  header: (open) => ({
    width: '100%', minHeight: ROW_PX, px: 1.5, display: 'flex', justifyContent: 'space-between', gap: 1, textAlign: 'left',
    borderBottom: 1, borderColor: open ? 'divider' : 'transparent', transition: (theme) => theme.transitions.create('border-color'),
  }),
  title: { minWidth: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, typography: 'subtitle2' },
  // At most about half the photo. An annotation list shrinks and scrolls in its own box, so the rest stays in view;
  // other content keeps its height, and the panel itself scrolls only if that alone is too tall.
  // Top padding as wide as the sides; a text field's floating label adds its own (see SummaryScreen).
  body: {
    position: 'relative', px: 1.5, pt: 1.5, pb: 1.5, maxHeight: '45dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5,
    '& > *': { flexShrink: 0 },
    '& > section': { flex: '0 1 auto', minHeight: 0 },
    '& > section > ul': { flex: '0 1 auto' },
  },
  // Outlined buttons get a solid fill, so they read over any photo.
  // As tall as the panel's header row, so the two read as one stack. Two classes, so this beats the theme's large-button height.
  actions: { display: 'flex', gap: 1, '& > .MuiButton-root': { flex: 1, height: ROW_PX, borderRadius: RADIUS }, '& .MuiButton-outlined': { bgcolor: 'background.paper' } },
}
