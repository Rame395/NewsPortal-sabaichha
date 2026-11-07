import { NextRequest, NextResponse } from 'next/server'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  messageEn?: string
  messageNe?: string
}

interface ClientRecord {
  count: number
  resetTime: number
}

// In-memory store partitioned by namespace
const stores = new Map<string, Map<string, ClientRecord>>()

// Periodic garbage collection every 5 minutes to prevent memory growth
let gcTimer: NodeJS.Timeout | null = null

function ensureGC() {
  if (!gcTimer) {
    gcTimer = setInterval(() => {
      const now = Date.now()
      stores.forEach((store) => {
        store.forEach((record, ip) => {
          if (record.resetTime <= now) {
            store.delete(ip)
          }
        })
      })
    }, 5 * 60 * 1000)

    if (gcTimer.unref) gcTimer.unref()
  }
}

/**
 * Safely extracts client IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '127.0.0.1'
}

/**
 * Applies sliding-window rate limiting.
 * Returns null if allowed, or an HTTP 429 NextResponse if rate limit is exceeded.
 */
export function checkRateLimit(
  request: NextRequest,
  namespace: string,
  config: RateLimitConfig
): NextResponse | null {
  ensureGC()

  let store = stores.get(namespace)
  if (!store) {
    store = new Map<string, ClientRecord>()
    stores.set(namespace, store)
  }

  const ip = getClientIp(request)
  const now = Date.now()
  const record = store.get(ip)

  // Start new window if first request or window expired
  if (!record || record.resetTime <= now) {
    store.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return null
  }

  // Rate limit exceeded
  if (record.count >= config.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    const errorEn =
      config.messageEn ||
      `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`
    const errorNe =
      config.messageNe ||
      `धेरै पटक अनुरोध गरियो। कृपया ${retryAfterSec} सेकेन्डपछि पुन: प्रयास गर्नुहोस्।`

    return NextResponse.json(
      {
        error: errorEn,
        messageNe: errorNe,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
        },
      }
    )
  }

  // Increment request count in active window
  record.count += 1
  return null
}
