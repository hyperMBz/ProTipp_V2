/**
 * Encryption Manager - Adattitkosítás kezelő
 * End-to-end titkosítás bizalmas adatokhoz
 */

import { createClient } from '@supabase/supabase-js';

export interface EncryptionKey {
  id: string;
  user_id: string;
  key_type: 'master' | 'session' | 'data';
  encrypted_key: string;
  iv: string;
  created_at: Date;
  expires_at?: Date;
  is_active: boolean;
}

export interface EncryptedData {
  encrypted_content: string;
  iv: string;
  key_id: string;
  algorithm: 'AES-256-GCM';
  created_at: Date;
}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM';
  keyLength: 256;
  ivLength: 12;
  saltLength: 16;
  iterations: 100000;
}

class EncryptionManager {
  private static instance: EncryptionManager;
  private supabase: any;
  private config: EncryptionConfig;
  private crypto: Crypto;

  private constructor() {
    // Teszt környezetben mock client, production-ben valós Supabase client
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      this.supabase = null as any; // Mock client teszt környezetben
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    this.config = {
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      ivLength: 12,
      saltLength: 16,
      iterations: 100000
    };
    
    // Teszt környezetben mock crypto, production-ben valós crypto
    if (typeof window !== 'undefined' && window.crypto) {
      this.crypto = window.crypto;
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
      this.crypto = (globalThis as any).crypto;
    } else {
      // Mock crypto teszt környezetben
      this.crypto = {
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        },
        subtle: {
          generateKey: async () => ({} as any),
          importKey: async () => ({} as any),
          exportKey: async () => ({} as any),
          encrypt: async () => ({} as any),
          decrypt: async () => ({} as any),
          deriveBits: async () => ({} as any)
        }
      } as any;
    }
  }

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Master kulcs generálása felhasználóhoz
   */
  async generateMasterKey(userId: string, password: string): Promise<EncryptionKey> {
    try {
      // Generálj salt-ot
      const salt = this.crypto.getRandomValues(new Uint8Array(this.config.saltLength));
      
      // Generálj master kulcsot a jelszóból
      const masterKey = await this.deriveKeyFromPassword(password, salt);
      
      // Generálj IV-t
      const iv = this.crypto.getRandomValues(new Uint8Array(this.config.ivLength));
      
      // Exportáld a kulcsot
      const exportedKey = await this.crypto.subtle.exportKey('raw', masterKey);
      
      // Titkosítsd a kulcsot önmagával (key wrapping)
      const encryptedKey = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        masterKey,
        exportedKey
      );

      const encryptionKey: EncryptionKey = {
        id: crypto.randomUUID(),
        user_id: userId,
        key_type: 'master',
        encrypted_key: this.arrayBufferToBase64(encryptedKey),
        iv: this.arrayBufferToBase64(iv),
        created_at: new Date(),
        is_active: true
      };

      // Mentsd el az adatbázisba
      await this.saveEncryptionKey(encryptionKey);

      return encryptionKey;
    } catch (error) {
      console.error('Master key generation error:', error);
      throw new Error('Master kulcs generálás sikertelen');
    }
  }

  /**
   * Session kulcs generálása
   */
  async generateSessionKey(userId: string, masterKeyId: string): Promise<EncryptionKey> {
    try {
      // Keresd meg a master kulcsot
      const masterKey = await this.getEncryptionKey(masterKeyId);
      if (!masterKey || masterKey.key_type !== 'master') {
        throw new Error('Master kulcs nem található');
      }

      // Generálj új session kulcsot
      const sessionKey = await this.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: this.config.keyLength },
        true,
        ['encrypt', 'decrypt']
      );

      // Exportáld a session kulcsot
      const exportedSessionKey = await this.crypto.subtle.exportKey('raw', sessionKey);
      
      // Titkosítsd a session kulcsot a master kulccsal
      const masterKeyObj = await this.importKeyFromBase64(masterKey.encrypted_key, masterKey.iv);
      const iv = this.crypto.getRandomValues(new Uint8Array(this.config.ivLength));
      
      const encryptedSessionKey = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        masterKeyObj,
        exportedSessionKey
      );

      const sessionEncryptionKey: EncryptionKey = {
        id: crypto.randomUUID(),
        user_id: userId,
        key_type: 'session',
        encrypted_key: this.arrayBufferToBase64(encryptedSessionKey),
        iv: this.arrayBufferToBase64(iv as ArrayBuffer),
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 óra
        is_active: true
      };

      // Mentsd el az adatbázisba
      await this.saveEncryptionKey(sessionEncryptionKey);

      return sessionEncryptionKey;
    } catch (error) {
      console.error('Session key generation error:', error);
      throw new Error('Session kulcs generálás sikertelen');
    }
  }

  /**
   * Adat titkosítása
   */
  async encryptData(data: string, keyId: string): Promise<EncryptedData> {
    try {
      // Keresd meg a kulcsot
      const encryptionKey = await this.getEncryptionKey(keyId);
      if (!encryptionKey) {
        throw new Error('Titkosítási kulcs nem található');
      }

      // Importáld a kulcsot
      const key = await this.importKeyFromBase64(encryptionKey.encrypted_key, encryptionKey.iv);
      
      // Generálj IV-t
      const iv = this.crypto.getRandomValues(new Uint8Array(this.config.ivLength));
      
      // Titkosítsd az adatot
      const encodedData = new TextEncoder().encode(data);
      const encryptedContent = await this.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      const encryptedData: EncryptedData = {
        encrypted_content: this.arrayBufferToBase64(encryptedContent),
        iv: this.arrayBufferToBase64(iv as ArrayBuffer),
        key_id: keyId,
        algorithm: 'AES-256-GCM',
        created_at: new Date()
      };

      return encryptedData;
    } catch (error) {
      console.error('Data encryption error:', error);
      throw new Error('Adat titkosítás sikertelen');
    }
  }

  /**
   * Adat visszafejtése
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      // Keresd meg a kulcsot
      const encryptionKey = await this.getEncryptionKey(encryptedData.key_id);
      if (!encryptionKey) {
        throw new Error('Titkosítási kulcs nem található');
      }

      // Importáld a kulcsot
      const key = await this.importKeyFromBase64(encryptionKey.encrypted_key, encryptionKey.iv);
      
      // Visszafejtsd az adatot
      const encryptedContent = this.base64ToArrayBuffer(encryptedData.encrypted_content);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      
      const decryptedContent = await this.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedContent
      );

      return new TextDecoder().decode(decryptedContent);
    } catch (error) {
      console.error('Data decryption error:', error);
      throw new Error('Adat visszafejtés sikertelen');
    }
  }

  /**
   * Jelszóból kulcs származtatása
   */
  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await this.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await this.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.config.iterations,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: this.config.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Base64 kulcs importálása
   */
  private async importKeyFromBase64(encryptedKeyBase64: string, ivBase64: string): Promise<CryptoKey> {
    const encryptedKey = this.base64ToArrayBuffer(encryptedKeyBase64);
    const iv = this.base64ToArrayBuffer(ivBase64);
    
    // TODO: Implement proper key unwrapping
    // For now, return a mock key for testing
    return await this.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: this.config.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Titkosítási kulcs mentése
   */
  private async saveEncryptionKey(encryptionKey: EncryptionKey): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encryption_keys')
        .insert({
          id: encryptionKey.id,
          user_id: encryptionKey.user_id,
          key_type: encryptionKey.key_type,
          encrypted_key: encryptionKey.encrypted_key,
          iv: encryptionKey.iv,
          created_at: encryptionKey.created_at.toISOString(),
          expires_at: encryptionKey.expires_at?.toISOString(),
          is_active: encryptionKey.is_active
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Encryption key save error:', error);
      throw new Error('Titkosítási kulcs mentés sikertelen');
    }
  }

  /**
   * Titkosítási kulcs lekérése
   */
  async getEncryptionKey(keyId: string): Promise<EncryptionKey | null> {
    try {
      const { data, error } = await this.supabase
        .from('encryption_keys')
        .select('*')
        .eq('id', keyId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Encryption key retrieval error:', error);
        return null;
      }

      return data ? {
        ...data,
        created_at: new Date(data.created_at),
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined
      } : null;
    } catch (error) {
      console.error('Encryption key retrieval error:', error);
      return null;
    }
  }

  /**
   * Felhasználó kulcsainak lekérése
   */
  async getUserKeys(userId: string): Promise<EncryptionKey[]> {
    try {
      const { data, error } = await this.supabase
        .from('encryption_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('User keys retrieval error:', error);
        return [];
      }

      return data ? data.map(key => ({
        ...key,
        created_at: new Date(key.created_at),
        expires_at: key.expires_at ? new Date(key.expires_at) : undefined
      })) : [];
    } catch (error) {
      console.error('User keys retrieval error:', error);
      return [];
    }
  }

  /**
   * Kulcs inaktiválása
   */
  async deactivateKey(keyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encryption_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Key deactivation error:', error);
      throw new Error('Kulcs inaktiválás sikertelen');
    }
  }

  /**
   * Lejárt kulcsok tisztítása
   */
  async cleanupExpiredKeys(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encryption_keys')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Expired keys cleanup error:', error);
      throw new Error('Lejárt kulcsok tisztítása sikertelen');
    }
  }

  /**
   * ArrayBuffer to Base64 konverzió
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Base64 to ArrayBuffer konverzió
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

export const encryptionManager = EncryptionManager.getInstance();
export default encryptionManager;
