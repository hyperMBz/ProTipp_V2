/**
 * Session Manager - Session kezelő
 * Biztonságos session kezelés és timeout politikák
 */

import { createClient } from '@supabase/supabase-js';

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  ip_address: string;
  user_agent: string;
  device_info: {
    browser: string;
    os: string;
    device: string;
    location?: string;
  };
  created_at: Date;
  last_activity: Date;
  expires_at: Date;
  is_active: boolean;
  is_remembered: boolean;
  metadata: Record<string, any>;
  security_level: 'low' | 'medium' | 'high';
  mfa_verified: boolean;
  concurrent_sessions: number;
  max_concurrent_sessions: number;
}

export interface SessionPolicy {
  session_timeout: number; // percben
  idle_timeout: number; // percben
  max_concurrent_sessions: number;
  remember_me_duration: number; // napokban
  require_mfa: boolean;
  allowed_ips: string[];
  blocked_ips: string[];
  security_headers: Record<string, string>;
  session_rotation: boolean;
  rotation_interval: number; // órákban
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  expired_sessions: number;
  concurrent_sessions: number;
  sessions_today: number;
  sessions_this_week: number;
  average_session_duration: number;
  top_locations: Array<{ location: string; count: number }>;
  top_devices: Array<{ device: string; count: number }>;
}

