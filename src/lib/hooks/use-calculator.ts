/**
 * Kalkulátor custom hook
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  CalculatorResult, 
  CalculatorInput, 
  UseCalculatorReturn,
  CalculatorOptions 
} from '@/lib/types/calculator';
import { 
  calculateResult, 
  validateStake, 
  validateOdds,
  loadCalculatorOptions,
  saveCalculatorOptions 
} from '@/lib/utils/calculator';

/**
 * Kalkulátor hook
 * @param initialStake - Kezdeti tét összege
 * @returns Kalkulátor hook visszatérési értékek
 */
export function useCalculator(initialStake: number = 0): UseCalculatorReturn {
  const [stake, setStake] = useState<number>(initialStake);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CalculatorOptions>(() => loadCalculatorOptions());

  /**
   * Tét beállítása validációval
   */
  const handleSetStake = useCallback((newStake: number) => {
    const validation = validateStake(newStake);
    
    if (validation.isValid) {
      setStake(newStake);
      setError(null);
    } else {
      setError(validation.error || 'Érvénytelen tét összeg');
    }
  }, []);

  /**
   * Kalkuláció végrehajtása
   */
  const calculate = useCallback((stakeAmount: number, opportunity: any): CalculatorResult => {
    setIsLoading(true);
    setError(null);

    try {
      // Validációk
      const stakeValidation = validateStake(stakeAmount);
      if (!stakeValidation.isValid) {
        throw new Error(stakeValidation.error || 'Érvénytelen tét összeg');
      }

      const oddsValidation = validateOdds(opportunity.odds);
      if (!oddsValidation.isValid) {
        throw new Error(oddsValidation.error || 'Érvénytelen odds érték');
      }

      // Kalkuláció
      const input: CalculatorInput = {
        stake: stakeAmount,
        opportunity,
      };

      const result = calculateResult(input, options);
      
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ismeretlen hiba történt';
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        stake: 0,
        payout: 0,
        profit: 0,
        profitPercentage: 0,
        roi: 0,
      };
    }
  }, [options]);

  /**
   * Kalkulátor reset
   */
  const reset = useCallback(() => {
    setStake(0);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Beállítások frissítése
   */
  const updateOptions = useCallback((newOptions: Partial<CalculatorOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    saveCalculatorOptions(updatedOptions);
  }, [options]);

  /**
   * Memoizált eredmények
   */
  const result = useMemo(() => {
    if (stake <= 0) {
      return null;
    }

    // Ez csak akkor számít, ha van opportunity
    // A tényleges számítást a calculate függvény végzi
    return null;
  }, [stake]);

  return {
    stake,
    setStake: handleSetStake,
    result,
    calculate: (stake: number) => calculate(stake, null),
    reset,
    isLoading,
    error,
  };
}

/**
 * Kalkulátor modal hook
 * @returns Kalkulátor modal állapot és műveletek
 */
export function useCalculatorModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [opportunity, setOpportunity] = useState<any>(null);

  const openModal = useCallback((opp: any) => {
    setOpportunity(opp);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setOpportunity(null);
  }, []);

  return {
    isOpen,
    opportunity,
    openModal,
    closeModal,
  };
}

/**
 * Kalkulátor történet hook (opcionális)
 * @returns Kalkulátor történet állapot és műveletek
 */
export function useCalculatorHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addToHistory = useCallback((calculation: any) => {
    setHistory(prev => [calculation, ...prev.slice(0, 49)]); // Utolsó 50 számítás
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Itt lehetne API hívás a történet betöltéséhez
      // const response = await fetchCalculatorHistory();
      // setHistory(response.calculations);
      
      // Egyelőre localStorage-ból töltjük
      const saved = localStorage.getItem('calculator-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba a történet betöltése során');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHistory = useCallback(() => {
    try {
      localStorage.setItem('calculator-history', JSON.stringify(history));
    } catch (err) {
      console.error('Hiba a történet mentése során:', err);
    }
  }, [history]);

  return {
    history,
    isLoading,
    error,
    addToHistory,
    clearHistory,
    loadHistory,
    saveHistory,
  };
}

/**
 * Debounced kalkulátor hook
 * @param delay - Debounce késleltetés (ms)
 * @returns Debounced kalkulátor hook
 */
export function useDebouncedCalculator(delay: number = 300) {
  const [debouncedStake, setDebouncedStake] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const debounce = useCallback((value: number) => {
    setIsCalculating(true);
    
    const timeoutId = setTimeout(() => {
      setDebouncedStake(value);
      setIsCalculating(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return {
    debouncedStake,
    isCalculating,
    debounce,
  };
}
