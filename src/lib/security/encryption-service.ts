import { createClient } from '@supabase/supabase-js';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  saltLength: 16,
  iterations: 100000,
} as const;

// Encryption key interface
interface EncryptionKey {
  id: string;
  key: string;
  created_at: Date;
  expires_at?: Date;
  is_active: boolean;
  key_type: 'master' | 'data' | 'session';
}

// Encrypted data interface
interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  key_id: string;
  algorithm: string;
  created_at: Date;
}

// Key management interface
interface KeyManagement {
  master_key: string;
  data_keys: Map<string, EncryptionKey>;
  session_keys: Map<string, EncryptionKey>;
}

/**
 * Data Encryption Service
 * End-to-end encryption kezelése érzékeny adatokhoz
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  private keyManagement: KeyManagement;
  private crypto: Crypto;

  private constructor() {
    this.crypto = window.crypto;
    this.keyManagement = {
      master_key: '',
      data_keys: new Map(),
      session_keys: new Map(),
    };
    this.initializeEncryption();
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encryption inicializálása
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Master key generálása vagy betöltése
      await this.initializeMasterKey();
      
      // Data keys betöltése
      await this.loadDataKeys();
      
      console.log('Encryption service initialized successfully');
    } catch (error) {
      console.error('Encryption initialization error:', error);
      throw new Error('Encryption service initialization failed');
    }
  }

  /**
   * Master key inicializálása
   */
  private async initializeMasterKey(): Promise<void> {
    try {
      // Master key lekérése localStorage-ból vagy generálása
      let masterKey = localStorage.getItem('protipp_master_key');
      
      if (!masterKey) {
        masterKey = await this.generateMasterKey();
        localStorage.setItem('protipp_master_key', masterKey);
      }
      
      this.keyManagement.master_key = masterKey;
    } catch (error) {
      console.error('Master key initialization error:', error);
      throw error;
    }
  }

  /**
   * Master key generálása
   */
  private async generateMasterKey(): Promise<string> {
    const array = new Uint8Array(32);
    this.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Data keys betöltése
   */
  private async loadDataKeys(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('encryption_keys')
        .select('*')
        .eq('is_active', true)
        .eq('key_type', 'data');

      if (error) {
        console.error('Data keys load error:', error);
        return;
      }

      data?.forEach(key => {
        this.keyManagement.data_keys.set(key.id, {
          ...key,
          created_at: new Date(key.created_at),
          expires_at: key.expires_at ? new Date(key.expires_at) : undefined,
        });
      });
    } catch (error) {
      console.error('Data keys load error:', error);
    }
  }

  /**
   * Adat titkosítása
   */
  async encryptData(data: string, keyType: 'data' | 'session' = 'data'): Promise<EncryptedData> {
    try {
      // Encryption key generálása vagy lekérése
      const key = await this.getOrCreateKey(keyType);
      
      // Salt generálása
      const salt = this.generateSalt();
      
      // IV generálása
      const iv = this.generateIV();
      
      // Key derivation
      const derivedKey = await this.deriveKey(key.key, salt);
      
      // Adat titkosítása
      const encrypted = await this.encryptWithKey(data, derivedKey, iv);
      
      const encryptedData: EncryptedData = {
        encrypted,
        iv,
        salt,
        key_id: key.id,
        algorithm: ENCRYPTION_CONFIG.algorithm,
        created_at: new Date(),
      };

      // Titkosított adat mentése adatbázisba
      await this.saveEncryptedData(encryptedData);
      
      return encryptedData;
    } catch (error) {
      console.error('Data encryption error:', error);
      throw new Error('Adat titkosítási hiba');
    }
  }

  /**
   * Adat visszafejtése
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      // Encryption key lekérése
      const key = await this.getKey(encryptedData.key_id);
      if (!key) {
        throw new Error('Encryption key not found');
      }

      // Key derivation
      const derivedKey = await this.deriveKey(key.key, encryptedData.salt);
      
      // Adat visszafejtése
      const decrypted = await this.decryptWithKey(
        encryptedData.encrypted,
        derivedKey,
        encryptedData.iv
      );
      
      return decrypted;
    } catch (error) {
      console.error('Data decryption error:', error);
      throw new Error('Adat visszafejtési hiba');
    }
  }

  /**
   * Encryption key generálása vagy lekérése
   */
  private async getOrCreateKey(keyType: 'data' | 'session'): Promise<EncryptionKey> {
    const keyMap = keyType === 'data' ? this.keyManagement.data_keys : this.keyManagement.session_keys;
    
    // Aktív key keresése
    const entries = Array.from(keyMap.entries());
    for (const [_, key] of entries) {
      if (key.is_active && (!key.expires_at || key.expires_at > new Date())) {
        return key;
      }
    }

    // Új key generálása
    return await this.generateNewKey(keyType);
  }

  /**
   * Új encryption key generálása
   */
  private async generateNewKey(keyType: 'data' | 'session'): Promise<EncryptionKey> {
    try {
      const keyValue = await this.generateMasterKey();
      const keyId = this.generateKeyId();
      
      const newKey: EncryptionKey = {
        id: keyId,
        key: keyValue,
        created_at: new Date(),
        expires_at: keyType === 'session' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined, // Session key: 24 óra
        is_active: true,
        key_type: keyType,
      };

      // Key mentése adatbázisba
      await this.saveKey(newKey);
      
      // Key hozzáadása a memóriához
      const keyMap = keyType === 'data' ? this.keyManagement.data_keys : this.keyManagement.session_keys;
      keyMap.set(keyId, newKey);
      
      return newKey;
    } catch (error) {
      console.error('New key generation error:', error);
      throw new Error('Új encryption key generálási hiba');
    }
  }

  /**
   * Key lekérése ID alapján
   */
  private async getKey(keyId: string): Promise<EncryptionKey | null> {
    // Először memóriából próbáljuk
    const dataEntries = Array.from(this.keyManagement.data_keys.entries());
    for (const [_, key] of dataEntries) {
      if (key.id === keyId) return key;
    }
    
    const sessionEntries = Array.from(this.keyManagement.session_keys.entries());
    for (const [_, key] of sessionEntries) {
      if (key.id === keyId) return key;
    }

    // Ha nem találjuk memóriában, adatbázisból próbáljuk
    try {
      const { data, error } = await this.supabase
        .from('encryption_keys')
        .select('*')
        .eq('id', keyId)
        .single();

      if (error || !data) return null;

      const key: EncryptionKey = {
        ...data,
        created_at: new Date(data.created_at),
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
      };

      // Key hozzáadása a memóriához
      const keyMap = key.key_type === 'data' ? this.keyManagement.data_keys : this.keyManagement.session_keys;
      keyMap.set(keyId, key);
      
      return key;
    } catch (error) {
      console.error('Key retrieval error:', error);
      return null;
    }
  }

  /**
   * Key derivation
   */
  private async deriveKey(key: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await this.crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await this.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Adat titkosítása key-vel
   */
  private async encryptWithKey(data: string, key: CryptoKey, iv: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const ivArray = this.hexToUint8Array(iv);

    const encrypted = await this.crypto.subtle.encrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv: ivArray },
      key,
      encodedData
    );

    return this.arrayBufferToBase64(encrypted);
  }

  /**
   * Adat visszafejtése key-vel
   */
  private async decryptWithKey(encryptedData: string, key: CryptoKey, iv: string): Promise<string> {
    const encryptedArray = this.base64ToArrayBuffer(encryptedData);
    const ivArray = this.hexToUint8Array(iv);

    const decrypted = await this.crypto.subtle.decrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv: ivArray },
      key,
      encryptedArray
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Salt generálása
   */
  private generateSalt(): string {
    const array = new Uint8Array(ENCRYPTION_CONFIG.saltLength);
    this.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * IV generálása
   */
  private generateIV(): string {
    const array = new Uint8Array(ENCRYPTION_CONFIG.ivLength);
    this.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Key ID generálása
   */
  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Key mentése adatbázisba
   */
  private async saveKey(key: EncryptionKey): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encryption_keys')
        .insert({
          id: key.id,
          key: key.key,
          created_at: key.created_at.toISOString(),
          expires_at: key.expires_at?.toISOString(),
          is_active: key.is_active,
          key_type: key.key_type,
        });

      if (error) {
        console.error('Key save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Key save error:', error);
      throw error;
    }
  }

  /**
   * Titkosított adat mentése adatbázisba
   */
  private async saveEncryptedData(encryptedData: EncryptedData): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encrypted_data')
        .insert({
          encrypted: encryptedData.encrypted,
          iv: encryptedData.iv,
          salt: encryptedData.salt,
          key_id: encryptedData.key_id,
          algorithm: encryptedData.algorithm,
          created_at: encryptedData.created_at.toISOString(),
        });

      if (error) {
        console.error('Encrypted data save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Encrypted data save error:', error);
      throw error;
    }
  }

  /**
   * Utility függvények
   */
  private hexToUint8Array(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Key rotation
   */
  async rotateKeys(): Promise<void> {
    try {
      // Régi key-k deaktiválása
      const entries = Array.from(this.keyManagement.data_keys.entries());
      for (const [keyId, key] of entries) {
        if (key.is_active) {
          key.is_active = false;
          await this.updateKey(key);
        }
      }

      // Új key generálása
      await this.generateNewKey('data');
      
      console.log('Key rotation completed successfully');
    } catch (error) {
      console.error('Key rotation error:', error);
      throw new Error('Key rotation hiba');
    }
  }

  /**
   * Key frissítése adatbázisban
   */
  private async updateKey(key: EncryptionKey): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('encryption_keys')
        .update({
          is_active: key.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', key.id);

      if (error) {
        console.error('Key update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Key update error:', error);
      throw error;
    }
  }

  /**
   * Encryption status lekérése
   */
  getEncryptionStatus(): {
    initialized: boolean;
    activeDataKeys: number;
    activeSessionKeys: number;
    algorithm: string;
  } {
    return {
      initialized: !!this.keyManagement.master_key,
      activeDataKeys: Array.from(this.keyManagement.data_keys.values()).filter(k => k.is_active).length,
      activeSessionKeys: Array.from(this.keyManagement.session_keys.values()).filter(k => k.is_active).length,
      algorithm: ENCRYPTION_CONFIG.algorithm,
    };
  }

  /**
   * Encryption config lekérése
   */
  getEncryptionConfig(): typeof ENCRYPTION_CONFIG {
    return ENCRYPTION_CONFIG;
  }
}

// Singleton export
export const encryptionService = EncryptionService.getInstance();
