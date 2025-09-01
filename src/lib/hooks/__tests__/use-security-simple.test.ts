/**
 * Security Hooks Simple Unit Tests
 * Egyszerűsített teszt a security hook alapvető funkcionalitásához
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock auth provider
vi.mock('@/lib/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'test@example.com' },
    signIn: vi.fn(),
    signOut: vi.fn(),
    loading: false
  })
}));

// Mock security managers
vi.mock('@/lib/security/mfa-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getUserMFAStatus: vi.fn().mockResolvedValue({ has_mfa: true, mfa_types: ['totp'], is_verified: true }),
      setupTOTP: vi.fn(),
      setupSMS: vi.fn(),
      setupEmail: vi.fn(),
      verifyMFA: vi.fn(),
      deleteMFASession: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/encryption-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getUserKeys: vi.fn().mockResolvedValue([]),
      generateMasterKey: vi.fn(),
      generateSessionKey: vi.fn(),
      encryptData: vi.fn(),
      decryptData: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/api-security', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getUserAPIKeys: vi.fn().mockResolvedValue([]),
      generateAPIKey: vi.fn(),
      deactivateAPIKey: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/compliance-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getUserComplianceStatus: vi.fn().mockResolvedValue({ gdpr_enabled: true, data_export_enabled: true, data_deletion_enabled: true }),
      createDataSubjectRequest: vi.fn(),
      generateDataExport: vi.fn(),
      deleteUserData: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/monitoring', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getSecurityEvents: vi.fn().mockResolvedValue([]),
      getMonitoringStats: vi.fn().mockResolvedValue({ total_events: 0, critical_events: 0 }),
      createSecurityEvent: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/audit-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
      getAuditStats: vi.fn().mockResolvedValue({ total_logs: 0, logs_today: 0 }),
      createAuditLog: vi.fn(),
      exportAuditLogs: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/session-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getActiveSessions: vi.fn().mockResolvedValue([]),
      getSessionStats: vi.fn().mockResolvedValue({ expired_sessions: 0, concurrent_sessions: 0 }),
      invalidateSession: vi.fn(),
      invalidateAllUserSessions: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/input-validator', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getConfig: vi.fn().mockReturnValue({ enabled: true, security: { xss_protection: true } }),
      validate: vi.fn(),
      sanitizeInput: vi.fn(),
      generateCSRFToken: vi.fn(),
      validateCSRFToken: vi.fn()
    }))
  }
}));

describe('Security Hooks Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMFA', () => {
    it('should initialize with default state', async () => {
      const { useMFA } = await import('../use-security');
      const { result } = renderHook(() => useMFA());

      expect(result.current.status).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.setupMFA).toBe('function');
      expect(typeof result.current.verifyMFA).toBe('function');
      expect(typeof result.current.disableMFA).toBe('function');
    });
  });

  describe('useEncryption', () => {
    it('should initialize with default state', async () => {
      const { useEncryption } = await import('../use-security');
      const { result } = renderHook(() => useEncryption());

      expect(result.current.keys).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.generateMasterKey).toBe('function');
      expect(typeof result.current.generateSessionKey).toBe('function');
      expect(typeof result.current.encryptData).toBe('function');
      expect(typeof result.current.decryptData).toBe('function');
    });
  });

  describe('useAPISecurity', () => {
    it('should initialize with default state', async () => {
      const { useAPISecurity } = await import('../use-security');
      const { result } = renderHook(() => useAPISecurity());

      expect(result.current.keys).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.generateAPIKey).toBe('function');
      expect(typeof result.current.deactivateAPIKey).toBe('function');
    });
  });

  describe('useCompliance', () => {
    it('should initialize with default state', async () => {
      const { useCompliance } = await import('../use-security');
      const { result } = renderHook(() => useCompliance());

      expect(result.current.status).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createDataSubjectRequest).toBe('function');
      expect(typeof result.current.exportUserData).toBe('function');
      expect(typeof result.current.deleteUserData).toBe('function');
    });
  });

  describe('useSecurityMonitoring', () => {
    it('should initialize with default state', async () => {
      const { useSecurityMonitoring } = await import('../use-security');
      const { result } = renderHook(() => useSecurityMonitoring());

      expect(result.current.events).toBeDefined();
      expect(result.current.stats).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createSecurityEvent).toBe('function');
    });
  });

  describe('useAuditLogging', () => {
    it('should initialize with default state', async () => {
      const { useAuditLogging } = await import('../use-security');
      const { result } = renderHook(() => useAuditLogging());

      expect(result.current.logs).toBeDefined();
      expect(result.current.stats).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createAuditLog).toBe('function');
      expect(typeof result.current.exportAuditLogs).toBe('function');
    });
  });

  describe('useSessionManagement', () => {
    it('should initialize with default state', async () => {
      const { useSessionManagement } = await import('../use-security');
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessions).toBeDefined();
      expect(result.current.stats).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.invalidateSession).toBe('function');
      expect(typeof result.current.invalidateAllUserSessions).toBe('function');
    });
  });

  describe('useInputValidation', () => {
    it('should initialize with default state', async () => {
      const { useInputValidation } = await import('../use-security');
      const { result } = renderHook(() => useInputValidation());

      expect(result.current.config).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.validateInput).toBe('function');
      expect(typeof result.current.sanitizeInput).toBe('function');
      expect(typeof result.current.generateCSRFToken).toBe('function');
      expect(typeof result.current.validateCSRFToken).toBe('function');
    });
  });

  describe('useSecurity', () => {
    it('should combine all security hooks', async () => {
      const { useSecurity } = await import('../use-security');
      const { result } = renderHook(() => useSecurity());

      expect(result.current.mfa).toBeDefined();
      expect(result.current.encryption).toBeDefined();
      expect(result.current.apiSecurity).toBeDefined();
      expect(result.current.compliance).toBeDefined();
      expect(result.current.monitoring).toBeDefined();
      expect(result.current.auditLogging).toBeDefined();
      expect(result.current.sessionManagement).toBeDefined();
      expect(result.current.inputValidation).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(['string', 'object', 'null']).toContain(typeof result.current.error);
      expect(typeof result.current.refreshAll).toBe('function');
    });
  });
});
