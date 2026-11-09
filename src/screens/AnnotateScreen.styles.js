import { SCREEN_BODY, TABLE_HEADER } from '../theme.js'

const MAX_WIDTH = 1200

// The screen is exactly one window tall: the photo shrinks to fit and the annotation list scrolls inside.
// Phone: one column, Done at the bottom. Tablet: same column, quality as a 2 × 2 grid.
// Desktop: photo on the left; list, quality and Done in a 370 px sidebar whose bottom lines up with the photo's.
export const styles = {
  root: {
    ...SCREEN_BODY, maxWidth: MAX_WIDTH, p: 2, pb: { xs: 0, md: 2 }, display: 'grid', gap: 2,
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 370px' },
    // max-content: the photo card clips its overflow, so an `auto` row could collapse and let the sidebar overlap it.
    // The minimums stop the sidebar being squeezed on very short screens: the screen scrolls instead of overlapping.
    gridTemplateRows: { xs: 'max-content minmax(201px, 1fr)', sm: 'max-content minmax(381px, 1fr)', md: 'max-content' }, alignContent: { md: 'start' },
    gridTemplateAreas: { md: '"photo side"' },
  },
  headerWidth: { maxWidth: MAX_WIDTH },
  qualityPill: { display: { xs: 'none', sm: 'block' } },
  newPhoto: { flexShrink: 0, ml: 1 },
  // Desktop: height 0 + min-height 100% means the photo alone sets the row height; a long list scrolls instead of growing it.
  sidebar: { display: 'flex', flexDirection: 'column', gap: 2, minHeight: { xs: 0, md: '100%' }, height: { md: 0 }, gridArea: { md: 'side' } },
  quality: { display: { xs: 'none', sm: 'block' }, flexShrink: 0 },
  // Desktop: joined to the list below, like a table header. Tablet: a strip above the 2 × 2 tiles.
  qualityTitle: { ...TABLE_HEADER, borderBottomStyle: { xs: 'solid', md: 'none' }, borderBottomWidth: { xs: '1px', md: 0 }, borderRadius: { xs: 1, md: TABLE_HEADER.borderRadius }, mb: { xs: 1.25, md: 0 } },
  doneBar: {
    flexShrink: 0, mt: 'auto', mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, pt: { xs: 1.5, md: 0 }, pb: { xs: 3, md: 0 },
    borderTop: { xs: 1, md: 0 }, borderColor: { xs: 'divider' },
  },
}
