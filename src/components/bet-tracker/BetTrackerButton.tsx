"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Check, Loader2 } from 'lucide-react';
import { ArbitrageOpportunity } from '@/lib/mock-data';
import { useBetTrackerActions } from './BetTrackerProvider';
import { cn } from '@/lib/utils';

interface BetTrackerButtonProps {
  opportunity: ArbitrageOpportunity;
  isAdded?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function BetTrackerButton({ 
  opportunity, 
  isAdded = false, 
  size = 'sm',
  variant = 'outline',
  className 
}: BetTrackerButtonProps) {
  const { addToTracker } = useBetTrackerActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToTracker = async () => {
    if (isLoading || isAdded) return;

    setIsLoading(true);
    
    try {
      await addToTracker(opportunity);
      setIsSuccess(true);
      
      // Success state visszaállítása 2 másodperc után
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to bet tracker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isSuccess || isAdded) {
      return <Check className="h-4 w-4" />;
    }
    
    return <Plus className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (isSuccess || isAdded) {
      return 'default';
    }
    return variant;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-0';
      case 'md':
        return 'h-10 w-10 p-0';
      case 'lg':
        return 'h-12 w-12 p-0';
      default:
        return 'h-8 w-8 p-0';
    }
  };

  return (
    <Button
      size={size === 'md' ? 'default' : size}
      variant={getButtonVariant()}
      onClick={handleAddToTracker}
      disabled={isLoading || isAdded}
      className={cn(
        getSizeClasses(),
        'transition-all duration-300',
        isSuccess && 'bg-green-500 hover:bg-green-600 text-white',
        isAdded && 'bg-primary hover:bg-primary/90 text-primary-foreground',
        className
      )}
      title={
        isAdded 
          ? 'Már hozzáadva a Bet Tracker-hez' 
          : isLoading 
            ? 'Hozzáadás...' 
            : 'Hozzáadás a Bet Tracker-hez'
      }
    >
      {getButtonContent()}
    </Button>
  );
}

// Batch add komponens több fogadás egyszerre hozzáadásához
interface BatchBetTrackerButtonProps {
  opportunities: ArbitrageOpportunity[];
  onComplete?: (addedCount: number) => void;
  className?: string;
}

export function BatchBetTrackerButton({ 
  opportunities, 
  onComplete,
  className 
}: BatchBetTrackerButtonProps) {
  const { addToTracker } = useBetTrackerActions();
  const [isLoading, setIsLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const handleBatchAdd = async () => {
    if (isLoading || opportunities.length === 0) return;

    setIsLoading(true);
    setAddedCount(0);

    try {
      const promises = opportunities.map(opportunity => 
        addToTracker(opportunity).then(() => {
          setAddedCount(prev => prev + 1);
        })
      );

      await Promise.all(promises);
      onComplete?.(addedCount);
    } catch (error) {
      console.error('Error in batch add to bet tracker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBatchAdd}
      disabled={isLoading || opportunities.length === 0}
      className={cn(
        'transition-all duration-300',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Hozzáadás... ({addedCount}/{opportunities.length})
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Összes hozzáadása ({opportunities.length})
        </>
      )}
    </Button>
  );
}
