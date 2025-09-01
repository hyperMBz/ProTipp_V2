import { createClient } from '@supabase/supabase-js';

// Security monitoring configuration
const SECURITY_MONITORING_CONFIG = {
  alertThresholds: {
    failedLogins: 5, // 5 sikertelen bejelentkezés percenként
    suspiciousActivity: 10, // 10 gyanús tevékenység percenként
    apiAbuse: 20, // 20 API abuse percenként
    dataBreach: 1, // 1 adatsértés percenként
  },
  retentionPeriods: {
    securityAudits: 7 * 365 * 24 * 60 * 60 * 1000, // 7 év
    alerts: 90 * 24 * 60 * 60 * 1000, // 90 nap
    incidents: 5 * 365 * 24 * 60 * 60 * 1000, // 5 év
  },
  monitoringIntervals: {
    realTime: 1000, // 1 másodperc
    hourly: 60 * 60 * 1000, // 1 óra
    daily: 24 * 60 * 60 * 1000, // 1 nap
  },
} as const;

// Security audit interface
interface SecurityAudit {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'api_usage' | 'system' | 'compliance';
}

// Security alert interface
interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'api_abuse' | 'data_breach' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_users?: string[];
  affected_resources?: string[];
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assigned_to?: string;
  resolution_notes?: string;
  resolution_date?: Date;
}

// Security incident interface
interface SecurityIncident {
  id: string;
  alert_ids: string[];
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
  assigned_to?: string;
  affected_users: string[];
  affected_resources: string[];
  impact_assessment: string;
  root_cause?: string;
  remediation_actions: string[];
  lessons_learned?: string;
}

// Security metrics interface
interface SecurityMetrics {
  totalAudits: number;
  totalAlerts: number;
  totalIncidents: number;
  activeAlerts: number;
  openIncidents: number;
  averageResponseTime: number; // milliszekundumokban
  complianceScore: number; // 0-100
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

// Real-time monitoring interface
interface RealTimeMonitoring {
  activeUsers: number;
  failedLogins: number;
  suspiciousActivities: number;
  apiRequests: number;
  dataAccessEvents: number;
  systemAlerts: number;
  lastUpdated: Date;
  lastMinute: {
    audits: number;
    alerts: number;
    incidents: number;
  };
}

/**
 * Security Audit Logger Service
 * Valós idejű security monitoring és alerting kezelése
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  private securityAudits: SecurityAudit[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private securityIncidents: SecurityIncident[] = [];
  private realTimeMetrics: RealTimeMonitoring = {
    activeUsers: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    apiRequests: 0,
    dataAccessEvents: 0,
    systemAlerts: 0,
    lastUpdated: new Date(),
    lastMinute: {
      audits: 0,
      alerts: 0,
      incidents: 0,
    },
  };

  private monitoringTimers: NodeJS.Timeout[] = [];
  private alertCallbacks: ((alert: SecurityAlert) => void)[] = [];

  private constructor() {
    this.initializeSecurityMonitoring();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Security monitoring inicializálása
   */
  private async initializeSecurityMonitoring(): Promise<void> {
    try {
      // Security audits betöltése
      await this.loadSecurityAudits();
      
      // Security alerts betöltése
      await this.loadSecurityAlerts();
      
      // Security incidents betöltése
      await this.loadSecurityIncidents();
      
      // Real-time monitoring timerek
      this.startRealTimeMonitoring();
      
      // Alert monitoring
      this.startAlertMonitoring();
      
      // Metrics aggregation
      this.startMetricsAggregation();
      
      // Data retention cleanup
      this.startDataRetentionCleanup();

      console.log('Security audit logger initialized successfully');
    } catch (error) {
      console.error('Security monitoring initialization error:', error);
      throw new Error('Security monitoring initialization failed');
    }
  }

  /**
   * Security audits betöltése
   */
  private async loadSecurityAudits(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('security_audits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Security audits load error:', error);
        return;
      }

