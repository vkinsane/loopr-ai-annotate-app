import { alpha } from '@mui/material'
import { BOX_LABEL_TEXT, CARD_RADIUS, fitPhotoWidth, INK_OUTLINE } from '../../theme.js'
import { percentRect } from '../../utils'

const PHOTO_HEIGHT = { xs: 'max(60px, min(42dvh, 100dvh - 520px))', sm: '36dvh', md: 'calc(100dvh - 90px)' }

export const styles = {
  frame: (ratio) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', alignSelf: 'start', width: fitPhotoWidth(PHOTO_HEIGHT, ratio),
    border: 1, borderColor: 'divider', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised',
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
