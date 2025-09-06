"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Trash2, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { BetTrackerItem } from './BetTrackerItem';
import { useBetTrackerData, useBetTrackerActions } from './BetTrackerProvider';
import { BetTrackerItem as BetTrackerItemType } from '@/lib/types/bet-tracker';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface BetTrackerPanelProps {
  className?: string;
}

type FilterStatus = 'all' | 'pending' | 'won' | 'lost' | 'cancelled';

export function BetTrackerPanel({ className }: BetTrackerPanelProps) {
  const { 
    trackedBets, 
    isLoading, 
    error
  } = useBetTrackerData();
  
  // Szűrt listák helyi számítása
  const hasBets = trackedBets.length > 0;
  const pendingBets = trackedBets.filter(bet => bet.status === 'pending');
  const wonBets = trackedBets.filter(bet => bet.status === 'won');
  const lostBets = trackedBets.filter(bet => bet.status === 'lost');
  
  const { removeFromTracker, updateBet, clearTracker } = useBetTrackerActions();
  
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Szűrt fogadások - memoized for performance with debounced search
  const filteredBets = useMemo(() => {
    return trackedBets.filter((bet: BetTrackerItemType) => {
      const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
      const matchesSearch = bet.event_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           bet.sport.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           bet.bookmaker.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [trackedBets, filterStatus, debouncedSearchTerm]);

  // Statisztikák számítása - memoized for performance
  const stats = useMemo(() => ({
    totalBets: trackedBets.length,
    pendingBets: pendingBets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    totalStaked: trackedBets.reduce((sum: number, bet: BetTrackerItemType) => sum + (bet.stake || 0), 0),
    totalProfit: trackedBets.reduce((sum: number, bet: BetTrackerItemType) => sum + (bet.profit || 0), 0),
    winRate: trackedBets.length > 0 ? (wonBets.length / trackedBets.length) * 100 : 0
  }), [trackedBets, pendingBets, wonBets, lostBets]);

  const handleRemove = useCallback(async (betId: string) => {
    try {
      await removeFromTracker(betId);
    } catch (error) {
      console.error('Error removing bet:', error);
    }
  }, [removeFromTracker]);

  const handleUpdate = useCallback(async (betId: string, updates: Partial<BetTrackerItemType>) => {
    try {
      await updateBet(betId, updates);
    } catch (error) {
      console.error('Error updating bet:', error);
    }
  }, [updateBet]);

  const handleClearAll = useCallback(async () => {
    if (window.confirm('Biztosan törölni szeretnéd az összes fogadást?')) {
      try {
        await clearTracker();
      } catch (error) {
        console.error('Error clearing tracker:', error);
      }
    }
  }, [clearTracker]);

  const getProfitColor = (profit: number) => {
    return profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : 'text-muted-foreground';
  };

  if (error) {
    return (
      <Card className={cn('gradient-bg border-red-500/20', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">⚠️ Hiba történt</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('gradient-bg border-primary/20', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bet Tracker
          </CardTitle>
          
          {hasBets && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Törlés
            </Button>
          )}
        </div>

        {/* Statisztikák */}
        {hasBets && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{stats.totalBets}</div>
              <div className="text-xs text-muted-foreground">Összes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{stats.pendingBets}</div>
              <div className="text-xs text-muted-foreground">Függőben</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{stats.wonBets}</div>
              <div className="text-xs text-muted-foreground">Nyert</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.lostBets}</div>
              <div className="text-xs text-muted-foreground">Vesztett</div>
            </div>
          </div>
        )}

        {/* Profit összefoglaló */}
        {hasBets && (
          <div className="flex items-center justify-between mt-4 p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Összes profit:</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Tét: </span>
                <span className="font-semibold">{formatNumber(stats.totalStaked)} Ft</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Profit: </span>
                <span className={cn('font-semibold', getProfitColor(stats.totalProfit))}>
                  {stats.totalProfit > 0 ? '+' : ''}{formatNumber(stats.totalProfit)} Ft
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Win Rate: </span>
                <span className="font-semibold">{stats.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Szűrők és keresés */}
        {hasBets && (
          <div className="space-y-3 mb-4">
            {/* Státusz szűrők */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {[
                { key: 'all', label: 'Összes', count: trackedBets.length },
                { key: 'pending', label: 'Függőben', count: pendingBets.length },
                { key: 'won', label: 'Nyert', count: wonBets.length },
                { key: 'lost', label: 'Vesztett', count: lostBets.length }
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filterStatus === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(key as FilterStatus)}
                  className="h-7 text-xs"
                >
                  {label} ({count})
                </Button>
              ))}
            </div>

            {/* Keresés */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Keresés mérkőzés, sport vagy fogadóiroda szerint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}

        {/* Fogadások listája */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Betöltés...</p>
          </div>
        ) : !hasBets ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nincsenek tracked fogadások
            </h3>
            <p className="text-sm text-muted-foreground">
              Használd a "+" gombokat az arbitrage táblában a fogadások hozzáadásához.
            </p>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nincs találat a keresési feltételeknek megfelelően.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredBets.map((bet: BetTrackerItemType) => (
                <BetTrackerItem
                  key={bet.id}
                  bet={bet}
                  onRemove={handleRemove}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
