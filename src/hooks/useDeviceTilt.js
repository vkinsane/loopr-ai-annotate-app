import { useEffect, useState } from 'react'
import { readTilt } from '../utils'

// iPhone shares motion only after the user agrees, which has to start from a tap. Chrome has the same function
// but sends readings without it, so listening starts anyway and the tap is only offered until a reading comes.
// Computers have no motion sensor, so the tap is offered on touch screens only.
const askFirst = () => typeof window.DeviceMotionEvent?.requestPermission === 'function' && window.matchMedia('(pointer: coarse)').matches

/**
 * The phone's tilt from its gravity sensor while `enabled`: { roll, pitch } in degrees (see readTilt), or null before
 * the first reading and on devices without a sensor, such as most computers.
 * `needsTap` is true while the browser may be waiting for the user's tap; `requestPermission` must run from that tap.
 */
export function useDeviceTilt(enabled) {
  const [tilt, setTilt] = useState(null)
  const [permission, setPermission] = useState(() => (askFirst() ? 'ask' : 'granted'))

  useEffect(() => {
    if (!enabled || permission === 'denied' || !('DeviceMotionEvent' in window)) return
    let frame = 0
    const handleMotion = (event) => {
      const gravity = event.accelerationIncludingGravity
      if (gravity?.x == null) return
      // Readings come up to 60 times a second; one update per frame is enough.
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setTilt(readTilt(gravity, window.screen.orientation?.angle ?? 0)))
    }
    window.addEventListener('devicemotion', handleMotion)
    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      cancelAnimationFrame(frame)
    }
  }, [enabled, permission])

  async function requestPermission() {
    try {
      setPermission((await window.DeviceMotionEvent.requestPermission()) === 'granted' ? 'granted' : 'denied')
    } catch (error) {
      console.error('Motion permission failed', error)
      setPermission('denied')
    }
  }

  const reading = enabled ? tilt : null
  return { tilt: reading, needsTap: enabled && permission === 'ask' && !reading, requestPermission }
}
