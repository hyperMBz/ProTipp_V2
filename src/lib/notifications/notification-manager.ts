// Notification Manager - Centralized notification management
// Story 1.6: Notification System Enhancement

import { createClient } from '@supabase/supabase-js';

export interface NotificationSettings {
  user_id: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  thresholds: {
    min_profit: number;
    min_confidence: number;
    max_risk: number;
  };
  alert_thresholds?: {
    profit: {
      min: number;
      max: number;
      enabled: boolean;
    };
    confidence: {
      min: number;
      max: number;
      enabled: boolean;
    };
    risk: {
      min: number;
      max: number;
      enabled: boolean;
    };
    urgency: {
      low: boolean;
      medium: boolean;
      high: boolean;
      critical: boolean;
    };
    timeWindow: {
      enabled: boolean;
      minutes: number;
    };
    volume: {
      enabled: boolean;
      minStake: number;
      maxStake: number;
    };
  };
  sports: string[];
  bookmakers: string[];
  sound_enabled: boolean;
  vibration_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  type: 'arbitrage_opportunity' | 'price_alert' | 'system_alert';
  title: string;
  message: string;
  data: Record<string, any>;
  channels_sent: string[];
  sent_at: Date;
  read_at?: Date;
  action_taken?: string;
}

export class NotificationManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Get user notification settings
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getNotificationSettings:', error);
      return null;
    }
  }

  /**
   * Update user notification settings
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateNotificationSettings:', error);
      return false;
    }
  }

  /**
   * Create notification history record
   */
  async createNotificationHistory(
    notification: Omit<NotificationHistory, 'id' | 'sent_at'>
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_history')
        .insert({
          ...notification,
          sent_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating notification history:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in createNotificationHistory:', error);
      return null;
    }
  }

  /**
   * Get notification history for user
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notification history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotificationHistory:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notification_history')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  /**
   * Check if user is in quiet hours
   */
  isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quiet_hours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quiet_hours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quiet_hours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check if notification should be sent based on settings
   */
  shouldSendNotification(
    settings: NotificationSettings,
    notificationData: {
      profit?: number;
      confidence?: number;
      risk?: number;
      sport?: string;
      bookmaker?: string;
    }
  ): boolean {
    // Check quiet hours
    if (this.isInQuietHours(settings)) {
      return false;
    }

    // Check profit threshold
    if (notificationData.profit !== undefined && 
        notificationData.profit < settings.thresholds.min_profit) {
      return false;
    }

    // Check confidence threshold
    if (notificationData.confidence !== undefined && 
        notificationData.confidence < settings.thresholds.min_confidence) {
      return false;
    }

    // Check risk threshold
    if (notificationData.risk !== undefined && 
        notificationData.risk > settings.thresholds.max_risk) {
      return false;
    }

    // Check sport filter
    if (notificationData.sport && 
        settings.sports.length > 0 && 
        !settings.sports.includes(notificationData.sport)) {
      return false;
    }

    // Check bookmaker filter
    if (notificationData.bookmaker && 
        settings.bookmakers.length > 0 && 
        !settings.bookmakers.includes(notificationData.bookmaker)) {
      return false;
    }

    return true;
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();
