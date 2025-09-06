/**
 * Kalkulátor form komponens
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  RotateCcw, 
  AlertCircle,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculatorFormProps } from '@/lib/types/calculator';
import { validateStake, formatCurrency } from '@/lib/utils/calculator';

/**
 * Kalkulátor form komponens
 * Tét bevitel és számítás indítása
 */
export function CalculatorForm({
  opportunity,
  onCalculate,
  onReset,
  isLoading = false,
  error = null
}: CalculatorFormProps) {
  const [stake, setStake] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  // Tét validálása
  useEffect(() => {
    if (stake === '') {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    const stakeNumber = parseFloat(stake);
    const validation = validateStake(stakeNumber, 0, 1000000);
    
    setValidationError(validation.error || null);
    setIsValid(validation.isValid);
  }, [stake]);

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Csak számokat és tizedes pontot engedünk
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStake(value);
    }
  };

  const handleCalculate = () => {
    if (!isValid || stake === '') return;
    
    const stakeNumber = parseFloat(stake);
    onCalculate(stakeNumber);
  };

  const handleReset = () => {
    setStake('');
    setValidationError(null);
    setIsValid(false);
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleCalculate();
    }
  };

  // Gyors tét beállítások
  const quickStakes = [100, 500, 1000, 2500, 5000, 10000];

  const handleQuickStake = (amount: number) => {
    setStake(amount.toString());
  };

  return (
    <Card className="gradient-bg border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Profit Kalkulátor</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mérkőzés információk */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{opportunity.event}</h4>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {opportunity.sport}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {opportunity.bet1?.bookmaker || 'N/A'}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {opportunity.bet1?.odds ? opportunity.bet1.odds.toFixed(2) : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {opportunity.bet2?.bookmaker || 'N/A'}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {opportunity.bet2?.odds ? opportunity.bet2.odds.toFixed(2) : 'N/A'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Tét bevitel */}
        <div className="space-y-2">
          <Label htmlFor="stake" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Tét összege (Ft)</span>
          </Label>
          
          <Input
            id="stake"
            type="text"
            value={stake}
            onChange={handleStakeChange}
            onKeyPress={handleKeyPress}
            placeholder="0"
            className={cn(
              "text-lg font-mono",
              validationError && "border-red-500 focus:border-red-500",
              isValid && "border-green-500 focus:border-green-500"
            )}
            disabled={isLoading}
          />
          
          {validationError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Gyors tét beállítások */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Gyors tét beállítások</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickStakes.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickStake(amount)}
                disabled={isLoading}
                className="text-xs"
              >
                {formatCurrency(amount, 'HUF', { 
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 
                })}
              </Button>
            ))}
          </div>
        </div>

        {/* Hibaüzenet */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Művelet gombok */}
        <div className="flex space-x-2">
          <Button
            onClick={handleCalculate}
            disabled={!isValid || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Számítás...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Számítás
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Tippek */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400">
            💡 <strong>Tipp:</strong> A profit számítás valós idejű, így az odds változások 
            azonnal láthatók lesznek az eredményekben.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Kalkulátor form komponens memoizált verziója
 */
export const MemoizedCalculatorForm = React.memo(CalculatorForm, (prevProps, nextProps) => {
  return (
    prevProps.opportunity.id === nextProps.opportunity.id &&
    prevProps.opportunity.odds === nextProps.opportunity.odds &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error
  );
});

MemoizedCalculatorForm.displayName = 'MemoizedCalculatorForm';
