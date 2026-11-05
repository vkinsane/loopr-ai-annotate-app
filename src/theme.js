import { createTheme } from '@mui/material'

const shared = {
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  shape: { borderRadius: 12 },
}

export const theme = createTheme({
  ...shared,
  palette: {
    primary: { main: '#1d4ed8' },
    background: { default: '#f6f7f9', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
  },
})

export const cameraTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#f8fafc' },
    background: { default: '#0b0d10', paper: '#151a21' },
    text: { primary: '#f8fafc', secondary: '#cbd5e1' },
    divider: '#263040',
  },
})

export const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}
