/**
 * Authentication Integration Tests
 * E2E authentication flow tesztelése
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  isProtectedRoute, 
  hasRouteAccess, 
  getRoutePermission,
  type UserSession 
} from '../route-guard';
import { hasPermission } from '../permission-checker';
import { validateJWTToken, checkRateLimit } from '../session-manager';

// Mock user sessions for testing
const mockUsers: { [key: string]: UserSession } = {
  guest: null as any,
  user: {
    id: 'user-1',
    email: 'user@example.com',
    role: 'user',
    subscription_tier: 'free',
  },
  premium: {
    id: 'premium-1',
    email: 'premium@example.com',
    role: 'premium',
    subscription_tier: 'premium',
    subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  },
  admin: {
    id: 'admin-1',
    email: 'admin@protipp.admin',
    role: 'admin',
    subscription_tier: 'premium',
  },
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks or global state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Route Protection Flow', () => {
    it('should allow public access to public routes', () => {
      const publicRoutes = ['/', '/about', '/contact', '/terms', '/privacy'];
      
      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false);
        expect(hasRouteAccess(route, null)).toBe(true);
        expect(hasRouteAccess(route, mockUsers.user)).toBe(true);
      });
    });

    it('should protect user routes from unauthorized access', () => {
      const userRoutes = ['/dashboard', '/profile'];
      
      userRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true);
        expect(hasRouteAccess(route, null)).toBe(false);
        expect(hasRouteAccess(route, mockUsers.user)).toBe(true);
        expect(hasRouteAccess(route, mockUsers.premium)).toBe(true);
        expect(hasRouteAccess(route, mockUsers.admin)).toBe(true);
      });
    });

    it('should handle API route protection', () => {
      const apiRoutes = [
        { path: '/api/user', shouldBeProtected: true },
        { path: '/api/bets', shouldBeProtected: true },
        { path: '/api/arbitrage', shouldBeProtected: true },
        { path: '/api/premium', shouldBeProtected: true },
        { path: '/api/admin', shouldBeProtected: true },
      ];

      apiRoutes.forEach(({ path, shouldBeProtected }) => {
        expect(isProtectedRoute(path)).toBe(shouldBeProtected);
      });
    });
  });

  describe('Permission System Flow', () => {
    it('should handle user permissions correctly', () => {
      const user = mockUsers.user;
      
      // User permissions
      expect(hasPermission(user, 'read', 'dashboard')).toBe(true);
      expect(hasPermission(user, 'update', 'own_profile')).toBe(true);
      expect(hasPermission(user, 'create', 'bets')).toBe(true);
      expect(hasPermission(user, 'read', 'own_bets')).toBe(true);
      
      // Should not have premium permissions
      expect(hasPermission(user, 'read', 'premium_analytics')).toBe(false);
      expect(hasPermission(user, 'read', 'admin_data')).toBe(false);
    });

    it('should handle premium permissions correctly', () => {
      const premiumUser = mockUsers.premium;
      
      // All user permissions
      expect(hasPermission(premiumUser, 'read', 'dashboard')).toBe(true);
      expect(hasPermission(premiumUser, 'create', 'bets')).toBe(true);
      
      // Premium specific permissions
      expect(hasPermission(premiumUser, 'read', 'premium_analytics')).toBe(true);
      expect(hasPermission(premiumUser, 'read', 'advanced_arbitrage')).toBe(true);
      expect(hasPermission(premiumUser, 'create', 'custom_alerts')).toBe(true);
      
      // Should not have admin permissions
      expect(hasPermission(premiumUser, 'read', 'admin_data')).toBe(false);
    });

    it('should handle admin permissions correctly', () => {
      const admin = mockUsers.admin;
      
      // Admin should have all permissions
      expect(hasPermission(admin, 'read', 'dashboard')).toBe(true);
      expect(hasPermission(admin, 'read', 'premium_analytics')).toBe(true);
      expect(hasPermission(admin, 'read', 'admin_data')).toBe(true);
      expect(hasPermission(admin, '*', '*')).toBe(true);
    });
  });

  describe('Rate Limiting Flow', () => {
    it('should enforce rate limits correctly', () => {
      const identifier = 'test-user';
      const maxRequests = 5;
      const windowMs = 60000; // 1 minute

      // First requests should be allowed
      for (let i = 0; i < maxRequests; i++) {
        const result = checkRateLimit(identifier, maxRequests, windowMs);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(maxRequests - (i + 1));
      }

      // Next request should be blocked
      const blockedResult = checkRateLimit(identifier, maxRequests, windowMs);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });
  });

  describe('Role Hierarchy Flow', () => {
    it('should respect role hierarchy in route access', () => {
      const testCases = [
        { route: '/dashboard', user: 'user', expected: true },
        { route: '/dashboard', user: 'premium', expected: true },
        { route: '/dashboard', user: 'admin', expected: true },
        { route: '/dashboard', user: 'guest', expected: false },
      ];

      testCases.forEach(({ route, user, expected }) => {
        const userSession = user === 'guest' ? null : mockUsers[user];
        expect(hasRouteAccess(route, userSession)).toBe(expected);
      });
    });

    it('should handle subscription expiry correctly', () => {
      const expiredPremiumUser: UserSession = {
        id: 'expired-premium',
        email: 'expired@example.com',
        role: 'premium',
        subscription_tier: 'premium',
        subscription_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      };

      // Should not have premium permissions with expired subscription
      expect(hasPermission(expiredPremiumUser, 'read', 'premium_analytics')).toBe(false);
      
      // But should still have basic user permissions
      expect(hasPermission(expiredPremiumUser, 'read', 'dashboard')).toBe(true);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle invalid user sessions gracefully', () => {
      const invalidSessions = [
        null,
        undefined,
        {} as UserSession,
        { id: '', email: '', role: 'user' } as UserSession,
      ];

      invalidSessions.forEach(session => {
        // Should not crash and should default to no access
        expect(() => hasRouteAccess('/dashboard', session as UserSession | null)).not.toThrow();
        expect(() => hasPermission(session as UserSession | null, 'read', 'dashboard')).not.toThrow();
      });
    });

    it('should handle malformed route paths gracefully', () => {
      const malformedPaths = ['', null, undefined, '//', '///api//'];
      
      malformedPaths.forEach(path => {
        expect(() => isProtectedRoute(path as string)).not.toThrow();
        expect(() => getRoutePermission(path as string)).not.toThrow();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete authentication flow', () => {
      // 1. Guest user tries to access protected route
      expect(hasRouteAccess('/dashboard', null)).toBe(false);
      
      // 2. User logs in and gets access
      expect(hasRouteAccess('/dashboard', mockUsers.user)).toBe(true);
      
      // 3. User tries to access premium feature
      expect(hasPermission(mockUsers.user, 'read', 'premium_analytics')).toBe(false);
      
      // 4. User upgrades to premium
      expect(hasPermission(mockUsers.premium, 'read', 'premium_analytics')).toBe(true);
    });

    it('should handle API access control flow', () => {
      const apiEndpoints = [
        { path: '/api/user', method: 'GET', requiredRole: 'user' },
        { path: '/api/bets', method: 'POST', requiredRole: 'user' },
        { path: '/api/premium/analytics', method: 'GET', requiredRole: 'premium' },
        { path: '/api/admin/users', method: 'GET', requiredRole: 'admin' },
      ];

      apiEndpoints.forEach(({ path, requiredRole }) => {
        // Check protection
        expect(isProtectedRoute(path)).toBe(true);
        
        // Check access by role
        Object.entries(mockUsers).forEach(([userType, user]) => {
          if (userType === 'guest') return;
          
          const shouldHaveAccess = getUserRoleLevel(user.role) >= getRoleLevel(requiredRole as any);
          expect(hasRouteAccess(path, user)).toBe(shouldHaveAccess);
        });
      });
    });
  });
});

// Helper functions
function getUserRoleLevel(role: string): number {
  const levels = { user: 1, premium: 2, admin: 3 };
  return levels[role as keyof typeof levels] || 0;
}

function getRoleLevel(role: string): number {
  const levels = { user: 1, premium: 2, admin: 3 };
  return levels[role as keyof typeof levels] || 0;
}

// Mock implementations for external dependencies
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      refreshSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({})),
}));
