import { COMPACT, COMPACT_PAGE_PADDING, SCREEN_BODY, TABLE_HEADER } from '../theme.js'

const MAX_WIDTH = 1200

// The screen is exactly one window tall: the photo shrinks to fit and the annotation list scrolls inside.
// Compact: the photo fills the screen; the list and Done are on a panel over it.
// Wide: photo on the left; list, quality and Done in a 370 px sidebar whose bottom lines up with the photo's.
export const styles = {
  root: {
    ...SCREEN_BODY, maxWidth: MAX_WIDTH, p: 2, display: 'grid', gap: 2,
    // max-content: the photo card clips its overflow, so an `auto` row could collapse and let the sidebar overlap it.
    gridTemplateColumns: 'minmax(0, 1fr) 370px', gridTemplateRows: 'max-content', alignContent: 'start', gridTemplateAreas: '"photo side"',
    [COMPACT]: { gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)', alignContent: 'stretch', gridTemplateAreas: 'none', ...COMPACT_PAGE_PADDING },
  },
  headerWidth: { maxWidth: MAX_WIDTH },
  qualityPill: { display: { xs: 'none', sm: 'block' } },
  newPhoto: { flexShrink: 0, ml: 1 },
  // Height 0 + min-height 100% means the photo alone sets the row height; a long list scrolls instead of growing it.
  sidebar: { display: 'flex', flexDirection: 'column', gap: 2, minHeight: '100%', height: 0, gridArea: 'side' },
  quality: { flexShrink: 0 },
  // Joined to the list below, like a table header.
  qualityTitle: { ...TABLE_HEADER, borderBottomStyle: 'none', borderBottomWidth: 0 },
  doneBar: { flexShrink: 0, mt: 'auto' },
}
