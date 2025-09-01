"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
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
  Loader2,
  Scale,
  Network
} from "lucide-react";
import { useLoadBalancer } from "@/lib/hooks/use-performance";

interface LoadBalancerStatusProps {
  className?: string;
}

export function LoadBalancerStatus({ className }: LoadBalancerStatusProps) {
  const {
    loadBalancerStats,
    serverStatuses,
    isLoading,
    refreshStats,
  } = useLoadBalancer();

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const healthyServersPercentage = loadBalancerStats.serverCount > 0 
    ? (loadBalancerStats.healthyServers / loadBalancerStats.serverCount) * 100 
    : 0;

  const errorRatePercentage = loadBalancerStats.totalRequests > 0 
    ? (loadBalancerStats.errorRate * 100) 
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Load Balancer Overview */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Load Balancer Overview
          </CardTitle>
          <CardDescription>
            Szerverek állapota és auto-scaling események
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server Health Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Healthy Servers</span>
              <span className="text-sm font-medium">
                {loadBalancerStats.healthyServers} / {loadBalancerStats.serverCount}
              </span>
            </div>
            <Progress value={healthyServersPercentage} className="h-2" />
          </div>

          {/* Auto Scaling Events */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Auto Scaling Events</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              {loadBalancerStats.autoScalingEvents}
            </Badge>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshStats}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="text-sm font-medium">{errorRatePercentage.toFixed(2)}%</span>
            </div>
            <Progress value={errorRatePercentage} className="h-2" />
          </div>

          {/* Request Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Network className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Requests</span>
              </div>
              <span className="text-lg font-semibold">{loadBalancerStats.totalRequests.toLocaleString()}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Active Connections</span>
              </div>
              <span className="text-lg font-semibold">{loadBalancerStats.activeConnections}</span>
            </div>
          </div>

          {/* Response Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-muted-foreground">Avg Response Time</span>
            </div>
            <span className="text-lg font-semibold">{loadBalancerStats.averageResponseTime.toFixed(2)}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Server Status List */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serverStatuses.length === 0 ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading server status...</p>
              </div>
            ) : (
              serverStatuses.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getHealthIcon(server.health)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{server.id}</span>
                        <Badge 
                          variant={server.health === 'healthy' ? 'default' : 'destructive'}
                          className="text-xs capitalize"
                        >
                          {server.health}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{server.url}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">{server.responseTime.toFixed(2)}ms</div>
                    <div className="text-xs text-muted-foreground">
                      {server.activeConnections} connections
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto Scaling Alerts */}
      {loadBalancerStats.autoScalingEvents > 0 && (
        <Alert>
          <Scale className="h-4 w-4" />
          <AlertDescription>
            {loadBalancerStats.autoScalingEvents} auto-scaling event(s) detected in the last period.
            The system is automatically adjusting server capacity based on load.
          </AlertDescription>
        </Alert>
      )}

      {/* Health Warnings */}
      {loadBalancerStats.healthyServers < loadBalancerStats.serverCount && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {loadBalancerStats.serverCount - loadBalancerStats.healthyServers} server(s) are currently unhealthy.
            Check server configurations and network connectivity.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
