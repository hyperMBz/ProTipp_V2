"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useBetTracker } from '@/lib/hooks/use-bet-tracker';
import { BetTrackerContextType } from '@/lib/types/bet-tracker';

// Context létrehozása
const BetTrackerContext = createContext<BetTrackerContextType | undefined>(undefined);

// Provider komponens
interface BetTrackerProviderProps {
  children: ReactNode;
}

export function BetTrackerProvider({ children }: BetTrackerProviderProps) {
  const betTrackerData = useBetTracker();

  return (
    <BetTrackerContext.Provider value={betTrackerData}>
      {children}
    </BetTrackerContext.Provider>
  );
}

// Custom hooks a context használatához
export function useBetTrackerData() {
  const context = useContext(BetTrackerContext);
  if (context === undefined) {
    throw new Error('useBetTrackerData must be used within a BetTrackerProvider');
  }
  return context;
}

export function useBetTrackerActions() {
  const context = useContext(BetTrackerContext);
  if (context === undefined) {
    throw new Error('useBetTrackerActions must be used within a BetTrackerProvider');
  }
  return {
    addToTracker: context.addToTracker,
    removeFromTracker: context.removeFromTracker,
    updateBet: context.updateBet,
    clearTracker: context.clearTracker
  };
}
