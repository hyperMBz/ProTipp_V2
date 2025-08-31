// Notification Hook - React hook for notification management
// Story 1.6: Notification System Enhancement

import { useState, useEffect, useCallback } from 'react';
import { notificationManager, NotificationSettings } from '../notifications/notification-manager';
import { alertEngine, AlertOpportunity } from '../notifications/alert-engine';
import { deliverySystem } from '../notifications/delivery-system';

export interface UseNotificationsReturn {
  // Settings
  settings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  
  // History
  history: any[];
  markAsRead: (notificationId: string) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
  
  // Real-time
  latestAlerts: AlertOpportunity[];
  sendTestNotification: () => Promise<void>;
  
  // Internal methods (for advanced usage)
  processOpportunities: (opportunities: any[]) => Promise<void>;
  processPriceChanges: (priceChanges: any[]) => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [latestAlerts, setLatestAlerts] = useState<AlertOpportunity[]>([]);

  // Load notification settings
  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const userSettings = await notificationManager.getNotificationSettings(userId);
      setSettings(userSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load notification history
  const loadHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const userHistory = await notificationManager.getNotificationHistory(userId, 50, 0);
      setHistory(userHistory);
    } catch (err) {
      console.error('Failed to load notification history:', err);
    }
  }, [userId]);

  // Update notification settings
  const updateSettings = useCallback(async (
    newSettings: Partial<NotificationSettings>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await notificationManager.updateNotificationSettings(userId, newSettings);
      
      if (success) {
        // Reload settings to get updated data
        await loadSettings();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, [userId, loadSettings]);

  // Request push notification permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    try {
      return await deliverySystem.requestPushPermission();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await deliverySystem.subscribeToPushNotifications(userId);
      
      if (success) {
        // Update settings to enable push notifications
        await updateSettings({
          channels: {
            push: true,
            email: settings?.channels.email || false,
            sms: settings?.channels.sms || false,
          },
        });
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push');
      return false;
    }
  }, [userId, settings, updateSettings]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await notificationManager.markNotificationAsRead(notificationId);
      
      if (success) {
        // Update local history
        setHistory(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
      }
      
      return success;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Clear notification history
  const clearHistory = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      // This would typically be an API call to clear history
      // For now, we'll just clear the local state
      setHistory([]);
      return true;
    } catch (err) {
      console.error('Failed to clear history:', err);
      return false;
    }
  }, [userId]);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!userId || !settings) return;

    try {
      const testAlert: AlertOpportunity = {
        id: `test_${Date.now()}`,
        title: '🧪 Test Notification',
        message: 'This is a test notification to verify your settings.',
        type: 'system_alert',
        data: {
          profit: 5.5,
          confidence: 85,
          risk: 3,
          sport: 'Test Sport',
          league: 'Test League',
          bookmakers: ['Test Bookmaker'],
          event: 'Test Event',
          odds: { 'Test Bookmaker': 2.0 },
          timestamp: new Date(),
        },
        priority: 5,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      };

      const results = await deliverySystem.deliverNotification(userId, testAlert, {
        sound: settings.sound_enabled,
        vibration: settings.vibration_enabled,
        priority: 'normal',
      });

      console.log('Test notification results:', results);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  }, [userId, settings]);

  // Process arbitrage opportunities
  const processOpportunities = useCallback(async (opportunities: any[]) => {
    if (!userId) return;

    try {
      const alerts = await alertEngine.processArbitrageOpportunities(opportunities, userId);
      setLatestAlerts(alerts);

      // Send notifications for new alerts
      for (const alert of alerts) {
        await deliverySystem.deliverNotification(userId, alert, {
          sound: settings?.sound_enabled,
          vibration: settings?.vibration_enabled,
          priority: alert.priority >= 8 ? 'high' : 'normal',
        });
      }
    } catch (err) {
      console.error('Failed to process opportunities:', err);
    }
  }, [userId, settings]);

  // Process price changes
  const processPriceChanges = useCallback(async (priceChanges: any[]) => {
    if (!userId) return;

    try {
      const alerts = await alertEngine.processPriceChanges(priceChanges, userId);
      
      // Add to latest alerts
      setLatestAlerts(prev => [...alerts, ...prev].slice(0, 10));

      // Send notifications for new alerts
      for (const alert of alerts) {
        await deliverySystem.deliverNotification(userId, alert, {
          sound: settings?.sound_enabled,
          vibration: settings?.vibration_enabled,
          priority: 'normal',
        });
      }
    } catch (err) {
      console.error('Failed to process price changes:', err);
    }
  }, [userId, settings]);

  // Load data on mount
  useEffect(() => {
    loadSettings();
    loadHistory();
  }, [loadSettings, loadHistory]);

  // Set up real-time listeners (if needed)
  useEffect(() => {
    if (!userId) return;

    // This would typically set up WebSocket or Supabase real-time subscriptions
    // For now, we'll just set up a basic interval to check for new opportunities
    
    const interval = setInterval(() => {
      // Check for new opportunities (this would be replaced with real-time data)
      // For demo purposes, we'll just log that we're checking
      console.log('Checking for new arbitrage opportunities...');
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  return {
    // Settings
    settings,
    loading,
    error,
    
    // Actions
    updateSettings,
    requestPushPermission,
    subscribeToPush,
    
    // History
    history,
    markAsRead,
    clearHistory,
    
    // Real-time
    latestAlerts,
    sendTestNotification,
    
    // Internal methods (for advanced usage)
    processOpportunities,
    processPriceChanges,
  };
}

// Hook for notification settings only
export function useNotificationSettings(userId?: string) {
  const { settings, loading, error, updateSettings } = useNotifications(userId);
  
  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}

// Hook for notification history only
export function useNotificationHistory(userId?: string) {
  const { history, loading, error, markAsRead, clearHistory } = useNotifications(userId);
  
  return {
    history,
    loading,
    error,
    markAsRead,
    clearHistory,
  };
}

// Hook for real-time alerts only
export function useRealTimeAlerts(userId?: string) {
  const { latestAlerts, processOpportunities, processPriceChanges } = useNotifications(userId);
  
  return {
    latestAlerts,
    processOpportunities,
    processPriceChanges,
  };
}
