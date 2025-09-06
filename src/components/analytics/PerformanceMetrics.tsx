"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  DollarSign,
  Percent,
  BarChart3,
  AlertCircle,
  Loader2,
  Trophy,
  Zap
} from "lucide-react";
import { PerformanceMetrics as PerformanceMetricsType } from "@/lib/types/analytics";
import { formatCurrency, formatPercentage, getProfitColor } from "@/lib/utils/analytics";

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType | null;
  isLoading?: boolean;
  className?: string;
}

export function PerformanceMetrics({ metrics, isLoading = false, className }: PerformanceMetricsProps) {
  // Performance rating számítása
  const performanceRating = useMemo(() => {
    if (!metrics) return { rating: 0, label: 'N/A', color: 'text-gray-400' };
    
    const { winRate, roi, profitMargin } = metrics;
    
    // Összetett rating számítás (0-100)
    const rating = Math.round(
      (winRate * 0.4) + // Win rate 40%
      (Math.max(0, Math.min(100, roi + 50)) * 0.3) + // ROI 30% (normalizálva)
      (Math.max(0, Math.min(100, profitMargin + 50)) * 0.3) // Profit margin 30% (normalizálva)
    );
    
    let label: string;
    let color: string;
    
    if (rating >= 80) {
      label = 'Kiváló';
      color = 'text-green-400';
    } else if (rating >= 60) {
      label = 'Jó';
      color = 'text-blue-400';
    } else if (rating >= 40) {
      label = 'Átlagos';
      color = 'text-yellow-400';
    } else if (rating >= 20) {
      label = 'Gyenge';
      color = 'text-orange-400';
    } else {
      label = 'Rossz';
      color = 'text-red-400';
    }
    
    return { rating, label, color };
  }, [metrics]);

  // ROI kategória meghatározása
  const roiCategory = useMemo(() => {
    if (!metrics) return { category: 'N/A', color: 'text-gray-400' };
    
    const { roi } = metrics;
    
    if (roi >= 20) {
      return { category: 'Kiváló', color: 'text-green-400' };
    } else if (roi >= 10) {
      return { category: 'Jó', color: 'text-blue-400' };
    } else if (roi >= 0) {
      return { category: 'Pozitív', color: 'text-yellow-400' };
    } else if (roi >= -10) {
      return { category: 'Negatív', color: 'text-orange-400' };
    } else {
      return { category: 'Rossz', color: 'text-red-400' };
    }
  }, [metrics]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Teljesítmény mutatók betöltése...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nincsenek elérhető teljesítmény mutatók.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Performance Rating */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Teljesítmény Értékelés</span>
          </h3>
          <Badge variant="outline" className={performanceRating.color}>
            {performanceRating.label}
          </Badge>
        </div>
        <Progress value={performanceRating.rating} className="h-2" />
        <p className="text-sm text-muted-foreground mt-1">
          Összesített pontszám: {performanceRating.rating}/100
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Win Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Sikerességi Arány</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPercentage(metrics.winRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalBets} fogadásból
            </p>
            <Progress 
              value={metrics.winRate} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Percent className="h-4 w-4 text-primary" />
              <span>ROI (Return on Investment)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(metrics.roi)}`}>
              {formatPercentage(metrics.roi)}
            </div>
            <p className={`text-xs mt-1 ${roiCategory.color}`}>
              {roiCategory.category} kategória
            </p>
            <Progress 
              value={Math.max(0, Math.min(100, metrics.roi + 50))} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>Összes Profit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(metrics.totalProfit)}`}>
              {formatCurrency(metrics.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Átlag: {formatCurrency(metrics.avgProfitPerBet)} / fogadás
            </p>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Profit Margin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(metrics.profitMargin)}`}>
              {formatPercentage(metrics.profitMargin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit / Kifizetés aránya
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Teljesítmény Elemzés</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-400">
                Legjobb Teljesítmény
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Legnagyobb profit:</span>
                  <span className="text-sm font-medium text-green-400">
                    {formatCurrency(metrics.maxProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sikerességi arány:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(metrics.winRate)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-400">
                Kockázat Elemzés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Legnagyobb veszteség:</span>
                  <span className="text-sm font-medium text-red-400">
                    {formatCurrency(metrics.maxLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit/veszteség arány:</span>
                  <span className="text-sm font-medium">
                    {metrics.maxLoss !== 0 ? (metrics.maxProfit / Math.abs(metrics.maxLoss)).toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Teljesítmény Tippek</h3>
        <div className="space-y-2">
          {metrics.winRate < 50 && (
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                A sikerességi arányod alacsonyabb, mint 50%. Érdemes lehet átgondolni a fogadási stratégiádat.
              </AlertDescription>
            </Alert>
          )}
          
          {metrics.roi < 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A ROI negatív. Jelenleg veszteséges a fogadási tevékenységed. Fontolja meg a stratégia módosítását.
              </AlertDescription>
            </Alert>
          )}
          
          {metrics.winRate >= 60 && metrics.roi > 10 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Kiváló teljesítmény! Magas sikerességi arány és pozitív ROI. Folytasd így!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}