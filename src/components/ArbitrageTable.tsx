"use client";

import { useState, useEffect, useMemo } from "react";
import { ArbitrageOpportunity } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, TrendingUp, Target, Zap } from "lucide-react";
import { BetTrackerButton } from "@/components/bet-tracker/BetTrackerButton";
import { CalculatorButton, CalculatorModal } from "@/components/calculator";
import { HydrationSafeTableWrapper } from "@/components/ui/hydration-safe-wrapper";
// Hydration-safe utility függvények közvetlen implementálása
function safeToFixed(value: number | undefined | null, decimals: number = 2): string {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return '0.00';
}

function stableOddsDirection(odds: number, previousOdds?: number): 'up' | 'down' | 'neutral' {
  if (typeof previousOdds !== 'number' || isNaN(previousOdds)) {
    return 'neutral';
  }
  
  if (typeof odds !== 'number' || isNaN(odds)) {
    return 'neutral';
  }
  
  if (odds > previousOdds) return 'up';
  if (odds < previousOdds) return 'down';
  return 'neutral';
}

function stableOddsChange(odds: number, previousOdds?: number): number {
  if (typeof previousOdds !== 'number' || isNaN(previousOdds)) {
    return 0;
  }
  
  if (typeof odds !== 'number' || isNaN(odds)) {
    return 0;
  }
  
  return odds - previousOdds;
}

function useHydrationSafeField<T>(
  obj: T | undefined | null,
  field: keyof T,
  fallback: string = ''
): string {
  // useMemo használata hydration során stabil értékek biztosítására
  return useMemo(() => {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }
    
    const value = obj[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    
    return fallback;
  }, [obj, field, fallback]);
}

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  oddsUpdateTrigger?: number;
}

/**
 * Hydration-safe opportunity adatok megjelenítése
 */
function HydrationSafeOpportunityDisplay({ opportunity }: { opportunity: ArbitrageOpportunity }) {
  const eventName = useHydrationSafeField(opportunity, 'event', 'Mérkőzés');
  const outcomeName = useHydrationSafeField(opportunity, 'outcome', 'Eredmény');
  const sportName = useHydrationSafeField(opportunity, 'sport', 'Sport');
  
  // Memoized JSX hydration során stabil megjelenítés biztosítására
  return useMemo(() => (
    <>
      <div className="text-sm font-semibold truncate">{eventName}</div>
      <div className="text-xs text-muted-foreground">{outcomeName}</div>
    </>
  ), [eventName, outcomeName]);
}

function OddsAnimation({
  initialOdds,
  isUpdating,
  direction
}: {
  initialOdds: number;
  isUpdating: boolean;
  direction?: 'up' | 'down' | 'neutral';
}) {
  const [displayOdds, setDisplayOdds] = useState(initialOdds);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setIsFlashing(true);
      // Deterministic change based on initial odds to avoid hydration mismatch
      const change = stableOddsChange(initialOdds, initialOdds * 0.95);
      const newOdds = Math.max(1.01, initialOdds + change);

      setTimeout(() => {
        setDisplayOdds(parseFloat(newOdds.toFixed(2)));
        setTimeout(() => setIsFlashing(false), 500);
      }, 200);
    }
  }, [initialOdds, isUpdating]);

  const getAnimationClass = () => {
    if (!isFlashing) return '';

    switch (direction) {
      case 'up':
        return 'bg-green-500/20 text-green-400 animate-pulse scale-105';
      case 'down':
        return 'bg-red-500/20 text-red-400 animate-pulse scale-105';
      default:
        return 'bg-primary/20 text-primary animate-pulse scale-105';
    }
  };

  return (
    <span className={`font-mono transition-all duration-300 inline-block ${getAnimationClass()}`}>
      {displayOdds.toFixed(2)}
      {isFlashing && direction === 'up' && <TrendingUp className="h-3 w-3 inline ml-1" />}
      {isFlashing && direction === 'down' && <TrendingUp className="h-3 w-3 inline ml-1 rotate-180" />}
    </span>
  );
}

