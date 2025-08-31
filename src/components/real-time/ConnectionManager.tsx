"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  Signal,
  Database
} from "lucide-react";
import { useRealTime } from "@/lib/hooks/use-real-time";
import { useLatencyMonitoring } from "@/lib/hooks/use-real-time";
import { cn } from "@/lib/utils";

interface ConnectionManagerProps {
  className?: string;
  showAdvanced?: boolean;
}

export function ConnectionManager({ 
  className,
  showAdvanced = false
}: ConnectionManagerProps) {
  const {
    isConnected,
    connectionStatus,
    currentMethod,
    latency,
    error,
    isConnecting,
    connect,
    disconnect,
    switchMethod,
    refreshConnection
  } = useRealTime({
    autoConnect: true,
    preferredMethod: 'websocket',
    enablePolling: true
  });

  const {
    currentLatency,
    averageLatency,
    latencyHistory
  } = useLatencyMonitoring({
    autoConnect: true
  });

  const [autoReconnect, setAutoReconnect] = useState(true);
  const [showLatencyHistory, setShowLatencyHistory] = useState(false);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'websocket':
        return <Zap className="h-4 w-4" />;
      case 'sse':
        return <Signal className="h-4 w-4" />;
      case 'polling':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'websocket':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'sse':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'polling':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-600';
    if (latency < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLatency = (latency: number) => {
    if (latency === 0) return 'N/A';
    return `${latency}ms`;
  };

  const getConnectionQuality = (latency: number) => {
    if (latency === 0) return 'Unknown';
    if (latency < 50) return 'Excellent';
    if (latency < 100) return 'Good';
    if (latency < 200) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Connection Manager
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                isConnected 
                  ? "bg-green-500/10 text-green-600 border-green-200"
                  : "bg-red-500/10 text-red-600 border-red-200"
              )}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {connectionStatus.status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Method</span>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getMethodColor(currentMethod))}
            >
              <div className="flex items-center gap-1">
                {getMethodIcon(currentMethod)}
                {currentMethod.toUpperCase()}
              </div>
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Latency</span>
            <span className={cn(
              "text-sm font-medium",
              getLatencyColor(currentLatency)
            )}>
              {formatLatency(currentLatency)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quality</span>
            <span className="text-sm">
              {getConnectionQuality(currentLatency)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Connection Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-reconnect" className="text-sm">
              Auto Reconnect
            </Label>
            <Switch
              id="auto-reconnect"
              checked={autoReconnect}
              onCheckedChange={setAutoReconnect}
            />
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="flex-1"
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={disconnect}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            )}

            <Button
              onClick={refreshConnection}
              variant="ghost"
              size="sm"
              disabled={isConnecting}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Method Selection */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Connection Method</span>
          <div className="grid grid-cols-3 gap-2">
            {(['websocket', 'sse', 'polling'] as const).map((method) => (
              <Button
                key={method}
                variant={currentMethod === method ? "default" : "outline"}
                size="sm"
                onClick={() => switchMethod(method)}
                disabled={isConnecting}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                {getMethodIcon(method)}
                <span className="text-xs">{method.toUpperCase()}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="space-y-3">
              <span className="text-sm font-medium">Advanced</span>
              
              {/* Latency Statistics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Average Latency</span>
                  <span className={cn(
                    "text-xs font-medium",
                    getLatencyColor(averageLatency)
                  )}>
                    {formatLatency(averageLatency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Measurements</span>
                  <span className="text-xs">{latencyHistory.length}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLatencyHistory(!showLatencyHistory)}
                  className="w-full"
                >
                  {showLatencyHistory ? 'Hide' : 'Show'} Latency History
                </Button>
              </div>

              {/* Latency History Chart */}
              {showLatencyHistory && latencyHistory.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Recent Latency</span>
                  <div className="flex items-end gap-1 h-20">
                    {latencyHistory.slice(-20).map((latency, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-1 bg-primary/20 rounded-t",
                          getLatencyColor(latency).replace('text-', 'bg-').replace('-600', '-500/30')
                        )}
                        style={{
                          height: `${Math.min((latency / 200) * 100, 100)}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <>
            <Separator />
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last Update</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {connectionStatus.lastUpdate 
                ? connectionStatus.lastUpdate.toLocaleTimeString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConnectionManager;
