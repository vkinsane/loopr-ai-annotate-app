// Input validation for every input in the app. Components call these and show `message`; they build no messages.
// A message is null, or { text, warn }: `warn` for a problem, plain for a hint such as a character count.

/**
 * Text field rules. Allowlist (OWASP): letters and numbers in any language (\p{M} keeps accents typed
 * as two code points), spaces, and the marks named in `allowedText`.
 */
export const TEXT_RULES = {
  annotationName: {
    maxLength: 40,
    notAllowed: /[^\p{L}\p{M}\p{N} _.,()-]/gu,
    allowedText: 'letters, numbers, spaces and - _ . , ( )',
    name: 'A name',
    duplicateText: 'Another annotation has the same name.',
  },
  // No dots or slashes: the name becomes a file name, and the app adds ".jpg" itself.
  photoName: {
    maxLength: 60,
    notAllowed: /[^\p{L}\p{M}\p{N} _()-]/gu,
    allowedText: 'letters, numbers, spaces and - _ ( )',
    name: 'A photo name',
  },
}

export const PHOTO_RULES = { maxMb: 30, types: 'JPEG, PNG, WebP or HEIC' }

const COUNT_HINT_FROM = 10 // characters left
const BYTES_PER_MB = 1024 * 1024
const ascii = (bytes, start, end) => String.fromCharCode(...bytes.slice(start, end))
// The file's first bytes, not its name or reported type, decide what it is.
const PHOTO_SIGNATURES = [
  (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff, // JPEG
  (b) => [0x89, 0x50, 0x4e, 0x47].every((byte, i) => b[i] === byte), // PNG
  (b) => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP', // WebP
  (b) => ascii(b, 4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1|heif)$/.test(ascii(b, 8, 12)), // HEIC / HEIF
]

/**
 * Use on every change (typing or paste). Removes characters that aren't allowed, turns tabs and line
 * breaks into spaces, keeps one space between words, and cuts the text to `maxLength`. Returns { value, message }.
 */
export function validateText(raw, rule) {
  const text = raw.normalize('NFC').replace(/\s/g, ' ')
  const allowed = text.replace(rule.notAllowed, '')
  // Code points, not UTF-16 units, so a letter outside the basic range counts as one character.
  const characters = Array.from(allowed.replace(/ {2,}/g, ' ').replace(/^ /, ''))
  const value = characters.slice(0, rule.maxLength).join('')

  let message = null
  if (allowed !== text) message = { text: `Only ${rule.allowedText} can be used.`, warn: true }
  else if (characters.length > rule.maxLength) message = { text: `${rule.name} can have up to ${rule.maxLength} characters.`, warn: true }
  else if (characters.length >= rule.maxLength - COUNT_HINT_FROM) message = { text: `${characters.length} / ${rule.maxLength} characters`, warn: false }
  return { value, message }
}

/**
 * Use when the field loses focus. Trims outer spaces. An empty value goes back to `previous`.
 * A value already in `others` is kept, with a warning (case and outer spaces ignored). Returns { value, message }.
 */
export function finishText(raw, rule, { previous = '', others = [] } = {}) {
  const value = raw.trim() || previous
  const key = value.toLocaleLowerCase()
  const taken = key !== '' && others.some((other) => other.trim().toLocaleLowerCase() === key)
  return { value, message: taken ? { text: rule.duplicateText, warn: true } : null }
}

/** Use when a photo file is picked. Returns { message }: null when the file can be used. */
export async function validatePhotoFile(file) {
  const fail = (text) => ({ message: { text, warn: true } })
  if (file.size === 0) return fail('This file is empty. Choose another photo.')
  if (file.size > PHOTO_RULES.maxMb * BYTES_PER_MB) return fail(`This photo is larger than ${PHOTO_RULES.maxMb} MB. Choose a smaller one.`)
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (!PHOTO_SIGNATURES.some((matches) => matches(bytes))) return fail(`This file is not a photo. Choose a ${PHOTO_RULES.types} file.`)
  return { message: null }
}
