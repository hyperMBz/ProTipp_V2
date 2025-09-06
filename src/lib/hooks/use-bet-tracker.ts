"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { betTrackerAPI } from '@/lib/api/bet-tracker-api';
import { 
  BetTrackerItem, 
  BetTrackerContextType, 
  AddBetRequest,
  BetTrackerStats 
} from '@/lib/types/bet-tracker';
import { ArbitrageOpportunity } from '@/lib/mock-data';

export function useBetTracker(): BetTrackerContextType {
  const { user } = useAuth();
  const [trackedBets, setTrackedBets] = useState<BetTrackerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bet Tracker adatok betöltése
  const loadTrackedBets = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await betTrackerAPI.getTrackedBets(user.id);
      setTrackedBets(response.bets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error loading tracked bets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fogadás hozzáadása a tracker-hez
  const addToTracker = useCallback(async (
    opportunity: ArbitrageOpportunity, 
    stake?: number, 
    notes?: string
  ) => {
    if (!user?.id) {
      setError('Be kell jelentkezned a fogadások hozzáadásához');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const betData: AddBetRequest = {
        opportunity_id: opportunity.id,
        event_name: opportunity.event,
        sport: opportunity.sport,
        bookmaker: opportunity.bet1.bookmaker, // Első fogadóiroda alapértelmezés
        odds: opportunity.bet1.odds,
        stake: stake || opportunity.totalStake,
        outcome: opportunity.bet1.outcome,
        notes: notes
      };

      const newBet = await betTrackerAPI.addBet(user.id, betData);
      setTrackedBets(prev => [newBet, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error adding bet to tracker:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fogadás törlése a tracker-ből
  const removeFromTracker = useCallback(async (betId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await betTrackerAPI.removeBet(betId);
      setTrackedBets(prev => prev.filter(bet => bet.id !== betId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error removing bet from tracker:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fogadás frissítése
  const updateBet = useCallback(async (betId: string, updates: Partial<BetTrackerItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedBet = await betTrackerAPI.updateBet(betId, updates);
      setTrackedBets(prev => 
        prev.map(bet => bet.id === betId ? updatedBet : bet)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error updating bet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Összes fogadás törlése
  const clearTracker = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      await betTrackerAPI.clearAllBets(user.id);
      setTrackedBets([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error clearing tracker:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Real-time subscription beállítása
  useEffect(() => {
    if (!user?.id) return;

    // Először betöltjük az adatokat
    loadTrackedBets();

    // Real-time subscription
    const subscription = betTrackerAPI.subscribeToBetTrackerChanges(
      user.id,
      (payload) => {
        console.log('Bet tracker real-time update:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            setTrackedBets(prev => [payload.new, ...prev]);
            break;
          case 'UPDATE':
            setTrackedBets(prev => 
              prev.map(bet => bet.id === payload.new.id ? payload.new : bet)
            );
            break;
          case 'DELETE':
            setTrackedBets(prev => 
              prev.filter(bet => bet.id !== payload.old.id)
            );
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, loadTrackedBets]);

  return {
    trackedBets,
    addToTracker,
    removeFromTracker,
    updateBet,
    clearTracker,
    isLoading,
    error
  };
}

// Bet Tracker statisztikák hook
export function useBetTrackerStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BetTrackerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const statsData = await betTrackerAPI.getBetTrackerStats(user.id);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      console.error('Error loading bet tracker stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: loadStats
  };
}
