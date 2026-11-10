import { useEffect, useState } from 'react'

/**
 * The device's cameras as [{ id, label }]. Read once the camera is live, because browsers hide the names until
 * the camera is allowed. Read again when a camera is plugged in or out.
 */
export function useCameraList(live) {
  const [cameras, setCameras] = useState([])

  useEffect(() => {
    if (!live) return
    let current = true
    const read = () => navigator.mediaDevices.enumerateDevices().then(
      (devices) => {
        const inputs = devices.filter((device) => device.kind === 'videoinput')
        if (current) setCameras(inputs.map((device, index) => ({ id: device.deviceId, label: device.label || `Camera ${index + 1}` })))
      },
      (error) => console.error('Could not list the cameras', error),
    )
    read()
    navigator.mediaDevices.addEventListener('devicechange', read)
    return () => {
      current = false
      navigator.mediaDevices.removeEventListener('devicechange', read)
    }
  }, [live])

  return cameras
}
