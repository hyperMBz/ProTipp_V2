"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Activity
} from "lucide-react";
import { useConnectionStatus } from "@/lib/hooks/use-real-time";
import { cn } from "@/lib/utils";

interface RealTimeStatusProps {
  className?: string;
  showDetails?: boolean;
  onRefresh?: () => void;
}

export function RealTimeStatus({ 
  className, 
  showDetails = false,
  onRefresh 
}: RealTimeStatusProps) {
  const connectionStatus = useConnectionStatus({
    autoConnect: true,
    preferredMethod: 'websocket'
  });

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'connecting':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getMethodColor = () => {
    switch (connectionStatus.method) {
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

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4" />
            Real-time Status
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={connectionStatus.status === 'connecting'}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Connection</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getStatusColor())}
          >
            {connectionStatus.status}
          </Badge>
        </div>

        {/* Connection Method */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Method</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getMethodColor())}
          >
            {connectionStatus.method.toUpperCase()}
          </Badge>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Latency</span>
          <span className={cn(
            "text-sm font-medium",
            getLatencyColor(connectionStatus.latency)
          )}>
            {formatLatency(connectionStatus.latency)}
          </span>
        </div>

        {/* Health Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Health</span>
          <div className="flex items-center gap-1">
            {connectionStatus.isHealthy ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs">
              {connectionStatus.isHealthy ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Update</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs">
              {formatLastUpdate(connectionStatus.lastUpdate)}
            </span>
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            {/* Connection Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Connection Quality</span>
                <span>{connectionStatus.isHealthy ? '100%' : '0%'}</span>
              </div>
              <Progress 
                value={connectionStatus.isHealthy ? 100 : 0} 
                className="h-2"
              />
            </div>

            {/* Error Message */}
            {connectionStatus.errorMessage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600">
                  {connectionStatus.errorMessage}
                </p>
              </div>
            )}

            {/* Connection Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Method:</span>
                <p className="font-medium">{connectionStatus.method}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{connectionStatus.status}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RealTimeStatus;
