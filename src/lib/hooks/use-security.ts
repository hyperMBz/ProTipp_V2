"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { authManager, SecurityConfig, MFASetup, AuthSession } from '../security/auth-manager';
import { apiSecurityManager, SecurityViolation } from '../security/api-security';

export interface SecurityStatus {
  isAuthenticated: boolean;
  user: User | null;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  mfaEnabled: boolean;
  sessionValid: boolean;
  lastSecurityCheck: Date | null;
}

export interface SecurityMetrics {
  totalViolations: number;
  activeViolations: number;
  blockedIPs: number;
  apiKeysActive: number;
  riskScore: number;
  lastUpdate: Date;
}

/**
 * Hook for managing user security status
 */
export function useSecurity(userId?: string) {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isAuthenticated: false,
    user: null,
    securityLevel: 'basic',
    mfaEnabled: false,
    sessionValid: false,
    lastSecurityCheck: null,
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSecurityStatus = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const config = await authManager.getSecurityConfig(userId);
      setSecurityConfig(config);

      const sessions = authManager.getUserSessions(userId);
      const activeSession = sessions.find(s => s.expires_at > new Date());

      setSecurityStatus({
        isAuthenticated: !!activeSession,
        user: activeSession?.user || null,
        securityLevel: activeSession?.security_level || 'basic',
        mfaEnabled: config?.mfa_enabled || false,
        sessionValid: !!activeSession,
        lastSecurityCheck: new Date(),
      });

    } catch (error) {
      console.error('[useSecurity] Error refreshing security status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshSecurityStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(refreshSecurityStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshSecurityStatus]);

  const enableMFA = useCallback(async (method: 'totp' | 'sms' | 'email' = 'totp'): Promise<MFASetup | null> => {
    if (!userId) return null;

    try {
      const setup = await authManager.setupMFA(userId, method);
      return setup;
    } catch (error) {
      console.error('[useSecurity] Error enabling MFA:', error);
      return null;
    }
  }, [userId]);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    if (!userId || !securityConfig?.mfa_method) return false;

    try {
      const isValid = await authManager.verifyMFA(userId, code, securityConfig.mfa_method);
      if (isValid) {
        await refreshSecurityStatus();
      }
      return isValid;
    } catch (error) {
      console.error('[useSecurity] Error verifying MFA:', error);
      return false;
    }
  }, [userId, securityConfig?.mfa_method, refreshSecurityStatus]);

  const disableMFA = useCallback(async (verificationCode: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await authManager.disableMFA(userId, verificationCode);
      if (success) {
        await refreshSecurityStatus();
      }
      return success;
    } catch (error) {
      console.error('[useSecurity] Error disabling MFA:', error);
      return false;
    }
  }, [userId, refreshSecurityStatus]);

  const generateAPIKey = useCallback(async (name: string, permissions: string[] = []): Promise<{
    key_id: string;
    api_key: string;
    permissions: string[];
  } | null> => {
    if (!userId) return null;

    try {
      const keyData = await authManager.generateAPIKey(userId, name, permissions);
      await refreshSecurityStatus();
      return keyData;
    } catch (error) {
      console.error('[useSecurity] Error generating API key:', error);
      return null;
    }
  }, [userId, refreshSecurityStatus]);

  const revokeAPIKey = useCallback(async (keyId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await authManager.revokeAPIKey(userId, keyId);
      if (success) {
        await refreshSecurityStatus();
      }
      return success;
    } catch (error) {
      console.error('[useSecurity] Error revoking API key:', error);
      return false;
    }
  }, [userId, refreshSecurityStatus]);

  return {
    securityStatus,
    securityConfig,
    isLoading,
    enableMFA,
    verifyMFA,
    disableMFA,
    generateAPIKey,
    revokeAPIKey,
    refresh: refreshSecurityStatus,
  };
}

/**
 * Hook for monitoring security violations and metrics
 */
