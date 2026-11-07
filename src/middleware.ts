import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionJwt } from '@/lib/auth/jwt'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Verifies that state-changing API requests originate from the same host (CSRF defense).
 */
function isSameOriginMutation(request: NextRequest): boolean {
  if (!MUTATING_METHODS.has(request.method)) return true

  const origin = request.headers.get('origin')
  if (!origin) return true // Same-origin fetch or server-to-server without Origin header

  try {
    const originHost = new URL(origin).host.toLowerCase()
    const targetHost = (
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.host
    )
      .split(',')[0]
      .trim()
      .toLowerCase()

    return Boolean(targetHost && originHost === targetHost)
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('sabaichha_session')?.value

  // 0. CSRF protection on all state-changing admin & auth API requests
  if ((pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth')) && !isSameOriginMutation(request)) {
    return NextResponse.json(
      {
        error: 'Forbidden. Cross-origin state-changing requests are not permitted.',
        messageNe: 'अस्वीकृत: बाह्य स्रोतबाट आएको अनुरोध मान्य छैन।',
      },
      { status: 403 }
    )
  }

  // 1. Defense-in-depth protection for all Admin APIs (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!sessionCookie) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Administrative API access requires active authentication.',
          messageNe: 'अनधिकृत: प्रशासकीय API पहुँचका लागि सक्रिय लगइन आवश्यक छ।',
        },
        { status: 401 }
      )
    }

    const payload = await verifySessionJwt(sessionCookie)
    if (!payload || !payload.sessionId || !payload.userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Your administrative session has expired or is invalid. Please sign in again.',
          messageNe: 'अनधिकृत: तपाईंको सत्र समाप्त भएको वा अमान्य छ। कृपया पुन: लगइन गर्नुहोस्।',
        },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  // 2. Protection for Admin Dashboard UI (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Public admin login page
    if (pathname === '/admin/login') {
      // If user is already authenticated with a valid session, redirect to admin dashboard
      if (sessionCookie) {
        const payload = await verifySessionJwt(sessionCookie)
        if (payload) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
      }
      return NextResponse.next()
    }

    // Protected admin pages: require valid session
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifySessionJwt(sessionCookie)
    if (!payload || !payload.sessionId || !payload.userId) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'],
}

