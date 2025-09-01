"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  TrendingUp, 
  TrendingDown,
  Play,
  Square,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { usePerformance } from "@/lib/hooks/use-performance";
import { CDNStatus } from "./CDNStatus";
import { LoadBalancerStatus } from "./LoadBalancerStatus";

interface PerformanceMonitorProps {
  className?: string;
  showCDN?: boolean;
  showLoadBalancer?: boolean;
}

export function PerformanceMonitor({ 
  className, 
  showCDN = true, 
  showLoadBalancer = true 
}: PerformanceMonitorProps) {
  const [state, actions] = usePerformance();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return "text-green-400";
    if (value <= threshold) return "text-yellow-400";
    return "text-red-400";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Monitoring Controls */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Teljesítmény Monitorozás
          </CardTitle>
          <CardDescription>
            Valós idejű teljesítmény metrikák és alert-ek kezelése
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={state.isMonitoring ? actions.stopMonitoring : actions.startMonitoring}
              variant={state.isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {state.isMonitoring ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Leállítás
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Indítás
                </>
              )}
            </Button>
            
            <Button
              onClick={() => actions.clearCache()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cache Törlés
            </Button>

            <Badge variant={state.isMonitoring ? "default" : "secondary"}>
              {state.isMonitoring ? "Aktív" : "Inaktív"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Átlagos Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(state.performanceStats.averageResponseTime, 1000)}>
                {formatTime(state.performanceStats.averageResponseTime)}
              </span>
            </div>
            <Progress 
              value={(state.performanceStats.averageResponseTime / 1000) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - state.cacheStats.hitRate, 30)}>
                {formatPercentage(state.cacheStats.hitRate)}
              </span>
            </div>
            <Progress 
              value={state.cacheStats.hitRate} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(state.performanceStats.peakMemoryUsage, 512)}>
                {state.performanceStats.peakMemoryUsage.toFixed(0)} MB
              </span>
            </div>
            <Progress 
              value={(state.performanceStats.peakMemoryUsage / 512) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - state.performanceStats.averageThroughput, 50)}>
                {state.performanceStats.averageThroughput.toFixed(0)} req/s
              </span>
            </div>
            <Progress 
              value={(state.performanceStats.averageThroughput / 100) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {state.alerts.length > 0 && (
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Aktív Alert-ek ({state.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className="border-yellow-200 bg-yellow-50/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="text-sm">
                      {alert.message} - {alert.metric.value.toFixed(2)} {alert.metric.unit}
                    </AlertDescription>
                  </div>
                  <Button
                    onClick={() => actions.resolveAlert(alert.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Feloldás
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Performance */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Database className="h-5 w-5" />
              Query Teljesítmény
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Átlagos Response Time:</span>
              <span className={getStatusColor(state.queryStats.averageResponseTime, 1000)}>
                {formatTime(state.queryStats.averageResponseTime)}
              </span>
            </div>
            
            {state.queryStats.slowQueries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Lassú Lekérdezések:</h4>
                <div className="space-y-2">
                  {state.queryStats.slowQueries.slice(0, 3).map((query, index) => (
                    <div key={index} className="text-xs bg-red-50/10 p-2 rounded">
                      {query.query.slice(0, 50)}... - {formatTime(query.executionTime)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache Stats */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cache Statisztikák
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Hits:</span>
                <div className="text-lg font-semibold text-green-400">
                  {state.cacheStats.hits.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Misses:</span>
                <div className="text-lg font-semibold text-red-400">
                  {state.cacheStats.misses.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Cache Size:</span>
              <div className="text-lg font-semibold">
                {state.cacheStats.size} items
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Memory Usage:</span>
              <div className="text-lg font-semibold">
                {(state.cacheStats.memoryUsage / 1024).toFixed(2)} KB
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Report */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Teljesítmény Riport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={actions.getPerformanceReport}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Riport Generálása
          </Button>
        </CardContent>
      </Card>

      {/* CDN Status */}
      {showCDN && (
        <div className="col-span-1">
          <CDNStatus />
        </div>
      )}

      {/* Load Balancer Status */}
      {showLoadBalancer && (
        <div className="col-span-1">
          <LoadBalancerStatus />
        </div>
      )}
    </div>
  );
}
