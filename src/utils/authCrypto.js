function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return bufferToHex(bytes)
}

export function generateId(prefix = 'id') {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return `${prefix}_${bufferToHex(bytes)}`
}

export function generateInviteToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return bufferToHex(bytes)
}

export async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(digest)
}

export async function verifyPassword(password, salt, expectedHash) {
  const hash = await hashPassword(password, salt)
  return hash === expectedHash
}
