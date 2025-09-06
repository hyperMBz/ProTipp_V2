/**
 * Kalkulátor gomb komponens
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

"use client";

import React from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalculatorButtonProps } from '@/lib/types/calculator';

/**
 * Kalkulátor gomb komponens
 * Minden mérkőzéshez kalkulátor ikon hozzáadása
 */
export function CalculatorButton({
  opportunity,
  onOpen,
  disabled = false,
  size = 'md',
  className
}: CalculatorButtonProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;

    setIsAnimating(true);
    
    // Animáció befejezése után modal megnyitása
    setTimeout(() => {
      onOpen(opportunity);
      setIsAnimating(false);
    }, 150);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Hydration-safe event name - mindkét oldalon ugyanazt az értéket használjuk
  const eventName = opportunity.event || 'Mérkőzés';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30",
        "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background",
        sizeClasses[size],
        isAnimating && "scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={`Kalkulátor megnyitása: ${eventName}`}
      title={`Profit számítás: ${eventName}`}
    >
      <Calculator 
        className={cn(
          "transition-colors duration-200",
          iconSizes[size],
          !disabled && "text-primary hover:text-primary/80"
        )} 
      />
    </Button>
  );
}

/**
 * Kalkulátor gomb komponens memoizált verziója
 * Performance optimalizálás nagy listákhoz
 */
export const MemoizedCalculatorButton = React.memo(CalculatorButton, (prevProps, nextProps) => {
  return (
    prevProps.opportunity.id === nextProps.opportunity.id &&
    prevProps.opportunity.odds === nextProps.opportunity.odds &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size
  );
});

MemoizedCalculatorButton.displayName = 'MemoizedCalculatorButton';
