"use client";

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { encryptionService, EncryptionUtils } from './encryption-service';

export interface SecurityConfig {
  user_id: string;
  mfa_enabled: boolean;
  mfa_method: 'totp' | 'sms' | 'email';
  api_keys: Array<{
    key_id: string;
    name: string;
    permissions: string[];
    created_at: Date;
    last_used?: Date;
  }>;
  security_settings: {
    session_timeout: number;
    max_login_attempts: number;
    password_policy: string;
  };
}

export interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
  setup_complete: boolean;
}

export interface AuthSession {
  user: User;
  session_id: string;
  created_at: Date;
  expires_at: Date;
  ip_address: string;
  user_agent: string;
  mfa_verified: boolean;
  security_level: 'basic' | 'enhanced' | 'maximum';
}

export interface LoginAttempt {
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  mfa_required: boolean;
  timestamp: Date;
}

/**
 * Enhanced Authentication Manager with MFA and Security Features
 */
export class AuthManager {
  private supabase: SupabaseClient;
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private activeSessions: Map<string, AuthSession> = new Map();
  private securityConfigs: Map<string, SecurityConfig> = new Map();

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    this.setupSessionMonitoring();
  }

  /**
   * Enhanced login with MFA support
   */
  async login(
    email: string,
    password: string,
    options: {
      ip_address?: string;
      user_agent?: string;
      mfa_code?: string;
      remember_device?: boolean;
    } = {}
  ): Promise<{
    user: User | null;
    session: AuthSession | null;
    requires_mfa: boolean;
    error?: string;
  }> {
    const { ip_address = 'unknown', user_agent = 'unknown' } = options;

    try {
      // Check for rate limiting
      if (this.isRateLimited(email, ip_address)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Attempt Supabase authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        this.recordLoginAttempt({
          email,
          ip_address,
          user_agent,
          success: false,
          failure_reason: error?.message || 'Authentication failed',
          mfa_required: false,
          timestamp: new Date(),
        });

        return {
          user: null,
          session: null,
          requires_mfa: false,
          error: error?.message || 'Authentication failed',
        };
      }

      const user = data.user;
      const securityConfig = await this.getSecurityConfig(user.id);

      // Check if MFA is required
      if (securityConfig?.mfa_enabled && !options.mfa_code) {
        this.recordLoginAttempt({
          user_id: user.id,
          email,
          ip_address,
          user_agent,
          success: false,
          failure_reason: 'MFA required',
          mfa_required: true,
          timestamp: new Date(),
        });

        return {
          user,
          session: null,
          requires_mfa: true,
        };
      }

      // Verify MFA if provided
      if (securityConfig?.mfa_enabled && options.mfa_code) {
        const mfaValid = await this.verifyMFA(user.id, options.mfa_code, securityConfig.mfa_method);
        if (!mfaValid) {
          this.recordLoginAttempt({
            user_id: user.id,
            email,
            ip_address,
            user_agent,
            success: false,
            failure_reason: 'Invalid MFA code',
            mfa_required: true,
            timestamp: new Date(),
          });

          return {
            user: null,
            session: null,
            requires_mfa: true,
            error: 'Invalid MFA code',
          };
        }
      }

      // Create enhanced session
      const session = await this.createEnhancedSession(user, {
        ip_address,
        user_agent,
        mfa_verified: securityConfig?.mfa_enabled || false,
        security_level: this.calculateSecurityLevel(securityConfig),
      });

      this.recordLoginAttempt({
        user_id: user.id,
        email,
        ip_address,
        user_agent,
        success: true,
        mfa_required: securityConfig?.mfa_enabled || false,
        timestamp: new Date(),
      });

      return {
        user,
        session,
        requires_mfa: false,
      };

    } catch (error) {
      console.error('[AuthManager] Login error:', error);
      
      this.recordLoginAttempt({
        email,
        ip_address,
        user_agent,
        success: false,
        failure_reason: error.message,
        mfa_required: false,
        timestamp: new Date(),
      });

      return {
        user: null,
        session: null,
        requires_mfa: false,
        error: error.message,
      };
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(
    userId: string,
    method: 'totp' | 'sms' | 'email' = 'totp'
  ): Promise<MFASetup> {
    try {
      const secret = this.generateTOTPSecret();
      const qrCode = await this.generateQRCode(userId, secret);
      const backupCodes = this.generateBackupCodes();

      // Store MFA configuration (encrypted)
      const mfaConfig = {
        secret,
        backup_codes: backupCodes,
        method,
        setup_complete: false,
      };

      const encryptedConfig = await encryptionService.encryptData(
        JSON.stringify(mfaConfig),
        'mfa'
      );

      // In production, this would be stored in Supabase
      console.log(`[AuthManager] MFA setup for user ${userId}:`, { method, secret });

      return {
        secret,
        qr_code: qrCode,
        backup_codes: backupCodes,
        setup_complete: false,
      };

    } catch (error) {
      console.error('[AuthManager] MFA setup error:', error);
      throw new Error('Failed to setup MFA');
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(
    userId: string,
    code: string,
    method: 'totp' | 'sms' | 'email' = 'totp'
  ): Promise<boolean> {
    try {
      switch (method) {
        case 'totp':
          return this.verifyTOTPCode(userId, code);
        case 'sms':
          return this.verifySMSCode(userId, code);
        case 'email':
          return this.verifyEmailCode(userId, code);
        default:
          return false;
      }
    } catch (error) {
      console.error('[AuthManager] MFA verification error:', error);
      return false;
    }
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(
    userId: string,
    verificationCode: string,
    method: 'totp' | 'sms' | 'email' = 'totp'
  ): Promise<boolean> {
    try {
      const isValid = await this.verifyMFA(userId, verificationCode, method);
      if (!isValid) {
        return false;
      }

      // Update security configuration
      const config = await this.getSecurityConfig(userId);
      const updatedConfig: SecurityConfig = {
        ...config,
        user_id: userId,
        mfa_enabled: true,
        mfa_method: method,
        api_keys: config?.api_keys || [],
        security_settings: config?.security_settings || {
          session_timeout: 3600, // 1 hour
          max_login_attempts: 5,
          password_policy: 'strong',
        },
      };

      await this.updateSecurityConfig(userId, updatedConfig);
      return true;

    } catch (error) {
      console.error('[AuthManager] Enable MFA error:', error);
      return false;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const config = await this.getSecurityConfig(userId);
      if (!config?.mfa_enabled) {
        return true; // Already disabled
      }

      const isValid = await this.verifyMFA(userId, verificationCode, config.mfa_method);
      if (!isValid) {
        return false;
      }

      const updatedConfig: SecurityConfig = {
        ...config,
        mfa_enabled: false,
      };

      await this.updateSecurityConfig(userId, updatedConfig);
      return true;

    } catch (error) {
      console.error('[AuthManager] Disable MFA error:', error);
      return false;
    }
  }

  /**
   * Generate API key for user
   */
  async generateAPIKey(
    userId: string,
    name: string,
    permissions: string[] = []
  ): Promise<{
    key_id: string;
    api_key: string;
    permissions: string[];
  }> {
    try {
      const keyId = `ak_${Date.now()}_${encryptionService.generateSecureToken(8)}`;
      const apiKey = EncryptionUtils.generateAPIKey();

      const keyConfig = {
        key_id: keyId,
        name,
        permissions,
        created_at: new Date(),
      };

      // Update security configuration
      const config = await this.getSecurityConfig(userId);
      const updatedConfig: SecurityConfig = {
        ...config,
        user_id: userId,
        mfa_enabled: config?.mfa_enabled || false,
        mfa_method: config?.mfa_method || 'totp',
        api_keys: [...(config?.api_keys || []), keyConfig],
        security_settings: config?.security_settings || {
          session_timeout: 3600,
          max_login_attempts: 5,
          password_policy: 'strong',
        },
      };

      await this.updateSecurityConfig(userId, updatedConfig);

      return {
        key_id: keyId,
        api_key: apiKey,
        permissions,
      };

    } catch (error) {
      console.error('[AuthManager] Generate API key error:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(userId: string, keyId: string): Promise<boolean> {
    try {
      const config = await this.getSecurityConfig(userId);
      if (!config) return false;

      const updatedApiKeys = config.api_keys.filter(key => key.key_id !== keyId);
      const updatedConfig: SecurityConfig = {
        ...config,
        api_keys: updatedApiKeys,
      };

      await this.updateSecurityConfig(userId, updatedConfig);
      return true;

    } catch (error) {
      console.error('[AuthManager] Revoke API key error:', error);
      return false;
    }
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: string): AuthSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.user.id === userId);
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      // Sign out from Supabase
      await this.supabase.auth.signOut();

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      return true;
    } catch (error) {
      console.error('[AuthManager] Terminate session error:', error);
      return false;
    }
  }

  /**
   * Get security configuration
   */
  async getSecurityConfig(userId: string): Promise<SecurityConfig | null> {
    try {
      // In production, this would fetch from Supabase
      return this.securityConfigs.get(userId) || null;
    } catch (error) {
      console.error('[AuthManager] Get security config error:', error);
      return null;
    }
  }

  /**
   * Update security configuration
   */
  async updateSecurityConfig(userId: string, config: SecurityConfig): Promise<void> {
    try {
      // In production, this would update Supabase
      this.securityConfigs.set(userId, config);
    } catch (error) {
      console.error('[AuthManager] Update security config error:', error);
      throw new Error('Failed to update security configuration');
    }
  }

  /**
   * Check if IP is rate limited
   */
  private isRateLimited(email: string, ipAddress: string): boolean {
    const key = `${email}:${ipAddress}`;
    const attempts = this.loginAttempts.get(key) || [];
    
    // Check attempts in last 15 minutes
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp.getTime() < 15 * 60 * 1000
    );

    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    return failedAttempts.length >= 5;
  }

  /**
   * Record login attempt
   */
  private recordLoginAttempt(attempt: LoginAttempt): void {
    const key = `${attempt.email}:${attempt.ip_address}`;
    const attempts = this.loginAttempts.get(key) || [];
    attempts.push(attempt);
    
    // Keep only last 100 attempts
    if (attempts.length > 100) {
      attempts.splice(0, attempts.length - 100);
    }
    
    this.loginAttempts.set(key, attempts);
  }

  /**
   * Create enhanced session
   */
  private async createEnhancedSession(
    user: User,
    options: {
      ip_address: string;
      user_agent: string;
      mfa_verified: boolean;
      security_level: 'basic' | 'enhanced' | 'maximum';
    }
  ): Promise<AuthSession> {
    const sessionId = EncryptionUtils.generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const session: AuthSession = {
      user,
      session_id: sessionId,
      created_at: now,
      expires_at: expiresAt,
      ip_address: options.ip_address,
      user_agent: options.user_agent,
      mfa_verified: options.mfa_verified,
      security_level: options.security_level,
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Calculate security level
   */
  private calculateSecurityLevel(config: SecurityConfig | null): 'basic' | 'enhanced' | 'maximum' {
    if (!config) return 'basic';
    
    if (config.mfa_enabled && config.api_keys.length > 0) {
      return 'maximum';
    } else if (config.mfa_enabled) {
      return 'enhanced';
    } else {
      return 'basic';
    }
  }

  /**
   * Generate TOTP secret
   */
  private generateTOTPSecret(): string {
    return encryptionService.generateSecureToken(20);
  }

  /**
   * Generate QR code for TOTP
   */
  private async generateQRCode(userId: string, secret: string): Promise<string> {
    const appName = 'ProTipp V2';
    const issuer = 'ProTipp';
    const otpauth = `otpauth://totp/${issuer}:${userId}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
    
    // In production, this would generate actual QR code
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code: ${otpauth}</svg>`)}`;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(encryptionService.generateSecureToken(4).toUpperCase());
    }
    return codes;
  }

  /**
   * Verify TOTP code
   */
  private verifyTOTPCode(userId: string, code: string): boolean {
    // In production, this would verify against stored secret
    // For now, accept any 6-digit code for testing
    return /^\d{6}$/.test(code);
  }

  /**
   * Verify SMS code
   */
  private verifySMSCode(userId: string, code: string): boolean {
    // In production, this would verify against sent SMS code
    return /^\d{6}$/.test(code);
  }

  /**
   * Verify email code
   */
  private verifyEmailCode(userId: string, code: string): boolean {
    // In production, this would verify against sent email code
    return /^\d{6}$/.test(code);
  }

  /**
   * Setup session monitoring
   */
  private setupSessionMonitoring(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (session.expires_at.getTime() < now) {
          this.activeSessions.delete(sessionId);
        }
      }
    }, 5 * 60 * 1000);
  }
}

// Create default Supabase client for auth manager
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const authManager = new AuthManager(supabaseClient);
