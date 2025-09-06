"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from "lucide-react";
import { BettingTrend } from "@/lib/types/analytics";
import { formatCurrency, formatPercentage, getTrendColor, getTrendIcon } from "@/lib/utils/analytics";

interface BettingTrendsProps {
  trends: BettingTrend[];
  isLoading?: boolean;
  className?: string;
}

export function BettingTrends({ trends, isLoading = false, className }: BettingTrendsProps) {
  // Trend statisztikák számítása
  const trendStats = useMemo(() => {
    if (!trends || trends.length === 0) {
      return {
        totalPeriods: 0,
        upTrends: 0,
        downTrends: 0,
        stableTrends: 0,
        avgProfit: 0,
        totalProfit: 0,
        bestPeriod: null,
        worstPeriod: null,
        consistency: 0
      };
    }

    const upTrends = trends.filter(trend => trend.trend === 'up').length;
    const downTrends = trends.filter(trend => trend.trend === 'down').length;
    const stableTrends = trends.filter(trend => trend.trend === 'stable').length;
    
    const totalProfit = trends.reduce((sum, trend) => sum + trend.profit, 0);
    const avgProfit = totalProfit / trends.length;
    
    const bestPeriod = trends.reduce((best, trend) => 
      trend.profit > best.profit ? trend : best
    );
    const worstPeriod = trends.reduce((worst, trend) => 
      trend.profit < worst.profit ? trend : worst
    );
    
    // Konzisztencia számítása (pozitív trendek aránya)
    const consistency = (upTrends / trends.length) * 100;

    return {
      totalPeriods: trends.length,
      upTrends,
      downTrends,
      stableTrends,
      avgProfit,
      totalProfit,
      bestPeriod,
      worstPeriod,
      consistency
    };
  }, [trends]);

  // Trend irány meghatározása
  const overallTrend = useMemo(() => {
    if (!trends || trends.length < 2) return 'stable';
    
    const recentTrends = trends.slice(-3); // Utolsó 3 periódus
    const upCount = recentTrends.filter(t => t.trend === 'up').length;
    const downCount = recentTrends.filter(t => t.trend === 'down').length;
    
    if (upCount > downCount) return 'up';
    if (downCount > upCount) return 'down';
    return 'stable';
  }, [trends]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Trend adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nincsenek elérhető trend adatok.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Overall Trend Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Általános Trend</span>
          </h3>
          <Badge 
            variant="outline" 
            className={`${getTrendColor(overallTrend)} border-current`}
          >
            {getTrendIcon(overallTrend)} {overallTrend === 'up' ? 'Emelkedő' : overallTrend === 'down' ? 'Csökkenő' : 'Stabil'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Emelkedő</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {trendStats.upTrends}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowDown className="h-4 w-4 text-red-400" />
                <span className="text-sm text-muted-foreground">Csökkenő</span>
              </div>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {trendStats.downTrends}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Stabil</span>
              </div>
              <p className="text-2xl font-bold text-gray-400 mt-1">
                {trendStats.stableTrends}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Konzisztencia</span>
              </div>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatPercentage(trendStats.consistency)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trend Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Trend Részletek</h3>
        
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getTrendColor(trend.trend)} bg-opacity-20`}>
                      {trend.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                      {trend.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                      {trend.trend === 'stable' && <Minus className="h-4 w-4" />}
                    </div>
                    
                    <div>
                      <p className="font-medium">{trend.period}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{trend.totalBets} fogadás</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>{formatPercentage(trend.winRate)} sikerességi arány</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(trend.avgStake)} átlagos tét</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getTrendColor(trend.trend)}`}>
                      {formatCurrency(trend.profit)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`${getTrendColor(trend.trend)} border-current`}
                    >
                      {trend.trend === 'up' ? 'Emelkedő' : trend.trend === 'down' ? 'Csökkenő' : 'Stabil'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Trend Elemzés</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Performance */}
          {trendStats.bestPeriod && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-400">
                  Legjobb Periódus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Periódus:</span>
                    <span className="text-sm font-medium">
                      {trendStats.bestPeriod.period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit:</span>
                    <span className="text-sm font-medium text-green-400">
                      {formatCurrency(trendStats.bestPeriod.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fogadások:</span>
                    <span className="text-sm font-medium">
                      {trendStats.bestPeriod.totalBets}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Worst Performance */}
          {trendStats.worstPeriod && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-400">
                  Legrosszabb Periódus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Periódus:</span>
                    <span className="text-sm font-medium">
                      {trendStats.worstPeriod.period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profit:</span>
                    <span className="text-sm font-medium text-red-400">
                      {formatCurrency(trendStats.worstPeriod.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fogadások:</span>
                    <span className="text-sm font-medium">
                      {trendStats.worstPeriod.totalBets}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Trend Recommendations */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Trend Ajánlások</h3>
        <div className="space-y-2">
          {trendStats.consistency < 50 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A trend konzisztencia alacsony ({formatPercentage(trendStats.consistency)}). 
                Érdemes lehet átgondolni a fogadási stratégiádat a stabilitás javítása érdekében.
              </AlertDescription>
            </Alert>
          )}
          
          {trendStats.consistency >= 70 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Kiváló trend konzisztencia ({formatPercentage(trendStats.consistency)})! 
                A fogadási stratégiád stabil és jól működik.
              </AlertDescription>
            </Alert>
          )}
          
          {overallTrend === 'down' && (
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                Az általános trend csökkenő. Fontolja meg a stratégia módosítását vagy a fogadási gyakoriság csökkentését.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
