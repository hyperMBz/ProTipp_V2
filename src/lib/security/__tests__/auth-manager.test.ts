import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authManager } from '../auth-manager';

describe('AuthManager', () => {
  beforeEach(() => {
    // Reset singleton instance for each test
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return success for valid credentials', async () => {
      const result = await authManager.login('test@example.com', 'password123');
      expect(result.success).toBe(true);
    });

    it('should return error for invalid credentials', async () => {
      const result = await authManager.login('invalid@example.com', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle MFA requirement', async () => {
      const result = await authManager.login('mfa@example.com', 'password123');
      expect(result.requiresMFA).toBe(true);
    });
  });

  describe('setupMFA', () => {
    it('should setup TOTP MFA successfully', async () => {
      const result = await authManager.setupMFA('user123', 'totp');
      expect(result.success).toBe(true);
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.backupCodes).toBeDefined();
    });

    it('should setup SMS MFA successfully', async () => {
      const result = await authManager.setupMFA('user123', 'sms');
      expect(result.success).toBe(true);
    });

    it('should setup Email MFA successfully', async () => {
      const result = await authManager.setupMFA('user123', 'email');
      expect(result.success).toBe(true);
    });
  });

  describe('verifyMFA', () => {
    it('should verify valid MFA code', async () => {
      const result = await authManager.verifyMFA('123456');
      expect(result.success).toBe(true);
    });

    it('should reject invalid MFA code', async () => {
      const result = await authManager.verifyMFA('000000');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const result = await authManager.changePassword('oldpass', 'NewPass123!');
      expect(result.success).toBe(true);
    });

    it('should reject weak password', async () => {
      const result = await authManager.changePassword('oldpass', 'weak');
      expect(result.success).toBe(false);
      expect(result.error).toContain('jelszónak legalább');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = authManager.validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = authManager.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should check minimum length', () => {
      const result = authManager.validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('8 karakter'))).toBe(true);
    });

    it('should check uppercase requirement', () => {
      const result = authManager.validatePassword('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nagybetű'))).toBe(true);
    });

    it('should check lowercase requirement', () => {
      const result = authManager.validatePassword('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('kisbetű'))).toBe(true);
    });

    it('should check number requirement', () => {
      const result = authManager.validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('számot'))).toBe(true);
    });

    it('should check special character requirement', () => {
      const result = authManager.validatePassword('NoSpecial123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('speciális karaktert'))).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await authManager.logout('session123');
      expect(result).toBeDefined();
    });
  });

  describe('getSecurityAudits', () => {
    it('should return security audits', () => {
      const audits = authManager.getSecurityAudits();
      expect(Array.isArray(audits)).toBe(true);
    });
  });

  describe('getStaticSecurityConfig', () => {
    it('should return security configuration', () => {
      const config = authManager.getStaticSecurityConfig();
      expect(config).toBeDefined();
      expect(config.sessionTimeout).toBeDefined();
      expect(config.maxLoginAttempts).toBeDefined();
      expect(config.passwordPolicy).toBeDefined();
      expect(config.mfaMethods).toBeDefined();
    });
  });
});
