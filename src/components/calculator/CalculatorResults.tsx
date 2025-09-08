/**
 * Kalkulátor eredmények komponens
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Save, 
  Share2,
  Calculator,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculatorResultsProps } from '@/lib/types/calculator';
import { 
  formatCurrency, 
  formatPercentage, 
  getProfitColorClass, 
  getProfitCategory 
} from '@/lib/utils/calculator';
import { useHydrationSafeNumber } from '@/lib/utils/hydration-safe';

/**
 * Kalkulátor eredmények komponens
 * Profit, kifizetés és ROI megjelenítése
 */
export function CalculatorResults({
  result,
  opportunity,
  onSave,
  onShare
}: CalculatorResultsProps) {
  const profitCategory = result ? getProfitCategory(result.profit) : 'neutral';
  const profitColorClass = result ? getProfitColorClass(result.profit) : 'text-muted-foreground';

  // Hydration-safe odds értékek
  const bet1Odds = useHydrationSafeNumber(opportunity?.bet1?.odds, 0);
  const bet2Odds = useHydrationSafeNumber(opportunity?.bet2?.odds, 0);

  const getProfitIcon = () => {
    switch (profitCategory) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'neutral':
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProfitBadgeVariant = () => {
    switch (profitCategory) {
      case 'positive':
        return 'default' as const;
      case 'negative':
        return 'destructive' as const;
      case 'neutral':
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card className="gradient-bg border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Számítási Eredmények</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mérkőzés információk */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{opportunity?.event || 'N/A'}</h4>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {opportunity?.sport || 'N/A'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {opportunity?.bet1?.bookmaker || 'N/A'}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {bet1Odds > 0 ? bet1Odds.toFixed(2) : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {opportunity?.bet2?.bookmaker || 'N/A'}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {bet2Odds > 0 ? bet2Odds.toFixed(2) : 'N/A'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Számítási eredmények */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tét */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tét</span>
            </div>
            <p className="text-lg font-semibold">
              {result ? formatCurrency(result.stake) : '0'}
            </p>
          </div>

          {/* Kifizetés */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kifizetés</span>
            </div>
            <p className="text-lg font-semibold">
              {result ? formatCurrency(result.payout) : '0'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Profit és ROI */}
        <div className="space-y-3">
          {/* Profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getProfitIcon()}
              <span className="text-sm font-medium">Profit</span>
            </div>
            <div className="text-right">
              <p className={cn("text-lg font-semibold", profitColorClass)}>
                {result ? formatCurrency(result.profit) : '0'}
              </p>
              <p className={cn("text-xs", profitColorClass)}>
                {result ? formatPercentage(result.profitPercentage) : '0%'}
              </p>
            </div>
          </div>

          {/* ROI */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ROI</span>
            <Badge 
              variant={getProfitBadgeVariant()}
              className="text-xs"
            >
              {result ? formatPercentage(result.roi) : '0%'}
            </Badge>
          </div>
        </div>

        {/* Művelet gombok */}
        {(onSave || onShare) && (
          <>
            <Separator />
            <div className="flex space-x-2">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Mentés
                </Button>
              )}
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Megosztás
                </Button>
              )}
            </div>
          </>
        )}

        {/* Profit kategória magyarázat */}
        {profitCategory === 'positive' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-400">
              ✅ Pozitív profit! Ez a fogadás potenciálisan nyereséges lehet.
            </p>
          </div>
        )}

        {profitCategory === 'negative' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">
              ⚠️ Negatív profit. Ez a fogadás veszteséges lehet.
            </p>
          </div>
        )}

        {profitCategory === 'neutral' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚖️ Semleges profit. Nincs nyereség vagy veszteség.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Kalkulátor eredmények komponens memoizált verziója
 */
export const MemoizedCalculatorResults = React.memo(CalculatorResults, (prevProps, nextProps) => {
  return (
    prevProps.result?.stake === nextProps.result?.stake &&
    prevProps.result?.payout === nextProps.result?.payout &&
    prevProps.result?.profit === nextProps.result?.profit &&
    prevProps.opportunity?.id === nextProps.opportunity?.id
  );
});

MemoizedCalculatorResults.displayName = 'MemoizedCalculatorResults';
