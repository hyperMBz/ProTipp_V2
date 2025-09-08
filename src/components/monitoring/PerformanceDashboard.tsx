"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformance, useApiPerformance } from '@/hooks/use-performance';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  Monitor, 
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';

interface PerformanceMetrics {
  buildTime: number;
  bundleSize: Record<string, number>;
  totalBundleSize: number;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  recommendations: string[];
  lastUpdated: string;
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  // Real-time performance metrics
  const { 
    metrics: realTimeMetrics, 
    isSupported: isPerformanceSupported,
    getOverallScore,
    getPerformanceGrade 
  } = usePerformance();
  
  const { 
    apiMetrics, 
    getAverageApiTime, 
    getApiSuccessRate 
  } = useApiPerformance();

  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockMetrics: PerformanceMetrics = {
    buildTime: 97,
    bundleSize: {
      'main.js': 245,
      'framework.js': 156,
      'vendor.js': 89,
      'pages.js': 67,
    },
    totalBundleSize: 557,
    lighthouse: {
      performance: 94,
      accessibility: 98,
      bestPractices: 96,
      seo: 92,
    },
    recommendations: [
      'Optimize main.js bundle size',
      'Consider lazy loading for large dependencies',
      'Update outdated dependencies',
    ],
    lastUpdated: new Date().toISOString(),
  };

  const mockSystemStatus: SystemStatus = {
    status: 'healthy',
    uptime: 99.9,
    responseTime: 145,
    errorRate: 0.1,
    activeUsers: 1247,
  };

  useEffect(() => {
    loadMetrics();
    loadSystemStatus();
  }, []);

  const loadMetrics = async () => {
    try {
      // In production, this would fetch real metrics from your monitoring service
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      // In production, this would fetch real system status
      setSystemStatus(mockSystemStatus);
    } catch (error) {
      console.error('Failed to load system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadMetrics(), loadSystemStatus()]);
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and analyze your application's performance metrics
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.status)}
                <span className={`text-2xl font-bold ${getStatusColor(systemStatus.status)}`}>
                  {systemStatus.status.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {systemStatus.uptime}%
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {systemStatus.responseTime}ms
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {systemStatus.activeUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
            <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="gradient-bg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Build Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Build Time</span>
                    <Badge variant={metrics.buildTime > 120 ? 'destructive' : 'default'}>
                      {metrics.buildTime}s
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Bundle Size</span>
                    <Badge variant={metrics.totalBundleSize > 500 ? 'destructive' : 'default'}>
                      {metrics.totalBundleSize}KB
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-bg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <Badge variant={(systemStatus?.errorRate ?? 0) > 1 ? 'destructive' : 'default'}>
                      {systemStatus?.errorRate ?? 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(metrics.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bundle" className="space-y-4">
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle>Bundle Size Analysis</CardTitle>
                <CardDescription>
                  Breakdown of JavaScript bundle sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics.bundleSize).map(([chunk, size]) => (
                  <div key={chunk} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{chunk}</span>
                      <Badge variant={size > 200 ? 'destructive' : 'default'}>
                        {size}KB
                      </Badge>
                    </div>
                    <Progress 
                      value={(size / 500) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lighthouse" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metrics.lighthouse).map(([category, score]) => (
                <Card key={category} className="gradient-bg border-primary/20">
                  <CardHeader>
                    <CardTitle className="capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          <span className={getScoreColor(score)}>{score}%</span>
                        </span>
                        <Badge variant={score >= 90 ? 'default' : 'destructive'}>
                          {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>
                  Actionable insights to improve your application's performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.recommendations.length > 0 ? (
                  metrics.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No performance recommendations at this time. Great job!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PerformanceDashboard;
