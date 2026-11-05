export const UNSUPPORTED_ERROR = {
  kind: 'unsupported',
  title: "Camera isn't available here",
  message:
    'Camera access needs a secure page (https://) in a recent browser such as Chrome, Safari, Edge or Firefox.',
  canRetry: false,
}

const DENIED_ERROR = {
  kind: 'denied',
  title: 'Camera access is blocked',
  message: 'This app needs the camera to take inspection photos. Photos stay on this device.',
  steps: [
    'Tap the site settings icon next to the address bar.',
    'Set Camera to Allow.',
    'Come back and tap Try again.',
  ],
  canRetry: true,
}

const NOT_FOUND_ERROR = {
  kind: 'not-found',
  title: 'No camera found',
  message:
    "This device doesn't have a camera the browser can use. Connect a camera, or open this page on a phone or tablet.",
  canRetry: true,
}

export const IN_USE_ERROR = {
  kind: 'in-use',
  title: 'Camera is busy',
  message:
    'Another app or browser tab is using the camera, or the camera stopped. Close the other app, then try again.',
  canRetry: true,
}

const UNKNOWN_ERROR = {
  kind: 'unknown',
  title: "Camera couldn't start",
  message: 'Something went wrong while starting the camera. Try again.',
  canRetry: true,
}

const ERRORS_BY_NAME = {
  NotAllowedError: DENIED_ERROR,
  SecurityError: DENIED_ERROR, // blocked by a permissions policy, e.g. inside an iframe
  NotFoundError: NOT_FOUND_ERROR,
  NotReadableError: IN_USE_ERROR,
  AbortError: IN_USE_ERROR, // Firefox reports a busy camera this way
}

export function toCameraError(error) {
  const name = error instanceof Error ? error.name : ''
  return ERRORS_BY_NAME[name] ?? UNKNOWN_ERROR
}
