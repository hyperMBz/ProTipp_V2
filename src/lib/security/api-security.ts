/**
 * API Security Manager - API biztonság kezelő
 * Rate limiting, API kulcs kezelés és kérés validáció
 */

import { createClient } from '@supabase/supabase-js';

export interface APIKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  rate_limit: number;
  rate_limit_window: number; // másodpercekben
  created_at: Date;
  last_used?: Date;
  expires_at?: Date;
  is_active: boolean;
}

export interface RateLimitInfo {
  current: number;
  limit: number;
  window: number;
  reset_time: Date;
  remaining: number;
}

export interface APIRequest {
  method: string;
  path: string;
  user_id?: string;
  api_key_id?: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  response_time: number;
  status_code: number;
  error_message?: string;
}

export interface SecurityConfig {
  default_rate_limit: number;
  default_rate_limit_window: number;
  max_api_keys_per_user: number;
  max_request_size: number; // bytes
  allowed_methods: string[];
  blocked_ips: string[];
  allowed_origins: string[];
}

class APISecurityManager {
  private static instance: APISecurityManager;
  private supabase: any;
  private config: SecurityConfig;
  private rateLimitCache: Map<string, { count: number; resetTime: Date }>;

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
      default_rate_limit: 100,
      default_rate_limit_window: 3600, // 1 óra
      max_api_keys_per_user: 10,
      max_request_size: 10 * 1024 * 1024, // 10MB
      allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      blocked_ips: [],
      allowed_origins: ['*']
    };
    
    this.rateLimitCache = new Map();
  }

  public static getInstance(): APISecurityManager {
    if (!APISecurityManager.instance) {
      APISecurityManager.instance = new APISecurityManager();
    }
    return APISecurityManager.instance;
  }

  /**
   * API kulcs generálása
   */
  async generateAPIKey(userId: string, name: string, permissions: string[] = []): Promise<APIKey> {
    try {
      // Ellenőrizd a felhasználó API kulcsainak számát
      const existingKeys = await this.getUserAPIKeys(userId);
      if (existingKeys.length >= this.config.max_api_keys_per_user) {
        throw new Error('Elérted a maximális API kulcsok számát');
      }

      // Generálj egyedi API kulcsot
      const apiKey = this.generateSecureKey();
      const keyHash = await this.hashAPIKey(apiKey);

      const apiKeyRecord: APIKey = {
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        key_hash: keyHash,
        permissions,
        rate_limit: this.config.default_rate_limit,
        rate_limit_window: this.config.default_rate_limit_window,
        created_at: new Date(),
        is_active: true
      };

      // Mentsd el az adatbázisba
      await this.saveAPIKey(apiKeyRecord);

      // Vissza a teljes API kulcsot (csak egyszer jelenik meg)
      return {
        ...apiKeyRecord,
        key_hash: apiKey // Visszaadunk egy hash-elt verziót a biztonság érdekében
      };
    } catch (error) {
      console.error('API key generation error:', error);
      throw new Error('API kulcs generálás sikertelen');
    }
  }

  /**
   * API kulcs validálása
   */
  async validateAPIKey(apiKey: string): Promise<APIKey | null> {
    try {
      const keyHash = await this.hashAPIKey(apiKey);
      
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // Ellenőrizd a lejárati időt
      if (data.expires_at && new Date() > new Date(data.expires_at)) {
        await this.deactivateAPIKey(data.id);
        return null;
      }

      // Frissítsd a last_used mezőt
      await this.updateAPIKeyUsage(data.id);

      return {
        ...data,
        created_at: new Date(data.created_at),
        last_used: data.last_used ? new Date(data.last_used) : undefined,
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined
      };
    } catch (error) {
      console.error('API key validation error:', error);
      return null;
    }
  }

  /**
   * Rate limiting ellenőrzés
   */
  async checkRateLimit(identifier: string, limit?: number, window?: number): Promise<RateLimitInfo> {
    try {
      const rateLimit = limit || this.config.default_rate_limit;
      const rateLimitWindow = window || this.config.default_rate_limit_window;
      
      const cacheKey = `${identifier}:${rateLimit}:${rateLimitWindow}`;
      const now = new Date();
      
      // Ellenőrizd a cache-t
      const cached = this.rateLimitCache.get(cacheKey);
      if (cached && now < cached.resetTime) {
        cached.count++;
        return {
          current: cached.count,
          limit: rateLimit,
          window: rateLimitWindow,
          reset_time: cached.resetTime,
          remaining: Math.max(0, rateLimit - cached.count)
        };
      }

      // Új rate limit ablak
      const resetTime = new Date(now.getTime() + rateLimitWindow * 1000);
      this.rateLimitCache.set(cacheKey, { count: 1, resetTime });

      return {
        current: 1,
        limit: rateLimit,
        window: rateLimitWindow,
        reset_time: resetTime,
        remaining: rateLimit - 1
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Hiba esetén engedélyezd a kérést
      return {
        current: 0,
        limit: 1000,
        window: 3600,
        reset_time: new Date(),
        remaining: 1000
      };
    }
  }

  /**
   * Kérés validáció
   */
  async validateRequest(request: Partial<APIRequest>): Promise<{ valid: boolean; error?: string }> {
    try {
      // Ellenőrizd a HTTP metódust
      if (request.method && !this.config.allowed_methods.includes(request.method.toUpperCase())) {
        return { valid: false, error: 'Nem engedélyezett HTTP metódus' };
      }

      // Ellenőrizd az IP címet
      if (request.ip_address && this.config.blocked_ips.includes(request.ip_address)) {
        return { valid: false, error: 'Blokkolt IP cím' };
      }

      // Ellenőrizd a kérés méretét (ha van)
      if (request.path && request.path.length > this.config.max_request_size) {
        return { valid: false, error: 'Túl nagy kérés' };
      }

      // Ellenőrizd a path-t (alapvető validáció)
      if (request.path && !this.isValidPath(request.path)) {
        return { valid: false, error: 'Érvénytelen kérési útvonal' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Request validation error:', error);
      return { valid: false, error: 'Kérés validáció hiba' };
    }
  }

  /**
   * API kérés naplózása
   */
  async logAPIRequest(request: APIRequest): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_requests')
        .insert({
          id: crypto.randomUUID(),
          method: request.method,
          path: request.path,
          user_id: request.user_id,
          api_key_id: request.api_key_id,
          ip_address: request.ip_address,
          user_agent: request.user_agent,
          timestamp: request.timestamp.toISOString(),
          response_time: request.response_time,
          status_code: request.status_code,
          error_message: request.error_message
        });

      if (error) {
        console.error('API request logging error:', error);
      }
    } catch (error) {
      console.error('API request logging error:', error);
    }
  }

  /**
   * Felhasználó API kulcsainak lekérése
   */
  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('User API keys retrieval error:', error);
        return [];
      }

      return data ? data.map(key => ({
        ...key,
        created_at: new Date(key.created_at),
        last_used: key.last_used ? new Date(key.last_used) : undefined,
        expires_at: key.expires_at ? new Date(key.expires_at) : undefined
      })) : [];
    } catch (error) {
      console.error('User API keys retrieval error:', error);
      return [];
    }
  }

  /**
   * API kulcs inaktiválása
   */
  async deactivateAPIKey(keyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('API key deactivation error:', error);
      throw new Error('API kulcs inaktiválás sikertelen');
    }
  }

  /**
   * API kulcs használat frissítése
   */
  private async updateAPIKeyUsage(keyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyId);

      if (error) {
        console.error('API key usage update error:', error);
      }
    } catch (error) {
      console.error('API key usage update error:', error);
    }
  }

  /**
   * Biztonságos API kulcs generálás
   */
  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * API kulcs hash-elése
   */
  private async hashAPIKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * API kulcs mentése
   */
  private async saveAPIKey(apiKey: APIKey): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_keys')
        .insert({
          id: apiKey.id,
          user_id: apiKey.user_id,
          name: apiKey.name,
          key_hash: apiKey.key_hash,
          permissions: apiKey.permissions,
          rate_limit: apiKey.rate_limit,
          rate_limit_window: apiKey.rate_limit_window,
          created_at: apiKey.created_at.toISOString(),
          expires_at: apiKey.expires_at?.toISOString(),
          is_active: apiKey.is_active
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('API key save error:', error);
      throw new Error('API kulcs mentés sikertelen');
    }
  }

  /**
   * Path validáció
   */
  private isValidPath(path: string): boolean {
    // Alapvető path validáció
    const validPathPattern = /^[a-zA-Z0-9\/\-_\.]+$/;
    return validPathPattern.test(path) && path.length <= 1000;
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Rate limit cache tisztítása
   */
  clearRateLimitCache(): void {
    this.rateLimitCache.clear();
  }

  /**
   * API statisztikák lekérése
   */
  async getAPIStats(userId?: string, days: number = 30): Promise<any> {
    try {
      let query = this.supabase
        .from('api_requests')
        .select('*')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('API stats retrieval error:', error);
        return {};
      }

             // Számítsd ki a statisztikákat
       const stats = {
         total_requests: data?.length || 0,
         successful_requests: data?.filter((r: any) => r.status_code < 400).length || 0,
         failed_requests: data?.filter((r: any) => r.status_code >= 400).length || 0,
         average_response_time: data?.reduce((sum: number, r: any) => sum + r.response_time, 0) / (data?.length || 1),
         requests_by_method: this.groupBy(data, 'method'),
         requests_by_status: this.groupBy(data, 'status_code')
       };

      return stats;
    } catch (error) {
      console.error('API stats retrieval error:', error);
      return {};
    }
  }

  /**
   * Adatok csoportosítása
   */
  private groupBy(data: any[], key: string): Record<string, number> {
    return data?.reduce((acc: Record<string, number>, item: any) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {}) || {};
  }
}

export const apiSecurityManager = APISecurityManager.getInstance();
export default apiSecurityManager;
