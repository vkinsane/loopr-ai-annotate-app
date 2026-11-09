import { InfoOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { styles } from './StatusBadge.styles.js'

const SYMBOLS = { good: '✓', warn: '!', poor: '✕' }
const TIP_TOUCH_MS = 4000

/**
 * Plain: coloured text, label hidden on phones. Pill: tinted background, label always shown.
 * `tip` adds an (i) button after the badge; its tooltip opens on hover, keyboard focus or tap.
 * `reserveInfo` keeps the same empty space, so badges in a column line up when only some have the button.
 */
export default function StatusBadge({ grade, label, pill = false, tip, reserveInfo = false }) {
  // A warning pill already says what it is in words.
  const noSymbol = pill && grade === 'warn'
  const badge = (
    <Box component="span" sx={pill ? styles.pill(grade) : styles.badge(grade)}>
      {!noSymbol && <span aria-hidden>{SYMBOLS[grade]}</span>}
      <Box component="span" sx={pill ? undefined : styles.label}>
        {!noSymbol && ' '}
        {label}
      </Box>
    </Box>
  )
  if (!tip && !reserveInfo) return badge
  return (
    <Box component="span" sx={styles.withInfo}>
      {badge}
      {tip ? (
        <Tooltip title={tip} placement="top-end" arrow describeChild enterTouchDelay={0} leaveTouchDelay={TIP_TOUCH_MS} slotProps={{ tooltip: { sx: styles.tip } }}>
          <IconButton aria-label="More information" sx={styles.info}>
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      ) : (
        <Box component="span" aria-hidden sx={styles.infoSlot} />
      )}
    </Box>
  )
}
