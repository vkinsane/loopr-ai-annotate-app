import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The current screen, kept in step with the browser's Back and Forward buttons. `go` adds a history entry.
 * `canShow(screen)` says if a screen still has its data: entries that can't be shown, such as a discarded photo, are skipped.
 */
export function useScreenHistory(firstScreen, canShow) {
  const [screen, setScreen] = useState(firstScreen)
  const latest = useRef({ screen, canShow })

  useEffect(() => {
    latest.current = { screen, canShow }
  })

  useEffect(() => {
    window.history.replaceState({ screen: firstScreen }, '')
    function handlePopState(event) {
      const target = event.state?.screen ?? firstScreen
      const { screen: current, canShow: isAvailable } = latest.current
      if (target === current || !isAvailable(target)) window.history.back()
      else setScreen(target)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [firstScreen])

  const go = useCallback((next) => {
    window.history.pushState({ screen: next }, '')
    setScreen(next)
  }, [])

  return [screen, go]
}
