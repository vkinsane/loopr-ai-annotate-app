import { CARD_RADIUS } from '../../theme.js'

export const styles = {
  paper: { borderRadius: CARD_RADIUS, width: '100%', maxWidth: 400, m: 2 },
  // Right padding leaves room for the close button, so a long title doesn't run under it.
  title: { typography: 'h2', pr: 7 },
  close: { position: 'absolute', top: 8, right: 8, width: 44, height: 44, color: 'text.secondary' },
  actions: { px: 3, pb: 2.5, gap: 1 },
  action: { minHeight: 44 },
}
