import { useRef, useState } from 'react'
import { InfoOutlined } from '@mui/icons-material'
import { Box, ClickAwayListener, IconButton, Tooltip } from '@mui/material'
import { styles } from './StatusBadge.styles.js'

const SYMBOLS = { good: '✓', warn: '!', poor: '✕' }

/**
 * Plain: coloured text, label hidden on phones. Pill: tinted background, label always shown.
 * `tip` adds an (i) button before the badge with a tooltip. Before, not after, so badges in a column keep one right edge.
 */
export default function StatusBadge({ grade, label, pill = false, tip }) {
  const [tipOpen, setTipOpen] = useState(false)
  // A tap also sends mouseover, which opens the tooltip just before the click. So the click toggles from
  // the state at pointerdown, which comes first; otherwise the first tap would open and close it at once.
  const openAtPress = useRef(false)
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
  if (!tip) return badge
  return (
    <Box component="span" sx={styles.withInfo}>
      {/* Opens on hover and keyboard focus; a tap or click opens it and a second one closes it, as does a tap elsewhere. */}
      <ClickAwayListener onClickAway={() => setTipOpen(false)}>
        <Tooltip
          title={tip}
          placement="top"
          arrow
          describeChild
          disableTouchListener
          open={tipOpen}
          onOpen={() => setTipOpen(true)}
          onClose={() => setTipOpen(false)}
          slotProps={{ tooltip: { sx: styles.tip } }}
        >
          <IconButton
            aria-label="More information"
            aria-expanded={tipOpen}
            onPointerDown={() => (openAtPress.current = tipOpen)}
            // detail is 0 for Enter or Space, which has no pointerdown.
            onClick={(event) => setTipOpen(!(event.detail === 0 ? tipOpen : openAtPress.current))}
            sx={styles.info}
          >
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      </ClickAwayListener>
      {badge}
    </Box>
  )
}
