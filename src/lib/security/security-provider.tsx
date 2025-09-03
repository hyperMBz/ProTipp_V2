"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { authManager } from "./auth-manager";
import { encryptionService } from "./encryption-service";
import { complianceChecker } from "./compliance-checker";
import { auditLogger } from "./audit-logger";

// Security context interface
interface SecurityContextType {
  // Auth state
  isAuthenticated: boolean;
  user: any | null;
  mfaEnabled: boolean;
  mfaMethod: string;
  
  // Security state
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceStatus: {
    gdpr: { compliant: boolean; score: number };
    financial: { compliant: boolean; score: number };
    dataProtection: { compliant: boolean; score: number };
  } | null;
  
  // Security functions
  login: (email: string, password: string, mfaCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setupMFA: (method: 'totp' | 'sms' | 'email') => Promise<boolean>;
  verifyMFA: (code: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // Audit functions
  logSecurityEvent: (event: SecurityEvent) => Promise<void>;
  getSecurityMetrics: () => any;
  getRecentAlerts: () => any[];
  
  // Compliance functions
  checkCompliance: () => Promise<any>;
  getComplianceReport: () => Promise<any>;
  
  // Encryption functions
  encryptData: (data: any) => Promise<string>;
  decryptData: (encryptedData: string) => Promise<any>;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
}

// Security event interface
interface SecurityEvent {
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'api_usage' | 'system' | 'compliance';
}

// Security provider props
interface SecurityProviderProps {
  children: ReactNode;
}

// Create security context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Security provider component
export function SecurityProvider({ children }: SecurityProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('');
  const [securityScore, setSecurityScore] = useState(0);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [complianceStatus, setComplianceStatus] = useState<{
    gdpr: { compliant: boolean; score: number };
    financial: { compliant: boolean; score: number };
    dataProtection: { compliant: boolean; score: number };
  } | null>({
    gdpr: { compliant: false, score: 0 },
    financial: { compliant: false, score: 0 },
    dataProtection: { compliant: false, score: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize security systems
  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      setIsInitializing(true);
      
      // Initialize security services - these are singletons, no explicit init needed
      // await Promise.all([
      //   authManager.initialize(),
      //   encryptionService.initialize(),
      //   complianceChecker.initialize(),
      //   auditLogger.initialize(),
      // ]);

      // Check authentication status - mock for now
      const authStatus = {
        isAuthenticated: false,
        user: null,
        mfaEnabled: false,
        mfaMethod: '',
      };
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
      setMfaEnabled(authStatus.mfaEnabled);
      setMfaMethod(authStatus.mfaMethod);

      // Load security metrics
      const metrics = auditLogger.getSecurityMetrics();
      setSecurityScore(metrics.complianceScore);
      setThreatLevel(metrics.threatLevel);

      // Load compliance status - mock for now
      // if (authStatus.user?.id) {
      //   const compliance = await complianceChecker.checkOverallCompliance(authStatus.user.id);
      //   setComplianceStatus({
      //     gdpr: compliance.gdpr.consent_given,
      //     financial: compliance.financial.kyc_completed,
      //     dataProtection: compliance.data_protection.encryption_enabled,
      //     overall: compliance.overall_compliance === 'compliant',
      //   });
      // }

      // Set up security monitoring
      setupSecurityMonitoring();

      console.log('Security systems initialized successfully');
          } catch (error) {
        console.error('Security initialization error:', error);
        toast.error('Biztonsági rendszerek inicializálási hiba');
      } finally {
      setIsInitializing(false);
    }
  };

  const setupSecurityMonitoring = () => {
    // Set up real-time security monitoring
    auditLogger.onAlert((alert) => {
      // Handle security alerts
      handleSecurityAlert(alert);
    });

    // Set up periodic security checks
    const securityCheckInterval = setInterval(async () => {
      try {
        // Update security metrics
        const metrics = auditLogger.getSecurityMetrics();
        setSecurityScore(metrics.complianceScore);
        setThreatLevel(metrics.threatLevel);

        // Check for critical alerts
        const criticalAlerts = auditLogger.getSecurityAlerts(5).filter(
          alert => alert.severity === 'critical' && alert.status === 'active'
        );

        if (criticalAlerts.length > 0) {
          toast.error(`${criticalAlerts.length} kritikus biztonsági riasztás!`);
        }
      } catch (error) {
        console.error('Security check error:', error);
      }
    }, 30000); // 30 másodpercenként

    // Cleanup on unmount
    return () => {
      clearInterval(securityCheckInterval);
    };
  };

  const handleSecurityAlert = (alert: any) => {
    // Handle different types of security alerts
    switch (alert.type) {
      case 'failed_login':
        if (alert.severity === 'critical') {
          toast.error('Kritikus: Több sikertelen bejelentkezési kísérlet!');
        }
        break;
      case 'suspicious_activity':
        toast.warning('Gyanús tevékenység észlelve');
        break;
      case 'api_abuse':
        toast.error('API visszaélés észlelve');
        break;
      case 'data_breach':
        toast.error('Adatsértés észlelve!');
        break;
      default:
        console.log('Security alert:', alert);
    }
  };

  const login = async (email: string, password: string, mfaCode?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Log login attempt
      await logSecurityEvent({
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        ip_address: '127.0.0.1', // In real app, get from request
        user_agent: navigator.userAgent,
        success: false,
        severity: 'medium',
        category: 'authentication',
      });

      // Attempt login
      const result = await authManager.login(email, password, mfaCode);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setMfaEnabled(result.requiresMFA || false);
        setMfaMethod('totp'); // Default method

        // Log successful login
        await logSecurityEvent({
          action: 'LOGIN_SUCCESS',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: true,
          severity: 'low',
          category: 'authentication',
        });

        toast.success('Sikeres bejelentkezés');
        return true;
      } else {
        // Log failed login
        await logSecurityEvent({
          action: 'LOGIN_FAILED',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: false,
          severity: 'medium',
          category: 'authentication',
          details: { reason: result.error },
        });

        toast.error(result.error || 'Bejelentkezési hiba');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Bejelentkezési hiba történt');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Log logout
      await logSecurityEvent({
        action: 'LOGOUT',
        resource: 'auth',
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        success: true,
        severity: 'low',
        category: 'authentication',
      });

      await authManager.logout('session-id'); // TODO: Pass actual session ID
      setIsAuthenticated(false);
      setUser(null);
      setMfaEnabled(false);
      setMfaMethod('');

      toast.success('Sikeres kijelentkezés');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Kijelentkezési hiba');
    } finally {
      setIsLoading(false);
    }
  };

  const setupMFA = async (method: 'totp' | 'sms' | 'email'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        toast.error('Felhasználó nincs bejelentkezve');
        return false;
      }

      const result = await authManager.setupMFA(user.id, method);
      
      if (result.success) {
        setMfaEnabled(true);
        setMfaMethod(method);
        
        // Log MFA setup
        await logSecurityEvent({
          action: 'MFA_SETUP',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: true,
          severity: 'medium',
          category: 'authentication',
          details: { method },
        });

        toast.success('MFA beállítás sikeres');
        return true;
      } else {
        toast.error(result.error || 'MFA beállítási hiba');
        return false;
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      toast.error('MFA beállítási hiba');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await authManager.verifyMFA(code);
      
      if (result.success) {
        // Log successful MFA verification
        await logSecurityEvent({
          action: 'MFA_VERIFY_SUCCESS',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: true,
          severity: 'low',
          category: 'authentication',
        });

        toast.success('MFA ellenőrzés sikeres');
        return true;
      } else {
        // Log failed MFA verification
        await logSecurityEvent({
          action: 'MFA_VERIFY_FAILED',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: false,
          severity: 'medium',
          category: 'authentication',
        });

        toast.error('Érvénytelen MFA kód');
        return false;
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      toast.error('MFA ellenőrzési hiba');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await authManager.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        // Log password change
        await logSecurityEvent({
          action: 'PASSWORD_CHANGE',
          resource: 'auth',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          success: true,
          severity: 'medium',
          category: 'authentication',
        });

        toast.success('Jelszó sikeresen megváltoztatva');
        return true;
      } else {
        toast.error(result.error || 'Jelszó változtatási hiba');
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Jelszó változtatási hiba');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
    try {
      await auditLogger.logSecurityAudit({
        user_id: user?.id,
        action: event.action,
        resource: event.resource,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        success: event.success,
        details: event.details || {},
        severity: event.severity,
        category: event.category,
      });
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  };

  const getSecurityMetrics = () => {
    return auditLogger.getSecurityMetrics();
  };

  const getRecentAlerts = () => {
    return auditLogger.getSecurityAlerts(10);
  };

  const checkCompliance = async () => {
    try {
      if (!user?.id) {
        throw new Error('Felhasználó nincs bejelentkezve');
      }

      const compliance = await complianceChecker.checkOverallCompliance(user.id);
      return compliance;
    } catch (error) {
      console.error('Compliance check error:', error);
      throw error;
    }
  };

  const getComplianceReport = async () => {
    try {
      if (!user?.id) {
        throw new Error('Felhasználó nincs bejelentkezve');
      }

      const gdprCheck = await complianceChecker.checkGDPRCompliance(user.id);
      const financialCheck = await complianceChecker.checkFinancialCompliance(user.id);
      const dataProtectionCheck = await complianceChecker.checkDataProtectionCompliance(user.id);

      return {
        gdpr: gdprCheck,
        financial: financialCheck,
        dataProtection: dataProtectionCheck,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Compliance report error:', error);
      throw error;
    }
  };

  const encryptData = async (data: Record<string, unknown>): Promise<string> => {
    try {
      const dataString = JSON.stringify(data);
      const encrypted = await encryptionService.encryptData(dataString);
      return JSON.stringify(encrypted);
    } catch (error) {
      console.error('Data encryption error:', error);
      throw error;
    }
  };

  const decryptData = async (encryptedData: string): Promise<Record<string, unknown>> => {
    try {
      const parsed = JSON.parse(encryptedData);
      const decrypted = await encryptionService.decryptData(parsed);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Data decryption error:', error);
      throw error;
    }
  };

  const contextValue: SecurityContextType = {
    // Auth state
    isAuthenticated,
    user,
    mfaEnabled,
    mfaMethod,
    
    // Security state
    securityScore,
    threatLevel,
    complianceStatus,
    
    // Security functions
    login,
    logout,
    setupMFA,
    verifyMFA,
    changePassword,
    
    // Audit functions
    logSecurityEvent,
    getSecurityMetrics,
    getRecentAlerts,
    
    // Compliance functions
    checkCompliance,
    getComplianceReport,
    
    // Encryption functions
    encryptData,
    decryptData,
    
    // Loading states
    isLoading,
    isInitializing,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

// Custom hook to use security context
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// Security middleware hook
export function useSecurityMiddleware() {
  const { isAuthenticated, isInitializing, threatLevel, logSecurityEvent } = useSecurity();

  // Security middleware for route protection
  const requireAuth = (callback: () => void) => {
    if (isInitializing) {
      return; // Wait for initialization
    }

    if (!isAuthenticated) {
      toast.error('Bejelentkezés szükséges');
      return;
    }

    // Log route access
    logSecurityEvent({
      action: 'ROUTE_ACCESS',
      resource: window.location.pathname,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
      success: true,
      severity: 'low',
      category: 'authorization',
    });

    callback();
  };

  // Security middleware for sensitive operations
  const requireSecurityCheck = (operation: string, callback: () => void) => {
    if (threatLevel === 'critical') {
      toast.error('Biztonsági riasztás miatt a művelet nem hajtható végre');
      return;
    }

    if (threatLevel === 'high') {
      toast.warning('Magas biztonsági riasztás - a művelet figyelmeztetéssel hajtandó végre');
    }

    // Log sensitive operation
    logSecurityEvent({
      action: operation,
      resource: 'sensitive_operation',
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
      success: true,
      severity: 'medium',
      category: 'authorization',
    });

    callback();
  };

  return {
    requireAuth,
    requireSecurityCheck,
    isAuthenticated,
    isInitializing,
    threatLevel,
  };
}
