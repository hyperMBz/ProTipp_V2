"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  HardDrive, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { useCDN } from "@/lib/hooks/use-performance";

interface CDNStatusProps {
  className?: string;
}

export function CDNStatus({ className }: CDNStatusProps) {
  const {
    cdnStats,
    healthStatus,
    isLoading,
    refreshStats,
    checkHealth,
  } = useCDN();

  const getHealthIcon = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const cacheHitRate = cdnStats.totalRequests > 0 
    ? (cdnStats.cacheHits / cdnStats.totalRequests) * 100 
    : 0;

  const bandwidthSavedMB = cdnStats.bandwidthSaved / (1024 * 1024);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* CDN Health Status */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            CDN Health Status
            {getHealthIcon()}
          </CardTitle>
          <CardDescription>
            Content Delivery Network állapot és teljesítmény
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge 
              variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
              className="capitalize"
            >
              {healthStatus.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Response Time</span>
            <span className="text-sm font-medium">
              {healthStatus.responseTime.toFixed(2)}ms
            </span>
          </div>

          {healthStatus.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {healthStatus.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkHealth}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Health Check
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshStats}
              disabled={isLoading}
              className="flex-1"
            >
              <Activity className="h-3 w-3 mr-1" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CDN Performance Metrics */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Hit Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
              <span className="text-sm font-medium">{cacheHitRate.toFixed(1)}%</span>
            </div>
            <Progress value={cacheHitRate} className="h-2" />
          </div>

          {/* Request Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Cache Hits</span>
              </div>
              <span className="text-lg font-semibold">{cdnStats.cacheHits.toLocaleString()}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-xs text-muted-foreground">Cache Misses</span>
              </div>
              <span className="text-lg font-semibold">{cdnStats.cacheMisses.toLocaleString()}</span>
            </div>
          </div>

          {/* Bandwidth Savings */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Bandwidth Saved</span>
            </div>
            <span className="text-lg font-semibold">{bandwidthSavedMB.toFixed(2)} MB</span>
          </div>

          {/* Response Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Avg Response Time</span>
            </div>
            <span className="text-lg font-semibold">{cdnStats.averageResponseTime.toFixed(2)}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* CDN Statistics */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            CDN Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total Requests</span>
              <span className="text-lg font-semibold">{cdnStats.totalRequests.toLocaleString()}</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Errors</span>
              <span className="text-lg font-semibold text-red-500">{cdnStats.errors}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
