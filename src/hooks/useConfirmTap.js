import { useEffect, useState } from 'react'

const CONFIRM_TIMEOUT_MS = 4000

/**
 * A second tap confirms a destructive action, without a dialog. The first tap expires after a few seconds.
 * `confirm(action, needed)` runs `action` at once when `needed` is false.
 */
export function useConfirmTap() {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const timer = window.setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [confirming])

  function confirm(action, needed) {
    if (!needed || confirming) action()
    else setConfirming(true)
  }

  return { confirming, confirm }
}
