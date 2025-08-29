"use client";

// Bookmaker Configuration Component
// Story 1.1 Task 5: Create Bookmaker UI Components

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Shield,
  Zap
} from "lucide-react";
import { useBookmakers, useBookmakerManager } from "@/lib/hooks/use-bookmakers";
import { BookmakerManagerConfig } from "@/lib/api/bookmakers/manager";

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const configSections: ConfigSection[] = [
  {
    id: "general",
    title: "General Settings",
    description: "Basic configuration and preferences",
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: "performance",
    title: "Performance",
    description: "Rate limiting and caching settings",
    icon: <Zap className="h-4 w-4" />
  },
  {
    id: "health",
    title: "Health Monitoring",
    description: "Health check intervals and alerts",
    icon: <Activity className="h-4 w-4" />
  },
  {
    id: "cache",
    title: "Cache Management",
    description: "Data caching and storage settings",
    icon: <Database className="h-4 w-4" />
  },
  {
    id: "security",
    title: "Security",
    description: "Authentication and API key management",
    icon: <Shield className="h-4 w-4" />
  }
];

export default function BookmakerConfig() {
  const [activeSection, setActiveSection] = useState("general");
  const [config, setConfig] = useState<BookmakerManagerConfig>({
    healthCheckInterval: 5 * 60 * 1000, // 5 minutes
    maxReconnectAttempts: 3,
    fallbackEnabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const { manager, isInitialized } = useBookmakerManager();
  const { stats, clearCache, isClearingCache } = useBookmakers();

  useEffect(() => {
    // Load current configuration
    if (manager) {
      // In a real implementation, you would load the actual config from the manager
      // For now, we'll use the default config
    }
  }, [manager]);

  const handleConfigChange = (key: keyof BookmakerManagerConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // In a real implementation, you would save the config to the manager
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = async () => {
    await clearCache();
  };

  const formatInterval = (ms: number): string => {
    if (ms < 60000) return `${ms / 1000}s`;
    if (ms < 3600000) return `${ms / 60000}m`;
    return `${ms / 3600000}h`;
  };

  const parseInterval = (value: string): number => {
    const num = parseInt(value);
    if (value.includes('s')) return num * 1000;
    if (value.includes('m')) return num * 60000;
    if (value.includes('h')) return num * 3600000;
    return num * 60000; // Default to minutes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Bookmaker Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage bookmaker API settings and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Connecting...
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {configSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {section.icon}
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {configSections.find(s => s.id === activeSection)?.title}
                  </CardTitle>
                  <CardDescription>
                    {configSections.find(s => s.id === activeSection)?.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {saveStatus === "success" && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                  {saveStatus === "error" && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSection === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fallback-enabled">Enable Fallback API</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fallback-enabled"
                          checked={config.fallbackEnabled}
                          onCheckedChange={(checked) => handleConfigChange('fallbackEnabled', checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          Use The Odds API as fallback when bookmakers fail
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "performance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-reconnect">Max Reconnect Attempts</Label>
                      <Input
                        id="max-reconnect"
                        type="number"
                        min="1"
                        max="10"
                        value={config.maxReconnectAttempts}
                        onChange={(e) => handleConfigChange('maxReconnectAttempts', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of reconnection attempts for failed APIs
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "health" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="health-interval">Health Check Interval</Label>
                      <Select
                        value={formatInterval(config.healthCheckInterval)}
                        onValueChange={(value) => handleConfigChange('healthCheckInterval', parseInterval(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30s">30 seconds</SelectItem>
                          <SelectItem value="1m">1 minute</SelectItem>
                          <SelectItem value="5m">5 minutes</SelectItem>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="30m">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        How often to check bookmaker API health
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "cache" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Cache Statistics</h4>
                      <p className="text-sm text-muted-foreground">
                        Current cache status and performance
                      </p>
                    </div>
                    <Button
                      onClick={handleClearCache}
                      disabled={isClearingCache}
                      variant="outline"
                      size="sm"
                    >
                      {isClearingCache ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Clear Cache
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Total Bookmakers</span>
                        </div>
                        <p className="text-2xl font-bold">{stats?.totalBookmakers || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Healthy</span>
                        </div>
                        <p className="text-2xl font-bold">{stats?.healthyBookmakers || 0}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Errors</span>
                        </div>
                        <p className="text-2xl font-bold">{stats?.errorBookmakers || 0}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key Management</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage API keys for different bookmakers
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Bet365 API Key</p>
                        <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Update
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Pinnacle API Key</p>
                        <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Update
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">William Hill API Key</p>
                        <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
