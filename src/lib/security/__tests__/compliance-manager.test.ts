/**
 * Compliance Manager Unit Tests
 * GDPR compliance és adatvédelmi funkciók tesztelése
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  complianceManager, 
  DataRetentionPolicy,
  DataSubjectRequest,
  PrivacyConsent,
  DataProcessingActivity 
} from '../compliance-manager';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}));

// Mock crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-123')
}));

// Mock global crypto
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  },
  writable: true
});

describe('ComplianceManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should get default configuration', () => {
      const config = complianceManager.getConfig();
      
      expect(config).toEqual({
        gdpr_enabled: true,
        default_retention_period: 2555,
        consent_required: true,
        data_export_enabled: true,
        data_deletion_enabled: true,
        privacy_policy_version: '1.0.0',
        cookie_policy_version: '1.0.0',
        terms_of_service_version: '1.0.0'
      });
    });

    it('should update configuration', () => {
      const newConfig = {
        gdpr_enabled: false,
        default_retention_period: 365
      };
      
      complianceManager.updateConfig(newConfig);
      const config = complianceManager.getConfig();
      
      expect(config.gdpr_enabled).toBe(false);
      expect(config.default_retention_period).toBe(365);
    });
  });

  describe('Basic Functionality', () => {
    it('should create retention policy with valid data', async () => {
      const policy = {
        name: 'Test Policy',
        data_type: 'user_data',
        retention_period: 30,
        retention_unit: 'days' as const,
        deletion_strategy: 'soft' as const,
        is_active: true
      };

      const result = await complianceManager.createRetentionPolicy(policy);
      
      expect(result).toMatchObject({
        name: 'Test Policy',
        data_type: 'user_data',
        retention_period: 30,
        retention_unit: 'days',
        deletion_strategy: 'soft',
        is_active: true
      });
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should create data subject request with valid data', async () => {
      const request = {
        user_id: 'user-123',
        request_type: 'access' as const,
        status: 'pending' as const,
        description: 'Test request',
        requested_data_types: ['personal_data']
      };

      const result = await complianceManager.createDataSubjectRequest(request);
      
      expect(result).toMatchObject({
        user_id: 'user-123',
        request_type: 'access',
        status: 'pending',
        description: 'Test request',
        requested_data_types: ['personal_data']
      });
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should manage consent with valid data', async () => {
      const consent = {
        user_id: 'user-123',
        consent_type: 'marketing' as const,
        granted: true,
        granted_at: new Date(),
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        consent_version: '1.0.0'
      };

      const result = await complianceManager.manageConsent(consent);
      
      expect(result).toMatchObject({
        user_id: 'user-123',
        consent_type: 'marketing',
        granted: true,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        consent_version: '1.0.0'
      });
      expect(result.granted_at).toBeInstanceOf(Date);
    });

    it('should create data processing activity with valid data', async () => {
      const activity = {
        name: 'Test Activity',
        purpose: 'Testing purposes',
        legal_basis: 'consent' as const,
        data_categories: ['personal_data'],
        recipients: ['internal'],
        retention_period: 365,
        data_transfers: ['EU'],
        is_active: true
      };

      const result = await complianceManager.createDataProcessingActivity(activity);
      
      expect(result).toMatchObject({
        name: 'Test Activity',
        purpose: 'Testing purposes',
        legal_basis: 'consent',
        data_categories: ['personal_data'],
        recipients: ['internal'],
        retention_period: 365,
        data_transfers: ['EU'],
        is_active: true
      });
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });
  });

});
