/**
 * Audit Manager - Audit logging kezelő
 * Átfogó audit trail minden felhasználói művelethez
 */

import { createClient } from '@supabase/supabase-js';

export interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: 'user' | 'betting' | 'security' | 'system' | 'api' | 'data' | 'compliance';
  resource_id?: string;
  resource_name?: string;
  action_type: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'block' | 'unblock' | 'approve' | 'reject';
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  ip_address: string;
  user_agent: string;
  request_method?: string;
  request_path?: string;
  request_body?: string;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  duration_ms?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  retention_days: number;
  archived: boolean;
  archived_at?: Date;
}

export interface AuditFilter {
  user_id?: string;
  action?: string;
  resource_type?: string;
  action_type?: string;
  status?: string;
  severity?: string;
  start_date?: Date;
  end_date?: Date;
  tags?: string[];
  ip_address?: string;
}

export interface AuditStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  logs_this_month: number;
  success_rate: number;
  failure_rate: number;
  average_duration: number;
  top_actions: Array<{ action: string; count: number }>;
  top_users: Array<{ user_id: string; count: number }>;
  top_resources: Array<{ resource_type: string; count: number }>;
  severity_distribution: Record<string, number>;
}

export interface AuditConfig {
  enabled: boolean;
  log_level: 'all' | 'high_only' | 'critical_only';
  retention_period: number; // napokban
  auto_archive: boolean;
  archive_threshold: number; // napokban
  sensitive_fields: string[];
  excluded_paths: string[];
  excluded_actions: string[];
  batch_size: number;
  flush_interval: number; // másodpercekben
}

