import { useEffect, useRef, useState } from 'react'

/**
 * The current screen, kept in step with the browser's Back and Forward buttons. `go` adds a history entry.
 * `canShow(screen)` says if a screen still has its data: entries that can't be shown, such as a discarded photo, are skipped.
 * On a screen where `askBeforeLeaving(screen)` is true, Back and Forward don't move. `leaving` turns true instead, so the
 * app can ask, then call `stay()` or `go()`.
 */
export function useScreenHistory(firstScreen, canShow, askBeforeLeaving) {
  const [screen, setScreen] = useState(firstScreen)
  const [leaving, setLeaving] = useState(false)
  const latest = useRef({ screen, canShow, askBeforeLeaving })

  useEffect(() => {
    latest.current = { screen, canShow, askBeforeLeaving }
  })

  useEffect(() => {
    window.history.replaceState({ screen: firstScreen }, '')
    function handlePopState(event) {
      const target = event.state?.screen ?? firstScreen
      const { screen: current, canShow: isAvailable, askBeforeLeaving: ask } = latest.current
      if (ask(current)) {
        // The browser has already moved, so the step is undone: the screen and the history stay in step while the app asks.
        window.history.pushState({ screen: current }, '')
        setLeaving(true)
        return
      }
      if (target === current || !isAvailable(target)) window.history.back()
      else setScreen(target)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [firstScreen])

  function go(next) {
    window.history.pushState({ screen: next }, '')
    setLeaving(false)
    setScreen(next)
  }

  return { screen, go, leaving, stay: () => setLeaving(false) }
}
