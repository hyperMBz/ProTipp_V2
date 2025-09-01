/**
 * Security Hooks - Biztonsági React hook-ok
 * Minden biztonsági rendszerhez React hook-ok
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { mfaManager, MFASetup, MFAVerification } from '@/lib/security/mfa-manager';
import { encryptionManager, EncryptionKey } from '@/lib/security/encryption-manager';
import { apiSecurityManager, APIKey } from '@/lib/security/api-security';
import { complianceManager, DataSubjectRequest } from '@/lib/security/compliance-manager';
import { securityMonitoringManager, SecurityEvent } from '@/lib/security/monitoring';
import { auditManager, AuditLog, AuditStats } from '@/lib/security/audit-manager';
import { sessionManager, Session } from '@/lib/security/session-manager';
import { inputValidator, ValidationResult, ValidationSchema } from '@/lib/security/input-validator';

// MFA Hook
export function useMFA() {
  const { user } = useAuth();
  const [mfaStatus, setMfaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMFAStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const status = await mfaManager.getUserMFAStatus(user.id);
      setMfaStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA státusz betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const setupMFA = useCallback(async (type: 'totp' | 'sms' | 'email') => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      let result;
      if (type === 'totp') {
        result = await mfaManager.setupTOTP(user.id);
      } else if (type === 'sms') {
        result = await mfaManager.setupSMS(user.id, user.phone || '');
      } else if (type === 'email') {
        result = await mfaManager.setupEmail(user.id, user.email || '');
      } else {
        throw new Error('Nem támogatott MFA típus');
      }
      await loadMFAStatus();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA beállítási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadMFAStatus]);

  const verifyMFA = useCallback(async (verification: MFAVerification) => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      const result = await mfaManager.verifyMFA(verification);
      await loadMFAStatus();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA ellenőrzési hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadMFAStatus]);

  const disableMFA = useCallback(async () => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      await mfaManager.deleteMFASession(user.id, 'totp');
      await loadMFAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA kikapcsolási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadMFAStatus]);

  useEffect(() => {
    loadMFAStatus();
  }, [loadMFAStatus]);

  return {
    mfaStatus,
    loading,
    error,
    setupMFA,
    verifyMFA,
    disableMFA,
    refresh: loadMFAStatus
  };
}

// Encryption Hook
export function useEncryption() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const activeKeys = await encryptionManager.getUserKeys(user.id);
      setKeys(activeKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kulcsok betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateMasterKey = useCallback(async (password: string) => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      const key = await encryptionManager.generateMasterKey(user.id, password);
      await loadKeys();
      return key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Master kulcs generálási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadKeys]);

  const generateSessionKey = useCallback(async () => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      // Először generáljunk egy master kulcsot, ha nincs
      const masterKeys = await encryptionManager.getUserKeys(user.id);
      const masterKey = masterKeys.find(k => k.key_type === 'master');
      
      if (!masterKey) {
        throw new Error('Először generálj egy master kulcsot');
      }
      
      const key = await encryptionManager.generateSessionKey(user.id, masterKey.id);
      await loadKeys();
      return key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session kulcs generálási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadKeys]);

  const encryptData = useCallback(async (data: string, keyId: string) => {
    try {
      setError(null);
      return await encryptionManager.encryptData(data, keyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Titkosítási hiba');
      throw err;
    }
  }, []);

  const decryptData = useCallback(async (encryptedData: any) => {
    try {
      setError(null);
      return await encryptionManager.decryptData(encryptedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Visszafejtési hiba');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  return {
    keys,
    loading,
    error,
    generateMasterKey,
    generateSessionKey,
    encryptData,
    decryptData,
    refresh: loadKeys
  };
}

// API Security Hook
export function useAPISecurity() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAPIKeys = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const keys = await apiSecurityManager.getUserAPIKeys(user.id);
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API kulcsok betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateAPIKey = useCallback(async (name: string, permissions: string[]) => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      const key = await apiSecurityManager.generateAPIKey(user.id, name, permissions);
      await loadAPIKeys();
      return key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API kulcs generálási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadAPIKeys]);

  const deactivateAPIKey = useCallback(async (keyId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiSecurityManager.deactivateAPIKey(keyId);
      await loadAPIKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API kulcs deaktiválási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAPIKeys]);

  useEffect(() => {
    loadAPIKeys();
  }, [loadAPIKeys]);

  return {
    apiKeys,
    loading,
    error,
    generateAPIKey,
    deactivateAPIKey,
    refresh: loadAPIKeys
  };
}

// Compliance Hook
export function useCompliance() {
  const { user } = useAuth();
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplianceStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = user ? await complianceManager.getComplianceStatus() : null;
      setComplianceStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance státusz betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDataRequest = useCallback(async (request: Omit<DataSubjectRequest, 'id' | 'created_at'>) => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      const result = await complianceManager.createDataSubjectRequest({
        ...request,
        user_id: user.id,
        status: 'pending'
      });
      await loadComplianceStatus();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adatigénylés létrehozási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadComplianceStatus]);

  const exportUserData = useCallback(async () => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
              const data = await complianceManager.generateDataExport(user.id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adatexportálási hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const deleteUserData = useCallback(async () => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      await complianceManager.deleteUserData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adattörlési hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadComplianceStatus();
  }, [loadComplianceStatus]);

  return {
    complianceStatus,
    dataRequests,
    loading,
    error,
    createDataRequest,
    exportUserData,
    deleteUserData,
    refresh: loadComplianceStatus
  };
}

// Security Monitoring Hook
export function useSecurityMonitoring() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await securityMonitoringManager.getSecurityEvents(filters);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Események betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await securityMonitoringManager.getMonitoringStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statisztikák betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>) => {
    try {
      setError(null);
      const result = await securityMonitoringManager.createSecurityEvent(event);
      await loadEvents();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Esemény létrehozási hiba');
      throw err;
    }
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
    loadStats();
  }, [loadEvents, loadStats]);

  return {
    events,
    stats,
    loading,
    error,
    createEvent,
    refreshEvents: loadEvents,
    refreshStats: loadStats
  };
}

// Audit Logging Hook
export function useAuditLogging() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (filters?: any, limit = 100, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await auditManager.getAuditLogs(filters, limit, offset);
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit logok betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (timeRange: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await auditManager.getAuditStats(timeRange);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit statisztikák betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLog = useCallback(async (log: Omit<AuditLog, 'id' | 'timestamp' | 'archived'>) => {
    try {
      setError(null);
      const result = await auditManager.createAuditLog(log);
      await loadLogs();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit log létrehozási hiba');
      throw err;
    }
  }, [loadLogs]);

  const exportLogs = useCallback(async (filters?: any, format: 'json' | 'csv' | 'xml' = 'json') => {
    try {
      setError(null);
      const data = await auditManager.exportAuditLogs(filters, format);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit log exportálási hiba');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  return {
    logs,
    stats,
    totalLogs,
    loading,
    error,
    createLog,
    exportLogs,
    refreshLogs: loadLogs,
    refreshStats: loadStats
  };
}

// Session Management Hook
export function useSessionManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const sessionsData = await sessionManager.getActiveSessions(user.id);
      setSessions(sessionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session-ök betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await sessionManager.getSessionStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session statisztikák betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await sessionManager.invalidateSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session érvénytelenítési hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSessions]);

  const invalidateAllSessions = useCallback(async (exceptSessionId?: string) => {
    if (!user?.id) throw new Error('Felhasználó nincs bejelentkezve');
    
    try {
      setLoading(true);
      setError(null);
      const count = await sessionManager.invalidateAllUserSessions(user.id, exceptSessionId);
      await loadSessions();
      return count;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session-ök érvénytelenítési hiba');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadSessions]);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, [loadSessions, loadStats]);

  return {
    sessions,
    stats,
    loading,
    error,
    invalidateSession,
    invalidateAllSessions,
    refreshSessions: loadSessions,
    refreshStats: loadStats
  };
}

// Input Validation Hook
export function useInputValidation() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = inputValidator.getConfig();
      setConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validáció konfiguráció betöltési hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  const validateInput = useCallback(async (data: Record<string, any>, schema: ValidationSchema) => {
    try {
      setError(null);
      const result = await inputValidator.validate(data, schema);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Input validációs hiba');
      throw err;
    }
  }, []);

  const sanitizeInput = useCallback(async (input: any, level: 'low' | 'medium' | 'high' | 'strict' = 'high') => {
    try {
      setError(null);
      const sanitized = inputValidator.sanitizeInput(input, level);
      return sanitized;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Input sanitizálási hiba');
      throw err;
    }
  }, []);

  const generateCSRFToken = useCallback(() => {
    try {
      setError(null);
      return inputValidator.generateCSRFToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSRF token generálási hiba');
      throw err;
    }
  }, []);

  const validateCSRFToken = useCallback((token: string) => {
    try {
      setError(null);
      return inputValidator.validateCSRFToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSRF token validációs hiba');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    validateInput,
    sanitizeInput,
    generateCSRFToken,
    validateCSRFToken,
    refresh: loadConfig
  };
}

// Combined Security Hook
export function useSecurity() {
  const mfa = useMFA();
  const encryption = useEncryption();
  const apiSecurity = useAPISecurity();
  const compliance = useCompliance();
  const monitoring = useSecurityMonitoring();
  const auditLogging = useAuditLogging();
  const sessionManagement = useSessionManagement();
  const inputValidation = useInputValidation();

  const isLoading = useMemo(() => 
    mfa.loading || encryption.loading || apiSecurity.loading || 
    compliance.loading || monitoring.loading || auditLogging.loading || 
    sessionManagement.loading || inputValidation.loading, 
    [mfa.loading, encryption.loading, apiSecurity.loading, compliance.loading, 
     monitoring.loading, auditLogging.loading, sessionManagement.loading, inputValidation.loading]
  );

  const error = useMemo(() => 
    mfa.error || encryption.error || apiSecurity.error || 
    compliance.error || monitoring.error || auditLogging.error || 
    sessionManagement.error || inputValidation.error, 
    [mfa.error, encryption.error, apiSecurity.error, compliance.error, 
     monitoring.error, auditLogging.error, sessionManagement.error, inputValidation.error]
  );

  const refreshAll = useCallback(() => {
    mfa.refresh();
    encryption.refresh();
    apiSecurity.refresh();
    compliance.refresh();
    monitoring.refreshEvents();
    monitoring.refreshStats();
    auditLogging.refreshLogs();
    auditLogging.refreshStats();
    sessionManagement.refreshSessions();
    sessionManagement.refreshStats();
    inputValidation.refresh();
  }, [mfa, encryption, apiSecurity, compliance, monitoring, auditLogging, sessionManagement, inputValidation]);

  return {
    mfa,
    encryption,
    apiSecurity,
    compliance,
    monitoring,
    auditLogging,
    sessionManagement,
    inputValidation,
    isLoading,
    error,
    refreshAll
  };
}
