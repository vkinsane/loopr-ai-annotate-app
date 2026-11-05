export type CameraErrorKind = 'unsupported' | 'denied' | 'not-found' | 'in-use' | 'unknown'

/** A camera failure translated into text an operator can act on. */
export interface CameraError {
  kind: CameraErrorKind
  title: string
  message: string
  steps?: readonly string[]
  canRetry: boolean
}
