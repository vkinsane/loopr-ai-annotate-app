const LEVEL_DEGREES = 2
const UPRIGHT_LIMIT_DEGREES = 45

/**
 * Changes one camera setting, such as { torch: true }. applyConstraints replaces every constraint, so the current
 * ones (resolution, camera) and the other advanced settings (torch, exposure) are passed back with it.
 */
export function applyCameraSetting(track, setting) {
  const current = track.getConstraints()
  return track.applyConstraints({ ...current, advanced: [{ ...current.advanced?.[0], ...setting }] })
}

/**
 * From the gravity reading of a `devicemotion` event (phone axes) and the screen's rotation angle:
 * `roll` is how far the picture's horizon is turned (degrees, 0 = level), `pitch` how far the screen leans
 * from upright (0 = upright, 90 = flat). Only angles and |z| are used, so a reading with flipped signs gives the same result.
 */
export function readTilt({ x, y, z }, screenAngle) {
  const angle = (screenAngle * Math.PI) / 180
  const screenX = x * Math.cos(angle) - y * Math.sin(angle)
  const screenY = x * Math.sin(angle) + y * Math.cos(angle)
  let roll = (Math.atan2(screenX, screenY) * 180) / Math.PI
  // The nearest upright way up, whichever way the phone is held.
  if (roll > 90) roll -= 180
  if (roll < -90) roll += 180
  const pitch = (Math.atan2(Math.abs(z), Math.hypot(screenX, screenY)) * 180) / Math.PI
  return { roll, pitch }
}

/**
 * Advice for a straight photo: first turn the phone until the horizon is level, then hold it upright (a wall, a car
 * door) or flat (something on a table), whichever is closer. Returns { level, text }.
 */
export function tiltAdvice({ roll, pitch }) {
  const turn = Math.round(Math.abs(roll))
  // A negative roll means the phone is turned clockwise, so it has to turn back to the left.
  if (turn > LEVEL_DEGREES) return { level: false, text: `Turn ${roll < 0 ? 'left' : 'right'} ${turn}°` }
  const flat = pitch > UPRIGHT_LIMIT_DEGREES
  const lean = Math.round(flat ? 90 - pitch : pitch)
  if (lean > LEVEL_DEGREES) return { level: false, text: `Hold ${flat ? 'flat' : 'upright'}: ${lean}° off` }
  return { level: true, text: 'Level' }
}
