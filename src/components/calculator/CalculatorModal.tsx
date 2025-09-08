/**
 * Kalkulátor modal komponens
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

"use client";

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Calculator, 
  TrendingUp,
  Save,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculatorModalProps, CalculatorResult } from '@/lib/types/calculator';
import { CalculatorForm } from './CalculatorForm';
import { CalculatorResults } from './CalculatorResults';
import { useCalculator } from '@/lib/hooks/use-calculator';
import { calculateResult } from '@/lib/utils/calculator';

/**
 * Kalkulátor modal komponens
 * Teljes funkcionalitású kalkulátor modal ablak
 */
export function CalculatorModal({
  isOpen,
  onClose,
  opportunity
}: CalculatorModalProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { stake, setStake, reset } = useCalculator();

  // Modal bezárása
  const handleClose = useCallback(() => {
    setResult(null);
    setError(null);
    reset();
    onClose();
  }, [onClose, reset]);

  // Kalkuláció végrehajtása
  const handleCalculate = useCallback((stakeAmount: number) => {
    if (!opportunity) return;

    setIsCalculating(true);
    setError(null);

    try {
      const calculationResult = calculateResult({
        stake: stakeAmount,
        opportunity
      });

      setResult(calculationResult);
      setStake(stakeAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt a számítás során');
    } finally {
      setIsCalculating(false);
    }
  }, [opportunity, setStake]);

  // Kalkulátor reset
  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    reset();
  }, [reset]);

  // Eredmények mentése (opcionális)
  const handleSave = useCallback(() => {
    if (!result || !opportunity) return;

    try {
      // Itt lehetne API hívás a mentéshez
      console.log('Kalkuláció mentése:', {
        opportunity,
        result,
        timestamp: new Date().toISOString()
      });

      // Toast notification vagy más visszajelzés
      alert('Kalkuláció mentve!');
    } catch (err) {
      console.error('Hiba a mentés során:', err);
      alert('Hiba történt a mentés során');
    }
  }, [result, opportunity]);

  // Eredmények megosztása (opcionális)
  const handleShare = useCallback(() => {
    if (!result || !opportunity) return;

    try {
      const shareText = `Profit kalkuláció: ${opportunity.event}\n` +
        `Tét: ${result.stake.toLocaleString()} Ft\n` +
        `Kifizetés: ${result.payout.toLocaleString()} Ft\n` +
        `Profit: ${result.profit.toLocaleString()} Ft (${typeof result.profitPercentage === 'number' && !isNaN(result.profitPercentage) ? result.profitPercentage.toFixed(2) : 'N/A'}%)`;

      if (navigator.share) {
        navigator.share({
          title: 'Profit Kalkuláció',
          text: shareText,
        });
      } else {
        // Fallback: clipboard
        navigator.clipboard.writeText(shareText);
        alert('Szöveg vágólapra másolva!');
      }
    } catch (err) {
      console.error('Hiba a megosztás során:', err);
      alert('Hiba történt a megosztás során');
    }
  }, [result, opportunity]);

  if (!opportunity) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span>Profit Kalkulátor</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <DialogDescription className="text-left">
            Számítsd ki a potenciális profitot és kifizetést a fogadásodhoz.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Kalkulátor form */}
          <CalculatorForm
            opportunity={opportunity}
            onCalculate={handleCalculate}
            onReset={handleReset}
            isLoading={isCalculating}
            error={error}
          />

          {/* Eredmények megjelenítése */}
          {result && (
            <>
              <Separator />
              <CalculatorResults
                result={result}
                opportunity={opportunity}
                onSave={handleSave}
                onShare={handleShare}
              />
            </>
          )}

          {/* További információk */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Kalkulátor információk</span>
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• A számítások valós idejűek és pontosak</p>
              <p>• A profit kalkuláció tartalmazza a tét és kifizetés különbségét</p>
              <p>• A ROI (Return on Investment) a befektetés megtérülését mutatja</p>
              <p>• Az eredmények menthetők és megoszthatók</p>
            </div>
          </div>
        </div>

        {/* Modal láb */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Kalkulátor v1.0 • ProTipp V2
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Bezárás
            </Button>
            {result && (
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Kalkulátor modal komponens memoizált verziója
 */
export const MemoizedCalculatorModal = React.memo(CalculatorModal, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.opportunity?.id === nextProps.opportunity?.id
  );
});

MemoizedCalculatorModal.displayName = 'MemoizedCalculatorModal';
