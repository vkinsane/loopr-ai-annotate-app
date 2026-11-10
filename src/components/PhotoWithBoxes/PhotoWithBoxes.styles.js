import { alpha } from '@mui/material'
import { BOX_LABEL_TEXT, CARD_RADIUS, COMPACT, INK_OUTLINE, PHOTO_MAX_HEIGHT } from '../../theme.js'
import { percentRect } from '../../utils'

export const styles = {
  frame: (ratio) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', alignSelf: 'start', width: `min(100%, ${PHOTO_MAX_HEIGHT} * ${ratio})`,
    overflow: 'hidden', bgcolor: 'brand.carbonRaised', border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS,
    // Compact: the card is the area around the photo (see SummaryScreen), as on Preview and Annotate.
    [COMPACT]: { alignSelf: 'center', width: `min(100%, 100cqh * ${ratio})`, border: 0, borderRadius: 0 },
  }),
  photo: { display: 'block', width: '100%', height: '100%' },
  box: (rect, size) => ({
    position: 'absolute', boxSizing: 'border-box', ...percentRect(rect, size),
    border: 2, borderColor: 'brand.lime', bgcolor: (theme) => alpha(theme.palette.brand.lime, 0.14),
    boxShadow: (theme) => INK_OUTLINE(theme),
  }),
  label: (below) => ({
    position: 'absolute', left: -2, [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    ...BOX_LABEL_TEXT, color: 'brand.ink', bgcolor: 'brand.lime',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }),
}
