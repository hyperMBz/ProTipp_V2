/**
 * Route Guard Utilities
 * Biztosítja a route protection és permission checking logikát
 */

export type UserRole = 'public' | 'user' | 'premium' | 'admin';

export interface RoutePermission {
  path: string;
  required_role: UserRole;
  redirect_to?: string;
  middleware?: string[];
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  subscription_tier: 'free' | 'pro' | 'premium';
  subscription_ends_at?: string;
}

/**
 * Route konfigurációk - meghatározza melyik route milyen szerepet igényel
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Nyilvános oldalak - bejelentkezés nélkül is elérhetők
  { path: '/', required_role: 'public' },
  { path: '/login', required_role: 'public' },
  { path: '/register', required_role: 'public' },
  
  // Védett oldalak - csak bejelentkezett felhasználóknak
  { path: '/dashboard', required_role: 'user', redirect_to: '/login' },
  { path: '/profile', required_role: 'user', redirect_to: '/login' },
  { path: '/arbitrage', required_role: 'user', redirect_to: '/login' },
  { path: '/ev-betting', required_role: 'user', redirect_to: '/login' },
  { path: '/bet-tracker', required_role: 'user', redirect_to: '/login' },
  { path: '/calculator', required_role: 'user', redirect_to: '/login' },
  { path: '/odds', required_role: 'user', redirect_to: '/login' },
  { path: '/alerts', required_role: 'user', redirect_to: '/login' },
  { path: '/analytics', required_role: 'user', redirect_to: '/login' },
  { path: '/settings', required_role: 'user', redirect_to: '/login' },
  { path: '/about', required_role: 'user', redirect_to: '/login' },
  { path: '/contact', required_role: 'user', redirect_to: '/login' },
  { path: '/terms', required_role: 'user', redirect_to: '/login' },
  { path: '/privacy', required_role: 'user', redirect_to: '/login' },
  { path: '/test', required_role: 'user', redirect_to: '/login' },
  { path: '/simple-test', required_role: 'user', redirect_to: '/login' },
  { path: '/mobile-test', required_role: 'user', redirect_to: '/login' },
  
  // API route-ok
  { path: '/api/user', required_role: 'user' },
  { path: '/api/bets', required_role: 'user' },
  { path: '/api/arbitrage', required_role: 'user' },
  { path: '/api/notifications', required_role: 'user' },
  
  // Premium funkciók
  { path: '/api/premium', required_role: 'premium' },
  
  // Admin route-ok
  { path: '/api/admin', required_role: 'admin' },
];

/**
 * Ellenőrzi hogy egy adott path védett-e
 */
export function isProtectedRoute(pathname: string): boolean {
  const permission = getRoutePermission(pathname);
  return permission ? permission.required_role !== 'public' : false;
}

/**
 * Ellenőrzi hogy a főoldal elérhető-e a felhasználó számára
 * A főoldal mindig elérhető, függetlenül a bejelentkezési állapottól
 */
export function canAccessHomePage(userSession: UserSession | null): boolean {
  // A főoldal mindig elérhető
  return true;
}

/**
 * Meghatározza egy route permission beállításait
 */
export function getRoutePermission(pathname: string): RoutePermission | null {
  // Exact match
  let permission = ROUTE_PERMISSIONS.find(p => p.path === pathname);
  
  if (!permission) {
    // Pattern matching for dynamic routes
    permission = ROUTE_PERMISSIONS.find(p => {
      if (p.path.includes('[') || p.path.includes('*')) {
        return false; // Skip dynamic patterns for now
      }
      return pathname.startsWith(p.path) && p.path !== '/';
    });
  }
  
  return permission || null;
}

/**
 * Ellenőrzi hogy a felhasználó hozzáfér-e egy adott route-hoz
 */
export function hasRouteAccess(
  pathname: string, 
  userSession: UserSession | null
): boolean {
  const permission = getRoutePermission(pathname);
  
  if (!permission) {
    // Ha nincs explicit permission, akkor nyilvános
    return true;
  }
  
  if (permission.required_role === 'public') {
    return true;
  }
  
  if (!userSession) {
    return false;
  }
  
  return hasRequiredRole(userSession, permission.required_role);
}

/**
 * Ellenőrzi hogy a felhasználó rendelkezik-e a szükséges szereppel
 */
export function hasRequiredRole(
  userSession: UserSession, 
  requiredRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'public': 0,
    'user': 1,
    'premium': 2,
    'admin': 3,
  };
  
  const userLevel = roleHierarchy[userSession.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Meghatározza hova kell redirectelni egy nem jogosult felhasználót
 */
export function getRedirectPath(pathname: string): string {
  const permission = getRoutePermission(pathname);
  return permission?.redirect_to || '/';
}

/**
 * API route-ok védelmének ellenőrzése
 */
export function isProtectedApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/') && isProtectedRoute(pathname);
}

/**
 * Subscription-based access ellenőrzés
 */
export function hasSubscriptionAccess(
  userSession: UserSession | null,
  requiredTier: 'free' | 'pro' | 'premium'
): boolean {
  if (!userSession) return false;
  
  const tierHierarchy = {
    'free': 0,
    'pro': 1,
    'premium': 2,
  };
  
  const userTier = tierHierarchy[userSession.subscription_tier] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier] || 0;
  
  // Ellenőrizzük hogy aktív-e a subscription
  if (userSession.subscription_ends_at) {
    const expiryDate = new Date(userSession.subscription_ends_at);
    if (expiryDate < new Date()) {
      return false; // Lejárt subscription
    }
  }
  
  return userTier >= requiredTierLevel;
}
