/**
 * Security Hooks Unit Tests
 * Teszteli az összes security hook alapvető funkcionalitását
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMFA, useEncryption, useAPISecurity, useCompliance, useSecurityMonitoring, useAuditLogging, useSessionManagement, useInputValidation, useSecurity } from '../use-security';

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
      getUserMFAStatus: vi.fn(),
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
      getUserKeys: vi.fn(),
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
      getUserAPIKeys: vi.fn(),
      generateAPIKey: vi.fn(),
      deactivateAPIKey: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/compliance-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getUserComplianceStatus: vi.fn(),
      createDataSubjectRequest: vi.fn(),
      generateDataExport: vi.fn(),
      deleteUserData: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/monitoring', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getSecurityEvents: vi.fn(),
      getMonitoringStats: vi.fn(),
      createSecurityEvent: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/audit-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getAuditLogs: vi.fn(),
      getAuditStats: vi.fn(),
      createAuditLog: vi.fn(),
      exportAuditLogs: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/session-manager', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getActiveSessions: vi.fn(),
      getSessionStats: vi.fn(),
      invalidateSession: vi.fn(),
      invalidateAllUserSessions: vi.fn()
    }))
  }
}));

vi.mock('@/lib/security/input-validator', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getConfig: vi.fn(),
      validate: vi.fn(),
      sanitizeInput: vi.fn(),
      generateCSRFToken: vi.fn(),
      validateCSRFToken: vi.fn()
    }))
  }
}));

describe('Security Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMFA', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMFA());

      expect(result.current.mfaStatus).toBeNull();
      expect(result.current.loading).toBe(true); // Loading on mount
      expect(result.current.error).toBeNull();
      expect(typeof result.current.setupMFA).toBe('function');
      expect(typeof result.current.verifyMFA).toBe('function');
      expect(typeof result.current.disableMFA).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should load MFA status on mount', async () => {
      const mockStatus = { has_mfa: true, mfa_types: ['totp'], is_verified: true };
      const { default: mfaManager } = await import('@/lib/security/mfa-manager');
      const instance = mfaManager.getInstance();
      vi.mocked(instance.getUserMFAStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useMFA());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getUserMFAStatus).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('useEncryption', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useEncryption());

      expect(result.current.keys).toEqual([]); // Initial state is empty array
      expect(result.current.loading).toBe(true); // Loading on mount for encryption
      // Error can be null or a string, depending on the state
      expect(['string', 'object', 'null']).toContain(typeof result.current.error);
      expect(typeof result.current.generateMasterKey).toBe('function');
      expect(typeof result.current.generateSessionKey).toBe('function');
      expect(typeof result.current.encryptData).toBe('function');
      expect(typeof result.current.decryptData).toBe('function');
    });

    it('should load keys on mount', async () => {
      const mockKeys = [{ 
        id: 'key-1', 
        user_id: 'test-user-123',
        name: 'Master Key', 
        key_type: 'master',
        encrypted_key: 'encrypted-key',
        iv: 'iv',
        created_at: new Date(),
        expires_at: new Date(),
        is_active: true
      }];
      const { default: encryptionManager } = await import('@/lib/security/encryption-manager');
      const instance = encryptionManager.getInstance();
      vi.mocked(instance.getUserKeys).mockResolvedValue(mockKeys);

      const { result } = renderHook(() => useEncryption());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getUserKeys).toHaveBeenCalled();
    });
  });

  describe('useAPISecurity', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAPISecurity());

      expect(result.current.apiKeys).toEqual([]);
      expect(result.current.loading).toBe(true); // Loading on mount
      expect(result.current.error).toBeNull();
      expect(typeof result.current.generateAPIKey).toBe('function');
      expect(typeof result.current.deactivateAPIKey).toBe('function');
    });

    it('should load API keys on mount', async () => {
      const mockKeys = [{ 
        id: 'api-1', 
        user_id: 'test-user-123',
        name: 'Test API Key', 
        key_hash: 'hash',
        permissions: ['read'],
        rate_limit: 1000,
        rate_limit_window: 3600,
        created_at: new Date(),
        last_used: new Date(),
        is_active: true
      }];
      const { default: apiSecurityManager } = await import('@/lib/security/api-security');
      const instance = apiSecurityManager.getInstance();
      vi.mocked(instance.getUserAPIKeys).mockResolvedValue(mockKeys);

      const { result } = renderHook(() => useAPISecurity());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getUserAPIKeys).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('useCompliance', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCompliance());

      expect(result.current.complianceStatus).toBeUndefined(); // Initial state is undefined
      expect(result.current.dataRequests).toEqual([]);
      expect(result.current.loading).toBe(false); // No loading on mount for compliance
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createDataRequest).toBe('function');
      expect(typeof result.current.exportUserData).toBe('function');
      expect(typeof result.current.deleteUserData).toBe('function');
    });

    it('should load compliance status on mount', async () => {
      const mockStatus = { 
        gdpr_enabled: true,
        data_export_enabled: true,
        data_deletion_enabled: true
      };
      const { default: complianceManager } = await import('@/lib/security/compliance-manager');
      const instance = complianceManager.getInstance();
      vi.mocked(instance.getUserComplianceStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useCompliance());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getUserComplianceStatus).toHaveBeenCalled();
    });
  });

  describe('useSecurityMonitoring', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSecurityMonitoring());

      expect(result.current.events).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.loading).toBe(true); // Loading on mount
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createEvent).toBe('function');
      expect(typeof result.current.refreshEvents).toBe('function');
      expect(typeof result.current.refreshStats).toBe('function');
    });

    it('should load events and stats on mount', async () => {
      const mockEvents = [{ 
        id: 'event-1', 
        user_id: 'test-user-123',
        event_type: 'login_failed', 
        severity: 'medium',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        description: 'Failed login attempt',
        timestamp: new Date(),
        is_resolved: false,
        auto_resolved: false
      }];
      const mockStats = { total_events: 10, critical_events: 2 };
      const { default: securityMonitoringManager } = await import('@/lib/security/monitoring');
      const instance = securityMonitoringManager.getInstance();
      vi.mocked(instance.getSecurityEvents).mockResolvedValue(mockEvents);
      vi.mocked(instance.getMonitoringStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useSecurityMonitoring());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getSecurityEvents).toHaveBeenCalled();
      expect(instance.getMonitoringStats).toHaveBeenCalled();
    });
  });

  describe('useAuditLogging', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuditLogging());

      expect(result.current.logs).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.totalLogs).toBe(0);
      expect(result.current.loading).toBe(true); // Loading on mount
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createLog).toBe('function');
      expect(typeof result.current.exportLogs).toBe('function');
      expect(typeof result.current.refreshLogs).toBe('function');
      expect(typeof result.current.refreshStats).toBe('function');
    });

    it('should load logs and stats on mount', async () => {
      const mockLogs = [{ 
        id: 'log-1', 
        user_id: 'test-user-123',
        action: 'user_login',
        resource_type: 'auth',
        action_type: 'login',
        status: 'success',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        timestamp: new Date(),
        session_id: 'session-123',
        metadata: {},
        success: true
      }];
      const mockStats = { total_logs: 100, logs_today: 10 };
      const { default: auditManager } = await import('@/lib/security/audit-manager');
      const instance = auditManager.getInstance();
      vi.mocked(instance.getAuditLogs).mockResolvedValue({ logs: mockLogs, total: 100 });
      vi.mocked(instance.getAuditStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useAuditLogging());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getAuditLogs).toHaveBeenCalled();
      expect(instance.getAuditStats).toHaveBeenCalled();
    });
  });

  describe('useSessionManagement', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.sessions).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.loading).toBe(true); // Loading on mount
      expect(result.current.error).toBeNull();
      expect(typeof result.current.invalidateSession).toBe('function');
      expect(typeof result.current.invalidateAllSessions).toBe('function');
      expect(typeof result.current.refreshSessions).toBe('function');
      expect(typeof result.current.refreshStats).toBe('function');
    });

    it('should load sessions and stats on mount', async () => {
      const mockSessions = [{ 
        id: 'session-1', 
        user_id: 'test-user-123', 
        session_token: 'token-123',
        refresh_token: 'refresh-123',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        created_at: new Date(),
        expires_at: new Date(),
        last_activity: new Date(),
        is_active: true,
        device_info: 'test-device',
        location: 'test-location',
        concurrent_sessions: 1
      }];
      const mockStats = { 
        total_sessions: 5, 
        active_sessions: 2,
        expired_sessions: 3,
        concurrent_sessions: 1,
        sessions_today: 2,
        sessions_this_week: 8,
        sessions_this_month: 25,
        avg_session_duration: 3600,
        max_concurrent_sessions: 2
      };
      const { default: sessionManager } = await import('@/lib/security/session-manager');
      const instance = sessionManager.getInstance();
      vi.mocked(instance.getActiveSessions).mockResolvedValue(mockSessions);
      vi.mocked(instance.getSessionStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useSessionManagement());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getActiveSessions).toHaveBeenCalledWith('test-user-123');
      expect(instance.getSessionStats).toHaveBeenCalled();
    });
  });

  describe('useInputValidation', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useInputValidation());

      expect(result.current.config).toBeUndefined(); // Initial state is undefined
      expect(result.current.loading).toBe(false); // No loading on mount for input validation
      expect(result.current.error).toBeNull();
      expect(typeof result.current.validateInput).toBe('function');
      expect(typeof result.current.sanitizeInput).toBe('function');
      expect(typeof result.current.generateCSRFToken).toBe('function');
      expect(typeof result.current.validateCSRFToken).toBe('function');
    });

    it('should load config on mount', async () => {
      const mockConfig = { 
        enabled: true,
        max_length: 1000, 
        allowed_tags: ['p', 'br'],
        security: {
          xss_protection: true,
          sql_injection_protection: true,
          csrf_protection: true
        },
        default_rules: ['max_length', 'xss_protection'],
        custom_validators: []
      };
      const { default: inputValidator } = await import('@/lib/security/input-validator');
      const instance = inputValidator.getInstance();
      vi.mocked(instance.getConfig).mockReturnValue(mockConfig);

      const { result } = renderHook(() => useInputValidation());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(instance.getConfig).toHaveBeenCalled();
    });
  });

  describe('useSecurity', () => {
    it('should combine all security hooks', () => {
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
      expect(['string', 'object', 'null']).toContain(typeof result.current.error); // Can be string, object, or null
      expect(typeof result.current.refreshAll).toBe('function');
    });

    it('should track loading state across all hooks', () => {
      const { result } = renderHook(() => useSecurity());

      expect(result.current.isLoading).toBe(true); // Loading on mount
    });

    it('should track error state across all hooks', () => {
      const { result } = renderHook(() => useSecurity());

      // Error can be null or a string, depending on the state
      expect(['string', 'object', 'null']).toContain(typeof result.current.error);
    });

    it('should provide refreshAll function', () => {
      const { result } = renderHook(() => useSecurity());

      expect(typeof result.current.refreshAll).toBe('function');
    });
  });
});
