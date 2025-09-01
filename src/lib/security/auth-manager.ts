import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Security configuration
const SECURITY_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 óra
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 perc
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  mfaMethods: ['totp', 'sms', 'email'] as const,
} as const;

// Security audit interface
interface SecurityAudit {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  details: Record<string, any>;
}

// MFA configuration interface
interface MFAConfig {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backup_codes?: string[];
  last_used?: Date;
}

// Security settings interface
interface SecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  password_policy: string;
  mfa_required: boolean;
}

// API key interface
interface APIKey {
  key_id: string;
  name: string;
  permissions: string[];
  created_at: Date;
  last_used?: Date;
  expires_at?: Date;
}

// Security configuration interface
interface SecurityConfig {
  user_id: string;
  mfa_enabled: boolean;
  mfa_method: 'totp' | 'sms' | 'email';
  backup_codes?: string[];
  api_keys: APIKey[];
  security_settings: SecuritySettings;
}

/**
 * Enhanced Authentication Manager
 * Kezeli a multi-factor authentication-t, session kezelést és security policy-ket
 */
export class AuthManager {
  private static instance: AuthManager;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private activeSessions = new Map<string, { userId: string; expiresAt: number }>();
  private securityAudits: SecurityAudit[] = [];

  private constructor() {
    this.initializeSecurityMonitoring();
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Security monitoring inicializálása
   */
  private initializeSecurityMonitoring(): void {
    // Session cleanup timer
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // 1 percenként

    // Login attempts cleanup
    setInterval(() => {
      this.cleanupExpiredLoginAttempts();
    }, 300000); // 5 percenként
  }

  /**
   * Felhasználó bejelentkezése MFA támogatással
   */
  async login(email: string, password: string, mfaCode?: string): Promise<{
    success: boolean;
    requiresMFA?: boolean;
    error?: string;
    user?: any;
  }> {
    try {
      // Login attempts ellenőrzése
      if (this.isAccountLocked(email)) {
        this.logSecurityAudit({
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          ip_address: 'unknown',
          user_agent: 'unknown',
          success: false,
          details: { reason: 'account_locked', email }
        });
        return { success: false, error: 'Fiók ideiglenesen zárolva. Próbálja újra 15 perc múlva.' };
      }

      // Alapvető bejelentkezés
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.recordLoginAttempt(email, false);
        this.logSecurityAudit({
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          ip_address: 'unknown',
          user_agent: 'unknown',
          success: false,
          details: { error: error.message, email }
        });
        return { success: false, error: error.message };
      }

      // MFA ellenőrzése
      const securityConfig = await this.getSecurityConfig(data.user.id);
      if (securityConfig?.mfa_enabled) {
        if (!mfaCode) {
          this.logSecurityAudit({
            action: 'LOGIN_ATTEMPT',
            resource: 'auth',
            ip_address: 'unknown',
            user_agent: 'unknown',
            success: true,
            details: { requiresMFA: true, email, userId: data.user.id }
          });
          return { success: true, requiresMFA: true, user: data.user };
        }

        // MFA kód ellenőrzése
        const mfaValid = await this.verifyMFACode(data.user.id, mfaCode);
        if (!mfaValid) {
          this.logSecurityAudit({
            action: 'MFA_VERIFICATION',
            resource: 'auth',
            ip_address: 'unknown',
            user_agent: 'unknown',
            success: false,
            details: { userId: data.user.id, mfaCode }
          });
          return { success: false, error: 'Érvénytelen MFA kód' };
        }
      }

      // Sikeres bejelentkezés
      this.recordLoginAttempt(email, true);
      this.createSession(data.user.id);
      
      this.logSecurityAudit({
        action: 'LOGIN_SUCCESS',
        resource: 'auth',
        ip_address: 'unknown',
        user_agent: 'unknown',
        success: true,
        details: { userId: data.user.id, email }
      });

      toast.success('Sikeres bejelentkezés!');
      return { success: true, user: data.user };

    } catch (error) {
      console.error('Login error:', error);
      this.logSecurityAudit({
        action: 'LOGIN_ERROR',
        resource: 'auth',
        ip_address: 'unknown',
        user_agent: 'unknown',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { success: false, error: 'Bejelentkezési hiba történt' };
    }
  }

  /**
   * MFA kód ellenőrzése
   */
  private async verifyMFACode(userId: string, code: string): Promise<boolean> {
    try {
      // Itt implementálnánk a TOTP ellenőrzést
      // Példa implementáció - valós környezetben TOTP library-t használnánk
      const securityConfig = await this.getSecurityConfig(userId);
      if (!securityConfig?.mfa_enabled) return false;

      // TOTP ellenőrzés (példa)
      const isValid = await this.verifyTOTPCode(userId, code);
      
      if (isValid) {
        this.logSecurityAudit({
          action: 'MFA_VERIFICATION',
          resource: 'auth',
          ip_address: 'unknown',
          user_agent: 'unknown',
          success: true,
          details: { userId, mfaMethod: securityConfig.mfa_method }
        });
      }

      return isValid;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  /**
   * TOTP kód ellenőrzése (példa implementáció)
   */
  private async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    // Valós implementációban TOTP library-t használnánk
    // Példa: otplib, speakeasy, stb.
    
    // Mock implementáció - valós környezetben cseréljük le
    const expectedCode = '123456'; // Valós környezetben dinamikusan generált
    return code === expectedCode;
  }

  /**
   * MFA beállítása felhasználónak
   */
  async setupMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{
    success: boolean;
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
    error?: string;
  }> {
    try {
      // MFA secret generálása
      const secret = this.generateMFASecret();
      const qrCode = this.generateQRCode(secret, userId);
      const backupCodes = this.generateBackupCodes();

      // Security config frissítése
      await this.updateSecurityConfig(userId, {
        mfa_enabled: true,
        mfa_method: method,
        backup_codes: backupCodes,
      });

      this.logSecurityAudit({
        action: 'MFA_SETUP',
        resource: 'auth',
        ip_address: 'unknown',
        user_agent: 'unknown',
        success: true,
        details: { userId, method }
      });

      return {
        success: true,
        secret,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      console.error('MFA setup error:', error);
      return { success: false, error: 'MFA beállítási hiba' };
    }
  }

  /**
   * MFA kód ellenőrzése (publikus metódus)
   */
  async verifyMFA(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Get current user from session/context
      const currentUserId = 'mock-user-id'; // Valós implementációban session-ből
      
      const isValid = await this.verifyMFACode(currentUserId, code);
      
      if (isValid) {
        return { success: true };
      } else {
        return { success: false, error: 'Érvénytelen MFA kód' };
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      return { success: false, error: 'MFA ellenőrzési hiba' };
    }
  }

  /**
   * Jelszó módosítása
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Get current user from session/context
      const currentUserId = 'mock-user-id'; // Valós implementációban session-ből

      // Jelenlegi jelszó ellenőrzése
      const isCurrentValid = await this.verifyPassword(currentUserId, currentPassword);
      if (!isCurrentValid) {
        return { success: false, error: 'Hibás jelenlegi jelszó' };
      }

      // Új jelszó validálása
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Jelszó frissítése (valós implementációban adatbázisban)
      await this.updatePassword(currentUserId, newPassword);

      this.logSecurityAudit({
        action: 'PASSWORD_CHANGE',
        resource: 'auth',
        ip_address: 'unknown',
        user_agent: 'unknown',
        success: true,
        details: { userId: currentUserId }
      });

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Jelszó módosítási hiba' };
    }
  }

  /**
   * Jelszó ellenőrzése
   */
  private async verifyPassword(userId: string, password: string): Promise<boolean> {
    // Valós implementációban adatbázisból ellenőrizzük
    // Mock implementáció
    return password.length >= 8;
  }

  /**
   * Jelszó frissítése
   */
  private async updatePassword(userId: string, newPassword: string): Promise<void> {
    // Valós implementációban adatbázisban frissítjük
    // Mock implementáció
    console.log(`Password updated for user ${userId}`);
  }

  /**
   * MFA secret generálása
   */
  private generateMFASecret(): string {
    // Valós implementációban cryptographically secure random string
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * QR kód generálása TOTP-hoz
   */
  private generateQRCode(secret: string, userId: string): string {
    // Valós implementációban QR kód library-t használnánk
    return `otpauth://totp/ProTipp:${userId}?secret=${secret}&issuer=ProTipp`;
  }

  /**
   * Backup kódok generálása
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  /**
   * Session létrehozása
   */
  private createSession(userId: string): void {
    const sessionId = this.generateSessionId();
    const expiresAt = Date.now() + SECURITY_CONFIG.sessionTimeout;
    
    this.activeSessions.set(sessionId, { userId, expiresAt });
    
    // Session ID cookie-be mentése
    document.cookie = `session_id=${sessionId}; expires=${new Date(expiresAt).toUTCString()}; path=/; secure; samesite=strict`;
  }

  /**
   * Session ID generálása
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Session ellenőrzése
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return false;
    }

    return true;
  }

  /**
   * Session törlése
   */
  async logout(sessionId: string): Promise<void> {
    this.activeSessions.delete(sessionId);
    document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    await this.supabase.auth.signOut();
    
    this.logSecurityAudit({
      action: 'LOGOUT',
      resource: 'auth',
      ip_address: 'unknown',
      user_agent: 'unknown',
      success: true,
      details: { sessionId }
    });
  }

  /**
   * Security config lekérése
   */
  private async getSecurityConfig(userId: string): Promise<SecurityConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('security_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Security config fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Security config error:', error);
      return null;
    }
  }

  /**
   * Security config frissítése
   */
  private async updateSecurityConfig(userId: string, updates: Partial<SecurityConfig>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_configs')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Security config update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Security config update error:', error);
      throw error;
    }
  }

  /**
   * Login attempts kezelése
   */
  private recordLoginAttempt(email: string, success: boolean): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    if (success) {
      this.loginAttempts.delete(email);
    } else {
      attempts.count++;
      attempts.lastAttempt = Date.now();
      this.loginAttempts.set(email, attempts);
    }
  }

