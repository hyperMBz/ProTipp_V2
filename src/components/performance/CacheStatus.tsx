"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Clock,
  HardDrive,
  Activity,
  BarChart3
} from "lucide-react";
import { useCacheStatus } from "@/lib/hooks/use-performance";

interface CacheStatusProps {
  className?: string;
}

export function CacheStatus({ className }: CacheStatusProps) {
  const { cacheStats, isLoading, refreshStats, clearCache, warmCache } = useCacheStatus();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return "text-green-400";
    if (hitRate >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getHitRateStatus = (hitRate: number) => {
    if (hitRate >= 80) return "Kiváló";
    if (hitRate >= 60) return "Jó";
    if (hitRate >= 40) return "Közepes";
    return "Gyenge";
  };

  const getEfficiencyScore = () => {
    const hitRate = cacheStats.hitRate;
    const sizeEfficiency = Math.min(100, (cacheStats.size / 1000) * 100); // 1000 item = 100%
    
    return Math.round((hitRate * 0.7) + (sizeEfficiency * 0.3));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cache Overview */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Státusz
          </CardTitle>
          <CardDescription>
            Redis és memory cache teljesítmény monitorozás
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshStats}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Frissítés
            </Button>
            
            <Button
              onClick={() => clearCache()}
              variant="destructive"
              size="sm"
              disabled={isLoading}
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Cache Törlés
            </Button>

            <Badge variant="outline" className="ml-auto">
              <Activity className="h-3 w-3 mr-1" />
              {isLoading ? "Frissítés..." : "Aktív"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Rate */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getHitRateColor(cacheStats.hitRate)}>
                {cacheStats.hitRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {getHitRateStatus(cacheStats.hitRate)}
            </div>
            <Progress 
              value={cacheStats.hitRate} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Total Requests */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Összes Kérés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {(cacheStats.hits + cacheStats.misses).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Hits: {cacheStats.hits.toLocaleString()} | Misses: {cacheStats.misses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Cache Size */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Cache Méret
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {cacheStats.size.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(cacheStats.memoryUsage)}
            </div>
            <Progress 
              value={(cacheStats.size / 1000) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Efficiency Score */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Hatékonyság
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {getEfficiencyScore()}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Teljesítmény pontszám
            </div>
            <Progress 
              value={getEfficiencyScore()} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cache Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hit/Miss Breakdown */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hit/Miss Részletezés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50/10 rounded-lg border border-green-200/20">
                <div className="text-2xl font-bold text-green-400">
                  {cacheStats.hits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Cache Hits</div>
                <div className="text-xs text-green-400 mt-1">
                  {((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50/10 rounded-lg border border-red-200/20">
                <div className="text-2xl font-bold text-red-400">
                  {cacheStats.misses.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Cache Misses</div>
                <div className="text-xs text-red-400 mt-1">
                  {((cacheStats.misses / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Összes kérés:</span>
                <span className="font-semibold">
                  {(cacheStats.hits + cacheStats.misses).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hit rate:</span>
                <span className={`font-semibold ${getHitRateColor(cacheStats.hitRate)}`}>
                  {cacheStats.hitRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Operations */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Cache Műveletek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={() => clearCache('odds')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Odds Cache Törlése
              </Button>
              
              <Button
                onClick={() => clearCache('arbitrage')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Arbitrage Cache Törlése
              </Button>
              
              <Button
                onClick={() => clearCache('analytics')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Cache Törlése
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">Cache Warming</div>
              <Button
                onClick={() => warmCache(
                  ['odds_football', 'odds_basketball', 'arbitrage_opportunities'],
                  async (key) => {
                    // Példa data provider
                    return { data: 'warmed', timestamp: Date.now() };
                  }
                )}
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Cache Warming Indítása
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Performance Tips */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Teljesítmény Javaslatok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cacheStats.hitRate < 60 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50/10 rounded-lg border border-yellow-200/20">
              <TrendingDown className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-400">Alacsony Cache Hit Rate</div>
                <div className="text-xs text-muted-foreground">
                  A cache hit rate {cacheStats.hitRate.toFixed(1)}% - javasolt a cache warming és TTL optimalizálás
                </div>
              </div>
            </div>
          )}
          
          {cacheStats.size > 800 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50/10 rounded-lg border border-blue-200/20">
              <HardDrive className="h-4 w-4 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-400">Nagy Cache Méret</div>
                <div className="text-xs text-muted-foreground">
                  Cache méret: {cacheStats.size} items - fontold meg a régi adatok törlését
                </div>
              </div>
            </div>
          )}
          
          {cacheStats.hitRate >= 80 && (
            <div className="flex items-start gap-2 p-3 bg-green-50/10 rounded-lg border border-green-200/20">
              <TrendingUp className="h-4 w-4 text-green-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-green-400">Kiváló Cache Teljesítmény</div>
                <div className="text-xs text-muted-foreground">
                  Cache hit rate {cacheStats.hitRate.toFixed(1)}% - a cache rendszer optimálisan működik
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
