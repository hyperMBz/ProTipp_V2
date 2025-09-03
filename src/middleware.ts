import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { 
  isProtectedRoute, 
  hasRouteAccess, 
  getRedirectPath,
  isProtectedApiRoute,
  type UserSession 
} from '@/lib/auth/route-guard'
import { 
  validateJWTToken, 
  extractSessionToken, 
  checkRateLimit, 
  getSecurityHeaders 
} from '@/lib/auth/session-manager'
import { hasApiPermission } from '@/lib/auth/permission-checker'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const method = req.method
  
  console.log('🔄 Middleware - Request to:', pathname, method)

  // Security headers hozzáadása minden válaszhoz
  const response = NextResponse.next()
  const securityHeaders = getSecurityHeaders()
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting ellenőrzés
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(clientIP, 100, 15 * 60 * 1000) // 100 req/15min
  
  if (!rateLimit.allowed) {
    console.warn('🚫 Rate limit exceeded for IP:', clientIP)
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          ...securityHeaders
        }
      }
    )
  }

  // Supabase client létrehozása
  const supabase = createMiddlewareClient({ req, res: response })
  
  let userSession: UserSession | null = null
  
  try {
    // Session ellenőrzés
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session?.user && !error) {
      // Felhasználó profil lekérése a role meghatározásához
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_ends_at')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        userSession = {
          id: session.user.id,
          email: session.user.email || '',
          role: determineUserRole(profile, session.user.email || ''),
          subscription_tier: profile.subscription_tier,
          subscription_ends_at: profile.subscription_ends_at || undefined,
        }
      }
    }
  } catch (error) {
    console.error('🚫 Session validation error:', error)
    // Folytatjuk guest user-ként
  }

  // API route protection
  if (pathname.startsWith('/api/')) {
    if (isProtectedApiRoute(pathname)) {
      if (!userSession) {
        console.warn('🚫 Unauthorized API access attempt:', pathname)
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401, headers: securityHeaders }
        )
      }
      
      // API permission ellenőrzés
      if (!hasApiPermission(userSession, method, pathname)) {
        console.warn('🚫 Insufficient permissions for API:', pathname, userSession.role)
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403, headers: securityHeaders }
        )
      }
    }
    
    // API rate limiting headers hozzáadása
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())
    
    return response
  }

  // Page route protection
  if (isProtectedRoute(pathname)) {
    if (!hasRouteAccess(pathname, userSession)) {
      const redirectPath = getRedirectPath(pathname)
      console.warn('🚫 Unauthorized page access attempt:', pathname, '-> redirecting to:', redirectPath)
      
      // Redirect URL-ben eredeti path mentése
      const redirectUrl = new URL(redirectPath, req.url)
      redirectUrl.searchParams.set('from', pathname)
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth refresh ellenőrzés protected route-oknál
  if (userSession && isProtectedRoute(pathname)) {
    try {
      const { data: { session } } = await supabase.auth.refreshSession()
      if (!session) {
        console.warn('🚫 Session refresh failed, redirecting to login')
        const loginUrl = new URL('/', req.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('🚫 Session refresh error:', error)
    }
  }

  console.log('✅ Middleware - Access granted to:', pathname, userSession?.role || 'guest')
  return response
}

/**
 * Felhasználó szerepkör meghatározása
 */
function determineUserRole(profile: any, email: string): 'user' | 'premium' | 'admin' {
  // Admin ellenőrzés
  if (email.endsWith('@protipp.admin')) {
    return 'admin'
  }
  
  // Premium subscription ellenőrzés
  if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
    if (profile.subscription_ends_at) {
      const expiryDate = new Date(profile.subscription_ends_at)
      if (expiryDate > new Date()) {
        return 'premium'
      }
    }
  }
  
  return 'user'
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
