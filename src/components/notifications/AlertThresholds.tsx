"use client";

// Alert Thresholds Component
// Story 1.6: Notification System Enhancement

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Save, 
  RotateCcw,
  Target,
  Zap,
  Shield,
  DollarSign,
  Percent,
  Clock,
  Filter
} from 'lucide-react';
import { useNotificationSettings } from '@/lib/hooks/use-notifications';

interface AlertThresholdsProps {
  userId: string;
}

interface ThresholdSettings {
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
}

export function AlertThresholdsComponent({ userId }: AlertThresholdsProps) {
  const { settings, loading, error, updateSettings } = useNotificationSettings(userId);
  const [localThresholds, setLocalThresholds] = useState<ThresholdSettings>({
    profit: { min: 2, max: 50, enabled: true },
    confidence: { min: 70, max: 100, enabled: true },
    risk: { min: 0, max: 30, enabled: true },
    urgency: { low: true, medium: true, high: true, critical: true },
    timeWindow: { enabled: false, minutes: 30 },
    volume: { enabled: false, minStake: 10, maxStake: 1000 }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profit' | 'confidence' | 'risk' | 'urgency' | 'advanced'>('profit');

  // Load settings from hook
  useEffect(() => {
    if (settings?.alert_thresholds) {
      setLocalThresholds(settings.alert_thresholds);
    }
  }, [settings]);

  // Handle threshold changes
  const handleThresholdChange = (
    category: keyof ThresholdSettings,
    field: string,
    value: number | boolean
  ) => {
    setLocalThresholds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle urgency toggle
  const handleUrgencyToggle = (level: keyof ThresholdSettings['urgency']) => {
    setLocalThresholds(prev => ({
      ...prev,
      urgency: {
        ...prev.urgency,
        [level]: !prev.urgency[level]
      }
    }));
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings({
        alert_thresholds: localThresholds
      });
      if (success) {
        // Show success feedback
        console.log('Threshold settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving threshold settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    const defaults: ThresholdSettings = {
      profit: { min: 2, max: 50, enabled: true },
      confidence: { min: 70, max: 100, enabled: true },
      risk: { min: 0, max: 30, enabled: true },
      urgency: { low: true, medium: true, high: true, critical: true },
      timeWindow: { enabled: false, minutes: 30 },
      volume: { enabled: false, minStake: 10, maxStake: 1000 }
    };
    setLocalThresholds(defaults);
  };

  // Get urgency color
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Get urgency icon
  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'low': return <Clock className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>Loading threshold settings...</CardDescription>
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
            <Target className="h-5 w-5" />
            Error Loading Thresholds
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Configure when you want to receive notifications based on opportunity criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'profit', label: 'Profit', icon: <DollarSign className="h-4 w-4" /> },
              { key: 'confidence', label: 'Confidence', icon: <Shield className="h-4 w-4" /> },
              { key: 'risk', label: 'Risk', icon: <AlertTriangle className="h-4 w-4" /> },
              { key: 'urgency', label: 'Urgency', icon: <Zap className="h-4 w-4" /> },
              { key: 'advanced', label: 'Advanced', icon: <Settings className="h-4 w-4" /> }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Profit Thresholds */}
          {activeTab === 'profit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-medium">Profit Thresholds</Label>
                </div>
                <Switch
                  checked={localThresholds.profit.enabled}
                  onCheckedChange={(checked) => handleThresholdChange('profit', 'enabled', checked)}
                />
              </div>

              {localThresholds.profit.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Minimum Profit (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.profit.min]}
                        onValueChange={([value]) => handleThresholdChange('profit', 'min', value)}
                        max={20}
                        min={0}
                        step={0.5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.profit.min}
                        onChange={(e) => handleThresholdChange('profit', 'min', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={0}
                        max={localThresholds.profit.max}
                        step={0.5}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Maximum Profit (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.profit.max]}
                        onValueChange={([value]) => handleThresholdChange('profit', 'max', value)}
                        max={100}
                        min={localThresholds.profit.min}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.profit.max}
                        onChange={(e) => handleThresholdChange('profit', 'max', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={localThresholds.profit.min}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You will receive notifications for opportunities with profit between{' '}
                      <span className="font-medium text-green-600">{localThresholds.profit.min}%</span> and{' '}
                      <span className="font-medium text-green-600">{localThresholds.profit.max}%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confidence Thresholds */}
          {activeTab === 'confidence' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Confidence Thresholds</Label>
                </div>
                <Switch
                  checked={localThresholds.confidence.enabled}
                  onCheckedChange={(checked) => handleThresholdChange('confidence', 'enabled', checked)}
                />
              </div>

              {localThresholds.confidence.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Minimum Confidence (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.confidence.min]}
                        onValueChange={([value]) => handleThresholdChange('confidence', 'min', value)}
                        max={100}
                        min={50}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.confidence.min}
                        onChange={(e) => handleThresholdChange('confidence', 'min', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={50}
                        max={localThresholds.confidence.max}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Maximum Confidence (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.confidence.max]}
                        onValueChange={([value]) => handleThresholdChange('confidence', 'max', value)}
                        max={100}
                        min={localThresholds.confidence.min}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.confidence.max}
                        onChange={(e) => handleThresholdChange('confidence', 'max', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={localThresholds.confidence.min}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You will receive notifications for opportunities with confidence between{' '}
                      <span className="font-medium text-blue-600">{localThresholds.confidence.min}%</span> and{' '}
                      <span className="font-medium text-blue-600">{localThresholds.confidence.max}%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risk Thresholds */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <Label className="text-base font-medium">Risk Thresholds</Label>
                </div>
                <Switch
                  checked={localThresholds.risk.enabled}
                  onCheckedChange={(checked) => handleThresholdChange('risk', 'enabled', checked)}
                />
              </div>

              {localThresholds.risk.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Minimum Risk (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.risk.min]}
                        onValueChange={([value]) => handleThresholdChange('risk', 'min', value)}
                        max={50}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.risk.min}
                        onChange={(e) => handleThresholdChange('risk', 'min', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={0}
                        max={localThresholds.risk.max}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Maximum Risk (%)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[localThresholds.risk.max]}
                        onValueChange={([value]) => handleThresholdChange('risk', 'max', value)}
                        max={100}
                        min={localThresholds.risk.min}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.risk.max}
                        onChange={(e) => handleThresholdChange('risk', 'max', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min={localThresholds.risk.min}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You will receive notifications for opportunities with risk between{' '}
                      <span className="font-medium text-orange-600">{localThresholds.risk.min}%</span> and{' '}
                      <span className="font-medium text-orange-600">{localThresholds.risk.max}%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Urgency Levels */}
          {activeTab === 'urgency' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-600" />
                <Label className="text-base font-medium">Urgency Levels</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(localThresholds.urgency).map(([level, enabled]) => (
                  <div
                    key={level}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      enabled
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/50 border-muted'
                    }`}
                    onClick={() => handleUrgencyToggle(level as keyof ThresholdSettings['urgency'])}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${getUrgencyColor(level)}`}>
                          {getUrgencyIcon(level)}
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{level}</h4>
                          <p className="text-sm text-muted-foreground">
                            {level === 'low' && 'Low priority opportunities'}
                            {level === 'medium' && 'Standard priority opportunities'}
                            {level === 'high' && 'High priority opportunities'}
                            {level === 'critical' && 'Critical priority opportunities'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleUrgencyToggle(level as keyof ThresholdSettings['urgency'])}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Select which urgency levels you want to receive notifications for. 
                  Higher urgency levels will trigger more immediate notifications.
                </p>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-purple-600" />
                <Label className="text-base font-medium">Advanced Settings</Label>
              </div>

              {/* Time Window */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Label className="text-sm font-medium">Time Window Filter</Label>
                  </div>
                  <Switch
                    checked={localThresholds.timeWindow.enabled}
                    onCheckedChange={(checked) => handleThresholdChange('timeWindow', 'enabled', checked)}
                  />
                </div>

                {localThresholds.timeWindow.enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm">Minimum Time Until Event (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[localThresholds.timeWindow.minutes]}
                        onValueChange={([value]) => handleThresholdChange('timeWindow', 'minutes', value)}
                        max={120}
                        min={5}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={localThresholds.timeWindow.minutes}
                        onChange={(e) => handleThresholdChange('timeWindow', 'minutes', parseInt(e.target.value) || 0)}
                        className="w-20"
                        min={5}
                        max={120}
                        step={5}
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Volume Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <Label className="text-sm font-medium">Volume Filter</Label>
                  </div>
                  <Switch
                    checked={localThresholds.volume.enabled}
                    onCheckedChange={(checked) => handleThresholdChange('volume', 'enabled', checked)}
                  />
                </div>

                {localThresholds.volume.enabled && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Minimum Stake Amount ($)</Label>
                      <Input
                        type="number"
                        value={localThresholds.volume.minStake}
                        onChange={(e) => handleThresholdChange('volume', 'minStake', parseFloat(e.target.value) || 0)}
                        className="w-full"
                        min={0}
                        max={localThresholds.volume.maxStake}
                        step={1}
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Maximum Stake Amount ($)</Label>
                      <Input
                        type="number"
                        value={localThresholds.volume.maxStake}
                        onChange={(e) => handleThresholdChange('volume', 'maxStake', parseFloat(e.target.value) || 0)}
                        className="w-full"
                        min={localThresholds.volume.minStake}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Separator className="my-6" />
          
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