export function ArbitrageTable({ opportunities, oddsUpdateTrigger = 0 }: ArbitrageTableProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [lastUpdateTrigger, setLastUpdateTrigger] = useState(0);
  const [updatingRows, setUpdatingRows] = useState<Set<string>>(new Set());
  const [calculatorModal, setCalculatorModal] = useState<{
    isOpen: boolean;
    opportunity: ArbitrageOpportunity | null;
  }>({ isOpen: false, opportunity: null });

  // Memoize opportunities to prevent unnecessary re-renders
  const memoizedOpportunities = useMemo(() => opportunities, [opportunities]);

  useEffect(() => {
    if (oddsUpdateTrigger !== lastUpdateTrigger && oddsUpdateTrigger > 0) {
      // Deterministically select 2-3 opportunities to update
      const shuffled = [...memoizedOpportunities].sort((a, b) => a.id.localeCompare(b.id));
      const updateCount = Math.min(3, (oddsUpdateTrigger % 3) + 1);
      const toUpdate = shuffled.slice(0, updateCount);

      setUpdatingRows(new Set(toUpdate.map(opp => opp.id)));
      setLastUpdateTrigger(oddsUpdateTrigger);

      // Clear updating state after animation
      setTimeout(() => {
        setUpdatingRows(new Set());
      }, 1000);
    }
  }, [oddsUpdateTrigger, lastUpdateTrigger, memoizedOpportunities]);

  const getStatusColor = (probability: number) => {
    if (probability >= 95) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (probability >= 90) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getProfitColor = (profitMargin: number) => {
    if (profitMargin >= 5) return "text-green-400";
    if (profitMargin >= 3) return "text-yellow-400";
    return "text-orange-400";
  };

  const addToBetTracker = (opportunity: ArbitrageOpportunity) => {
    // This function is now handled by BetTrackerButton component
    console.log("Adding to bet tracker:", opportunity);
    setSelectedOpportunity(opportunity.id);
    setTimeout(() => setSelectedOpportunity(null), 1000);
  };

  const openCalculator = (opportunity: ArbitrageOpportunity) => {
    setCalculatorModal({ isOpen: true, opportunity });
  };

  const closeCalculator = () => {
    setCalculatorModal({ isOpen: false, opportunity: null });
  };

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Nincsenek arbitrage lehetőségek</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Próbáld meg megváltoztatni a szűrőket újabb lehetőségek kereséséhez.
        </p>
      </div>
    );
  }

  return (
    <>
      <HydrationSafeTableWrapper 
        className="rounded-lg border border-border overflow-hidden"
        columns={10}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold">Sport</TableHead>
              <TableHead className="font-semibold">Mérkőzés</TableHead>
              <TableHead className="font-semibold">Piac</TableHead>
              <TableHead className="font-semibold">Fogadóiroda 1</TableHead>
              <TableHead className="font-semibold">Fogadóiroda 2</TableHead>
              <TableHead className="font-semibold">Profit</TableHead>
              <TableHead className="font-semibold">Tét</TableHead>
              <TableHead className="font-semibold">Lejárat</TableHead>
              <TableHead className="font-semibold">Státusz</TableHead>
              <TableHead className="font-semibold">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => {
              const isUpdating = updatingRows.has(opportunity.id);

              return (
                <TableRow
                  key={opportunity.id}
                  className={`hover:bg-secondary/30 transition-all duration-300 border-border/50 ${
                    isUpdating ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.sport}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="max-w-[200px]">
                      <HydrationSafeOpportunityDisplay opportunity={opportunity} />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {opportunity.outcome || 'Eredmény'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {opportunity.bet1.bookmaker}
                        </Badge>
                        <OddsAnimation
                          initialOdds={opportunity.bet1.odds}
                          isUpdating={isUpdating}
                          direction={stableOddsDirection(opportunity.bet1.odds, opportunity.bet1.odds * 0.95)}
                        />
                        {isUpdating && <Zap className="h-3 w-3 text-primary animate-pulse" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {opportunity.bet1.outcome}
                      </div>
                      <div className="text-xs text-primary">
                        {formatNumber(opportunity.stakes.bet1.stake)} Ft
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {opportunity.bet2.bookmaker}
                        </Badge>
                        <OddsAnimation
                          initialOdds={opportunity.bet2.odds}
                          isUpdating={isUpdating}
                          direction={stableOddsDirection(opportunity.bet2.odds, opportunity.bet2.odds * 1.05)}
                        />
                        {isUpdating && <Zap className="h-3 w-3 text-primary animate-pulse" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {opportunity.bet2.outcome}
                      </div>
                      <div className="text-xs text-primary">
                        {formatNumber(opportunity.stakes.bet2.stake)} Ft
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className={`text-sm font-bold ${getProfitColor(opportunity.profitMargin)} ${
                        isUpdating ? 'animate-pulse' : ''
                      }`}>
                        {safeToFixed(opportunity.profitMargin, 1)}%
                      </div>
                      <div className="text-xs text-green-400">
                        +{formatNumber(opportunity.expectedProfit)} Ft
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        {formatNumber(opportunity.totalStake)} Ft
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>ROI: {safeToFixed(opportunity.profitMargin, 1)}%</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-mono text-orange-400 ${
                        isUpdating ? 'animate-pulse' : ''
                      }`}>
                        {opportunity.timeToExpiry}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`text-xs ${getStatusColor(opportunity.probability)} ${
                        isUpdating ? 'animate-pulse' : ''
                      }`}
                    >
                      {opportunity.probability}%
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <BetTrackerButton
                        opportunity={opportunity}
                        isAdded={selectedOpportunity === opportunity.id}
                        size="sm"
                        variant="outline"
                      />
                      <CalculatorButton
                        opportunity={opportunity}
                        onOpen={openCalculator}
                        size="sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </HydrationSafeTableWrapper>

      {/* Kalkulátor Modal */}
      {calculatorModal.isOpen && calculatorModal.opportunity && (
        <CalculatorModal
          isOpen={calculatorModal.isOpen}
          onClose={closeCalculator}
          opportunity={calculatorModal.opportunity}
        />
      )}
    </>
  );
}
