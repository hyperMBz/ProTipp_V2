"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Settings, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Widget típusok
export type WidgetType = 'arbitrage' | 'odds' | 'analytics' | 'profit' | 'alerts' | 'custom';

// Widget állapotok
export type WidgetStatus = 'loading' | 'success' | 'error' | 'warning' | 'idle';

// Widget props
interface DashboardWidgetProps {
  id: string;
  title: string;
  description?: string;
  type: WidgetType;
  status?: WidgetStatus;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onSettings?: () => void;
  isMaximized?: boolean;
  isRefreshing?: boolean;
  showControls?: boolean;
  showStatus?: boolean;
  error?: string;
  lastUpdated?: Date;
  refreshInterval?: number;
}

export function DashboardWidget({
  id,
  title,
  description,
  type,
  status = 'idle',
  children,
  className,
  onRefresh,
  onMaximize,
  onMinimize,
  onSettings,
  isMaximized = false,
  isRefreshing = false,
  showControls = true,
  showStatus = true,
  error,
  lastUpdated,
  refreshInterval
}: DashboardWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Status badge színek
  const getStatusColor = (status: WidgetStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'loading':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  // Status ikon
  const getStatusIcon = (status: WidgetStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3" />;
      case 'loading':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Widget típus ikon
  const getTypeIcon = (type: WidgetType) => {
    switch (type) {
      case 'arbitrage':
        return <TrendingUp className="h-4 w-4" />;
      case 'odds':
        return <TrendingDown className="h-4 w-4" />;
      case 'analytics':
        return <TrendingUp className="h-4 w-4" />;
      case 'profit':
        return <TrendingUp className="h-4 w-4" />;
      case 'alerts':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Refresh kezelése
  const handleRefresh = useCallback(() => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  }, [onRefresh, isRefreshing]);

  // Auto refresh kezelése
  React.useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh, handleRefresh]);

  return (
    <Card 
      className={cn(
        "h-full transition-all duration-200 group",
        "border-primary/20 bg-gradient-to-br from-background to-background/50",
        "backdrop-blur-sm hover:shadow-lg hover:border-primary/30",
        isMaximized && "ring-2 ring-primary/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="flex items-center space-x-2 text-primary">
              {getTypeIcon(type)}
              <CardTitle className="text-sm font-semibold truncate">
                {title}
              </CardTitle>
            </div>
            
            {description && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {description}
              </Badge>
            )}

            {showStatus && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs shrink-0",
                  getStatusColor(status)
                )}
              >
                {getStatusIcon(status)}
              </Badge>
            )}
          </div>

          {showControls && (
            <div className={cn(
              "flex items-center space-x-1 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Frissítés"
              >
                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
              </Button>

              {/* Maximize/Minimize Button */}
              {(onMaximize || onMinimize) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  onClick={isMaximized ? onMinimize : onMaximize}
                  title={isMaximized ? "Kicsinyítés" : "Nagyítás"}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                </Button>
              )}

              {/* Settings Button */}
              {onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  onClick={onSettings}
                  title="Beállítások"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}

              {/* More Options */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                title="További opciók"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-2 p-2 bg-red-400/10 border border-red-400/20 rounded-md">
            <div className="flex items-center space-x-2 text-red-400 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-1 text-xs text-muted-foreground">
            Utoljára frissítve: {lastUpdated.toLocaleTimeString('hu-HU')}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 h-full">
        <div className="h-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Widget wrapper komponens
interface WidgetWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function WidgetWrapper({ children, className }: WidgetWrapperProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      {children}
    </div>
  );
}

// Widget loading skeleton
export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("h-full animate-pulse", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-6 w-6 bg-muted rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
