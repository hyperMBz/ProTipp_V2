/**
 * Route Guard Component
 * Client-side route protection és authorization
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { 
  isProtectedRoute, 
  hasRouteAccess, 
  getRedirectPath,
  type UserRole 
} from '@/lib/auth/route-guard';
import { hasPermission } from '@/lib/auth/permission-checker';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    action: string;
    resource: string;
    conditions?: Record<string, any>;
  };
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Route Guard Component - Client-side route protection
 */
export function RouteGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo,
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Role-based ellenőrzés
    if (requiredRole && (!user || user.role !== requiredRole)) {
      const redirect = redirectTo || getRedirectPath(pathname);
      console.warn('🚫 RouteGuard - Insufficient role:', user?.role, 'required:', requiredRole);
      router.push(`${redirect}?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Permission-based ellenőrzés
    if (requiredPermission) {
      const hasAccess = hasPermission(
        user,
        requiredPermission.action,
        requiredPermission.resource,
        requiredPermission.conditions
      );
      
      if (!hasAccess) {
        const redirect = redirectTo || getRedirectPath(pathname);
        console.warn('🚫 RouteGuard - Insufficient permissions:', requiredPermission);
        router.push(`${redirect}?from=${encodeURIComponent(pathname)}`);
        return;
      }
    }

    // Általános route protection ellenőrzés
    if (isProtectedRoute(pathname) && !hasRouteAccess(pathname, user)) {
      const redirect = redirectTo || getRedirectPath(pathname);
      console.warn('🚫 RouteGuard - Protected route access denied:', pathname);
      router.push(`${redirect}?from=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [user, loading, pathname, requiredRole, requiredPermission, redirectTo, router]);

  // Loading állapot
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Hitelesítés ellenőrzése...</p>
        </div>
      </div>
    );
  }

  // Role ellenőrzés
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return fallback || <UnauthorizedFallback />;
  }

  // Permission ellenőrzés
  if (requiredPermission) {
    const hasAccess = hasPermission(
      user,
      requiredPermission.action,
      requiredPermission.resource,
      requiredPermission.conditions
    );
    
    if (!hasAccess) {
      return fallback || <UnauthorizedFallback />;
    }
  }

  // Általános route protection
  if (isProtectedRoute(pathname) && !hasRouteAccess(pathname, user)) {
    return fallback || <UnauthorizedFallback />;
  }

  return <>{children}</>;
}

/**
 * Admin Route Guard - Csak admin felhasználóknak
 */
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

/**
 * Premium Route Guard - Premium felhasználóknak
 */
export function PremiumGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard requiredRole="premium" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

/**
 * User Route Guard - Bejelentkezett felhasználóknak
 */
export function UserGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RouteGuard requiredRole="user" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

/**
 * Permission Guard - Specifikus jogosultságoknak
 */
export function PermissionGuard({
  children,
  action,
  resource,
  conditions,
  fallback,
}: {
  children: ReactNode;
  action: string;
  resource: string;
  conditions?: Record<string, any>;
  fallback?: ReactNode;
}) {
  return (
    <RouteGuard
      requiredPermission={{ action, resource, conditions }}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}

/**
 * Subscription Guard - Subscription alapú hozzáférés
 */
export function SubscriptionGuard({
  children,
  requiredTier,
  fallback,
}: {
  children: ReactNode;
  requiredTier: 'pro' | 'premium';
  fallback?: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return fallback || <UnauthorizedFallback />;
  }

  const tierHierarchy = { pro: 1, premium: 2 };
  const userTier = tierHierarchy[user.subscription_tier as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];

  // Lejárat ellenőrzés
  if (user.subscription_ends_at) {
    const expiryDate = new Date(user.subscription_ends_at);
    if (expiryDate < new Date()) {
      return fallback || <SubscriptionExpiredFallback />;
    }
  }

  if (userTier < requiredTierLevel) {
    return fallback || <UpgradeRequiredFallback requiredTier={requiredTier} />;
  }

  return <>{children}</>;
}

/**
 * Unauthorized Fallback Component
 */
function UnauthorizedFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Hozzáférés megtagadva</h1>
        <p className="text-muted-foreground">
          Nincs jogosultságod ehhez az oldalhoz. Kérlek jelentkezz be megfelelő fiókkal.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Vissza
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Főoldal
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Subscription Expired Fallback
 */
function SubscriptionExpiredFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⏰</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Előfizetés lejárt</h1>
        <p className="text-muted-foreground">
          Az előfizetésed lejárt. Kérlek újítsd meg a folytatáshoz.
        </p>
        <button
          onClick={() => (window.location.href = '/pricing')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Előfizetés megújítása
        </button>
      </div>
    </div>
  );
}

/**
 * Upgrade Required Fallback
 */
function UpgradeRequiredFallback({ requiredTier }: { requiredTier: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⭐</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Frissítés szükséges</h1>
        <p className="text-muted-foreground">
          Ez a funkció {requiredTier.toUpperCase()} előfizetést igényel.
        </p>
        <button
          onClick={() => (window.location.href = '/pricing')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Előfizetés frissítése
        </button>
      </div>
    </div>
  );
}
