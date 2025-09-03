"use client";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface APIKeyConfig {
  key_id: string;
  api_key: string;
  user_id: string;
  name: string;
  permissions: string[];
  rate_limit: RateLimitConfig;
  created_at: Date;
  last_used?: Date;
  expires_at?: Date;
  is_active: boolean;
}

export interface SecurityViolation {
  id: string;
  type: 'rate_limit' | 'invalid_key' | 'insufficient_permissions' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent: string;
  endpoint: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface RequestValidation {
  isValid: boolean;
  errors: string[];
  sanitized: any;
  risk_score: number;
}

/**
 * API Security Manager with Rate Limiting and Key Management
 */
export class APISecurityManager {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private apiKeys: Map<string, APIKeyConfig> = new Map();
  private violations: SecurityViolation[] = [];
  private suspiciousIPs: Set<string> = new Set();

  constructor() {
    this.setupCleanupInterval();
    this.initializeDefaultRateLimits();
  }

  /**
   * Check rate limit for request
   */
  checkRateLimit(
    key: string,
    config: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    }
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    let record = this.rateLimitStore.get(key);
    
    // Initialize or reset if window has passed
    if (!record || record.resetTime < windowStart) {
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      // Record violation
      this.recordViolation({
        type: 'rate_limit',
        severity: 'medium',
        ip_address: this.extractIPFromKey(key),
        user_agent: 'unknown',
        endpoint: 'unknown',
        details: {
          key,
          count: record.count,
          limit: config.maxRequests,
          windowMs: config.windowMs,
        },
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter,
      };
    }

    // Increment count and update store
    record.count++;
    this.rateLimitStore.set(key, record);

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Validate API key
   */
  validateAPIKey(apiKey: string): {
    valid: boolean;
    keyConfig?: APIKeyConfig;
    error?: string;
  } {
    try {
      const keyConfig = this.apiKeys.get(apiKey);
      
      if (!keyConfig) {
        this.recordViolation({
          type: 'invalid_key',
          severity: 'high',
          ip_address: 'unknown',
          user_agent: 'unknown',
          endpoint: 'unknown',
          details: { attempted_key: apiKey.substring(0, 8) + '...' },
        });

        return {
          valid: false,
          error: 'Invalid API key',
        };
      }

      if (!keyConfig.is_active) {
        return {
          valid: false,
          error: 'API key is inactive',
        };
      }

      if (keyConfig.expires_at && keyConfig.expires_at < new Date()) {
        return {
          valid: false,
          error: 'API key has expired',
        };
      }

      // Update last used timestamp
      keyConfig.last_used = new Date();

      return {
        valid: true,
        keyConfig,
      };

    } catch (error) {
      console.error('[APISecurityManager] API key validation error:', error);
      return {
        valid: false,
        error: 'API key validation failed',
      };
    }
  }

  /**
   * Check permissions for API key
   */
  checkPermissions(
    keyConfig: APIKeyConfig,
    requiredPermission: string
  ): boolean {
    if (!keyConfig.permissions.includes('*') && 
        !keyConfig.permissions.includes(requiredPermission)) {
      
      this.recordViolation({
        type: 'insufficient_permissions',
        severity: 'medium',
        ip_address: 'unknown',
        user_agent: 'unknown',
        endpoint: 'unknown',
        details: {
          key_id: keyConfig.key_id,
          required_permission: requiredPermission,
          available_permissions: keyConfig.permissions,
        },
      });

      return false;
    }

    return true;
  }

  /**
   * Validate and sanitize request data
   */
  validateRequest(data: any, schema: any): RequestValidation {
    const errors: string[] = [];
    let riskScore = 0;
    let sanitized = { ...data };

    try {
      // Basic XSS protection
      if (typeof data === 'object') {
        sanitized = this.sanitizeObject(data);
        riskScore += this.calculateXSSRisk(data);
      }

      // SQL injection protection
      riskScore += this.calculateSQLInjectionRisk(data);

      // Suspicious patterns
      riskScore += this.calculateSuspiciousPatterns(data);

      // Schema validation (basic implementation)
      const schemaErrors = this.validateSchema(sanitized, schema);
      errors.push(...schemaErrors);

      return {
        isValid: errors.length === 0 && riskScore < 50,
        errors,
        sanitized,
        risk_score: riskScore,
      };

    } catch (error) {
      console.error('[APISecurityManager] Request validation error:', error);
      return {
        isValid: false,
        errors: ['Request validation failed'],
        sanitized: {},
        risk_score: 100,
      };
    }
  }

  /**
   * Register API key
   */
  registerAPIKey(config: Omit<APIKeyConfig, 'created_at' | 'is_active'>): APIKeyConfig {
    const fullConfig: APIKeyConfig = {
      ...config,
      created_at: new Date(),
      is_active: true,
    };

    this.apiKeys.set(config.api_key, fullConfig);
    return fullConfig;
  }

  /**
   * Revoke API key
   */
  revokeAPIKey(apiKey: string): boolean {
    const keyConfig = this.apiKeys.get(apiKey);
    if (keyConfig) {
      keyConfig.is_active = false;
      return true;
    }
    return false;
  }

  /**
   * Get API key statistics
   */
  getAPIKeyStats(apiKey: string): {
    total_requests: number;
    requests_today: number;
    last_used?: Date;
    violations: number;
  } | null {
    const keyConfig = this.apiKeys.get(apiKey);
    if (!keyConfig) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const keyViolations = this.violations.filter(
      v => v.details.key_id === keyConfig.key_id
    );

    return {
      total_requests: 0, // Would be tracked in production
      requests_today: 0, // Would be tracked in production
      last_used: keyConfig.last_used,
      violations: keyViolations.length,
    };
  }

  /**
   * Block suspicious IP
   */
  blockIP(ipAddress: string, reason: string): void {
    this.suspiciousIPs.add(ipAddress);
    
    this.recordViolation({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: ipAddress,
      user_agent: 'unknown',
      endpoint: 'unknown',
      details: { reason, blocked: true },
    });
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress);
  }