class AuditManager {
  private static instance: AuditManager;
  private supabase: any;
  private config: AuditConfig;
  private logBuffer: AuditLog[];
  private flushTimer?: NodeJS.Timeout;

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
      enabled: true,
      log_level: 'all',
      retention_period: 365,
      auto_archive: true,
      archive_threshold: 90,
      sensitive_fields: ['password', 'token', 'secret', 'key'],
      excluded_paths: ['/health', '/metrics', '/favicon.ico'],
      excluded_actions: ['heartbeat', 'ping'],
      batch_size: 100,
      flush_interval: 30
    };
    
    this.logBuffer = [];
    // Teszt környezetben ne indítsd el a timer-t
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      this.startFlushTimer();
    }
  }

  public static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
    }
    return AuditManager.instance;
  }

  /**
   * Audit log létrehozása
   */
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'archived'>): Promise<AuditLog> {
    try {
      // Ellenőrizd, hogy az audit logging engedélyezett-e
      if (!this.config.enabled) {
        throw new Error('Audit logging is disabled');
      }

      // Ellenőrizd a log szintet
      if (!this.shouldLog(log.severity)) {
        throw new Error('Log level too low');
      }

      // Ellenőrizd a kizárt útvonalakat és műveleteket
      if (this.isExcluded(log)) {
        throw new Error('Action or path is excluded from logging');
      }

      const auditLog: AuditLog = {
        ...log,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        archived: false
      };

      // Érzékeny adatok szűrése
      auditLog.request_body = this.sanitizeSensitiveData(auditLog.request_body);
      auditLog.response_body = this.sanitizeSensitiveData(auditLog.response_body);
      auditLog.metadata = this.sanitizeSensitiveData(auditLog.metadata);

      // Buffer-be mentés
      this.logBuffer.push(auditLog);

      // Buffer flush ha elérte a méretet
      if (this.logBuffer.length >= this.config.batch_size) {
        await this.flushBuffer();
      }

      return auditLog;
    } catch (error) {
      console.error('Audit log creation error:', error);
      throw new Error('Audit log létrehozás sikertelen');
    }
  }

  /**
   * Audit logok lekérése szűrőkkel
   */
  async getAuditLogs(
    filters: AuditFilter = {},
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      // Szűrők alkalmazása
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date.toISOString());
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date.toISOString());
      }
      if (filters.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const logs = data ? data.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
        archived_at: log.archived_at ? new Date(log.archived_at) : undefined
      })) : [];

      return { logs, total: count || 0 };
    } catch (error) {
      console.error('Audit logs retrieval error:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Audit log exportálása
   */
  async exportAuditLogs(
    filters: AuditFilter = {},
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs(filters, 10000); // Nagyobb limit exportáláshoz

      switch (format) {
        case 'json':
          return JSON.stringify(logs, null, 2);
        
        case 'csv':
          return this.convertToCSV(logs);
        
        case 'xml':
          return this.convertToXML(logs);
        
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Audit log export error:', error);
      throw new Error('Audit log exportálás sikertelen');
    }
  }

  /**
   * Audit log törlése
   */
  async deleteAuditLogs(filters: AuditFilter): Promise<number> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .delete({ count: 'exact' });

      // Szűrők alkalmazása
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date.toISOString());
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date.toISOString());
      }

      const { error, count } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Audit log deletion error:', error);
      throw new Error('Audit log törlés sikertelen');
    }
  }

  /**
   * Audit log archiválás
   */
  async archiveAuditLogs(): Promise<number> {
    try {
      if (!this.config.auto_archive) {
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.archive_threshold);

      const { error, count } = await this.supabase
        .from('audit_logs')
        .update({
          archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('archived', false)
        .lt('timestamp', cutoffDate.toISOString())
        .select('id', { count: 'exact' });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Audit log archiving error:', error);
      return 0;
    }
  }

  /**
   * Audit statisztikák lekérése
   */
  async getAuditStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AuditStats> {
    try {
      const startDate = this.getStartDate(timeRange);
      const endDate = new Date();

      // Alapvető statisztikák
      const { logs } = await this.getAuditLogs({
        start_date: startDate,
        end_date: endDate
      }, 10000);

      const totalLogs = logs.length;
      const successLogs = logs.filter(log => log.status === 'success').length;
      const failureLogs = logs.filter(log => log.status === 'failure').length;
      const successRate = totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0;
      const failureRate = totalLogs > 0 ? (failureLogs / totalLogs) * 100 : 0;

      // Átlagos időtartam
      const durations = logs
        .filter(log => log.duration_ms)
        .map(log => log.duration_ms!);
      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;

      // Top műveletek
      const actionCounts = this.countOccurrences(logs.map(log => log.action));
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top felhasználók
      const userCounts = this.countOccurrences(
        logs.filter(log => log.user_id).map(log => log.user_id!)
      );
      const topUsers = Object.entries(userCounts)
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top erőforrások
      const resourceCounts = this.countOccurrences(logs.map(log => log.resource_type));
      const topResources = Object.entries(resourceCounts)
        .map(([resource_type, count]) => ({ resource_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Súlyosság eloszlás
      const severityCounts = this.countOccurrences(logs.map(log => log.severity));
      const severityDistribution = {
        low: severityCounts['low'] || 0,
        medium: severityCounts['medium'] || 0,
        high: severityCounts['high'] || 0,
        critical: severityCounts['critical'] || 0
      };

      // Időszak specifikus statisztikák
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const logsToday = logs.filter(log => log.timestamp >= today).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const logsThisWeek = logs.filter(log => log.timestamp >= weekAgo).length;

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const logsThisMonth = logs.filter(log => log.timestamp >= monthAgo).length;

      return {
        total_logs: totalLogs,
        logs_today: logsToday,
        logs_this_week: logsThisWeek,
        logs_this_month: logsThisMonth,
        success_rate: Math.round(successRate * 100) / 100,
        failure_rate: Math.round(failureRate * 100) / 100,
        average_duration: Math.round(averageDuration),
        top_actions: topActions,
        top_users: topUsers,
        top_resources: topResources,
        severity_distribution: severityDistribution
      };
    } catch (error) {
      console.error('Audit stats retrieval error:', error);
      return {
        total_logs: 0,
        logs_today: 0,
        logs_this_week: 0,
        logs_this_month: 0,
        success_rate: 0,
        failure_rate: 0,
        average_duration: 0,
        top_actions: [],
        top_users: [],
        top_resources: [],
        severity_distribution: { low: 0, medium: 0, high: 0, critical: 0 }
      };
    }
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Flush timer újraindítása új konfigurációval
    this.stopFlushTimer();
    this.startFlushTimer();
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * Buffer flush indítása
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.config.flush_interval * 1000);
  }

  /**
   * Flush timer leállítása
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Buffer flush végrehajtása
   */
  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    try {
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logsToFlush.map(log => ({
          ...log,
          timestamp: log.timestamp.toISOString(),
          archived_at: log.archived_at?.toISOString()
        })));

      if (error) {
        console.error('Buffer flush error:', error);
        // Sikertelen logok visszaadása a buffer-be
        this.logBuffer.unshift(...logsToFlush);
      }
    } catch (error) {
      console.error('Buffer flush error:', error);
    }
  }

  /**
   * Log szint ellenőrzése
   */
  private shouldLog(severity: string): boolean {
    switch (this.config.log_level) {
      case 'all':
        return true;
      case 'high_only':
        return ['high', 'critical'].includes(severity);
      case 'critical_only':
        return severity === 'critical';
      default:
        return true;
    }
  }

  /**
   * Kizárt műveletek ellenőrzése
   */
  private isExcluded(log: Partial<AuditLog>): boolean {
    // Kizárt útvonalak ellenőrzése
    if (log.request_path && this.config.excluded_paths.some(path => 
      log.request_path!.includes(path)
    )) {
      return true;
    }

    // Kizárt műveletek ellenőrzése
    if (log.action && this.config.excluded_actions.includes(log.action)) {
      return true;
    }

    return false;
  }

  /**
   * Érzékeny adatok szűrése
   */
  private sanitizeSensitiveData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      let sanitized = data;
      this.config.sensitive_fields.forEach(field => {
        const regex = new RegExp(`"${field}":\\s*"[^"]*"`, 'gi');
        sanitized = sanitized.replace(regex, `"${field}": "[REDACTED]"`);
      });
      return sanitized;
    }

    if (typeof data === 'object') {
      const sanitized = { ...data };
      this.config.sensitive_fields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    }

    return data;
  }

  /**
   * CSV konverzió
   */
  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Action Type',
      'Status', 'IP Address', 'Timestamp', 'Duration (ms)', 'Severity'
    ];

    const rows = logs.map(log => [
      log.id,
      log.user_id || '',
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.action_type,
      log.status,
      log.ip_address,
      log.timestamp.toISOString(),
      log.duration_ms || '',
      log.severity
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * XML konverzió
   */
  private convertToXML(logs: AuditLog[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const auditLogs = logs.map(log => `
  <audit_log>
    <id>${log.id}</id>
    <user_id>${log.user_id || ''}</user_id>
    <action>${log.action}</action>
    <resource_type>${log.resource_type}</resource_type>
    <resource_id>${log.resource_id || ''}</resource_id>
    <action_type>${log.action_type}</action_type>
    <status>${log.status}</status>
    <ip_address>${log.ip_address}</ip_address>
    <timestamp>${log.timestamp.toISOString()}</timestamp>
    <duration_ms>${log.duration_ms || ''}</duration_ms>
    <severity>${log.severity}</severity>
  </audit_log>`).join('');

    return `${xmlHeader}
<audit_logs>${auditLogs}
</audit_logs>`;
  }

  /**
   * Előfordulások számolása
   */
  private countOccurrences<T>(items: T[]): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = String(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Kezdő dátum kiszámítása
   */
  private getStartDate(timeRange: string): Date {
    const now = new Date();
    
    switch (timeRange) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        now.setMonth(now.getMonth() - 1);
    }
    
    return now;
  }

  /**
   * Manager leállítása
   */
  destroy(): void {
    this.stopFlushTimer();
    this.flushBuffer(); // Utolsó buffer flush
  }
}

export const auditManager = AuditManager.getInstance();
export default auditManager;