  /**
   * Fiók zárolás ellenőrzése
   */
  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    if (attempts.count >= SECURITY_CONFIG.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < SECURITY_CONFIG.lockoutDuration) {
        return true;
      } else {
        // Lockout lejárt, reset
        this.loginAttempts.delete(email);
      }
    }

    return false;
  }

  /**
   * Expired sessions cleanup
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const entries = Array.from(this.activeSessions.entries());
    for (const [sessionId, session] of entries) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Expired login attempts cleanup
   */
  private cleanupExpiredLoginAttempts(): void {
    const now = Date.now();
    const entries = Array.from(this.loginAttempts.entries());
    for (const [email, attempts] of entries) {
      if (now - attempts.lastAttempt > SECURITY_CONFIG.lockoutDuration) {
        this.loginAttempts.delete(email);
      }
    }
  }

  /**
   * Security audit logging
   */
  private logSecurityAudit(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): void {
    const securityAudit: SecurityAudit = {
      ...audit,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
    };

    this.securityAudits.push(securityAudit);
    
    // Valós környezetben adatbázisba mentenénk
    console.log('Security Audit:', securityAudit);
  }

  /**
   * Security audits lekérése
   */
  getSecurityAudits(): SecurityAudit[] {
    return [...this.securityAudits];
  }

  /**
   * Password policy ellenőrzése
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = SECURITY_CONFIG.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`A jelszónak legalább ${policy.minLength} karakter hosszúnak kell lennie`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell nagybetűt');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell kisbetűt');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell számot');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A jelszónak tartalmaznia kell speciális karaktert');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }



  /**
   * Security config lekérése (static)
   */
  getStaticSecurityConfig(): typeof SECURITY_CONFIG {
    return SECURITY_CONFIG;
  }
}

// Singleton export
export const authManager = AuthManager.getInstance();