export function useSecurityMonitoring(refreshInterval: number = 30000) {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalViolations: 0,
    activeViolations: 0,
    blockedIPs: 0,
    apiKeysActive: 0,
    riskScore: 0,
    lastUpdate: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshSecurityData = useCallback(async () => {
    try {
      const [recentViolations, securityMetrics] = await Promise.all([
        apiSecurityManager.getViolations({ limit: 100 }),
        apiSecurityManager.getSecurityMetrics(),
      ]);

      setViolations(recentViolations);
      
      const activeViolations = recentViolations.filter(v => !v.resolved);
      const riskScore = calculateRiskScore(recentViolations);

      setMetrics({
        totalViolations: securityMetrics.blocked_requests,
        activeViolations: activeViolations.length,
        blockedIPs: securityMetrics.blocked_ips,
        apiKeysActive: securityMetrics.active_api_keys,
        riskScore,
        lastUpdate: new Date(),
      });

    } catch (error) {
      console.error('[useSecurityMonitoring] Error refreshing security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSecurityData();
    
    const interval = setInterval(refreshSecurityData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshSecurityData, refreshInterval]);

  const resolveViolation = useCallback(async (violationId: string) => {
    try {
      const success = apiSecurityManager.resolveViolation(violationId);
      if (success) {
        await refreshSecurityData();
      }
      return success;
    } catch (error) {
      console.error('[useSecurityMonitoring] Error resolving violation:', error);
      return false;
    }
  }, [refreshSecurityData]);

  const blockIP = useCallback(async (ipAddress: string, reason: string) => {
    try {
      apiSecurityManager.blockIP(ipAddress, reason);
      await refreshSecurityData();
    } catch (error) {
      console.error('[useSecurityMonitoring] Error blocking IP:', error);
    }
  }, [refreshSecurityData]);

  const unblockIP = useCallback(async (ipAddress: string) => {
    try {
      const success = apiSecurityManager.unblockIP(ipAddress);
      if (success) {
        await refreshSecurityData();
      }
      return success;
    } catch (error) {
      console.error('[useSecurityMonitoring] Error unblocking IP:', error);
      return false;
    }
  }, [refreshSecurityData]);

  const violationsByType = useMemo(() => {
    return violations.reduce((acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [violations]);

  const violationsBySeverity = useMemo(() => {
    return violations.reduce((acc, violation) => {
      acc[violation.severity] = (acc[violation.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [violations]);

  return {
    violations,
    metrics,
    violationsByType,
    violationsBySeverity,
    isLoading,
    resolveViolation,
    blockIP,
    unblockIP,
    refresh: refreshSecurityData,
  };
}

/**
 * Hook for session management
 */
export function useSessionManagement(userId?: string) {
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSessions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const userSessions = authManager.getUserSessions(userId);
      setSessions(userSessions);
    } catch (error) {
      console.error('[useSessionManagement] Error refreshing sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshSessions();
    
    // Refresh every 2 minutes
    const interval = setInterval(refreshSessions, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshSessions]);

  const terminateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const success = await authManager.terminateSession(sessionId);
      if (success) {
        await refreshSessions();
      }
      return success;
    } catch (error) {
      console.error('[useSessionManagement] Error terminating session:', error);
      return false;
    }
  }, [refreshSessions]);

  const terminateAllSessions = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const userSessions = authManager.getUserSessions(userId);
      const terminationPromises = userSessions.map(session => 
        authManager.terminateSession(session.session_id)
      );
      
      await Promise.all(terminationPromises);
      await refreshSessions();
      return true;
    } catch (error) {
      console.error('[useSessionManagement] Error terminating all sessions:', error);
      return false;
    }
  }, [userId, refreshSessions]);

  const activeSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(session => session.expires_at > now);
  }, [sessions]);

  const expiredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(session => session.expires_at <= now);
  }, [sessions]);

  return {
    sessions,
    activeSessions,
    expiredSessions,
    isLoading,
    terminateSession,
    terminateAllSessions,
    refresh: refreshSessions,
  };
}

/**
 * Hook for API key management
 */
export function useAPIKeyManagement(userId?: string) {
  const [apiKeys, setAPIKeys] = useState<SecurityConfig['api_keys']>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAPIKeys = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const config = await authManager.getSecurityConfig(userId);
      setAPIKeys(config?.api_keys || []);
    } catch (error) {
      console.error('[useAPIKeyManagement] Error refreshing API keys:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshAPIKeys();
  }, [refreshAPIKeys]);

  const generateKey = useCallback(async (name: string, permissions: string[] = []): Promise<{
    key_id: string;
    api_key: string;
    permissions: string[];
  } | null> => {
    if (!userId) return null;

    try {
      const keyData = await authManager.generateAPIKey(userId, name, permissions);
      await refreshAPIKeys();
      return keyData;
    } catch (error) {
      console.error('[useAPIKeyManagement] Error generating API key:', error);
      return null;
    }
  }, [userId, refreshAPIKeys]);

  const revokeKey = useCallback(async (keyId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await authManager.revokeAPIKey(userId, keyId);
      if (success) {
        await refreshAPIKeys();
      }
      return success;
    } catch (error) {
      console.error('[useAPIKeyManagement] Error revoking API key:', error);
      return false;
    }
  }, [userId, refreshAPIKeys]);

  const getKeyStats = useCallback((keyId: string) => {
    // In production, this would fetch actual usage statistics
    return {
      total_requests: 0,
      requests_today: 0,
      last_used: apiKeys.find(key => key.key_id === keyId)?.last_used,
      violations: 0,
    };
  }, [apiKeys]);

  return {
    apiKeys,
    isLoading,
    generateKey,
    revokeKey,
    getKeyStats,
    refresh: refreshAPIKeys,
  };
}

/**
 * Hook for compliance monitoring
 */
export function useComplianceMonitoring() {
  const [complianceStatus, setComplianceStatus] = useState({
    gdpr_compliant: true,
    data_retention_policy: true,
    encryption_enabled: true,
    audit_logging: true,
    last_assessment: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);

  const runComplianceCheck = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would run actual compliance checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setComplianceStatus({
        gdpr_compliant: true,
        data_retention_policy: true,
        encryption_enabled: true,
        audit_logging: true,
        last_assessment: new Date(),
      });
    } catch (error) {
      console.error('[useComplianceMonitoring] Error running compliance check:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    runComplianceCheck();
  }, [runComplianceCheck]);

  return {
    complianceStatus,
    isLoading,
    runComplianceCheck,
  };
}

/**
 * Calculate risk score based on violations
 */
function calculateRiskScore(violations: SecurityViolation[]): number {
  if (violations.length === 0) return 0;

  const recentViolations = violations.filter(
    v => Date.now() - v.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
  );

  let score = 0;
  
  recentViolations.forEach(violation => {
    switch (violation.severity) {
      case 'low':
        score += 1;
        break;
      case 'medium':
        score += 3;
        break;
      case 'high':
        score += 7;
        break;
      case 'critical':
        score += 15;
        break;
    }
  });

  return Math.min(score, 100);
}
