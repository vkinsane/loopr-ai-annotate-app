import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { styles } from './ScrollThumb.styles.js'

const MIN_THUMB_PX = 32

/**
 * A scroll bar for browsers that hide theirs until you scroll, such as iPhone Safari.
 * Goes inside the scrolling element, which needs position: relative. Shows only when that element overflows.
 */
export default function ScrollThumb({ component = 'span' }) {
  const thumbRef = useRef(null)

  useEffect(() => {
    const thumb = thumbRef.current
    const scroller = thumb.parentElement
    // A scrolling element takes no width for its bar only when the browser hides bars.
    // Measured on a test element, because the real scroller may not be overflowing yet.
    const probe = document.createElement('div')
    probe.style.cssText = 'position: absolute; visibility: hidden; overflow: scroll; width: 50px; height: 50px'
    document.body.append(probe)
    const browserHidesBars = probe.offsetWidth === probe.clientWidth
    probe.remove()

    function update() {
      const { scrollTop, scrollHeight, clientHeight } = scroller
      const range = scrollHeight - clientHeight
      const show = browserHidesBars && range > 1
      thumb.style.display = show ? 'block' : 'none'
      if (!show) return
      const height = Math.max(MIN_THUMB_PX, (clientHeight * clientHeight) / scrollHeight)
      thumb.style.height = `${height}px`
      // The bar scrolls with the content, so scrollTop first keeps it in view.
      thumb.style.transform = `translateY(${scrollTop + (scrollTop / range) * (clientHeight - height)}px)`
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const sizes = new ResizeObserver(update)
    sizes.observe(scroller)
    for (const child of scroller.children) sizes.observe(child)
    const rows = new MutationObserver(update)
    rows.observe(scroller, { childList: true, subtree: true })
    return () => {
      scroller.removeEventListener('scroll', update)
      sizes.disconnect()
      rows.disconnect()
    }
  }, [])

  return <Box component={component} ref={thumbRef} aria-hidden sx={styles.thumb} />
}
