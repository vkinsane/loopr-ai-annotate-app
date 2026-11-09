import { HEADER_BAR } from '../../theme.js'

export const styles = {
  root: { height: '100dvh', display: 'flex', flexDirection: 'column' },
  bar: HEADER_BAR,
  header: { width: '100%', mx: 'auto', px: 2, minHeight: 56, display: 'flex', alignItems: 'center', gap: 0.5 },
  // Lines the arrow itself up with the content below, not its 44 px tap area.
  back: { ml: -1.5 },
  title: { typography: 'h1', flexGrow: 1 },
}
