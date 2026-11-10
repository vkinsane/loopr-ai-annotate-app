import { ON_PHOTO } from '../../theme.js'

const LINE_PX = 120
const MARK_PX = 20
const GAP_PX = 8

const color = (level) => (level ? 'brand.lime' : 'common.white')

export const styles = {
  root: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none' },
  line: (level) => ({
    position: 'absolute', left: -LINE_PX / 2, top: -1, width: LINE_PX, height: 2, borderRadius: 1, bgcolor: color(level),
    boxShadow: (theme) => `0 0 4px ${theme.palette.brand.scrim}`,
  }),
  // Fixed marks either side of the line: when the line lines up with them, the phone is level.
  mark: (side, level) => ({
    position: 'absolute', left: side === 'left' ? -(LINE_PX / 2 + GAP_PX + MARK_PX) : LINE_PX / 2 + GAP_PX, top: -1,
    width: MARK_PX, height: 2, bgcolor: color(level),
  }),
  text: (level) => ({
    position: 'absolute', top: 12, left: 0, transform: 'translateX(-50%)', px: 1, py: 0.25, borderRadius: 999, whiteSpace: 'nowrap',
    ...ON_PHOTO, color: color(level), typography: 'caption', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
  }),
}
