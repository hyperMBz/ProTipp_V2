/**
 * Rate Limiting Security Tests
 * API rate limiting és burst protection tesztek
 */

import { checkRateLimit, checkUserRateLimit, checkIPRateLimit } from '@/lib/auth/session-manager';

describe('Rate Limiting Tests', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    test('should allow requests within limit', () => {
      const result = checkRateLimit('test-user', 10, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    test('should block requests exceeding limit', () => {
      const identifier = 'test-user-block';
      
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, 10, 60000);
      }
      
      // 11th request should be blocked
      const result = checkRateLimit(identifier, 10, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    test('should reset after window expires', (done) => {
      const identifier = 'test-reset';
      
      // Make requests to fill the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 5, 100); // 100ms window
      }
      
      // Should be blocked
      let result = checkRateLimit(identifier, 5, 100);
      expect(result.allowed).toBe(false);
      
      // Wait for window to reset
      setTimeout(() => {
        result = checkRateLimit(identifier, 5, 100);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
        done();
      }, 150);
    });
  });

  describe('Burst Protection', () => {
    test('should implement burst protection', () => {
      const identifier = 'test-burst';
      
      // Make 10 requests quickly
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, 100, 60000, 5);
      }
      
      // 6th request should be blocked by burst protection
      const result = checkRateLimit(identifier, 100, 60000, 5);
      
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    test('should allow requests after burst window', (done) => {
      const identifier = 'test-burst-reset';
      
      // Make 5 requests to trigger burst protection
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 100, 60000, 5);
      }
      
      // Should be blocked by burst protection
      let result = checkRateLimit(identifier, 100, 60000, 5);
      expect(result.allowed).toBe(false);
      
      // Wait for burst window to reset (1 minute)
      setTimeout(() => {
        result = checkRateLimit(identifier, 100, 60000, 5);
        expect(result.allowed).toBe(true);
        done();
      }, 100);
    });
  });

  describe('Per-User Rate Limiting', () => {
    test('should limit per user', () => {
      const userId = 'user-123';
      const action = 'login';
      
      // Make requests for user
      for (let i = 0; i < 5; i++) {
        checkUserRateLimit(userId, action, 5, 60000);
      }
      
      // Should be blocked
      const result = checkUserRateLimit(userId, action, 5, 60000);
      
      expect(result.allowed).toBe(false);
    });

    test('should allow different users independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      const action = 'login';
      
      // Fill limit for user 1
      for (let i = 0; i < 5; i++) {
        checkUserRateLimit(user1, action, 5, 60000);
      }
      
      // User 1 should be blocked
      let result = checkUserRateLimit(user1, action, 5, 60000);
      expect(result.allowed).toBe(false);
      
      // User 2 should still be allowed
      result = checkUserRateLimit(user2, action, 5, 60000);
      expect(result.allowed).toBe(true);
    });

    test('should limit different actions independently', () => {
      const userId = 'user-123';
      const action1 = 'login';
      const action2 = 'register';
      
      // Fill limit for login action
      for (let i = 0; i < 5; i++) {
        checkUserRateLimit(userId, action1, 5, 60000);
      }
      
      // Login should be blocked
      let result = checkUserRateLimit(userId, action1, 5, 60000);
      expect(result.allowed).toBe(false);
      
      // Register should still be allowed
      result = checkUserRateLimit(userId, action2, 5, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Per-IP Rate Limiting', () => {
    test('should limit per IP address', () => {
      const ip = '192.168.1.1';
      
      // Make requests from IP
      for (let i = 0; i < 10; i++) {
        checkIPRateLimit(ip, 10, 60000);
      }
      
      // Should be blocked
      const result = checkIPRateLimit(ip, 10, 60000);
      
      expect(result.allowed).toBe(false);
    });

    test('should allow different IPs independently', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      
      // Fill limit for IP 1
      for (let i = 0; i < 10; i++) {
        checkIPRateLimit(ip1, 10, 60000);
      }
      
      // IP 1 should be blocked
      let result = checkIPRateLimit(ip1, 10, 60000);
      expect(result.allowed).toBe(false);
      
      // IP 2 should still be allowed
      result = checkIPRateLimit(ip2, 10, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Rate Limit Headers', () => {
    test('should include retry-after header when blocked', () => {
      const identifier = 'test-headers';
      
      // Fill the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 5, 60000);
      }
      
      // Should be blocked with retry-after
      const result = checkRateLimit(identifier, 5, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should include remaining count', () => {
      const identifier = 'test-remaining';
      
      // Make 3 requests out of 10
      for (let i = 0; i < 3; i++) {
        checkRateLimit(identifier, 10, 60000);
      }
      
      const result = checkRateLimit(identifier, 10, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(6); // 10 - 4 (3 previous + 1 current)
    });

    test('should include reset time', () => {
      const result = checkRateLimit('test-reset-time', 10, 60000);
      
      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero limit', () => {
      const result = checkRateLimit('test-zero', 0, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should handle negative limit', () => {
      const result = checkRateLimit('test-negative', -1, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('should handle very short window', () => {
      const result = checkRateLimit('test-short', 1, 1); // 1ms window
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    test('should handle empty identifier', () => {
      const result = checkRateLimit('', 10, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });
});
