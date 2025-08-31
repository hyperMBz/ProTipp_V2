"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/lib/providers/auth-provider';
import { useArbitrageWithFallback } from '@/lib/hooks/use-odds-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  BellRing,
  Settings,
  Zap,
  MessageSquare,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ArbitrageOpportunity } from "@/lib/mock-data";
import { AlertHistoryList } from "./AlertHistoryList";
import { NotificationSettings } from "./NotificationSettings";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useNotificationSettings } from "@/lib/hooks/use-notifications";

interface AlertThresholds {
  minProfitMargin: number;
  minStakeSize: number;
  maxStakeSize: number;
  minOdds: number;
  maxTimeToExpiry: number; // in hours
  enabledSports: string[];
  enabledBookmakers: string[];
}

interface LiveAlert {
  id: string;
  timestamp: Date;
  opportunity: ArbitrageOpportunity;
  type: 'high_profit' | 'large_stake' | 'favorite_sport' | 'closing_soon';
  triggered: boolean;
  acknowledged: boolean;
}

export function LiveAlertsSystem() {
  const user = useUser();
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [newAlertsCount, setNewAlertsCount] = useState(0);

  // Integrate new notification system
  const { 
    subscribeToPush, 
    sendTestNotification: sendNewTestNotification,
    processOpportunities,
    processPriceChanges
  } = useNotifications();
  const { 
    settings, 
    updateSettings, 
    loading: settingsLoading 
  } = useNotificationSettings();

  const [thresholds, setThresholds] = useState<AlertThresholds>({
    minProfitMargin: 3.0,
    minStakeSize: 50000,
    maxStakeSize: 500000,
    minOdds: 1.5,
    maxTimeToExpiry: 2, // 2 hours
    enabledSports: ['Labdarúgás', 'Kosárlabda', 'Tenisz'],
    enabledBookmakers: ['Bet365', 'Unibet', 'Tipico']
  });

  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  // Get arbitrage opportunities
  const arbitrageQuery = useArbitrageWithFallback(['soccer_epl', 'basketball_nba', 'tennis_atp']);
  const opportunities = useMemo(() => arbitrageQuery.data || [], [arbitrageQuery.data]);

  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/alert.mp3'); // You'd need to add this sound file
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: Use Web Audio API to generate beep
        const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const audioContext = new Ctx();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      });
    } catch (error) {
      console.error('Could not play alert sound:', error);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const sendWebhookAlert = useCallback(async (alert: LiveAlert) => {
    try {
      const payload = {
        type: 'arbitrage_alert',
        alert_type: alert.type,
        timestamp: alert.timestamp.toISOString(),
        opportunity: {
          id: alert.opportunity.id,
          event: alert.opportunity.event,
          sport: alert.opportunity.sport,
          profit_margin: alert.opportunity.profitMargin,
          expected_profit: alert.opportunity.expectedProfit,
          total_stake: alert.opportunity.totalStake,
          bet1: alert.opportunity.bet1,
          bet2: alert.opportunity.bet2,
          time_to_expiry: alert.opportunity.timeToExpiry
        }
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }, [webhookUrl]);

  const sendDiscordAlert = useCallback(async (alert: LiveAlert) => {
    try {
      const { opportunity } = alert;
      const embed = {
        title: '🚨 Új Arbitrage Lehetőség!',
        color: 0x00ff00,
        fields: [
          { name: 'Esemény', value: opportunity.event, inline: true },
          { name: 'Sport', value: opportunity.sport, inline: true },
          { name: 'Profit', value: `${opportunity.profitMargin.toFixed(1)}%`, inline: true },
          { name: 'Várható nyereség', value: `${formatNumber(opportunity.expectedProfit)} Ft`, inline: true },
          { name: 'Szükséges tét', value: `${formatNumber(opportunity.totalStake)} Ft`, inline: true },
          { name: 'Lejárat', value: opportunity.timeToExpiry, inline: true },
          {
            name: 'Fogadóiroda 1',
            value: `${opportunity.bet1.bookmaker}: ${opportunity.bet1.odds} (${formatNumber(opportunity.stakes.bet1.stake)} Ft)`,
            inline: false
          },
          {
            name: 'Fogadóiroda 2',
            value: `${opportunity.bet2.bookmaker}: ${opportunity.bet2.odds} (${formatNumber(opportunity.stakes.bet2.stake)} Ft)`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      await fetch(discordWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (error) {
      console.error('Discord webhook failed:', error);
    }
  }, [discordWebhook]);

  const sendTelegramAlert = useCallback(async (alert: LiveAlert) => {
    try {
      const { opportunity } = alert;
      const message = `
🚨 *Új Arbitrage Lehetőség!*

📊 *Esemény:* ${opportunity.event}
🏆 *Sport:* ${opportunity.sport}
💰 *Profit:* ${opportunity.profitMargin.toFixed(1)}%
💵 *Várható nyereség:* ${formatNumber(opportunity.expectedProfit)} Ft
🎯 *Szükséges tét:* ${formatNumber(opportunity.totalStake)} Ft
⏰ *Lejárat:* ${opportunity.timeToExpiry}

🏠 *${opportunity.bet1.bookmaker}:* ${opportunity.bet1.odds} (${formatNumber(opportunity.stakes.bet1.stake)} Ft)
🏠 *${opportunity.bet2.bookmaker}:* ${opportunity.bet2.odds} (${formatNumber(opportunity.stakes.bet2.stake)} Ft)
      `.trim();

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Telegram alert failed:', error);
    }
  }, [telegramChatId, telegramToken]);

  const getAlertTitle = useCallback((type: LiveAlert['type']) => {
    switch (type) {
      case 'high_profit':
        return '🚨 Magas profit arbitrage!';
      case 'large_stake':
        return '💰 Nagy tétes lehetőség!';
      case 'closing_soon':
        return '⏰ Hamarosan lejár!';
      case 'favorite_sport':
        return '⭐ Kedvenc sport arbitrage!';
      default:
        return '🔔 Új arbitrage lehetőség!';
    }
  }, []);

  // Notification functions - moved before checkForAlerts
  const triggerNotification = useCallback(async (alert: LiveAlert) => {
    const { opportunity, type } = alert;

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = getAlertTitle(type);
      const body = `${opportunity.event}: ${opportunity.profitMargin.toFixed(1)}% profit (${formatNumber(opportunity.expectedProfit)} Ft)`;

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true
      });
    }

    // Sound notification
    if (soundEnabled) {
      playAlertSound();
    }

    // Send to webhooks
    if (webhookEnabled && webhookUrl) {
      await sendWebhookAlert(alert);
    }

    if (discordWebhook) {
      await sendDiscordAlert(alert);
    }

    if (telegramToken && telegramChatId) {
      await sendTelegramAlert(alert);
    }
  }, [soundEnabled, webhookEnabled, webhookUrl, discordWebhook, telegramToken, telegramChatId, getAlertTitle, playAlertSound, sendDiscordAlert, sendTelegramAlert, sendWebhookAlert]);

  // Check for new opportunities that meet alert criteria
  const checkForAlerts = useCallback((opportunities: ArbitrageOpportunity[]) => {
    const newAlerts: LiveAlert[] = [];

    opportunities.forEach(opportunity => {
      // Check if already alerted for this opportunity
      const existingAlert = alerts.find(alert =>
        alert.opportunity.id === opportunity.id
      );

      if (existingAlert) return;

      // Check alert criteria
      const meetsMinProfit = opportunity.profitMargin >= thresholds.minProfitMargin;
      const meetsStakeRange = opportunity.totalStake >= thresholds.minStakeSize &&
                             opportunity.totalStake <= thresholds.maxStakeSize;
      const meetsOddsThreshold = opportunity.bet1.odds >= thresholds.minOdds &&
                                opportunity.bet2.odds >= thresholds.minOdds;
      const sportEnabled = thresholds.enabledSports.includes(opportunity.sport);
      const bookmakerEnabled = thresholds.enabledBookmakers.includes(opportunity.bet1.bookmaker) ||
                              thresholds.enabledBookmakers.includes(opportunity.bet2.bookmaker);

      // Get time to expiry in hours
      const timeToExpiryHours = parseFloat(opportunity.timeToExpiry.replace('h', '').replace('m', '')) / 60;
      const meetsTimeThreshold = timeToExpiryHours <= thresholds.maxTimeToExpiry;

      if (meetsMinProfit && meetsStakeRange && meetsOddsThreshold && sportEnabled && bookmakerEnabled) {
        let alertType: LiveAlert['type'] = 'high_profit';

        if (opportunity.profitMargin >= 8) {
          alertType = 'high_profit';
        } else if (opportunity.totalStake >= 200000) {
          alertType = 'large_stake';
        } else if (timeToExpiryHours <= 0.5) {
          alertType = 'closing_soon';
        } else {
          alertType = 'favorite_sport';
        }

        const alert: LiveAlert = {
          id: `alert-${opportunity.id}-${Date.now()}`,
          timestamp: new Date(),
          opportunity,
          type: alertType,
          triggered: true,
          acknowledged: false
        };

        newAlerts.push(alert);
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 100)); // Keep last 100 alerts
      setNewAlertsCount(prev => prev + newAlerts.length);

      // Trigger notifications
      newAlerts.forEach(alert => {
        if (isEnabled) {
          triggerNotification(alert);
        }
      });
    }
  }, [alerts, thresholds, isEnabled, triggerNotification]);

  // Monitor opportunities for alerts
  useEffect(() => {
    if (opportunities.length > 0 && isEnabled) {
      checkForAlerts(opportunities);
      
      // Process opportunities with new notification system
      if (settings?.channels.push || settings?.channels.email || settings?.channels.sms) {
        processOpportunities(opportunities);
      }
    }
  }, [opportunities, isEnabled, checkForAlerts, settings, processOpportunities]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    setNewAlertsCount(prev => Math.max(0, prev - 1));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setNewAlertsCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isEnabled ? (
                  <BellRing className="h-6 w-6 text-green-400" />
                ) : (
                  <Bell className="h-6 w-6 text-muted-foreground" />
                )}
                {newAlertsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                    {newAlertsCount}
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle>Live Alerts System</CardTitle>
                <CardDescription>
                  Valós idejű értesítések arbitrage lehetőségekről
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="alerts-enabled">Alerts aktív</Label>
                <Switch
                  id="alerts-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alert Status */}
      {isEnabled && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Live alerts rendszer aktív. Figyeljük a következő küszöbértékeket:
            minimum {thresholds.minProfitMargin}% profit,
            {formatNumber(thresholds.minStakeSize)}-{formatNumber(thresholds.maxStakeSize)} Ft tét tartomány.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert Tabs */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Aktív alerts</span>
            {newAlertsCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {newAlertsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Beállítások</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Értesítések</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
        </TabsList>

        {/* Current Alerts */}
        <TabsContent value="current" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aktuális riasztások ({alerts.length})</h3>
            {alerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                Összes törlése
              </Button>
            )}
          </div>

          <AlertHistoryList
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert küszöbértékek</CardTitle>
              <CardDescription>
                Állítsd be mikor szeretnél értesítést kapni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum profit margin (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={thresholds.minProfitMargin}
                    onChange={(e) => setThresholds(prev => ({
                      ...prev,
                      minProfitMargin: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum tét (Ft)</Label>
                  <Input
                    type="number"
                    value={thresholds.minStakeSize}
                    onChange={(e) => setThresholds(prev => ({
                      ...prev,
                      minStakeSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maximum tét (Ft)</Label>
                  <Input
                    type="number"
                    value={thresholds.maxStakeSize}
                    onChange={(e) => setThresholds(prev => ({
                      ...prev,
                      maxStakeSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum odds</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={thresholds.minOdds}
                    onChange={(e) => setThresholds(prev => ({
                      ...prev,
                      minOdds: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            onRequestPermission={requestNotificationPermission}
          />
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook integráció</CardTitle>
              <CardDescription>
                Küldd el az alerteket külső szolgáltatásokba
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Custom Webhook */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={webhookEnabled}
                    onCheckedChange={setWebhookEnabled}
                  />
                  <Label>Custom Webhook</Label>
                </div>
                <Input
                  placeholder="https://your-webhook-url.com/alerts"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={!webhookEnabled}
                />
              </div>

              {/* Discord */}
              <div className="space-y-4">
                <Label>Discord Webhook URL</Label>
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                />
              </div>

              {/* Telegram */}
              <div className="space-y-4">
                <Label>Telegram Bot</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Bot Token"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                  />
                  <Input
                    placeholder="Chat ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
