import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import securityMonitoringManager, { 
  SecurityEvent, 
  SecurityAlert, 
  ThreatIndicator,
  MonitoringConfig 
} from '../monitoring';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        error: null
      })),
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        })),
        count: vi.fn(() => ({
          head: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          lt: vi.fn(() => ({
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// Mock process.env
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}));

// Mock crypto.randomUUID
vi.mock('globalThis', () => ({
  crypto: {
    randomUUID: vi.fn(() => 'test-uuid-123')
  }
}));

describe('SecurityMonitoringManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up singleton instance
    vi.resetModules();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = securityMonitoringManager;
      const instance2 = securityMonitoringManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Management', () => {
    it('should return default configuration', () => {
      const config = securityMonitoringManager.getConfig();
      expect(config).toEqual({
        real_time_monitoring: true,
        alert_thresholds: {
          failed_logins_per_hour: 5,
          suspicious_ips_per_hour: 10,
          api_errors_per_minute: 20,
          encryption_failures_per_hour: 3
        },
        alert_channels: {
          email_enabled: true,
          sms_enabled: false,
          webhook_enabled: true,
          dashboard_enabled: true
        },
        retention_period: 90,
        auto_resolution: true,
        auto_resolution_delay: 24
      });
    });

    it('should update configuration', () => {
      const newConfig = {
        real_time_monitoring: false,
        alert_thresholds: {
          failed_logins_per_hour: 10
        }
      };

      securityMonitoringManager.updateConfig(newConfig);
      const updatedConfig = securityMonitoringManager.getConfig();

      expect(updatedConfig.real_time_monitoring).toBe(false);
      expect(updatedConfig.alert_thresholds.failed_logins_per_hour).toBe(10);
    });
  });

  describe('Security Event Creation', () => {
    it('should create security event successfully', async () => {
      const mockEvent = {
        event_type: 'failed_login' as const,
        severity: 'high' as const,
        user_id: 'test-user',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        description: 'Multiple failed login attempts',
        metadata: { attempts: 5 }
      };

      const result = await securityMonitoringManager.createSecurityEvent(mockEvent);

      expect(result).toMatchObject({
        id: 'test-uuid-123',
        event_type: 'failed_login',
        severity: 'high',
        user_id: 'test-user',
        ip_address: '192.168.1.100',
        description: 'Multiple failed login attempts',
        resolved: false
      });
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle security event creation error', async () => {
      // Mock Supabase error
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            error: new Error('Database error')
          }))
        }))
      });

      const mockEvent = {
        event_type: 'failed_login' as const,
        severity: 'high' as const,
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        description: 'Test event',
        metadata: {}
      };

      await expect(securityMonitoringManager.createSecurityEvent(mockEvent))
        .rejects.toThrow('Biztonsági esemény létrehozás sikertelen');
    });
  });

  describe('Security Events Retrieval', () => {
    it('should retrieve security events with filters', async () => {
      const mockEvents = [
        {
          id: 'test-uuid-123',
          event_type: 'failed_login',
          severity: 'high',
          user_id: 'test-user',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0',
          description: 'Test event',
          metadata: {},
          timestamp: '2024-01-01T00:00:00Z',
          resolved: false
        }
      ];

      // Mock Supabase response
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gte: vi.fn(() => ({
                    lte: vi.fn(() => ({
                      data: mockEvents,
                      error: null
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      });

      const filters = {
        event_type: 'failed_login',
        severity: 'high',
        resolved: false
      };

      const result = await securityMonitoringManager.getSecurityEvents(filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'test-uuid-123',
        event_type: 'failed_login',
        severity: 'high'
      });
      expect(result[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle retrieval error gracefully', async () => {
      // Mock Supabase error
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gte: vi.fn(() => ({
                    lte: vi.fn(() => ({
                      data: null,
                      error: new Error('Database error')
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      });

      const result = await securityMonitoringManager.getSecurityEvents();
      expect(result).toEqual([]);
    });
  });

  describe('Event Resolution', () => {
    it('should resolve security event successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.resolveSecurityEvent('test-event-id', 'admin', 'Test resolution')
      ).resolves.not.toThrow();
    });

    it('should handle resolution error', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: new Error('Database error')
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.resolveSecurityEvent('test-event-id', 'admin')
      ).rejects.toThrow('Biztonsági esemény feloldás sikertelen');
    });
  });

  describe('Threat Indicators', () => {
    it('should retrieve threat indicators', async () => {
      const mockIndicators = [
        {
          id: 'test-uuid-123',
          indicator_type: 'ip_address',
          value: '192.168.1.100',
          threat_level: 'high',
          description: 'Suspicious activity',
          first_seen: '2024-01-01T00:00:00Z',
          last_seen: '2024-01-01T01:00:00Z',
          occurrences: 5,
          is_blocked: false
        }
      ];

      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              data: mockIndicators,
              error: null
            }))
          }))
        }))
      });

      const result = await securityMonitoringManager.getThreatIndicators();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'test-uuid-123',
        indicator_type: 'ip_address',
        value: '192.168.1.100',
        threat_level: 'high'
      });
      expect(result[0].first_seen).toBeInstanceOf(Date);
      expect(result[0].last_seen).toBeInstanceOf(Date);
    });

    it('should handle threat indicators retrieval error', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      });

      const result = await securityMonitoringManager.getThreatIndicators();
      expect(result).toEqual([]);
    });
  });

  describe('IP Blocking', () => {
    it('should block IP address successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.blockIPAddress('192.168.1.100', 'Test block')
      ).resolves.not.toThrow();
    });

    it('should handle IP blocking error', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: new Error('Database error')
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.blockIPAddress('192.168.1.100', 'Test block')
      ).rejects.toThrow('IP cím blokkolás sikertelen');
    });

    it('should unblock IP address successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.unblockIPAddress('192.168.1.100')
      ).resolves.not.toThrow();
    });

    it('should handle IP unblocking error', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: new Error('Database error')
            }))
          }))
        }))
      });

      await expect(
        securityMonitoringManager.unblockIPAddress('192.168.1.100')
      ).rejects.toThrow('IP cím blokkolás feloldása sikertelen');
    });
  });

  describe('Monitoring Statistics', () => {
    it('should retrieve monitoring statistics', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            count: vi.fn(() => ({
              head: vi.fn(() => ({
                data: null,
                error: null
              }))
            }))
          }))
        }))
      });

      const result = await securityMonitoringManager.getMonitoringStats();

      expect(result).toEqual({
        total_events: 0,
        events_last_hour: 0,
        events_last_day: 0,
        critical_events: 0,
        high_events: 0,
        medium_events: 0,
        low_events: 0,
        unresolved_events: 0,
        total_alerts: 0,
        sent_alerts: 0,
        failed_alerts: 0,
        threat_indicators: 0,
        blocked_ips: 0
      });
    });

    it('should handle statistics retrieval error', async () => {
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            count: vi.fn(() => ({
              head: vi.fn(() => ({
                data: null,
                error: new Error('Database error')
              }))
            }))
          }))
        }))
      });

      const result = await securityMonitoringManager.getMonitoringStats();
      expect(result).toEqual({});
    });
  });

  describe('Monitoring Control', () => {
    it('should stop monitoring', () => {
      // This test verifies that the method exists and doesn't throw
      expect(() => securityMonitoringManager.stopMonitoring()).not.toThrow();
    });
  });
});