  /**
   * Unblock IP
   */
  unblockIP(ipAddress: string): boolean {
    return this.suspiciousIPs.delete(ipAddress);
  }

  /**
   * Get security violations
   */
  getViolations(filters: {
    type?: string;
    severity?: string;
    ip_address?: string;
    resolved?: boolean;
    limit?: number;
  } = {}): SecurityViolation[] {
    let filtered = this.violations;

    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter(v => v.severity === filters.severity);
    }

    if (filters.ip_address) {
      filtered = filtered.filter(v => v.ip_address === filters.ip_address);
    }

    if (filters.resolved !== undefined) {
      filtered = filtered.filter(v => v.resolved === filters.resolved);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Resolve violation
   */
  resolveViolation(violationId: string): boolean {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    total_requests: number;
    blocked_requests: number;
    violations_by_type: Record<string, number>;
    violations_by_severity: Record<string, number>;
    blocked_ips: number;
    active_api_keys: number;
  } {
    const violationsByType = this.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const violationsBySeverity = this.violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeKeys = Array.from(this.apiKeys.values())
      .filter(key => key.is_active).length;

    return {
      total_requests: 0, // Would be tracked in production
      blocked_requests: this.violations.length,
      violations_by_type: violationsByType,
      violations_by_severity: violationsBySeverity,
      blocked_ips: this.suspiciousIPs.size,
      active_api_keys: activeKeys,
    };
  }

  /**
   * Record security violation
   */
  private recordViolation(violation: Omit<SecurityViolation, 'id' | 'timestamp' | 'resolved'>): void {
    const fullViolation: SecurityViolation = {
      ...violation,
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
    };

    this.violations.push(fullViolation);

    // Keep only last 10000 violations
    if (this.violations.length > 10000) {
      this.violations = this.violations.slice(-10000);
    }

    // Auto-block IPs with multiple high-severity violations
    if (violation.severity === 'high' || violation.severity === 'critical') {
      const ipViolations = this.violations.filter(
        v => v.ip_address === violation.ip_address && 
            (v.severity === 'high' || v.severity === 'critical') &&
            Date.now() - v.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      );

      if (ipViolations.length >= 3) {
        this.blockIP(violation.ip_address, 'Multiple high-severity violations');
      }
    }
  }

  /**
   * Sanitize object for XSS protection
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  /**
   * Sanitize string for XSS protection
   */
  private sanitizeString(str: any): any {
    if (typeof str !== 'string') return str;

    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Calculate XSS risk score
   */
  private calculateXSSRisk(data: any): number {
    const dataString = JSON.stringify(data).toLowerCase();
    let risk = 0;

    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(dataString)) {
        risk += 15;
      }
    });

