import { alpha } from '@mui/material'
import { CARD_RADIUS } from '../../theme.js'

const toPercent = (value, total) => `${(value / total) * 100}%`

export const styles = {
  frame: (ratio) => ({
    position: 'relative', aspectRatio: String(ratio), mx: 'auto', alignSelf: 'start',
    width: { xs: `min(100%, max(100px, min(36dvh, 100dvh - 450px)) * ${ratio})`, sm: `min(100%, 36dvh * ${ratio})`, md: `min(100%, (100dvh - 90px) * ${ratio})` },
    borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.photoBackdrop',
  }),
  photo: { display: 'block', width: '100%', height: '100%' },
  box: (rect, size) => ({
    position: 'absolute', boxSizing: 'border-box',
    left: toPercent(rect.x, size.width), top: toPercent(rect.y, size.height),
    width: toPercent(rect.width, size.width), height: toPercent(rect.height, size.height),
    border: 2, borderColor: 'brand.lime', bgcolor: (theme) => alpha(theme.palette.brand.lime, 0.14),
    boxShadow: (theme) => `0 0 0 1px ${theme.palette.brand.ink}, inset 0 0 0 1px ${theme.palette.brand.ink}`,
  }),
  label: (below) => ({
    position: 'absolute', left: -2, [below ? 'top' : 'bottom']: '100%', px: 0.5, maxWidth: 160,
    fontSize: 11, fontWeight: 600, lineHeight: '16px', color: 'brand.ink', bgcolor: 'brand.lime',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }),
}
