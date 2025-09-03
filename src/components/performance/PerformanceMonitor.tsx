"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, Database, AlertTriangle, CheckCircle, XCircle, Refresh, TrendingUp, TrendingDown } from 'lucide-react';
import { usePerformance, useMetrics, useAlerts, useCacheStats } from '@/lib/hooks/use-performance';
import { cn } from '@/lib/utils';

interface PerformanceMonitorProps {
  className?: string;
  refreshInterval?: number;
}

export function PerformanceMonitor({ className, refreshInterval = 30000 }: PerformanceMonitorProps) {
  const [selectedMetric, setSelectedMetric] = useState<'response_time' | 'error_rate' | 'memory_usage' | 'cache_hit_rate'>('response_time');
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week'>('hour');

  const performance = usePerformance(refreshInterval);
  const metrics = useMetrics(selectedMetric, selectedPeriod);
  const alerts = useAlerts();
  const cacheStats = useCacheStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard
          title="Átlagos Válaszidő"
          value={`${performance.avgResponseTime.toFixed(0)}ms`}
          icon={<Zap className="h-4 w-4" />}
          trend={performance.avgResponseTime < 1000 ? 'good' : performance.avgResponseTime < 2000 ? 'warning' : 'critical'}
          description="API és oldal válaszidők"
        />
        
        <PerformanceCard
          title="Hibaarány"
          value={`${performance.errorRate.toFixed(1)}%`}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={performance.errorRate < 1 ? 'good' : performance.errorRate < 5 ? 'warning' : 'critical'}
          description="Sikertelen kérések aránya"
        />
        
        <PerformanceCard
          title="Memóriahasználat"
          value={`${performance.memoryUsage.toFixed(0)}MB`}
          icon={<Database className="h-4 w-4" />}
          trend={performance.memoryUsage < 50 ? 'good' : performance.memoryUsage < 100 ? 'warning' : 'critical'}
          description="Aktuális memória használat"
        />
        
        <PerformanceCard
          title="Cache Találat"
          value={`${performance.cacheHitRate.toFixed(0)}%`}
          icon={<Activity className="h-4 w-4" />}
          trend={performance.cacheHitRate > 80 ? 'good' : performance.cacheHitRate > 60 ? 'warning' : 'critical'}
          description="Cache hatékonyság"
        />
      </div>

      {/* Active Alerts */}
      {alerts.alerts.length > 0 && (
        <Card className="gradient-bg border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Aktív Riasztások ({alerts.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.alerts.map((alert) => (
                <Alert key={alert.id} className={cn(
                  "border-l-4",
                  alert.severity === 'critical' && "border-l-red-500 bg-red-500/10",
                  alert.severity === 'high' && "border-l-orange-500 bg-orange-500/10",
                  alert.severity === 'medium' && "border-l-yellow-500 bg-yellow-500/10",
                  alert.severity === 'low' && "border-l-blue-500 bg-blue-500/10"
                )}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.metric_type.replace('_', ' ').toUpperCase()}</span>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Aktuális érték: {alert.current_value} (Küszöb: {alert.threshold})
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => alerts.resolveAlert(alert.id)}
                    >
                      Megoldva
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Charts */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Teljesítmény Metrikák
              </CardTitle>
              <CardDescription>
                Valós idejű teljesítmény monitoring és trendek
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={metrics.refresh}
                disabled={metrics.isLoading}
              >
                <Refresh className={cn("h-4 w-4", metrics.isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="response_time">Válaszidő</TabsTrigger>
              <TabsTrigger value="error_rate">Hibaarány</TabsTrigger>
              <TabsTrigger value="memory_usage">Memória</TabsTrigger>
              <TabsTrigger value="cache_hit_rate">Cache</TabsTrigger>
            </TabsList>

            <div className="mt-4 mb-4 flex gap-2">
              {(['hour', 'day', 'week'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'hour' && '1 óra'}
                  {period === 'day' && '1 nap'}
                  {period === 'week' && '1 hét'}
                </Button>
              ))}
            </div>

            <TabsContent value={selectedMetric} className="space-y-4">
              {metrics.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{metrics.stats.latest.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Jelenlegi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.stats.avg.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Átlag</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{metrics.stats.min.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Minimum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{metrics.stats.max.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Maximum</div>
                  </div>
                </div>
              )}

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Cache Teljesítmény
          </CardTitle>
          <CardDescription>
            Cache használat és hatékonyság statisztikák
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {cacheStats.stats.hit_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Találati Arány</div>
              <Badge 
                variant={cacheStats.health === 'excellent' ? 'default' : 
                         cacheStats.health === 'good' ? 'secondary' : 'destructive'}
                className="mt-1"
              >
                {cacheStats.health === 'excellent' && 'Kiváló'}
                {cacheStats.health === 'good' && 'Jó'}
                {cacheStats.health === 'fair' && 'Elfogadható'}
                {cacheStats.health === 'poor' && 'Gyenge'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {cacheStats.stats.total_keys}
              </div>
              <div className="text-sm text-muted-foreground">Tárolt Kulcsok</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">
                {(cacheStats.stats.memory_usage * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Memória Használat</div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={cacheStats.clearCache}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Cache Törlése
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PerformanceCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'good' | 'warning' | 'critical';
  description: string;
}

function PerformanceCard({ title, value, icon, trend, description }: PerformanceCardProps) {
  const trendColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  const trendIcons = {
    good: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    critical: <XCircle className="h-4 w-4" />,
  };

  return (
    <Card className="gradient-bg border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("flex items-center", trendColors[trend])}>
            {icon}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <div className={cn("flex items-center", trendColors[trend])}>
            {trendIcons[trend]}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
