import { jwtVerify, JWTPayload } from 'jose'

const DEFAULT_DEV_SECRET = 'dev-super-secret-news-portal-key-change-in-production-32-chars'

/**
 * Validates and retrieves the JWT secret for session signing and cryptographic verification.
 * Enforces strict security requirements in production.
 */
export function getJwtSecret(): Uint8Array {
  const envSecret = process.env.NEXTAUTH_SECRET

  if (process.env.NODE_ENV === 'production') {
    if (!envSecret || envSecret === DEFAULT_DEV_SECRET || envSecret.length < 32) {
      throw new Error(
        'CRITICAL SECURITY ERROR: NEXTAUTH_SECRET must be set to a unique random secret of at least 32 characters in production.'
      )
    }
  }

  const secret = envSecret || DEFAULT_DEV_SECRET
  return new TextEncoder().encode(secret)
}

/**
 * Lightweight, Edge-compatible JWT verification helper for Next.js Middleware and API guards.
 * Returns decoded payload if valid and unexpired; returns null if tampered or expired.
 */
export async function verifySessionJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload
  } catch {
    return null
  }
}
