/**
 * URL safety helpers.
 *
 * Any URL that ends up in an href/src on a public page must be restricted to safe
 * schemes. Otherwise a value like `javascript:alert(document.cookie)` stored in an ad,
 * a social link, or a featured image field becomes a stored XSS payload.
 */

const SAFE_ABSOLUTE_SCHEMES = new Set(['http:', 'https:'])
const SAFE_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/**
 * Returns the trimmed URL if it is a safe http(s) URL or a same-site relative path
 * (e.g. `/uploads/photo.jpg`). Returns null for anything else.
 */
export function safeHttpUrl(value: unknown, { allowRelative = true } = {}): string | null {
  if (typeof value !== 'string') return null
  // Strip ASCII control chars and whitespace that browsers ignore inside schemes ("java\tscript:")
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!trimmed) return null

  if (allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    return SAFE_ABSOLUTE_SCHEMES.has(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

/**
 * Like safeHttpUrl, but also allows mailto: and tel: links (for contact/social links).
 */
export function safeLinkUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) return trimmed
  if (trimmed.startsWith('#')) return trimmed
  try {
    const parsed = new URL(trimmed)
    return SAFE_LINK_SCHEMES.has(parsed.protocol) ? trimmed : null
  } catch {
    return null
  }
}

const DANGEROUS_SCHEME = /^\s*(javascript|vbscript|data|file):/i

/**
 * Recursively walks a JSON-like settings object and blanks out any string value that
 * uses a dangerous URL scheme. Also caps string length to prevent storage abuse.
 */
export function neutralizeDangerousUrls<T>(input: T, depth = 0): T {
  if (depth > 8) return input
  if (typeof input === 'string') {
    const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, '')
    if (DANGEROUS_SCHEME.test(cleaned)) return '' as unknown as T
    return input.slice(0, 5000) as unknown as T
  }
  if (Array.isArray(input)) {
    return input.slice(0, 200).map((v) => neutralizeDangerousUrls(v, depth + 1)) as unknown as T
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue
      out[k] = neutralizeDangerousUrls(v, depth + 1)
    }
    return out as T
  }
  return input
}
