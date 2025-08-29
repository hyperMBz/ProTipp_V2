"use client";

// Bookmaker Status Component
// Story 1.1 Task 5: Create Bookmaker UI Components

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Globe,
  Zap,
  Database,
  BarChart3,
  Target,
  AlertTriangle
} from "lucide-react";
import { useBookmakers, useBookmakerManager } from "@/lib/hooks/use-bookmakers";
import { BookmakerIntegration } from "@/lib/api/bookmakers/base";

interface StatusCardProps {
  title: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

function StatusCard({ title, value, total, icon, color, description }: StatusCardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {percentage.toFixed(1)}% of total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface BookmakerStatusItemProps {
  bookmaker: BookmakerIntegration;
}

function BookmakerStatusItem({ bookmaker }: BookmakerStatusItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getApiTypeIcon = (apiType: string) => {
    switch (apiType) {
      case 'REST':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'WebSocket':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'GraphQL':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {getStatusIcon(bookmaker.status)}
        <div>
          <div className="font-medium">{bookmaker.name}</div>
          <div className="text-sm text-muted-foreground">
            {bookmaker.bookmaker_id}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getApiTypeIcon(bookmaker.api_type)}
          <span className="text-sm">{bookmaker.api_type}</span>
        </div>
        
        {getStatusBadge(bookmaker.status)}
        
        <div className="text-right">
          <div className="text-sm font-medium">
            {formatLastSync(bookmaker.last_sync)}
          </div>
          {bookmaker.error_count > 0 && (
            <div className="text-xs text-red-500">
              {bookmaker.error_count} errors
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookmakerStatus() {
  const { status, stats, isLoading, error, refetch, checkHealth, isHealthChecking } = useBookmakers();
  const { manager, isInitialized } = useBookmakerManager();

  const activeBookmakers = status.filter(b => b.status === 'active').length;
  const errorBookmakers = status.filter(b => b.status === 'error').length;
  const inactiveBookmakers = status.filter(b => b.status === 'inactive').length;
  const totalBookmakers = status.length;

  const healthPercentage = totalBookmakers > 0 ? (activeBookmakers / totalBookmakers) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Bookmaker Status
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of bookmaker API health and performance
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
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => checkHealth()}
            disabled={isHealthChecking}
            variant="outline"
            size="sm"
          >
            <Activity className={`h-4 w-4 ${isHealthChecking ? 'animate-spin' : ''}`} />
            Health Check
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error loading bookmaker status</span>
            </div>
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Bookmakers"
          value={totalBookmakers}
          total={totalBookmakers}
          icon={<Database className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/20"
          description="Configured APIs"
        />
        
        <StatusCard
          title="Active"
          value={activeBookmakers}
          total={totalBookmakers}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/20"
          description="Healthy connections"
        />
        
        <StatusCard
          title="Errors"
          value={errorBookmakers}
          total={totalBookmakers}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          color="bg-red-100 dark:bg-red-900/20"
          description="Failed connections"
        />
        
        <StatusCard
          title="Inactive"
          value={inactiveBookmakers}
          total={totalBookmakers}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-100 dark:bg-yellow-900/20"
          description="Disconnected APIs"
        />
      </div>

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Health
          </CardTitle>
          <CardDescription>
            System-wide bookmaker API health status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Health Score</p>
              <p className="text-2xl font-bold">{healthPercentage.toFixed(1)}%</p>
            </div>
            <div className="flex items-center gap-2">
              {healthPercentage >= 80 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : healthPercentage >= 50 ? (
                <Target className="h-5 w-5 text-yellow-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {healthPercentage >= 80 ? 'Excellent' : healthPercentage >= 50 ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>
          
          <Progress value={healthPercentage} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{activeBookmakers}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{inactiveBookmakers}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{errorBookmakers}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Bookmaker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bookmaker Details
          </CardTitle>
          <CardDescription>
            Individual status for each configured bookmaker
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading bookmaker status...</span>
            </div>
          ) : status.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No bookmakers configured</h3>
              <p className="text-sm text-muted-foreground">
                Add bookmaker APIs to start monitoring their status
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {status.map((bookmaker) => (
                <BookmakerStatusItem key={bookmaker.bookmaker_id} bookmaker={bookmaker} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