export interface SessionConfig {
  enabled: boolean;
  policies: SessionPolicy;
  cleanup_interval: number; // percben
  audit_enabled: boolean;
  encryption_enabled: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private supabase: any;
  private config: SessionConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private sessionCache: Map<string, Session>;

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
      policies: {
        session_timeout: 480, // 8 óra
        idle_timeout: 30, // 30 perc
        max_concurrent_sessions: 5,
        remember_me_duration: 30, // 30 nap
        require_mfa: false,
        allowed_ips: [],
        blocked_ips: [],
        security_headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        },
        session_rotation: true,
        rotation_interval: 24 // 24 óra
      },
      cleanup_interval: 15, // 15 perc
      audit_enabled: true,
      encryption_enabled: true
    };
    
    this.sessionCache = new Map();
    // Teszt környezetben ne indítsd el a timer-t
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      this.startCleanupTimer();
    }
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Új session létrehozása
   */
  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean = false,
    mfaVerified: boolean = false
  ): Promise<Session> {
    try {
      // Ellenőrizd a concurrent session limitet
      const activeSessions = await this.getActiveSessions(userId);
      if (activeSessions.length >= this.config.policies.max_concurrent_sessions) {
        // Legrégebbi session törlése
        const oldestSession = activeSessions[0];
        await this.invalidateSession(oldestSession.id);
      }

      // Ellenőrizd az IP címeket
      if (!this.isIPAllowed(ipAddress)) {
        throw new Error('IP cím nem engedélyezett');
      }

      const now = new Date();
      const sessionDuration = rememberMe 
        ? this.config.policies.remember_me_duration * 24 * 60 // napokból percekbe
        : this.config.policies.session_timeout;
      
      const expiresAt = new Date(now.getTime() + sessionDuration * 60 * 1000);

      const session: Session = {
        id: crypto.randomUUID(),
        user_id: userId,
        session_token: this.generateSessionToken(),
        refresh_token: this.generateRefreshToken(),
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: this.parseUserAgent(userAgent),
        created_at: now,
        last_activity: now,
        expires_at: expiresAt,
        is_active: true,
        is_remembered: rememberMe,
        metadata: {},
        security_level: mfaVerified ? 'high' : 'medium',
        mfa_verified: mfaVerified,
        concurrent_sessions: activeSessions.length + 1,
        max_concurrent_sessions: this.config.policies.max_concurrent_sessions
      };

      const { error } = await this.supabase
        .from('user_sessions')
        .insert({
          id: session.id,
          user_id: session.user_id,
          session_token: session.session_token,
          refresh_token: session.refresh_token,
          ip_address: session.ip_address,
          user_agent: session.user_agent,
          device_info: session.device_info,
          created_at: session.created_at.toISOString(),
          last_activity: session.last_activity.toISOString(),
          expires_at: session.expires_at.toISOString(),
          is_active: session.is_active,
          is_remembered: session.is_remembered,
          metadata: session.metadata,
          security_level: session.security_level,
          mfa_verified: session.mfa_verified,
          concurrent_sessions: session.concurrent_sessions,
          max_concurrent_sessions: session.max_concurrent_sessions
        });

      if (error) {
        throw error;
      }

      // Cache-be mentés
      this.sessionCache.set(session.id, session);

      return session;
    } catch (error) {
      console.error('Session creation error:', error);
      throw new Error('Session létrehozás sikertelen');
    }
  }

  /**
   * Session validálása
   */
  async validateSession(sessionId: string, sessionToken: string): Promise<Session | null> {
    try {
      // Cache ellenőrzés
      const cachedSession = this.sessionCache.get(sessionId);
      if (cachedSession && cachedSession.session_token === sessionToken) {
        // Session lejárt ellenőrzése
        if (this.isSessionExpired(cachedSession)) {
          await this.invalidateSession(sessionId);
          return null;
        }

        // Idle timeout ellenőrzése
        if (this.isSessionIdle(cachedSession)) {
          await this.invalidateSession(sessionId);
          return null;
        }

        // Last activity frissítése
        await this.updateLastActivity(sessionId);
        return cachedSession;
      }

      // Adatbázis ellenőrzés
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      const session: Session = {
        ...data,
        created_at: new Date(data.created_at),
        last_activity: new Date(data.last_activity),
        expires_at: new Date(data.expires_at)
      };

      // Session lejárt ellenőrzése
      if (this.isSessionExpired(session)) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Idle timeout ellenőrzése
      if (this.isSessionIdle(session)) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Cache frissítése
      this.sessionCache.set(sessionId, session);

      // Last activity frissítése
      await this.updateLastActivity(sessionId);

      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Session frissítése
   */
  async refreshSession(sessionId: string, refreshToken: string): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      const session: Session = {
        ...data,
        created_at: new Date(data.created_at),
        last_activity: new Date(data.last_activity),
        expires_at: new Date(data.expires_at)
      };

      // Session lejárt ellenőrzése
      if (this.isSessionExpired(session)) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Új tokenek generálása
      const newSessionToken = this.generateSessionToken();
      const newRefreshToken = this.generateRefreshToken();

      // Session frissítése
      const { error: updateError } = await this.supabase
        .from('user_sessions')
        .update({
          session_token: newSessionToken,
          refresh_token: newRefreshToken,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        throw updateError;
      }

      // Frissített session
      const updatedSession: Session = {
        ...session,
        session_token: newSessionToken,
        refresh_token: newRefreshToken,
        last_activity: new Date()
      };

      // Cache frissítése
      this.sessionCache.set(sessionId, updatedSession);

      return updatedSession;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  }

  /**
   * Session érvénytelenítése
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Cache törlése
      this.sessionCache.delete(sessionId);
    } catch (error) {
      console.error('Session invalidation error:', error);
      throw new Error('Session érvénytelenítés sikertelen');
    }
  }

  /**
   * Felhasználó összes session-jének érvénytelenítése
   */
  async invalidateAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (exceptSessionId) {
        query = query.neq('id', exceptSessionId);
      }

      const { error, count } = await query;

      if (error) {
        throw error;
      }

      // Cache tisztítás
      for (const [sessionId, session] of this.sessionCache.entries()) {
        if (session.user_id === userId && sessionId !== exceptSessionId) {
          this.sessionCache.delete(sessionId);
        }
      }

      return count || 0;
    } catch (error) {
      console.error('User sessions invalidation error:', error);
      throw new Error('Felhasználó session-ök érvénytelenítése sikertelen');
    }
  }

  /**
   * Aktív session-ök lekérése
   */
  async getActiveSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data ? data.map(session => ({
        ...session,
        created_at: new Date(session.created_at),
        last_activity: new Date(session.last_activity),
        expires_at: new Date(session.expires_at)
      })) : [];
    } catch (error) {
      console.error('Active sessions retrieval error:', error);
      return [];
    }
  }

  /**
   * Session statisztikák lekérése
   */
  async getSessionStats(): Promise<SessionStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Alapvető statisztikák
      const { count: totalSessions } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: activeSessions } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: expiredSessions } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', now.toISOString());

      // Időszak specifikus statisztikák
      const { count: sessionsToday } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: sessionsThisWeek } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Concurrent sessions számolása
      const { data: concurrentData } = await this.supabase
        .from('user_sessions')
        .select('user_id, concurrent_sessions')
        .eq('is_active', true);

      const concurrentSessions = concurrentData 
        ? Math.max(...concurrentData.map(s => s.concurrent_sessions))
        : 0;

      // Átlagos session időtartam
      const { data: durationData } = await this.supabase
        .from('user_sessions')
        .select('created_at, last_activity')
        .eq('is_active', false)
        .limit(1000);

      const durations = durationData?.map(session => {
        const created = new Date(session.created_at);
        const lastActivity = new Date(session.last_activity);
        return lastActivity.getTime() - created.getTime();
      }) || [];

      const averageDuration = durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
        : 0;

      // Top lokációk és eszközök (mock data)
      const topLocations = [
        { location: 'Budapest, Hungary', count: 150 },
        { location: 'Debrecen, Hungary', count: 45 },
        { location: 'Szeged, Hungary', count: 32 }
      ];

      const topDevices = [
        { device: 'Chrome on Windows', count: 120 },
        { device: 'Safari on macOS', count: 85 },
        { device: 'Firefox on Windows', count: 45 }
      ];

      return {
        total_sessions: totalSessions || 0,
        active_sessions: activeSessions || 0,
        expired_sessions: expiredSessions || 0,
        concurrent_sessions: concurrentSessions,
        sessions_today: sessionsToday || 0,
        sessions_this_week: sessionsThisWeek || 0,
        average_session_duration: Math.round(averageDuration / (1000 * 60)), // percben
        top_locations: topLocations,
        top_devices: topDevices
      };
    } catch (error) {
      console.error('Session stats retrieval error:', error);
      return {
        total_sessions: 0,
        active_sessions: 0,
        expired_sessions: 0,
        concurrent_sessions: 0,
        sessions_today: 0,
        sessions_this_week: 0,
        average_session_duration: 0,
        top_locations: [],
        top_devices: []
      };
    }
  }

  /**
   * Session cleanup
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { error, count } = await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          last_activity: new Date().toISOString()
        })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }

      // Cache tisztítás
      for (const [sessionId, session] of this.sessionCache.entries()) {
        if (this.isSessionExpired(session)) {
          this.sessionCache.delete(sessionId);
        }
      }

      return count || 0;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Cleanup timer újraindítása új konfigurációval
    this.stopCleanupTimer();
    this.startCleanupTimer();
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): SessionConfig {
    return { ...this.config };
  }

  /**
   * Session token generálása
   */
  private generateSessionToken(): string {
    return crypto.randomUUID() + '.' + Date.now();
  }

  /**
   * Refresh token generálása
   */
  private generateRefreshToken(): string {
    return crypto.randomUUID() + '.' + crypto.randomUUID();
  }

  /**
   * User agent elemzése
   */
  private parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
    // Egyszerű user agent elemzés (valós implementációban használj UAParser-t)
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';

    return { browser, os, device };
  }

  /**
   * Session lejárt ellenőrzése
   */
  private isSessionExpired(session: Session): boolean {
    return new Date() > session.expires_at;
  }

  /**
   * Session idle ellenőrzése
   */
  private isSessionIdle(session: Session): boolean {
    const idleThreshold = new Date();
    idleThreshold.setMinutes(idleThreshold.getMinutes() - this.config.policies.idle_timeout);
    return session.last_activity < idleThreshold;
  }

  /**
   * IP cím engedélyezés ellenőrzése
   */
  private isIPAllowed(ipAddress: string): boolean {
    // Blokkolt IP címek ellenőrzése
    if (this.config.policies.blocked_ips.includes(ipAddress)) {
      return false;
    }

    // Engedélyezett IP címek ellenőrzése (ha van)
    if (this.config.policies.allowed_ips.length > 0) {
      return this.config.policies.allowed_ips.includes(ipAddress);
    }

    return true;
  }

  /**
   * Last activity frissítése
   */
  private async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Last activity update error:', error);
      }

      // Cache frissítése
      const session = this.sessionCache.get(sessionId);
      if (session) {
        session.last_activity = new Date();
      }
    } catch (error) {
      console.error('Last activity update error:', error);
    }
  }

  /**
   * Cleanup timer indítása
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.cleanup_interval * 60 * 1000);
  }

  /**
   * Cleanup timer leállítása
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Manager leállítása
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.sessionCache.clear();
  }
}

export const sessionManager = SessionManager.getInstance();
export default sessionManager;