      data?.forEach(audit => {
        this.securityAudits.push({
          ...audit,
          timestamp: new Date(audit.timestamp),
        });
      });
    } catch (error) {
      console.error('Security audits load error:', error);
    }
  }

  /**
   * Security alerts betöltése
   */
  private async loadSecurityAlerts(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Security alerts load error:', error);
        return;
      }

      data?.forEach(alert => {
        this.securityAlerts.push({
          ...alert,
          timestamp: new Date(alert.timestamp),
          resolution_date: alert.resolution_date ? new Date(alert.resolution_date) : undefined,
        });
      });
    } catch (error) {
      console.error('Security alerts load error:', error);
    }
  }

  /**
   * Security incidents betöltése
   */
  private async loadSecurityIncidents(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Security incidents load error:', error);
        return;
      }

      data?.forEach(incident => {
        this.securityIncidents.push({
          ...incident,
          created_at: new Date(incident.created_at),
          updated_at: new Date(incident.updated_at),
          resolved_at: incident.resolved_at ? new Date(incident.resolved_at) : undefined,
        });
      });
    } catch (error) {
      console.error('Security incidents load error:', error);
    }
  }

  /**
   * Security audit logolása
   */
  async logSecurityAudit(audit: Omit<SecurityAudit, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityAudit: SecurityAudit = {
        ...audit,
        id: this.generateAuditId(),
        timestamp: new Date(),
      };

      // Audit hozzáadása a memóriához
      this.securityAudits.unshift(securityAudit);
      
      // Audit mentése adatbázisba
      await this.saveSecurityAudit(securityAudit);
      
      // Real-time metrics frissítése
      this.updateRealTimeMetrics(securityAudit);
      
      // Alert ellenőrzése
      await this.checkForAlerts(securityAudit);
      
      // Incident ellenőrzése
      await this.checkForIncidents(securityAudit);
      
    } catch (error) {
      console.error('Security audit logging error:', error);
    }
  }

  /**
   * Security audit mentése
   */
  private async saveSecurityAudit(audit: SecurityAudit): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_audits')
        .insert({
          id: audit.id,
          user_id: audit.user_id,
          action: audit.action,
          resource: audit.resource,
          ip_address: audit.ip_address,
          user_agent: audit.user_agent,
          timestamp: audit.timestamp.toISOString(),
          success: audit.success,
          details: audit.details,
          severity: audit.severity,
          category: audit.category,
        });

      if (error) {
        console.error('Security audit save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Security audit save error:', error);
      throw error;
    }
  }

  /**
   * Alert ellenőrzése
   */
  private async checkForAlerts(audit: SecurityAudit): Promise<void> {
    try {
      const alerts: SecurityAlert[] = [];

      // Failed login alert
      if (audit.action === 'LOGIN_ATTEMPT' && !audit.success) {
        const failedLogins = this.getFailedLoginsLastMinute(audit.ip_address);
        if (failedLogins >= SECURITY_MONITORING_CONFIG.alertThresholds.failedLogins) {
          alerts.push({
            id: this.generateAlertId(),
            type: 'failed_login',
            severity: failedLogins >= 10 ? 'critical' : failedLogins >= 7 ? 'high' : 'medium',
            title: 'Sikertelen bejelentkezési kísérletek',
            description: `${failedLogins} sikertelen bejelentkezési kísérlet az elmúlt percben`,
            affected_users: audit.user_id ? [audit.user_id] : undefined,
            affected_resources: [audit.resource],
            timestamp: new Date(),
            status: 'active',
          });
        }
      }

      // Suspicious activity alert
      if (audit.severity === 'high' || audit.severity === 'critical') {
        const suspiciousActivities = this.getSuspiciousActivitiesLastMinute(audit.ip_address);
        if (suspiciousActivities >= SECURITY_MONITORING_CONFIG.alertThresholds.suspiciousActivity) {
          alerts.push({
            id: this.generateAlertId(),
            type: 'suspicious_activity',
            severity: audit.severity,
            title: 'Gyanús tevékenység észlelve',
            description: `${suspiciousActivities} gyanús tevékenység az elmúlt percben`,
            affected_users: audit.user_id ? [audit.user_id] : undefined,
            affected_resources: [audit.resource],
            timestamp: new Date(),
            status: 'active',
          });
        }
      }

      // API abuse alert
      if (audit.category === 'api_usage' && !audit.success) {
        const apiAbuse = this.getAPIAbuseLastMinute(audit.ip_address);
        if (apiAbuse >= SECURITY_MONITORING_CONFIG.alertThresholds.apiAbuse) {
          alerts.push({
            id: this.generateAlertId(),
            type: 'api_abuse',
            severity: apiAbuse >= 50 ? 'critical' : apiAbuse >= 30 ? 'high' : 'medium',
            title: 'API visszaélés észlelve',
            description: `${apiAbuse} API visszaélés az elmúlt percben`,
            affected_resources: [audit.resource],
            timestamp: new Date(),
            status: 'active',
          });
        }
      }

      // Alert mentése és értesítés küldése
      for (const alert of alerts) {
        await this.saveSecurityAlert(alert);
        this.securityAlerts.unshift(alert);
        this.notifyAlert(alert);
      }
    } catch (error) {
      console.error('Alert check error:', error);
    }
  }

  /**
   * Incident ellenőrzése
   */
  private async checkForIncidents(audit: SecurityAudit): Promise<void> {
    try {
      // Kritikus audit esetén incident létrehozása
      if (audit.severity === 'critical') {
        const incident: SecurityIncident = {
          id: this.generateIncidentId(),
          alert_ids: [],
          title: 'Kritikus biztonsági esemény',
          description: `Kritikus biztonsági esemény: ${audit.action} - ${audit.resource}`,
          severity: 'critical',
          status: 'open',
          created_at: new Date(),
          updated_at: new Date(),
          affected_users: audit.user_id ? [audit.user_id] : [],
          affected_resources: [audit.resource],
          impact_assessment: 'Kritikus biztonsági esemény - azonnali beavatkozás szükséges',
          remediation_actions: [
            'Azonnali incidenskezelés indítása',
            'Érintett rendszerek izolálása',
            'Biztonsági csapat értesítése',
          ],
        };

        await this.saveSecurityIncident(incident);
        this.securityIncidents.unshift(incident);
      }
    } catch (error) {
      console.error('Incident check error:', error);
    }
  }

  /**
   * Security alert mentése
   */
  private async saveSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .insert({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          affected_users: alert.affected_users,
          affected_resources: alert.affected_resources,
          timestamp: alert.timestamp.toISOString(),
          status: alert.status,
          assigned_to: alert.assigned_to,
          resolution_notes: alert.resolution_notes,
          resolution_date: alert.resolution_date?.toISOString(),
        });

      if (error) {
        console.error('Security alert save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Security alert save error:', error);
      throw error;
    }
  }

  /**
   * Security incident mentése
   */
  private async saveSecurityIncident(incident: SecurityIncident): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_incidents')
        .insert({
          id: incident.id,
          alert_ids: incident.alert_ids,
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          created_at: incident.created_at.toISOString(),
          updated_at: incident.updated_at.toISOString(),
          resolved_at: incident.resolved_at?.toISOString(),
          assigned_to: incident.assigned_to,
          affected_users: incident.affected_users,
          affected_resources: incident.affected_resources,
          impact_assessment: incident.impact_assessment,
          root_cause: incident.root_cause,
          remediation_actions: incident.remediation_actions,
          lessons_learned: incident.lessons_learned,
        });

      if (error) {
        console.error('Security incident save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Security incident save error:', error);
      throw error;
    }
  }

  /**
   * Real-time monitoring indítása
   */
  private startRealTimeMonitoring(): void {
    const timer = setInterval(() => {
      this.updateRealTimeMetrics();
    }, SECURITY_MONITORING_CONFIG.monitoringIntervals.realTime);

    this.monitoringTimers.push(timer);
  }

  /**
   * Alert monitoring indítása
   */
  private startAlertMonitoring(): void {
    const timer = setInterval(() => {
      this.monitorAlertTrends();
    }, SECURITY_MONITORING_CONFIG.monitoringIntervals.realTime);

    this.monitoringTimers.push(timer);
  }

  /**
   * Metrics aggregation indítása
   */
  private startMetricsAggregation(): void {
    const timer = setInterval(() => {
      this.aggregateMetrics();
    }, SECURITY_MONITORING_CONFIG.monitoringIntervals.hourly);

    this.monitoringTimers.push(timer);
  }

  /**
   * Data retention cleanup indítása
   */
  private startDataRetentionCleanup(): void {
    const timer = setInterval(() => {
      this.cleanupExpiredData();
    }, SECURITY_MONITORING_CONFIG.monitoringIntervals.daily);

    this.monitoringTimers.push(timer);
  }

  /**
   * Real-time metrics frissítése
   */
  private updateRealTimeMetrics(audit?: SecurityAudit): void {
    if (audit) {
      this.realTimeMetrics.lastMinute.audits++;
      
      if (audit.action === 'LOGIN_ATTEMPT' && !audit.success) {
        this.realTimeMetrics.failedLogins++;
      }
      
      if (audit.severity === 'high' || audit.severity === 'critical') {
        this.realTimeMetrics.suspiciousActivities++;
      }
      
      if (audit.category === 'api_usage') {
        this.realTimeMetrics.apiRequests++;
      }
      
      if (audit.category === 'data_access') {
        this.realTimeMetrics.dataAccessEvents++;
      }
    }

    this.realTimeMetrics.lastUpdated = new Date();
  }

  /**
   * Alert trends monitoring
   */
  private monitorAlertTrends(): void {
    const recentAlerts = this.securityAlerts.filter(
      alert => Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000 // 5 perc
    );

    this.realTimeMetrics.systemAlerts = recentAlerts.length;
    this.realTimeMetrics.lastMinute.alerts = recentAlerts.filter(
      alert => Date.now() - alert.timestamp.getTime() < 60 * 1000 // 1 perc
    ).length;
  }

  /**
   * Metrics aggregation
   */
  private async aggregateMetrics(): Promise<void> {
    try {
      // Itt implementálnánk a metrics aggregation-t
      console.log('Aggregating security metrics...');
    } catch (error) {
      console.error('Metrics aggregation error:', error);
    }
  }

  /**
   * Expired data cleanup
   */
  private async cleanupExpiredData(): Promise<void> {
    try {
      const now = Date.now();
      
      // Expired audits cleanup
      this.securityAudits = this.securityAudits.filter(
        audit => now - audit.timestamp.getTime() < SECURITY_MONITORING_CONFIG.retentionPeriods.securityAudits
      );
      
      // Expired alerts cleanup
      this.securityAlerts = this.securityAlerts.filter(
        alert => now - alert.timestamp.getTime() < SECURITY_MONITORING_CONFIG.retentionPeriods.alerts
      );
      
      // Expired incidents cleanup
      this.securityIncidents = this.securityIncidents.filter(
        incident => now - incident.created_at.getTime() < SECURITY_MONITORING_CONFIG.retentionPeriods.incidents
      );
      
      console.log('Security data cleanup completed');
    } catch (error) {
      console.error('Data cleanup error:', error);
    }
  }

  /**
   * Utility függvények
   */
  private getFailedLoginsLastMinute(ipAddress: string): number {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return this.securityAudits.filter(
      audit => 
        audit.action === 'LOGIN_ATTEMPT' && 
        !audit.success && 
        audit.ip_address === ipAddress &&
        audit.timestamp.getTime() > oneMinuteAgo
    ).length;
  }

  private getSuspiciousActivitiesLastMinute(ipAddress: string): number {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return this.securityAudits.filter(
      audit => 
        (audit.severity === 'high' || audit.severity === 'critical') &&
        audit.ip_address === ipAddress &&
        audit.timestamp.getTime() > oneMinuteAgo
    ).length;
  }

  private getAPIAbuseLastMinute(ipAddress: string): number {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return this.securityAudits.filter(
      audit => 
        audit.category === 'api_usage' && 
        !audit.success &&
        audit.ip_address === ipAddress &&
        audit.timestamp.getTime() > oneMinuteAgo
    ).length;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Alert notification
   */
  private notifyAlert(alert: SecurityAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert notification error:', error);
      }
    });
  }

  /**
   * Alert callback regisztrálása
   */
  onAlert(callback: (alert: SecurityAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Security metrics lekérése
   */
  getSecurityMetrics(): SecurityMetrics {
    const activeAlerts = this.securityAlerts.filter(alert => alert.status === 'active').length;
    const openIncidents = this.securityIncidents.filter(incident => incident.status !== 'closed').length;
    
    // Compliance score számítása
    const totalAudits = this.securityAudits.length;
    const successfulAudits = this.securityAudits.filter(audit => audit.success).length;
    const complianceScore = totalAudits > 0 ? Math.round((successfulAudits / totalAudits) * 100) : 100;
    
    // Threat level meghatározása
    const criticalAlerts = this.securityAlerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length;
    const highAlerts = this.securityAlerts.filter(alert => alert.severity === 'high' && alert.status === 'active').length;
    
    let threatLevel: 'low' | 'medium' | 'high' | 'critical';
    if (criticalAlerts > 0) {
      threatLevel = 'critical';
    } else if (highAlerts > 5) {
      threatLevel = 'high';
    } else if (highAlerts > 0 || activeAlerts > 10) {
      threatLevel = 'medium';
    } else {
      threatLevel = 'low';
    }

    return {
      totalAudits,
      totalAlerts: this.securityAlerts.length,
      totalIncidents: this.securityIncidents.length,
      activeAlerts,
      openIncidents,
      averageResponseTime: 0, // TODO: Implement response time tracking
      complianceScore,
      threatLevel,
      lastUpdated: new Date(),
    };
  }

  /**
   * Real-time monitoring lekérése
   */
  getRealTimeMonitoring(): RealTimeMonitoring {
    return { ...this.realTimeMetrics };
  }

  /**
   * Security audits lekérése
   */
  getSecurityAudits(limit: number = 100): SecurityAudit[] {
    return this.securityAudits.slice(0, limit);
  }

  /**
   * Security alerts lekérése
   */
  getSecurityAlerts(limit: number = 50): SecurityAlert[] {
    return this.securityAlerts.slice(0, limit);
  }

  /**
   * Security incidents lekérése
   */
  getSecurityIncidents(limit: number = 20): SecurityIncident[] {
    return this.securityIncidents.slice(0, limit);
  }

  /**
   * Alert status frissítése
   */
  async updateAlertStatus(alertId: string, status: SecurityAlert['status'], assignedTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const alert = this.securityAlerts.find(a => a.id === alertId);
      if (!alert) {
        return { success: false, error: 'Alert not found' };
      }

      alert.status = status;
      alert.assigned_to = assignedTo;
      
      if (status === 'resolved') {
        alert.resolution_date = new Date();
      }

      // Alert frissítése adatbázisban
      const { error } = await this.supabase
        .from('security_alerts')
        .update({
          status: alert.status,
          assigned_to: alert.assigned_to,
          resolution_date: alert.resolution_date?.toISOString(),
        })
        .eq('id', alertId);

      if (error) {
        console.error('Alert status update error:', error);
        return { success: false, error: 'Alert status update failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Alert status update error:', error);
      return { success: false, error: 'Alert status update failed' };
    }
  }

  /**
   * Incident status frissítése
   */
  async updateIncidentStatus(incidentId: string, status: SecurityIncident['status'], assignedTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const incident = this.securityIncidents.find(i => i.id === incidentId);
      if (!incident) {
        return { success: false, error: 'Incident not found' };
      }

      incident.status = status;
      incident.assigned_to = assignedTo;
      incident.updated_at = new Date();
      
      if (status === 'resolved' || status === 'closed') {
        incident.resolved_at = new Date();
      }

      // Incident frissítése adatbázisban
      const { error } = await this.supabase
        .from('security_incidents')
        .update({
          status: incident.status,
          assigned_to: incident.assigned_to,
          updated_at: incident.updated_at.toISOString(),
          resolved_at: incident.resolved_at?.toISOString(),
        })
        .eq('id', incidentId);

      if (error) {
        console.error('Incident status update error:', error);
        return { success: false, error: 'Incident status update failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Incident status update error:', error);
      return { success: false, error: 'Incident status update failed' };
    }
  }

  /**
   * Security monitoring config lekérése
   */
  getSecurityMonitoringConfig(): typeof SECURITY_MONITORING_CONFIG {
    return SECURITY_MONITORING_CONFIG;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.monitoringTimers.forEach(timer => clearInterval(timer));
    this.monitoringTimers = [];
    this.alertCallbacks = [];
  }
}

// Singleton export
export const auditLogger = AuditLogger.getInstance();
