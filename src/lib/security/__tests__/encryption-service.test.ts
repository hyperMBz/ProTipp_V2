import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encryptionService } from '../encryption-service';

describe('EncryptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptData', () => {
    it('should encrypt string data', async () => {
      const testData = 'sensitive information';
      const encrypted = await encryptionService.encryptData(testData);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('object');
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
    });

    it('should encrypt object data', async () => {
      const testData = JSON.stringify({ 
        username: 'testuser', 
        password: 'secret123',
        metadata: { role: 'admin', permissions: ['read', 'write'] }
      });
      const encrypted = await encryptionService.encryptData(testData);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('object');
      expect(encrypted.encrypted).toBeDefined();
    });

    it('should encrypt array data', async () => {
      const testData = JSON.stringify(['item1', 'item2', 'item3']);
      const encrypted = await encryptionService.encryptData(testData);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('object');
      expect(encrypted.encrypted).toBeDefined();
    });

    it('should handle empty data', async () => {
      const testData = '';
      const encrypted = await encryptionService.encryptData(testData);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('object');
    });
  });

  describe('decryptData', () => {
    it('should decrypt encrypted string data', async () => {
      const originalData = 'sensitive information';
      const encrypted = await encryptionService.encryptData(originalData);
      const decrypted = await encryptionService.decryptData(encrypted);
      
      expect(decrypted).toBe(originalData);
    });

    it('should decrypt encrypted object data', async () => {
      const originalData = JSON.stringify({ 
        username: 'testuser', 
        password: 'secret123',
        metadata: { role: 'admin', permissions: ['read', 'write'] }
      });
      const encrypted = await encryptionService.encryptData(originalData);
      const decrypted = await encryptionService.decryptData(encrypted);
      
      expect(decrypted).toEqual(originalData);
    });

    it('should decrypt encrypted array data', async () => {
      const originalData = JSON.stringify(['item1', 'item2', 'item3']);
      const encrypted = await encryptionService.encryptData(originalData);
      const decrypted = await encryptionService.decryptData(encrypted);
      
      expect(decrypted).toEqual(originalData);
    });

    it('should handle empty encrypted data', async () => {
      const originalData = '';
      const encrypted = await encryptionService.encryptData(originalData);
      const decrypted = await encryptionService.decryptData(encrypted);
      
      expect(decrypted).toBe(originalData);
    });

    it('should throw error for invalid encrypted data', async () => {
      const invalidEncryptedData = {
        encrypted: 'invalid',
        iv: 'invalid',
        salt: 'invalid',
        key_id: 'test-key',
        algorithm: 'AES-GCM',
        created_at: new Date()
      };

      await expect(encryptionService.decryptData(invalidEncryptedData))
        .rejects.toThrow();
    });
  });



  describe('getEncryptionConfig', () => {
    it('should return encryption configuration', () => {
      const config = encryptionService.getEncryptionConfig();
      
      expect(config).toBeDefined();
      expect(config.algorithm).toBe('AES-GCM');
      expect(config.keyLength).toBe(256);
      expect(config.ivLength).toBe(12);
      expect(config.saltLength).toBe(16);
      expect(config.iterations).toBe(100000);
    });
  });
});
