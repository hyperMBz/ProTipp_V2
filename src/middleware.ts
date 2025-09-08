import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Védett útvonalak listája
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/analytics',
  '/api/protected'
];

// Nyilvános útvonalak (csak bejelentkezés nélkül elérhető)
const publicOnlyRoutes = [
  '/login',
  '/register',
  '/auth/callback'
];

// Ellenőrzi, hogy az útvonal védett-e
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Ellenőrzi, hogy az útvonal csak nyilvános-e
function isPublicOnlyRoute(pathname: string): boolean {
  return publicOnlyRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔄 Middleware - Request to:', pathname);

  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // Session ellenőrzése
  const { data: { session } } = await supabase.auth.getSession();

  // Védett útvonalak ellenőrzése
  if (isProtectedRoute(pathname)) {
    console.log('🔄 Middleware - Protected route detected:', pathname);

    if (!session) {
      console.log('🚫 Middleware - No session found for protected route:', pathname);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('✅ Middleware - Session found, allowing access to:', pathname);
  } 
  // Nyilvános útvonalak ellenőrzése (bejelentkezés után ne legyen elérhető)
  else if (isPublicOnlyRoute(pathname)) {
    console.log('🔄 Middleware - Public only route detected:', pathname);

    if (session) {
      console.log('🚫 Middleware - User is authenticated, redirecting from public only route:', pathname);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('✅ Middleware - User not authenticated, allowing access to:', pathname);
  } 
  else {
    console.log('✅ Middleware - Access granted to public route:', pathname);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};