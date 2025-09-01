import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/client'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Rate limiting for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `rate_limit:${clientIp}`
    
    try {
      const supabase = createSupabaseAdminClient()
      const { data: rateLimitData } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('ip_address', clientIp)
        .eq('route', req.nextUrl.pathname)
        .single()

      if (rateLimitData && (rateLimitData as any).request_count > 100) {
        return new NextResponse('Rate limit exceeded', { status: 429 })
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
    }
  }

  // MFA verification for protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/profile')) {
    const authHeader = req.headers.get('authorization')
    
    if (authHeader) {
      try {
        const supabase = createSupabaseAdminClient()
        const token = authHeader.replace('Bearer ', '')
        
        // Verify MFA session if required
        const { data: { user } } = await supabase.auth.getUser(token)
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('mfa_enabled, mfa_type')
            .eq('id', user.id)
            .single()

          if ((profile as any)?.mfa_enabled) {
            // Check if MFA session is valid
            const { data: mfaSession } = await supabase
              .from('mfa_sessions')
              .select('*')
              .eq('user_id', user.id)
              .eq('verified', true)
              .gt('expires_at', new Date().toISOString())
              .single()

            if (!mfaSession) {
              return NextResponse.redirect(new URL('/auth/mfa-verify', req.url))
            }
          }
        }
      } catch (error) {
        console.error('MFA verification error:', error)
      }
    }
  }

  // Log request for audit
  console.log('🔄 Middleware - Request to:', req.nextUrl.pathname, 'from IP:', req.headers.get('x-forwarded-for') || 'unknown')

  return res
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
