import { alpha, keyframes } from '@mui/material'

// One loop drags from START to END (% of the photo). Two loops, then the hint fades out.
const LOOP_S = 2.4
const LOOPS = 2
const START = { left: 28, top: 30 }
const END = { left: 72, top: 66 }
const SIZE = { width: END.left - START.left, height: END.top - START.top }

const grow = keyframes`
  0%, 12% { width: 0; height: 0; opacity: 0 } 15% { opacity: 1 } 65%, 88% { width: ${SIZE.width}%; height: ${SIZE.height}%; opacity: 1 } 100% { opacity: 0 }`
const drag = keyframes`
  0% { left: ${START.left}%; top: ${START.top}%; opacity: 0; transform: translate(-50%, -50%) scale(1.4) }
  12% { left: ${START.left}%; top: ${START.top}%; opacity: 1; transform: translate(-50%, -50%) scale(1) }
  65%, 80% { left: ${END.left}%; top: ${END.top}%; opacity: 1; transform: translate(-50%, -50%) scale(1) }
  92%, 100% { left: ${END.left}%; top: ${END.top}%; opacity: 0; transform: translate(-50%, -50%) scale(1.4) }`
const fadeOut = keyframes`to { opacity: 0; visibility: hidden }`

// Without motion the hint is the drawn box with the finger at its corner, until the first box is drawn.
const animate = (animation) => ({ '@media (prefers-reduced-motion: no-preference)': { animation } })
const loop = (frames) => animate(`${frames} ${LOOP_S}s ease-in-out ${LOOPS} both`)

export const styles = {
  root: {
    display: 'none', position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
    '@media (pointer: coarse)': { display: 'block' },
    ...animate(`${fadeOut} 0.3s ${LOOP_S * LOOPS}s forwards`),
  },
  box: {
    position: 'absolute', left: `${START.left}%`, top: `${START.top}%`, width: `${SIZE.width}%`, height: `${SIZE.height}%`,
    border: 2, borderStyle: 'dashed', borderColor: 'brand.lime', bgcolor: (theme) => alpha(theme.palette.brand.lime, 0.14),
    ...loop(grow),
  },
  finger: {
    position: 'absolute', left: `${END.left}%`, top: `${END.top}%`, transform: 'translate(-50%, -50%)', width: 36, height: 36,
    borderRadius: '50%', border: 2, borderColor: 'common.white', bgcolor: (theme) => alpha(theme.palette.common.white, 0.45),
    boxShadow: (theme) => `0 2px 8px ${theme.palette.brand.scrim}`,
    ...loop(drag),
  },
  // Just under the drawn box, clear of the tools and badge at the edges and the phone panel at the bottom.
  caption: {
    position: 'absolute', left: '50%', top: `${END.top + 5}%`, transform: 'translateX(-50%)', px: 1.5, py: 0.75, borderRadius: 999,
    whiteSpace: 'nowrap', bgcolor: 'brand.scrim', color: 'brand.snow', typography: 'caption', fontWeight: 600,
  },
}
