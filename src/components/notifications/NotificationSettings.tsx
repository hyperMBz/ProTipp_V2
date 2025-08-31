"use client";

// Notification Settings Component
// Story 1.6: Notification System Enhancement

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Mail, MessageSquare, Smartphone, Volume2, VolumeX, Vibrate } from 'lucide-react';
import { useNotificationSettings } from '@/lib/hooks/use-notifications';
import { NotificationSettings } from '@/lib/notifications/notification-manager';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettingsComponent({ userId }: NotificationSettingsProps) {
  const { settings, loading, error, updateSettings } = useNotificationSettings(userId);
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local settings when settings are loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Handle setting changes
  const handleSettingChange = (key: string, value: any) => {
    if (!localSettings) return;

    setLocalSettings(prev => {
      if (!prev) return prev;

      const newSettings = { ...prev };

      // Handle nested object updates
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (parent === 'channels') {
          newSettings.channels = { ...newSettings.channels, [child]: value };
        } else if (parent === 'thresholds') {
          newSettings.thresholds = { ...newSettings.thresholds, [child]: value };
        } else if (parent === 'quiet_hours') {
          newSettings.quiet_hours = { ...newSettings.quiet_hours, [child]: value };
        }
      } else {
        (newSettings as any)[key] = value;
      }

      return newSettings;
    });
  };

  // Handle sport selection
  const handleSportToggle = (sport: string) => {
    if (!localSettings) return;

    const newSports = localSettings.sports.includes(sport)
      ? localSettings.sports.filter(s => s !== sport)
      : [...localSettings.sports, sport];

    setLocalSettings(prev => prev ? { ...prev, sports: newSports } : prev);
  };

  // Handle bookmaker selection
  const handleBookmakerToggle = (bookmaker: string) => {
    if (!localSettings) return;

    const newBookmakers = localSettings.bookmakers.includes(bookmaker)
      ? localSettings.bookmakers.filter(b => b !== bookmaker)
      : [...localSettings.bookmakers, bookmaker];

    setLocalSettings(prev => prev ? { ...prev, bookmakers: newBookmakers } : prev);
  };

  // Save settings
  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    try {
      const success = await updateSettings(localSettings);
      if (success) {
        // Show success message
        console.log('Settings saved successfully');
      } else {
        // Show error message
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultSettings: NotificationSettings = {
      user_id: userId,
      channels: {
        push: true,
        email: true,
        sms: false,
      },
      thresholds: {
        min_profit: 2.0,
        min_confidence: 70,
        max_risk: 15,
      },
      sports: ['Football', 'Basketball', 'Tennis'],
      bookmakers: ['Bet365', 'William Hill', 'Ladbrokes'],
      sound_enabled: true,
      vibration_enabled: true,
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };

    setLocalSettings(defaultSettings);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <BellOff className="h-5 w-5" />
            Error Loading Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!localSettings) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No settings found. Creating default settings...</p>
          <Button onClick={handleReset} className="mt-4">
            Initialize Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications in your browser
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={localSettings.channels.push}
              onCheckedChange={(checked) => handleSettingChange('channels.push', checked)}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={localSettings.channels.email}
              onCheckedChange={(checked) => handleSettingChange('channels.email', checked)}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <Label htmlFor="sms-notifications" className="text-sm font-medium">
                  SMS Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via SMS (additional charges may apply)
                </p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={localSettings.channels.sms}
              onCheckedChange={(checked) => handleSettingChange('channels.sms', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Set minimum requirements for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Minimum Profit */}
          <div className="space-y-2">
            <Label htmlFor="min-profit">Minimum Profit (%)</Label>
            <Input
              id="min-profit"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={localSettings.thresholds.min_profit}
              onChange={(e) => handleSettingChange('thresholds.min_profit', parseFloat(e.target.value))}
            />
          </div>

          {/* Minimum Confidence */}
          <div className="space-y-2">
            <Label htmlFor="min-confidence">Minimum Confidence (%)</Label>
            <Input
              id="min-confidence"
              type="number"
              step="1"
              min="0"
              max="100"
              value={localSettings.thresholds.min_confidence}
              onChange={(e) => handleSettingChange('thresholds.min_confidence', parseInt(e.target.value))}
            />
          </div>

          {/* Maximum Risk */}
          <div className="space-y-2">
            <Label htmlFor="max-risk">Maximum Risk (%)</Label>
            <Input
              id="max-risk"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={localSettings.thresholds.max_risk}
              onChange={(e) => handleSettingChange('thresholds.max_risk', parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vibrate className="h-5 w-5" />
            Sound & Vibration
          </CardTitle>
          <CardDescription>
            Configure audio and haptic feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {localSettings.sound_enabled ? (
                <Volume2 className="h-5 w-5 text-green-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <Label htmlFor="sound-enabled" className="text-sm font-medium">
                  Sound Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Play sound when receiving notifications
                </p>
              </div>
            </div>
            <Switch
              id="sound-enabled"
              checked={localSettings.sound_enabled}
              onCheckedChange={(checked) => handleSettingChange('sound_enabled', checked)}
            />
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="vibration-enabled" className="text-sm font-medium">
                  Vibration
                </Label>
                <p className="text-xs text-muted-foreground">
                  Vibrate device when receiving notifications
                </p>
              </div>
            </div>
            <Switch
              id="vibration-enabled"
              checked={localSettings.vibration_enabled}
              onCheckedChange={(checked) => handleSettingChange('vibration_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to be disturbed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Quiet Hours */}
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-enabled" className="text-sm font-medium">
              Enable Quiet Hours
            </Label>
            <Switch
              id="quiet-hours-enabled"
              checked={localSettings.quiet_hours.enabled}
              onCheckedChange={(checked) => handleSettingChange('quiet_hours.enabled', checked)}
            />
          </div>

          {localSettings.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localSettings.quiet_hours.start}
                  onChange={(e) => handleSettingChange('quiet_hours.start', e.target.value)}
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localSettings.quiet_hours.end}
                  onChange={(e) => handleSettingChange('quiet_hours.end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏈 Sports & Bookmakers
          </CardTitle>
          <CardDescription>
            Choose which sports and bookmakers to receive alerts for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sports */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sports</Label>
            <div className="flex flex-wrap gap-2">
              {['Football', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Soccer', 'Cricket', 'Rugby'].map((sport) => (
                <Badge
                  key={sport}
                  variant={localSettings.sports.includes(sport) ? 'default' : 'secondary'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleSportToggle(sport)}
                >
                  {sport}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bookmakers */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Bookmakers</Label>
            <div className="flex flex-wrap gap-2">
              {['Bet365', 'William Hill', 'Ladbrokes', 'Paddy Power', 'Betfair', 'Sky Bet', 'Coral', 'Unibet'].map((bookmaker) => (
                <Badge
                  key={bookmaker}
                  variant={localSettings.bookmakers.includes(bookmaker) ? 'default' : 'secondary'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleBookmakerToggle(bookmaker)}
                >
                  {bookmaker}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
