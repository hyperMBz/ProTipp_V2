/**
 * MFA Manager Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock all external dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }))
}));

vi.mock('speakeasy', () => ({
  generateSecret: vi.fn(() => ({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/ProTipp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ProTipp'
  })),
  generateTOTP: vi.fn(() => '123456'),
  verifyTOTP: vi.fn(() => true)
}));

vi.mock('qrcode', () => ({
  QRCode: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,test'))
  }
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
  }
}));

// Import after mocks
import { mfaManager, MFAType, MFASession } from '../mfa-manager';

describe('MFAManager', () => {
  const mockUserId = 'test-user-id';
  const mockPhoneNumber = '+36 20 123 4567';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = mfaManager;
      const instance2 = mfaManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('TOTP Setup', () => {
    it('should setup TOTP MFA successfully', async () => {
      const result = await mfaManager.setupTOTP(mockUserId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qr_code');
      expect(result).toHaveProperty('backup_codes');
      expect(result).toHaveProperty('verification_code');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.qr_code).toBe('data:image/png;base64,test');
      expect(result.backup_codes).toHaveLength(10);
      expect(result.verification_code).toBe('123456');
    });
  });

  describe('SMS Setup', () => {
    it('should setup SMS MFA successfully', async () => {
      const result = await mfaManager.setupSMS(mockUserId, mockPhoneNumber);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qr_code');
      expect(result).toHaveProperty('backup_codes');
      expect(result).toHaveProperty('verification_code');
      expect(result.secret).toBe('');
      expect(result.qr_code).toBe('');
      expect(result.backup_codes).toHaveLength(10);
      expect(result.verification_code).toMatch(/^\d{6}$/);
    });
  });

  describe('Email Setup', () => {
    it('should setup Email MFA successfully', async () => {
      const result = await mfaManager.setupEmail(mockUserId, mockEmail);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qr_code');
      expect(result).toHaveProperty('backup_codes');
      expect(result).toHaveProperty('verification_code');
      expect(result.secret).toBe('');
      expect(result.qr_code).toBe('');
      expect(result.backup_codes).toHaveLength(10);
      expect(result.verification_code).toMatch(/^\d{6}$/);
    });
  });

  describe('MFA Verification', () => {
    it('should verify TOTP code successfully', async () => {
      // Mock a successful MFA session
      const mockSession = {
        id: 'test-session',
        user_id: mockUserId,
        type: 'totp',
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: ['BACKUP1', 'BACKUP2'],
        created_at: new Date(),
        last_used: new Date(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_active: true
      };

      // Mock the getMFASession method
      vi.spyOn(mfaManager, 'getMFASession').mockResolvedValue(mockSession);

      const result = await mfaManager.verifyMFA({
        user_id: mockUserId,
        mfa_type: 'totp',
        code: '123456'
      });

      expect(result).toBe(true);
    });

    it('should handle missing session', async () => {
      // Mock getMFASession to return null
      vi.spyOn(mfaManager, 'getMFASession').mockResolvedValue(null);

      const result = await mfaManager.verifyMFA({
        user_id: 'non-existent-user',
        mfa_type: 'totp',
        code: '123456'
      });

      expect(result).toBe(false);
    });
  });

  describe('Code Generation', () => {
    it('should generate SMS codes with correct format', async () => {
      const result = await mfaManager.setupSMS(mockUserId, mockPhoneNumber);

      expect(result.verification_code).toMatch(/^\d{6}$/);
    });

    it('should generate email codes with correct format', async () => {
      const result = await mfaManager.setupEmail(mockUserId, mockEmail);

      expect(result.verification_code).toMatch(/^\d{6}$/);
    });
  });

  describe('Backup Code Generation', () => {
    it('should generate backup codes with correct format', async () => {
      const result = await mfaManager.setupTOTP(mockUserId);

      expect(result.backup_codes).toHaveLength(10);
      result.backup_codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });
  });

  describe('Backup Code Generation', () => {
    it('should generate backup codes with correct format', async () => {
      const result = await mfaManager.setupTOTP(mockUserId);

      expect(result.backup_codes).toHaveLength(10);
      result.backup_codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });
  });

  describe('Code Generation', () => {
    it('should generate SMS codes with correct format', async () => {
      const result = await mfaManager.setupSMS(mockUserId, mockPhoneNumber);

      expect(result.verification_code).toMatch(/^\d{6}$/);
    });

    it('should generate email codes with correct format', async () => {
      const result = await mfaManager.setupEmail(mockUserId, mockEmail);

      expect(result.verification_code).toMatch(/^\d{6}$/);
    });
  });
});
