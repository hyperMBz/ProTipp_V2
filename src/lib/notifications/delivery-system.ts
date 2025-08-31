// Delivery System - Multi-channel notification delivery
// Story 1.6: Notification System Enhancement

import { notificationManager, NotificationSettings } from './notification-manager';
import { AlertOpportunity } from './alert-engine';

export interface DeliveryResult {
  success: boolean;
  channel: string;
  message?: string;
  error?: string;
}

export interface DeliveryOptions {
  sound?: boolean;
  vibration?: boolean;
  priority?: 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
}

export class DeliverySystem {
  private notificationManager = notificationManager;

  /**
   * Deliver notification through all enabled channels
   */
  async deliverNotification(
    userId: string,
    alert: AlertOpportunity,
    options: DeliveryOptions = {}
  ): Promise<DeliveryResult[]> {
    try {
      const settings = await this.notificationManager.getNotificationSettings(userId);
      
      if (!settings) {
        console.warn('No notification settings found for user:', userId);
        return [];
      }

      const results: DeliveryResult[] = [];
      const channels = settings.channels;

      // Deliver to enabled channels
      if (channels.push) {
        const pushResult = await this.deliverPushNotification(userId, alert, options);
        results.push(pushResult);
      }

      if (channels.email) {
        const emailResult = await this.deliverEmailNotification(userId, alert, options);
        results.push(emailResult);
      }

      if (channels.sms) {
        const smsResult = await this.deliverSMSNotification(userId, alert, options);
        results.push(smsResult);
      }

      // Create notification history record
      await this.notificationManager.createNotificationHistory({
        user_id: userId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        data: alert.data,
        channels_sent: results
          .filter(r => r.success)
          .map(r => r.channel),
      });

      return results;
    } catch (error) {
      console.error('Error delivering notification:', error);
      return [{
        success: false,
        channel: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
      }];
    }
  }

  /**
   * Deliver push notification
   */
  private async deliverPushNotification(
    userId: string,
    alert: AlertOpportunity,
    options: DeliveryOptions
  ): Promise<DeliveryResult> {
    try {
      // Check if browser supports push notifications
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return {
          success: false,
          channel: 'push',
          error: 'Push notifications not supported',
        };
      }

      // Get user's push subscription
      const subscription = await this.getPushSubscription(userId);
      
      if (!subscription) {
        return {
          success: false,
          channel: 'push',
          error: 'No push subscription found',
        };
      }

      // Send push notification
      const response = await fetch('/api/v1/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          notification: {
            title: alert.title,
            body: alert.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: alert.data,
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'View Details',
                icon: '/view-icon.png',
              },
              {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/dismiss-icon.png',
              },
            ],
          },
          options: {
            TTL: options.ttl || 3600, // 1 hour default
            urgency: options.priority || 'normal',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.statusText}`);
      }

      return {
        success: true,
        channel: 'push',
        message: 'Push notification sent successfully',
      };
    } catch (error) {
      console.error('Error delivering push notification:', error);
      return {
        success: false,
        channel: 'push',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Deliver email notification
   */
  private async deliverEmailNotification(
    userId: string,
    alert: AlertOpportunity,
    options: DeliveryOptions
  ): Promise<DeliveryResult> {
    try {
      // Get user's email address
      const userEmail = await this.getUserEmail(userId);
      
      if (!userEmail) {
        return {
          success: false,
          channel: 'email',
          error: 'No email address found for user',
        };
      }

      // Send email notification
      const response = await fetch('/api/v1/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: alert.title,
          template: 'arbitrage-alert',
          data: {
            alert,
            user_id: userId,
            timestamp: new Date().toISOString(),
          },
          options: {
            priority: options.priority || 'normal',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email notification failed: ${response.statusText}`);
      }

      return {
        success: true,
        channel: 'email',
        message: 'Email notification sent successfully',
      };
    } catch (error) {
      console.error('Error delivering email notification:', error);
      return {
        success: false,
        channel: 'email',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Deliver SMS notification
   */
  private async deliverSMSNotification(
    userId: string,
    alert: AlertOpportunity,
    options: DeliveryOptions
  ): Promise<DeliveryResult> {
    try {
      // Get user's phone number
      const userPhone = await this.getUserPhone(userId);
      
      if (!userPhone) {
        return {
          success: false,
          channel: 'sms',
          error: 'No phone number found for user',
        };
      }

      // Send SMS notification
      const response = await fetch('/api/v1/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userPhone,
          message: this.formatSMSMessage(alert),
          options: {
            priority: options.priority || 'normal',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS notification failed: ${response.statusText}`);
      }

      return {
        success: true,
        channel: 'sms',
        message: 'SMS notification sent successfully',
      };
    } catch (error) {
      console.error('Error delivering SMS notification:', error);
      return {
        success: false,
        channel: 'sms',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's push subscription
   */
  private async getPushSubscription(userId: string): Promise<PushSubscription | null> {
    try {
      // This would typically be stored in the database
      // For now, we'll return null to indicate no subscription
      return null;
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  /**
   * Get user's email address
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      // Use the notification manager's public method instead of accessing private property
      const settings = await this.notificationManager.getNotificationSettings(userId);
      
      if (!settings) {
        return null;
      }

      // This would typically come from a user profile table
      // For now, we'll return a placeholder
      return `user-${userId}@example.com`;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Get user's phone number
   */
  private async getUserPhone(userId: string): Promise<string | null> {
    try {
      // Use the notification manager's public method instead of accessing private property
      const settings = await this.notificationManager.getNotificationSettings(userId);
      
      if (!settings) {
        return null;
      }

      // This would typically come from a user profile table
      // For now, we'll return a placeholder
      return `+1234567890`;
    } catch (error) {
      console.error('Error getting user phone:', error);
      return null;
    }
  }

  /**
   * Format message for SMS (limited to 160 characters)
   */
  private formatSMSMessage(alert: AlertOpportunity): string {
    const profit = alert.data.profit;
    const sport = alert.data.sport;
    const event = alert.data.event;

    // Create a concise message for SMS
    let message = `${profit.toFixed(1)}% profit: ${sport} - ${event}`;
    
    // Truncate if too long
    if (message.length > 140) {
      message = message.substring(0, 137) + '...';
    }

    return message;
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        console.warn('Push notification permission denied');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(userId: string): Promise<boolean> {
    try {
      const permissionGranted = await this.requestPushPermission();
      
      if (!permissionGranted) {
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      // Save subscription to database
      // This would typically be done through an API call
      console.log('Push subscription created:', subscription);

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Singleton instance
export const deliverySystem = new DeliverySystem();