    return Math.min(risk, 100);
  }

  /**
   * Calculate SQL injection risk score
   */
  private calculateSQLInjectionRisk(data: any): number {
    const dataString = JSON.stringify(data).toLowerCase();
    let risk = 0;

    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /'\s*or\s*'1'\s*=\s*'1/i,
      /;\s*--/i,
      /\/\*.*\*\//i,
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(dataString)) {
        risk += 20;
      }
    });

    return Math.min(risk, 100);
  }

  /**
   * Calculate suspicious patterns risk score
   */
  private calculateSuspiciousPatterns(data: any): number {
    const dataString = JSON.stringify(data);
    let risk = 0;

    // Excessive length
    if (dataString.length > 10000) {
      risk += 10;
    }

    // Repeated characters
    if (/(.)\1{50,}/.test(dataString)) {
      risk += 15;
    }

    // Binary data in text fields
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/.test(dataString)) {
      risk += 10;
    }

    return Math.min(risk, 100);
  }

  /**
   * Basic schema validation
   */
  private validateSchema(data: any, schema: any): string[] {
    const errors: string[] = [];

    if (!schema) return errors;

    // Basic type checking
    if (schema.type && typeof data !== schema.type) {
      errors.push(`Expected ${schema.type}, got ${typeof data}`);
    }

    // Required fields
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (!(field in data) || data[field] === undefined || data[field] === null) {
          errors.push(`Required field '${field}' is missing`);
        }
      });
    }

    return errors;
  }

  /**
   * Extract IP from rate limit key
   */
  private extractIPFromKey(key: string): string {
    // Assuming key format is "ip:endpoint" or just "ip"
    return key.split(':')[0] || 'unknown';
  }

  /**
   * Initialize default rate limits
   */
  private initializeDefaultRateLimits(): void {
    // Rate limits are applied per endpoint/key combination
    // This would be configured based on API endpoint requirements
  }

  /**
   * Setup cleanup interval
   */
  private setupCleanupInterval(): void {
    // Clean up expired rate limit records every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.rateLimitStore.entries()) {
        if (record.resetTime < now) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    // Clean up old violations every hour
    setInterval(() => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
      this.violations = this.violations.filter(v => v.timestamp.getTime() > cutoff);
    }, 60 * 60 * 1000);
  }
}

/**
 * Global API security manager instance
 */
export const apiSecurityManager = new APISecurityManager();

/**
 * Middleware helper functions
 */
export const APISecurityUtils = {
  /**
   * Generate rate limit key
   */
  generateRateLimitKey(ip: string, endpoint?: string, userId?: string): string {
    const parts = [ip];
    if (endpoint) parts.push(endpoint);
    if (userId) parts.push(userId);
    return parts.join(':');
  },

  /**
   * Extract IP address from request
   */
  extractIP(req: any): string {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           'unknown';
  },

  /**
   * Extract user agent from request
   */
  extractUserAgent(req: any): string {
    return req.headers['user-agent'] || 'unknown';
  },

  /**
   * Create security headers
   */
  createSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  },
};
