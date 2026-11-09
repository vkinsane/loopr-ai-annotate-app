import { alpha, keyframes } from '@mui/material'
import { BOX_LABEL_TEXT, CARD_RADIUS, cornerLines, INK_OUTLINE } from '../../theme.js'

// Timeline (% of 6 s): aim 0–20, shutter flash ~20, quality pill from 30, boxes drawn at ~55 and ~67, fade out 92–100.
const LOOP = '6s infinite'
const flash = keyframes`0%, 18% { opacity: 0 } 20% { opacity: 0.85 } 27%, 100% { opacity: 0 }`
const guides = keyframes`0%, 22% { opacity: 1 } 28%, 100% { opacity: 0 }`
const pill = keyframes`0%, 28% { opacity: 0; transform: translateY(8px) } 33%, 92% { opacity: 1; transform: none } 100% { opacity: 0 }`
const drawAt = (start) => keyframes`
  0%, ${start}% { opacity: 0; transform: scale(0.6) } ${start + 6}%, 92% { opacity: 1; transform: none } 100% { opacity: 0 }`
const STEP_WINDOWS = [[0, 26], [29, 50], [53, 100]]
const CONNECTOR = 20 // px of dotted line between two step boxes

// Animations run only when the user hasn't asked for reduced motion; the static styles are the final frame.
const animate = (animation) => ({ '@media (prefers-reduced-motion: no-preference)': { animation } })

// Box positions are % of the demo photo, matching the damage in it.
const boxBase = { position: 'absolute', boxSizing: 'border-box' }
const labelBase = { position: 'absolute', px: 0.625, ...BOX_LABEL_TEXT, whiteSpace: 'nowrap' }

export const styles = {
  root: { display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 },
  frame: (theme) => ({
    // Phone and tablet: shrinks on short screens so the page still fits. The steps below keep their full width.
    width: { xs: 'min(100%, max(120px, 100dvh - 500px) * 4 / 3)', sm: 'min(100%, max(200px, 100dvh - 590px) * 4 / 3)', md: '100%' }, mx: 'auto',
    position: 'relative', aspectRatio: '4 / 3', borderRadius: CARD_RADIUS, overflow: 'hidden', bgcolor: 'brand.carbonRaised',
    boxShadow: `0 12px 32px ${alpha(theme.palette.brand.ink, 0.18)}`,
  }),
  photo: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  guides: { position: 'absolute', inset: 18, opacity: 0, ...animate(`${guides} ${LOOP}`) },
  corner: (vertical, horizontal) => ({
    position: 'absolute', [vertical]: 0, [horizontal]: 0, width: 24, height: 24, color: 'brand.snow',
    ...cornerLines(vertical, horizontal, '3px solid', 5),
  }),
  flash: { position: 'absolute', inset: 0, bgcolor: 'brand.white', opacity: 0, ...animate(`${flash} ${LOOP}`) },
  boxSelected: (theme) => ({
    ...boxBase, left: '37.5%', top: '43.3%', width: '45%', height: '35%',
    border: 3, borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.14),
    ...animate(`${drawAt(52)} ${LOOP}`),
  }),
  labelSelected: { ...labelBase, left: -3, bottom: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' },
  boxOther: (theme) => ({
    ...boxBase, left: '17.5%', top: '49.3%', width: '7%', height: '7.5%',
    border: 2, borderColor: 'brand.lime', bgcolor: alpha(theme.palette.brand.lime, 0.14),
    boxShadow: INK_OUTLINE(theme),
    ...animate(`${drawAt(64)} ${LOOP}`),
  }),
  labelOther: { ...labelBase, left: -2, top: '100%', mt: 0.25, bgcolor: 'brand.lime', color: 'brand.ink' },
  pill: {
    position: 'absolute', left: 12, bottom: 12, px: 1.25, py: 0.625, borderRadius: 999,
    typography: 'caption', fontWeight: 600, bgcolor: 'success.tint', color: 'success.dark',
    ...animate(`${pill} ${LOOP}`),
  },
  // Three boxes joined by a dotted line, like steps on a path.
  steps: { listStyle: 'none', m: 0, p: 0, display: 'flex', gap: `${CONNECTOR}px` },
  step: (index) => (theme) => {
    const on = { bg: theme.palette.brand.tint, color: theme.palette.primary.dark, border: theme.palette.primary.main }
    const off = { bg: theme.palette.background.paper, color: theme.palette.text.secondary, border: theme.palette.divider }
    const current = index === STEP_WINDOWS.length - 1 ? on : off
    const [from, to] = STEP_WINDOWS[index]
    // Highlighted during its window, with a 2% fade either side. `on` is listed last so it wins at 0% and 100%.
    const highlight = keyframes`
      0%, ${Math.max(from - 2, 0)}%, ${Math.min(to + 2, 100)}%, 100% { background: ${off.bg}; color: ${off.color}; border-color: ${off.border} }
      ${from}%, ${to}% { background: ${on.bg}; color: ${on.color}; border-color: ${on.border} }`
    return {
      position: 'relative', flex: 1, textAlign: 'center', borderRadius: 1, py: 0.75,
      fontFamily: theme.typography.h2.fontFamily, fontSize: 13, fontWeight: 600,
      border: '1.5px solid', bgcolor: current.bg, color: current.color, borderColor: current.border,
      '&:not(:last-of-type)::after': {
        content: '""', position: 'absolute', top: '50%', left: '100%', width: CONNECTOR, ml: '1.5px',
        borderTop: `2px dotted ${theme.palette.primary.light}`,
      },
      ...animate(`${highlight} ${LOOP}`),
    }
  },
  stepNumber: (theme) => ({
    display: 'inline-block', width: 18, height: 18, lineHeight: '18px', borderRadius: 999, mr: 0.75, fontSize: 11,
    bgcolor: alpha(theme.palette.brand.ink, 0.08),
  }),
}
