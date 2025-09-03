/**
 * API Security Manager Unit Tests
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

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
  }
}));

// Mock crypto API
const mockCrypto = {
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
  }
};

// Mock global crypto
Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true
});

// Import after mocks
import { apiSecurityManager, APIKey, RateLimitInfo, APIRequest } from '../api-security';

describe('APISecurityManager', () => {
  const mockUserId = 'test-user-id';
  const mockKeyName = 'Test API Key';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = apiSecurityManager;
      const instance2 = apiSecurityManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('API Key Generation', () => {
    it('should handle API key generation errors', async () => {
      // Mock getUserAPIKeys to throw error
      vi.spyOn(apiSecurityManager, 'getUserAPIKeys').mockRejectedValue(new Error('Database error'));

      await expect(apiSecurityManager.generateAPIKey(mockUserId, mockKeyName))
        .rejects.toThrow('API kulcs generálás sikertelen');
    });
  });

  describe('API Key Validation', () => {
    it('should handle invalid API key', async () => {
      const result = await apiSecurityManager.validateAPIKey('invalid-key');
      expect(result).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit successfully', async () => {
      const identifier = 'test-user-123';
      const result = await apiSecurityManager.checkRateLimit(identifier);

      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('window');
      expect(result).toHaveProperty('reset_time');
      expect(result).toHaveProperty('remaining');
      expect(typeof result.current).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.remaining).toBe('number');
      expect(result.reset_time).toBeInstanceOf(Date);
    });

    it('should handle rate limit errors gracefully', async () => {
      // Mock crypto error
      mockCrypto.getRandomValues.mockImplementationOnce(() => {
        throw new Error('Crypto error');
      });

      const result = await apiSecurityManager.checkRateLimit('test-identifier');

      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(typeof result.current).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.remaining).toBe('number');
    });
  });

  describe('Request Validation', () => {
    it('should validate request successfully', async () => {
      const request: Partial<APIRequest> = {
        method: 'GET',
        path: '/api/test',
        ip_address: '192.168.1.1'
      };

      const result = await apiSecurityManager.validateRequest(request);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid HTTP method', async () => {
      const request: Partial<APIRequest> = {
        method: 'INVALID',
        path: '/api/test'
      };

      const result = await apiSecurityManager.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Nem engedélyezett HTTP metódus');
    });

    it('should reject blocked IP address', async () => {
      // Mock config with blocked IP
      const originalConfig = apiSecurityManager.getConfig();
      apiSecurityManager.updateConfig({ blocked_ips: ['192.168.1.1'] });

      const request: Partial<APIRequest> = {
        method: 'GET',
        path: '/api/test',
        ip_address: '192.168.1.1'
      };

      const result = await apiSecurityManager.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Blokkolt IP cím');

      // Restore original config
      apiSecurityManager.updateConfig(originalConfig);
    });

    it('should reject oversized request', async () => {
      const largePath = 'a'.repeat(1001);
      const request: Partial<APIRequest> = {
        method: 'GET',
        path: largePath
      };

      const result = await apiSecurityManager.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Érvénytelen kérési útvonal');
    });

    it('should reject invalid path', async () => {
      const request: Partial<APIRequest> = {
        method: 'GET',
        path: '/api/test<script>alert("xss")</script>'
      };

      const result = await apiSecurityManager.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Érvénytelen kérési útvonal');
    });
  });

  describe('API Request Logging', () => {
    it('should log API request successfully', async () => {
      const request: APIRequest = {
        method: 'GET',
        path: '/api/test',
        user_id: mockUserId,
        ip_address: '192.168.1.1',
        user_agent: 'test-agent',
        timestamp: new Date(),
        response_time: 100,
        status_code: 200
      };

      await expect(apiSecurityManager.logAPIRequest(request)).resolves.not.toThrow();
    });
  });



  describe('API Key Deactivation', () => {
    it('should deactivate API key successfully', async () => {
      await expect(apiSecurityManager.deactivateAPIKey('test-key-id')).resolves.not.toThrow();
    });
  });

  describe('Configuration Management', () => {
    it('should get current configuration', () => {
      const config = apiSecurityManager.getConfig();

      expect(config).toHaveProperty('default_rate_limit');
      expect(config).toHaveProperty('default_rate_limit_window');
      expect(config).toHaveProperty('max_api_keys_per_user');
      expect(config).toHaveProperty('max_request_size');
      expect(config).toHaveProperty('allowed_methods');
      expect(config).toHaveProperty('blocked_ips');
      expect(config).toHaveProperty('allowed_origins');
    });

    it('should update configuration', () => {
      const originalConfig = apiSecurityManager.getConfig();
      const newConfig = {
        default_rate_limit: 200,
        max_api_keys_per_user: 5
      };

      apiSecurityManager.updateConfig(newConfig);
      const updatedConfig = apiSecurityManager.getConfig();

      expect(updatedConfig.default_rate_limit).toBe(200);
      expect(updatedConfig.max_api_keys_per_user).toBe(5);
      expect(updatedConfig.default_rate_limit_window).toBe(originalConfig.default_rate_limit_window);
    });
  });

  describe('Rate Limit Cache', () => {
    it('should clear rate limit cache', () => {
      // First, create some rate limit entries
      apiSecurityManager.checkRateLimit('test1');
      apiSecurityManager.checkRateLimit('test2');

      // Clear cache
      apiSecurityManager.clearRateLimitCache();

      // Should work without errors
      expect(() => apiSecurityManager.clearRateLimitCache()).not.toThrow();
    });
  });


});
