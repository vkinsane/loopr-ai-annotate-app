import { alpha, createTheme } from '@mui/material'

// Brand palette follows loopr.ai's public site (indigo, carbon, lime). Every text pair passes WCAG AA.
const BRAND = {
  indigo: '#3c4fc9', indigoDark: '#303fa0', indigoLight: '#7683d9',
  ink: '#09123d', slate: '#4a5870', mist: '#f4f6fb', border: '#dde4ed', tint: '#ebedf9',
  carbon: '#05091c', carbonRaised: '#12173c', carbonBorder: '#252c4c', frost: '#c7d2ff',
  lime: '#cefe6f', limeDark: '#a8d94a', white: '#ffffff', snow: '#f8fafc', scrim: 'rgba(5, 9, 28, 0.55)',
}
const HEADING_FONT = "'Outfit', system-ui, sans-serif"

// Shared by both themes. `tint` is a pale background for status pills; `light` is for status text on dark.
const status = {
  success: { main: '#15803d', dark: '#166534', light: '#4ade80', tint: '#dcfce7' },
  warning: { main: '#b45309', dark: '#92400e', light: '#fbbf24', tint: '#fef3c7' },
  error: { main: '#b91c1c', dark: '#991b1b', light: '#f87171', tint: '#fee2e2' },
}

const heading = (fontSize, fontWeight = 600) => ({ fontFamily: HEADING_FONT, fontSize, fontWeight, lineHeight: 1.25 })

const shared = {
  // MUI's default 8px spacing unit; 0.5 steps give the 4-pt scale (sx p: 0.5 = 4px, p: 2 = 16px).
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    h1: { ...heading(22), letterSpacing: '-0.01em' },
    h2: heading(17),
    subtitle1: heading(16),
    body1: { fontSize: 15, lineHeight: 1.5 },
    body2: { fontSize: 14, lineHeight: 1.45 },
    caption: { fontSize: 13, lineHeight: 1.4 },
    overline: { ...heading(12), letterSpacing: '0.08em', lineHeight: 1.5 },
    button: { ...heading(16), textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        sizeLarge: { height: 52 },
        // Loopr's buttons sit on a slightly darker bottom edge.
        containedPrimary: ({ theme }) => ({ boxShadow: `inset 0 -2px 0 ${theme.palette.primary.dark}` }),
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({ '&.Mui-focusVisible': { outline: `3px solid ${theme.palette.primary.light}`, outlineOffset: 2 } }),
      },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiAlertTitle: { styleOverrides: { root: heading(16) } },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        '@media (prefers-reduced-motion: reduce)': { '*, *::before, *::after': { transitionDuration: '0.01ms !important' } },
        '@media (prefers-reduced-motion: no-preference)': {
          '*': { scrollBehavior: 'smooth' },
          // A new screen fades in. Only opacity changes, so nothing shifts.
          '#root > *': { animation: 'screen-in 180ms ease-out' },
        },
        '@keyframes screen-in': { from: { opacity: 0 } },
        // Always-visible scrollbars: browsers that hide them by default show these whenever an area can scroll.
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-track': { background: theme.palette.brand.tint },
        '*::-webkit-scrollbar-thumb': { background: theme.palette.primary.light, borderRadius: 4 },
        '@supports not selector(::-webkit-scrollbar)': { '*': { scrollbarWidth: 'thin', scrollbarColor: `${theme.palette.primary.light} ${theme.palette.brand.tint}` } },
      }),
    },
  },
}

export const theme = createTheme({
  ...shared,
  palette: {
    ...status,
    primary: { main: BRAND.indigo, dark: BRAND.indigoDark, light: BRAND.indigoLight, contrastText: BRAND.white },
    background: { default: BRAND.mist, paper: BRAND.white },
    text: { primary: BRAND.ink, secondary: BRAND.slate },
    divider: BRAND.border,
    // Lighter than MUI's grey so a disabled button reads as "not yet", not as broken. Text still passes AA.
    action: { disabledBackground: '#e9edf5', disabled: '#6b7b92' },
    brand: { ...BRAND, photoBackdrop: BRAND.carbonRaised },
  },
})

// Capture and camera errors: carbon like loopr.ai's dark sections, lime as the action colour.
export const cameraTheme = createTheme({
  ...shared,
  palette: {
    ...status,
    mode: 'dark',
    primary: { main: BRAND.lime, dark: BRAND.limeDark, light: BRAND.white, contrastText: BRAND.ink },
    background: { default: BRAND.carbon, paper: BRAND.carbonRaised },
    text: { primary: BRAND.snow, secondary: BRAND.frost },
    divider: BRAND.carbonBorder,
    brand: BRAND,
  },
})

/** Photo frames, panels, alerts and empty states. Buttons and inputs use theme.shape.borderRadius (6px). */
export const CARD_RADIUS = '16px'

/**
 * For scrolling lists. A soft shadow shows at any edge with more content, so it also works where scrollbars stay hidden (iOS).
 * The two "local" layers scroll with the content and cover the shadows once an end is reached.
 */
export const SCROLL_SHADOWS = (theme) => {
  const paper = theme.palette.background.paper
  const shade = alpha(theme.palette.brand.ink, 0.18)
  return {
    background: `linear-gradient(${paper} 30%, transparent) top / 100% 28px local no-repeat,
      linear-gradient(transparent, ${paper} 70%) bottom / 100% 28px local no-repeat,
      linear-gradient(${shade}, transparent) top / 100% 10px scroll no-repeat,
      linear-gradient(transparent, ${shade}) bottom / 100% 10px scroll no-repeat,
      ${paper}`,
    overflowY: 'scroll', // the scrollbar's track is always there, so rows don't narrow when the list gets long
  }
}

// Strings, not numbers: in MUI's sx, width/height values from 0 to 1 mean a percentage (1 = 100%).
export const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}
