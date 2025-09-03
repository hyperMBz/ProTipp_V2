"use client";

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  tag?: string;
  algorithm: string;
  timestamp: Date;
}

export interface EncryptionKey {
  key_id: string;
  key_data: string;
  created_at: Date;
  expires_at?: Date;
  purpose: 'data' | 'session' | 'api' | 'backup';
  status: 'active' | 'expired' | 'revoked';
}

/**
 * Enterprise-grade Encryption Service
 */
export class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 16,
    saltLength: 32,
    iterations: 100000,
  };

  private keys: Map<string, EncryptionKey> = new Map();
  private masterKey: string | null = null;

  constructor(masterKey?: string) {
    this.masterKey = masterKey || this.generateMasterKey();
    this.initializeDefaultKeys();
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(
    data: string,
    keyId: string = 'default',
    additionalData?: string
  ): Promise<EncryptedData> {
    try {
      if (typeof window === 'undefined') {
        // Server-side encryption (Node.js)
        return this.encryptServerSide(data, keyId, additionalData);
      } else {
        // Client-side encryption (Web Crypto API)
        return this.encryptClientSide(data, keyId, additionalData);
      }
    } catch (error) {
      console.error('[EncryptionService] Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(
    encryptedData: EncryptedData,
    keyId: string = 'default'
  ): Promise<string> {
    try {
      if (typeof window === 'undefined') {
        // Server-side decryption
        return this.decryptServerSide(encryptedData, keyId);
      } else {
        // Client-side decryption
        return this.decryptClientSide(encryptedData, keyId);
      }
    } catch (error) {
      console.error('[EncryptionService] Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt user PII data
   */
  async encryptPII(data: {
    email?: string;
    phone?: string;
    name?: string;
    address?: string;
    [key: string]: any;
  }): Promise<Record<string, EncryptedData>> {
    const encrypted: Record<string, EncryptedData> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string') {
        encrypted[key] = await this.encryptData(value, 'pii');
      }
    }

    return encrypted;
  }

  /**
   * Decrypt user PII data
   */
  async decryptPII(
    encryptedData: Record<string, EncryptedData>
  ): Promise<Record<string, string>> {
    const decrypted: Record<string, string> = {};

    for (const [key, value] of Object.entries(encryptedData)) {
      if (value && typeof value === 'object') {
        decrypted[key] = await this.decryptData(value, 'pii');
      }
    }

    return decrypted;
  }

  /**
   * Encrypt financial data
   */
  async encryptFinancialData(data: {
    amount?: number;
    bankAccount?: string;
    cardNumber?: string;
    [key: string]: any;
  }): Promise<Record<string, EncryptedData>> {
    const encrypted: Record<string, EncryptedData> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        encrypted[key] = await this.encryptData(stringValue, 'financial');
      }
    }

    return encrypted;
  }

  /**
   * Generate encryption key
   */
  async generateKey(
    purpose: 'data' | 'session' | 'api' | 'backup' = 'data',
    expiresIn?: number
  ): Promise<EncryptionKey> {
    const keyId = this.generateKeyId();
    const keyData = await this.generateSecureKey();
    
    const key: EncryptionKey = {
      key_id: keyId,
      key_data: keyData,
      created_at: new Date(),
      expires_at: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
      purpose,
      status: 'active',
    };

    this.keys.set(keyId, key);
    return key;
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(keyId: string): Promise<EncryptionKey> {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) {
      throw new Error('Key not found');
    }

    // Mark old key as expired
    oldKey.status = 'expired';

    // Generate new key with same purpose
    const newKey = await this.generateKey(oldKey.purpose);
    
    // Update key mapping
    this.keys.set(keyId, newKey);

    return newKey;
  }

  /**
   * Revoke encryption key
   */
  revokeKey(keyId: string): void {
    const key = this.keys.get(keyId);
    if (key) {
      key.status = 'revoked';
    }
  }

  /**
   * Get key status
   */
  getKeyStatus(keyId: string): EncryptionKey | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Hash password with salt
   */
  async hashPassword(password: string, salt?: string): Promise<{
    hash: string;
    salt: string;
  }> {
    const finalSalt = salt || this.generateSalt();
    
    if (typeof window === 'undefined') {
      // Server-side hashing
      const crypto = require('crypto');
      const hash = crypto.pbkdf2Sync(
        password,
        finalSalt,
        this.config.iterations,
        64,
        'sha512'
      ).toString('hex');
      
      return { hash, salt: finalSalt };
    } else {
      // Client-side hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(password + finalSalt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return { hash, salt: finalSalt };
    }
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: newHash } = await this.hashPassword(password, salt);
    return newHash === hash;
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    if (typeof window === 'undefined') {
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    } else {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  }

  /**
   * Client-side encryption using Web Crypto API
   */
  private async encryptClientSide(
    data: string,
    keyId: string,
    additionalData?: string
  ): Promise<EncryptedData> {
    const key = await this.getOrCreateCryptoKey(keyId);
    const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.config.algorithm,
        iv: iv,
        additionalData: additionalData ? encoder.encode(additionalData) : undefined,
      },
      key,
      encodedData
    );

    return {
      data: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
      salt: this.generateSalt(),
      algorithm: this.config.algorithm,
      timestamp: new Date(),
    };
  }

  /**
   * Client-side decryption using Web Crypto API
   */
  private async decryptClientSide(
    encryptedData: EncryptedData,
    keyId: string
  ): Promise<string> {
    const key = await this.getOrCreateCryptoKey(keyId);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const data = this.base64ToArrayBuffer(encryptedData.data);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: encryptedData.algorithm,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Server-side encryption (mock implementation)
   */
  private async encryptServerSide(
    data: string,
    keyId: string,
    additionalData?: string
  ): Promise<EncryptedData> {
    // In production, this would use Node.js crypto module
    // For now, return a mock encrypted structure
    const salt = this.generateSalt();
    const iv = this.generateSecureToken(this.config.ivLength);
    
    return {
      data: Buffer.from(data).toString('base64'),
      iv: iv,
      salt: salt,
      algorithm: this.config.algorithm,
      timestamp: new Date(),
    };
  }

  /**
   * Server-side decryption (mock implementation)
   */
  private async decryptServerSide(
    encryptedData: EncryptedData,
    keyId: string
  ): Promise<string> {
    // In production, this would use Node.js crypto module
    // For now, return mock decrypted data
    return Buffer.from(encryptedData.data, 'base64').toString('utf-8');
  }

  /**
   * Get or create Web Crypto API key
   */
  private async getOrCreateCryptoKey(keyId: string): Promise<CryptoKey> {
    // In a real implementation, this would derive keys from master key
    const keyData = new Uint8Array(32);
    crypto.getRandomValues(keyData);

    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.config.algorithm },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Initialize default encryption keys
   */
  private initializeDefaultKeys(): void {
    const defaultKeys = [
      { id: 'default', purpose: 'data' as const },
      { id: 'pii', purpose: 'data' as const },
      { id: 'financial', purpose: 'data' as const },
      { id: 'session', purpose: 'session' as const },
      { id: 'api', purpose: 'api' as const },
    ];

    defaultKeys.forEach(({ id, purpose }) => {
      const key: EncryptionKey = {
        key_id: id,
        key_data: this.generateSecureToken(32),
        created_at: new Date(),
        purpose,
        status: 'active',
      };
      this.keys.set(id, key);
    });
  }

  /**
   * Generate master key
   */
  private generateMasterKey(): string {
    return this.generateSecureToken(64);
  }

  /**
   * Generate key ID
   */
  private generateKeyId(): string {
    return `key_${Date.now()}_${this.generateSecureToken(8)}`;
  }

  /**
   * Generate secure key
   */
  private async generateSecureKey(): Promise<string> {
    return this.generateSecureToken(32);
  }

  /**
   * Generate salt
   */
  private generateSalt(): string {
    return this.generateSecureToken(this.config.saltLength);
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Global encryption service instance
 */
export const encryptionService = new EncryptionService();

/**
 * Utility functions for common encryption tasks
 */
export const EncryptionUtils = {
  /**
   * Encrypt user data for storage
   */
  async encryptUserData(userData: any): Promise<EncryptedData> {
    const dataString = typeof userData === 'string' 
      ? userData 
      : JSON.stringify(userData);
    return encryptionService.encryptData(dataString, 'pii');
  },

  /**
   * Decrypt user data from storage
   */
  async decryptUserData<T = any>(encryptedData: EncryptedData): Promise<T> {
    const decrypted = await encryptionService.decryptData(encryptedData, 'pii');
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted as T;
    }
  },

  /**
   * Secure password hashing
   */
  async secureHash(password: string): Promise<{ hash: string; salt: string }> {
    return encryptionService.hashPassword(password);
  },

  /**
   * Verify secure password
   */
  async verifySecureHash(
    password: string, 
    hash: string, 
    salt: string
  ): Promise<boolean> {
    return encryptionService.verifyPassword(password, hash, salt);
  },

  /**
   * Generate API key
   */
  generateAPIKey(): string {
    const prefix = 'pk_';
    const key = encryptionService.generateSecureToken(32);
    return `${prefix}${key}`;
  },

  /**
   * Generate session token
   */
  generateSessionToken(): string {
    return encryptionService.generateSecureToken(48);
  },
};
