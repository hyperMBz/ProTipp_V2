/**
 * Security Monitoring Manager - Biztonsági monitoring kezelő
 * Valós idejű biztonsági események detektálása és riasztások
 */

import { createClient } from '@supabase/supabase-js';

export interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'api_abuse' | 'encryption_error' | 'compliance_violation' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface SecurityAlert {
  id: string;
  event_id: string;
  alert_type: 'email' | 'sms' | 'webhook' | 'dashboard';
  recipient: string;
  message: string;
  sent: boolean;
  sent_at?: Date;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export interface ThreatIndicator {
  id: string;
  indicator_type: 'ip_address' | 'user_agent' | 'behavior_pattern' | 'geographic_location';
  value: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  first_seen: Date;
  last_seen: Date;
  occurrences: number;
  is_blocked: boolean;
  block_reason?: string;
}

export interface MonitoringConfig {
  real_time_monitoring: boolean;
  alert_thresholds: {
    failed_logins_per_hour: number;
    suspicious_ips_per_hour: number;
    api_errors_per_minute: number;
    encryption_failures_per_hour: number;
  };
  alert_channels: {
    email_enabled: boolean;
    sms_enabled: boolean;
    webhook_enabled: boolean;
    dashboard_enabled: boolean;
  };
  retention_period: number; // napokban
  auto_resolution: boolean;
  auto_resolution_delay: number; // órákban
}

class SecurityMonitoringManager {
  private static instance: SecurityMonitoringManager;
  private supabase: any;
  private config: MonitoringConfig;
  private eventCache: Map<string, SecurityEvent[]>;
  private alertQueue: SecurityAlert[];
  private threatIndicators: Map<string, ThreatIndicator>;
  private monitoringInterval?: NodeJS.Timeout;

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
    };
    
    this.eventCache = new Map();
    this.alertQueue = [];
    this.threatIndicators = new Map();
    
    // Teszt környezetben ne indítsd el a monitoring-ot
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      this.startMonitoring();
    }
  }

  public static getInstance(): SecurityMonitoringManager {
    if (!SecurityMonitoringManager.instance) {
      SecurityMonitoringManager.instance = new SecurityMonitoringManager();
    }
    return SecurityMonitoringManager.instance;
  }

  /**
   * Biztonsági esemény létrehozása
   */
  async createSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<SecurityEvent> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        resolved: false
      };

      const { error } = await this.supabase
        .from('security_events')
        .insert({
          id: securityEvent.id,
          event_type: securityEvent.event_type,
          severity: securityEvent.severity,
          user_id: securityEvent.user_id,
          ip_address: securityEvent.ip_address,
          user_agent: securityEvent.user_agent,
          description: securityEvent.description,
          metadata: securityEvent.metadata,
          timestamp: securityEvent.timestamp.toISOString(),
          resolved: securityEvent.resolved
        });

      if (error) {
        throw error;
      }

      // Cache-be mentés
      this.addToCache(securityEvent);

      // Riasztás generálása
      await this.generateAlert(securityEvent);

      // Fenyegetés detektálás
      await this.detectThreats(securityEvent);

      return securityEvent;
    } catch (error) {
      console.error('Security event creation error:', error);
      throw new Error('Biztonsági esemény létrehozás sikertelen');
    }
  }

  /**
   * Biztonsági események lekérése
   */
  async getSecurityEvents(
    filters: {
      event_type?: string;
      severity?: string;
      user_id?: string;
      resolved?: boolean;
      start_date?: Date;
      end_date?: Date;
    } = {},
    limit: number = 100
  ): Promise<SecurityEvent[]> {
    try {
      let query = this.supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date.toISOString());
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data ? data.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp),
        resolved_at: event.resolved_at ? new Date(event.resolved_at) : undefined
      })) : [];
    } catch (error) {
      console.error('Security events retrieval error:', error);
      return [];
    }
  }

  /**
   * Esemény feloldása
   */
  async resolveSecurityEvent(eventId: string, resolvedBy: string, notes?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution_notes: notes
        })
        .eq('id', eventId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Security event resolution error:', error);
      throw new Error('Biztonsági esemény feloldás sikertelen');
    }
  }

  /**
   * Riasztás generálása
   */
  private async generateAlert(event: SecurityEvent): Promise<void> {
    try {
      // Ellenőrizd a riasztási feltételeket
      if (!this.shouldGenerateAlert(event)) {
        return;
      }

      const alertMessage = this.createAlertMessage(event);
      const alert: SecurityAlert = {
        id: crypto.randomUUID(),
        event_id: event.id,
        alert_type: 'dashboard',
        recipient: 'admin',
        message: alertMessage,
        sent: false,
        retry_count: 0,
        max_retries: 3
      };

      // Riasztás küldése
      await this.sendAlert(alert);

      // Riasztás mentése
      const { error } = await this.supabase
        .from('security_alerts')
        .insert({
          id: alert.id,
          event_id: alert.event_id,
          alert_type: alert.alert_type,
          recipient: alert.recipient,
          message: alert.message,
          sent: alert.sent,
          retry_count: alert.retry_count,
          max_retries: alert.max_retries
        });

      if (error) {
        console.error('Alert save error:', error);
      }
    } catch (error) {
      console.error('Alert generation error:', error);
    }
  }

  /**
   * Riasztás küldése
   */
  private async sendAlert(alert: SecurityAlert): Promise<void> {
    try {
      switch (alert.alert_type) {
        case 'email':
          if (this.config.alert_channels.email_enabled) {
            await this.sendEmailAlert(alert);
          }
          break;
        case 'sms':
          if (this.config.alert_channels.sms_enabled) {
            await this.sendSMSAlert(alert);
          }
          break;
        case 'webhook':
          if (this.config.alert_channels.webhook_enabled) {
            await this.sendWebhookAlert(alert);
          }
          break;
        case 'dashboard':
          if (this.config.alert_channels.dashboard_enabled) {
            await this.sendDashboardAlert(alert);
          }
          break;
      }

      // Riasztás státusz frissítése
      alert.sent = true;
      alert.sent_at = new Date();

      await this.supabase
        .from('security_alerts')
        .update({
          sent: true,
          sent_at: alert.sent_at.toISOString()
        })
        .eq('id', alert.id);
    } catch (error) {
      console.error('Alert sending error:', error);
      alert.error_message = error instanceof Error ? error.message : 'Unknown error';
      alert.retry_count++;

      if (alert.retry_count < alert.max_retries) {
        // Újrapróbálkozás később
        setTimeout(() => this.sendAlert(alert), 5000 * alert.retry_count);
      }
    }
  }

  /**
   * Email riasztás küldése
   */
  private async sendEmailAlert(alert: SecurityAlert): Promise<void> {
    // TODO: Implement email sending
    console.log('Email alert sent:', alert.message);
  }

  /**
   * SMS riasztás küldése
   */
  private async sendSMSAlert(alert: SecurityAlert): Promise<void> {
    // TODO: Implement SMS sending
    console.log('SMS alert sent:', alert.message);
  }

  /**
   * Webhook riasztás küldése
   */
  private async sendWebhookAlert(alert: SecurityAlert): Promise<void> {
    // TODO: Implement webhook sending
    console.log('Webhook alert sent:', alert.message);
  }

  /**
   * Dashboard riasztás küldése
   */
  private async sendDashboardAlert(alert: SecurityAlert): Promise<void> {
    // TODO: Implement real-time dashboard notification
    console.log('Dashboard alert sent:', alert.message);
  }

  /**
   * Riasztási feltételek ellenőrzése
   */
  private shouldGenerateAlert(event: SecurityEvent): boolean {
    // Kritikus események mindig riasztást generálnak
    if (event.severity === 'critical') {
      return true;
    }

    // Magas súlyosságú események riasztást generálnak
    if (event.severity === 'high') {
      return true;
    }

    // Közepes súlyosságú események esetlegesen riasztást generálnak
    if (event.severity === 'medium') {
      // Ellenőrizd a gyakoriságot
      const recentEvents = this.getRecentEvents(event.event_type, event.ip_address, 1);
      return recentEvents.length >= 3;
    }

    return false;
  }

  /**
   * Riasztási üzenet létrehozása
   */
  private createAlertMessage(event: SecurityEvent): string {
    const severityEmoji = {
      'low': '🔵',
      'medium': '🟡',
      'high': '🟠',
      'critical': '🔴'
    };

    return `${severityEmoji[event.severity]} **${event.severity.toUpperCase()}** Security Alert

**Event Type**: ${event.event_type}
**Description**: ${event.description}
**IP Address**: ${event.ip_address}
**Timestamp**: ${event.timestamp.toLocaleString()}
${event.user_id ? `**User ID**: ${event.user_id}` : ''}

**Metadata**: ${JSON.stringify(event.metadata, null, 2)}`;
  }

  /**
   * Fenyegetések detektálása
   */
  private async detectThreats(event: SecurityEvent): Promise<void> {
    try {
      // IP cím alapú fenyegetés detektálás
      await this.detectIPThreat(event);

      // Viselkedési minta detektálás
      await this.detectBehavioralThreat(event);

      // Geográfiai fenyegetés detektálás
      await this.detectGeographicThreat(event);
    } catch (error) {
      console.error('Threat detection error:', error);
    }
  }

  /**
   * IP cím alapú fenyegetés detektálás
   */
  private async detectIPThreat(event: SecurityEvent): Promise<void> {
    const recentEvents = this.getRecentEvents(event.event_type, event.ip_address, 1);
    
    if (recentEvents.length >= this.config.alert_thresholds.suspicious_ips_per_hour) {
      const threatIndicator: ThreatIndicator = {
        id: crypto.randomUUID(),
        indicator_type: 'ip_address',
        value: event.ip_address,
        threat_level: 'high',
        description: `Suspicious activity from IP ${event.ip_address}`,
        first_seen: recentEvents[0].timestamp,
        last_seen: event.timestamp,
        occurrences: recentEvents.length,
        is_blocked: false
      };

      await this.createThreatIndicator(threatIndicator);
    }
  }

  /**
   * Viselkedési minta detektálás
   */
  private async detectBehavioralThreat(event: SecurityEvent): Promise<void> {
    // TODO: Implement behavioral analysis
    // Például: gyakori bejelentkezési kísérletek, szokatlan API használat
  }

  /**
   * Geográfiai fenyegetés detektálás
   */
  private async detectGeographicThreat(event: SecurityEvent): Promise<void> {
    // TODO: Implement geographic threat detection
    // Például: ismert rosszindulatú régiók, VPN detektálás
  }

  /**
   * Fenyegetési indikátor létrehozása
   */
  private async createThreatIndicator(indicator: ThreatIndicator): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('threat_indicators')
        .insert({
          id: indicator.id,
          indicator_type: indicator.indicator_type,
          value: indicator.value,
          threat_level: indicator.threat_level,
          description: indicator.description,
          first_seen: indicator.first_seen.toISOString(),
          last_seen: indicator.last_seen.toISOString(),
          occurrences: indicator.occurrences,
          is_blocked: indicator.is_blocked,
          block_reason: indicator.block_reason
        });

      if (error) {
        throw error;
      }

      this.threatIndicators.set(indicator.value, indicator);
    } catch (error) {
      console.error('Threat indicator creation error:', error);
    }
  }

  /**
   * Fenyegetési indikátorok lekérése
   */
  async getThreatIndicators(): Promise<ThreatIndicator[]> {
    try {
      const { data, error } = await this.supabase
        .from('threat_indicators')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(indicator => ({
        ...indicator,
        first_seen: new Date(indicator.first_seen),
        last_seen: new Date(indicator.last_seen)
      })) : [];
    } catch (error) {
      console.error('Threat indicators retrieval error:', error);
      return [];
    }
  }

  /**
   * IP cím blokkolása
   */
  async blockIPAddress(ipAddress: string, reason: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('threat_indicators')
        .update({
          is_blocked: true,
          block_reason: reason
        })
        .eq('indicator_type', 'ip_address')
        .eq('value', ipAddress);

      if (error) {
        throw error;
      }

      // Cache frissítése
      const indicator = this.threatIndicators.get(ipAddress);
      if (indicator) {
        indicator.is_blocked = true;
        indicator.block_reason = reason;
      }
    } catch (error) {
      console.error('IP blocking error:', error);
      throw new Error('IP cím blokkolás sikertelen');
    }
  }

  /**
   * IP cím blokkolásának feloldása
   */
  async unblockIPAddress(ipAddress: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('threat_indicators')
        .update({
          is_blocked: false,
          block_reason: null
        })
        .eq('indicator_type', 'ip_address')
        .eq('value', ipAddress);

      if (error) {
        throw error;
      }

      // Cache frissítése
      const indicator = this.threatIndicators.get(ipAddress);
      if (indicator) {
        indicator.is_blocked = false;
        indicator.block_reason = undefined;
      }
    } catch (error) {
      console.error('IP unblocking error:', error);
      throw new Error('IP cím blokkolás feloldása sikertelen');
    }
  }

  /**
   * Monitoring indítása
   */
  private startMonitoring(): void {
    if (!this.config.real_time_monitoring) {
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.performMonitoringChecks();
    }, 60000); // 1 percenként
  }

  /**
   * Monitoring ellenőrzések végrehajtása
   */
  private async performMonitoringChecks(): Promise<void> {
    try {
      // Automatikus esemény feloldás
      if (this.config.auto_resolution) {
        await this.autoResolveEvents();
      }

      // Cache tisztítás
      this.cleanupCache();

      // Riasztási késedelmek ellenőrzése
      await this.checkAlertDelays();
    } catch (error) {
      console.error('Monitoring check error:', error);
    }
  }

  /**
   * Automatikus esemény feloldás
   */
  private async autoResolveEvents(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.config.auto_resolution_delay);

      const { error } = await this.supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: 'system',
          resolution_notes: 'Auto-resolved by monitoring system'
        })
        .eq('resolved', false)
        .lt('timestamp', cutoffDate.toISOString())
        .eq('severity', 'low');

      if (error) {
        console.error('Auto-resolve error:', error);
      }
    } catch (error) {
      console.error('Auto-resolve error:', error);
    }
  }

  /**
   * Cache tisztítás
   */
  private cleanupCache(): void {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24);

    for (const [key, events] of this.eventCache.entries()) {
      const filteredEvents = events.filter(event => event.timestamp > cutoffDate);
      if (filteredEvents.length === 0) {
        this.eventCache.delete(key);
      } else {
        this.eventCache.set(key, filteredEvents);
      }
    }
  }

  /**
   * Riasztási késedelmek ellenőrzése
   */
  private async checkAlertDelays(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .eq('sent', false)
        .lt('retry_count', 'max_retries');

      if (error) {
        throw error;
      }

      for (const alert of data || []) {
        // Újrapróbálkozás késleltetett riasztásokkal
        setTimeout(() => {
          this.sendAlert(alert);
        }, 30000); // 30 másodperc késleltetés
      }
    } catch (error) {
      console.error('Alert delay check error:', error);
    }
  }

  /**
   * Cache-be esemény hozzáadása
   */
  private addToCache(event: SecurityEvent): void {
    const key = `${event.event_type}:${event.ip_address}`;
    const events = this.eventCache.get(key) || [];
    events.push(event);
    this.eventCache.set(key, events);
  }

  /**
   * Közelmúltbeli események lekérése
   */
  private getRecentEvents(eventType: string, ipAddress: string, hours: number): SecurityEvent[] {
    const key = `${eventType}:${ipAddress}`;
    const events = this.eventCache.get(key) || [];
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return events.filter(event => event.timestamp > cutoffDate);
  }

  /**
   * Monitoring leállítása
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Monitoring újraindítása új konfigurációval
    this.stopMonitoring();
    this.startMonitoring();
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Monitoring statisztikák lekérése
   */
  async getMonitoringStats(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats = {
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
      };

      // Események számolása
      const { count: totalEvents } = await this.supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true });

      stats.total_events = totalEvents || 0;

      // Riasztások számolása
      const { count: totalAlerts } = await this.supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true });

      stats.total_alerts = totalAlerts || 0;

      // Fenyegetési indikátorok számolása
      const { count: threatIndicators } = await this.supabase
        .from('threat_indicators')
        .select('*', { count: 'exact', head: true });

      stats.threat_indicators = threatIndicators || 0;

      return stats;
    } catch (error) {
      console.error('Monitoring stats retrieval error:', error);
      return {};
    }
  }
}

export const securityMonitoringManager = SecurityMonitoringManager.getInstance();
export default securityMonitoringManager;
