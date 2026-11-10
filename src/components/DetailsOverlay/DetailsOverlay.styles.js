import { alpha } from '@mui/material'
import { CARD_RADIUS, OVERLAY, SIDEWAYS } from '../../theme.js'

// The panel and buttons sit inside the photo card, so their corners follow its curve: card radius minus the inset.
const RADIUS = `calc(${CARD_RADIUS} - ${OVERLAY.inset}px)`
const ROW_PX = OVERLAY.row
const MAX_WIDTH = 560 // tablets: a readable width, centred, instead of the whole screen
// Sideways: the panel and buttons fill the side, so the details may use all the height above the buttons:
// the screen less its header (57), the page padding (32), the insets and card border (18), the buttons and gap (56),
// and the panel's header row (49).
const SIDE_BODY_HEIGHT = 'calc(100dvh - 212px)'

export const styles = {
  root: {
    position: 'absolute', left: OVERLAY.inset, right: OVERLAY.inset, bottom: OVERLAY.inset, zIndex: 2, maxWidth: MAX_WIDTH, mx: 'auto',
    display: 'flex', flexDirection: 'column', gap: `${OVERLAY.gap}px`,
    [SIDEWAYS]: { top: OVERLAY.inset, left: 'auto', width: OVERLAY.sideWidth, maxWidth: 'none', mx: 0, justifyContent: 'space-between' },
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
  // Long details scroll inside the panel, so it never covers more than about half the photo.
  // Top padding: the scrolling edge would otherwise clip the floating label of a text field.
  // Only the panel scrolls: iPhone Safari can leave a list that scrolls inside a blurred panel unpainted.
  // Lists and sections take their content's height here; one set to share spare height would get none.
  body: {
    position: 'relative', px: 1.5, pt: 1, pb: 1.5, maxHeight: '45dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5,
    '& section, & ul': { flex: 'none', overflowY: 'visible' },
    [SIDEWAYS]: { maxHeight: SIDE_BODY_HEIGHT },
  },
  // Outlined buttons get a solid fill, so they read over any photo.
  // As tall as the panel's header row, so the two read as one stack. Two classes, so this beats the theme's large-button height.
  actions: { display: 'flex', gap: 1, '& > .MuiButton-root': { flex: 1, height: ROW_PX, borderRadius: RADIUS }, '& .MuiButton-outlined': { bgcolor: 'background.paper' } },
}
