/**
 * Permission Checker Utilities
 * Részletes permission ellenőrzések és validációk
 */

import { UserSession, UserRole } from './route-guard';

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

/**
 * Szerepkör alapú jogosultságok definíciója
 */
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'public',
    permissions: [
      { action: 'read', resource: 'public_pages' },
      { action: 'read', resource: 'public_api' },
    ],
  },
  {
    role: 'user',
    permissions: [
      { action: 'read', resource: 'public_pages' },
      { action: 'read', resource: 'public_api' },
      { action: 'read', resource: 'dashboard' },
      { action: 'read', resource: 'profile' },
      { action: 'update', resource: 'own_profile' },
      { action: 'create', resource: 'bets' },
      { action: 'read', resource: 'own_bets' },
      { action: 'update', resource: 'own_bets' },
      { action: 'delete', resource: 'own_bets' },
      { action: 'read', resource: 'arbitrage_opportunities' },
      { action: 'create', resource: 'notifications' },
      { action: 'read', resource: 'own_notifications' },
      { action: 'update', resource: 'own_notifications' },
    ],
  },
  {
    role: 'premium',
    permissions: [
      // Minden user jogosultság
      { action: 'read', resource: 'public_pages' },
      { action: 'read', resource: 'public_api' },
      { action: 'read', resource: 'dashboard' },
      { action: 'read', resource: 'profile' },
      { action: 'update', resource: 'own_profile' },
      { action: 'create', resource: 'bets' },
      { action: 'read', resource: 'own_bets' },
      { action: 'update', resource: 'own_bets' },
      { action: 'delete', resource: 'own_bets' },
      { action: 'read', resource: 'arbitrage_opportunities' },
      { action: 'create', resource: 'notifications' },
      { action: 'read', resource: 'own_notifications' },
      { action: 'update', resource: 'own_notifications' },
      // Premium specifikus jogosultságok
      { action: 'read', resource: 'premium_analytics' },
      { action: 'read', resource: 'advanced_arbitrage' },
      { action: 'create', resource: 'custom_alerts' },
      { action: 'read', resource: 'api_access' },
      { action: 'export', resource: 'betting_data' },
    ],
  },
  {
    role: 'admin',
    permissions: [
      // Minden jogosultság
      { action: '*', resource: '*' },
    ],
  },
];

/**
 * Ellenőrzi hogy a felhasználó rendelkezik-e egy adott jogosultsággal
 */
export function hasPermission(
  userSession: UserSession | null,
  action: string,
  resource: string,
  conditions?: Record<string, any>
): boolean {
  if (!userSession) {
    // Guest user - csak public jogosultságok
    return hasRolePermission('public', action, resource, conditions);
  }
  
  return hasRolePermission(userSession.role, action, resource, conditions);
}

/**
 * Szerepkör alapú jogosultság ellenőrzés
 */
export function hasRolePermission(
  role: UserRole,
  action: string,
  resource: string,
  conditions?: Record<string, any>
): boolean {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  
  if (!rolePermissions) {
    return false;
  }
  
  // Admin mindent csinálhat
  if (role === 'admin') {
    return true;
  }
  
  // Keresés exact match-re
  const exactPermission = rolePermissions.permissions.find(
    p => p.action === action && p.resource === resource
  );
  
  if (exactPermission) {
    return checkConditions(exactPermission.conditions, conditions);
  }
  
  // Keresés wildcard match-re
  const wildcardPermission = rolePermissions.permissions.find(
    p => (p.action === '*' || p.action === action) && 
         (p.resource === '*' || p.resource === resource)
  );
  
  if (wildcardPermission) {
    return checkConditions(wildcardPermission.conditions, conditions);
  }
  
  return false;
}

/**
 * Feltételek ellenőrzése
 */
function checkConditions(
  permissionConditions?: Record<string, any>,
  requestConditions?: Record<string, any>
): boolean {
  if (!permissionConditions) {
    return true;
  }
  
  if (!requestConditions) {
    return false;
  }
  
  // Minden feltételnek teljesülnie kell
  return Object.entries(permissionConditions).every(([key, value]) => {
    return requestConditions[key] === value;
  });
}

/**
 * Felhasználó összes jogosultságának lekérése
 */
export function getUserPermissions(userSession: UserSession | null): Permission[] {
  if (!userSession) {
    const publicRole = ROLE_PERMISSIONS.find(rp => rp.role === 'public');
    return publicRole?.permissions || [];
  }
  
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userSession.role);
  return rolePermissions?.permissions || [];
}

/**
 * Resource ownership ellenőrzés
 */
export function isResourceOwner(
  userSession: UserSession | null,
  resourceOwnerId: string
): boolean {
  if (!userSession) {
    return false;
  }
  
  return userSession.id === resourceOwnerId;
}

/**
 * Batch permission ellenőrzés
 */
export function hasAllPermissions(
  userSession: UserSession | null,
  requiredPermissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
): boolean {
  return requiredPermissions.every(({ action, resource, conditions }) =>
    hasPermission(userSession, action, resource, conditions)
  );
}

/**
 * Legalább egy jogosultság ellenőrzés
 */
export function hasAnyPermission(
  userSession: UserSession | null,
  requiredPermissions: Array<{ action: string; resource: string; conditions?: Record<string, any> }>
): boolean {
  return requiredPermissions.some(({ action, resource, conditions }) =>
    hasPermission(userSession, action, resource, conditions)
  );
}

/**
 * API endpoint permission mapping
 */
export const API_PERMISSIONS: Record<string, { action: string; resource: string }> = {
  'GET /api/user/profile': { action: 'read', resource: 'profile' },
  'PUT /api/user/profile': { action: 'update', resource: 'own_profile' },
  'GET /api/bets': { action: 'read', resource: 'own_bets' },
  'POST /api/bets': { action: 'create', resource: 'bets' },
  'PUT /api/bets/[id]': { action: 'update', resource: 'own_bets' },
  'DELETE /api/bets/[id]': { action: 'delete', resource: 'own_bets' },
  'GET /api/arbitrage': { action: 'read', resource: 'arbitrage_opportunities' },
  'GET /api/premium/analytics': { action: 'read', resource: 'premium_analytics' },
  'GET /api/admin/*': { action: 'read', resource: 'admin_data' },
};

/**
 * API endpoint jogosultság ellenőrzés
 */
export function hasApiPermission(
  userSession: UserSession | null,
  method: string,
  pathname: string
): boolean {
  const key = `${method} ${pathname}`;
  const permission = API_PERMISSIONS[key];
  
  if (!permission) {
    // Ha nincs explicit permission, akkor admin jogosultság szükséges
    return userSession?.role === 'admin';
  }
  
  return hasPermission(userSession, permission.action, permission.resource);
}
