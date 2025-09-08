/**
 * Kalkulátor utility függvények
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

import { CalculatorResult, CalculatorInput, CalculatorOptions } from '@/lib/types/calculator';

/**
 * Alapértelmezett kalkulátor beállítások
 */
export const DEFAULT_CALCULATOR_OPTIONS: CalculatorOptions = {
  includeTaxes: false,
  taxRate: 0,
  includeFees: false,
  feeRate: 0,
  roundingMode: 'round',
  decimalPlaces: 2,
};

/**
 * Kifizetés számítása
 * @param stake - Tét összege
 * @param odds - Odds érték
 * @param options - Kalkulátor beállítások
 * @returns Kifizetés összege
 */
export function calculatePayout(
  stake: number,
  odds: number,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): number {
  if (stake <= 0 || odds <= 0) {
    return 0;
  }

  let payout = stake * odds;

  // Adók levonása (ha be van kapcsolva)
  if (options.includeTaxes && options.taxRate > 0) {
    payout = payout * (1 - options.taxRate);
  }

  // Díjak levonása (ha be van kapcsolva)
  if (options.includeFees && options.feeRate > 0) {
    payout = payout * (1 - options.feeRate);
  }

  return roundNumber(payout, options);
}

/**
 * Profit számítása
 * @param stake - Tét összege
 * @param payout - Kifizetés összege
 * @param options - Kalkulátor beállítások
 * @returns Profit összege
 */
export function calculateProfit(
  stake: number,
  payout: number,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): number {
  if (stake <= 0) {
    return 0;
  }

  const profit = payout - stake;
  return roundNumber(profit, options);
}

/**
 * Profit százalék számítása
 * @param stake - Tét összege
 * @param profit - Profit összege
 * @param options - Kalkulátor beállítások
 * @returns Profit százalék
 */
export function calculateProfitPercentage(
  stake: number,
  profit: number,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): number {
  if (stake <= 0) {
    return 0;
  }

  const percentage = (profit / stake) * 100;
  return roundNumber(percentage, options);
}

/**
 * ROI (Return on Investment) számítása
 * @param stake - Tét összege
 * @param payout - Kifizetés összege
 * @param options - Kalkulátor beállítások
 * @returns ROI százalék
 */
export function calculateROI(
  stake: number,
  payout: number,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): number {
  if (stake <= 0) {
    return 0;
  }

  const roi = ((payout - stake) / stake) * 100;
  return roundNumber(roi, options);
}

/**
 * Teljes kalkulátor számítás
 * @param input - Kalkulátor bemeneti paraméterek
 * @param options - Kalkulátor beállítások
 * @returns Kalkulátor eredmények
 */
export function calculateResult(
  input: CalculatorInput,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): CalculatorResult {
  const { stake, opportunity } = input;
  const { bet1, bet2 } = opportunity;

  // Validáció
  if (stake <= 0 || bet1.odds <= 0 || bet2.odds <= 0) {
    return {
      stake: 0,
      payout: 0,
      profit: 0,
      profitPercentage: 0,
      roi: 0,
    };
  }

  const payout = calculatePayout(stake, bet1.odds, options);
  const profit = calculateProfit(stake, payout, options);
  const profitPercentage = calculateProfitPercentage(stake, profit, options);
  const roi = calculateROI(stake, payout, options);

  return {
    stake,
    payout,
    profit,
    profitPercentage,
    roi,
  };
}

/**
 * Szám kerekítése a megadott beállítások szerint
 * @param number - Kerekítendő szám
 * @param options - Kalkulátor beállítások
 * @returns Kerekített szám
 */
export function roundNumber(
  number: number,
  options: CalculatorOptions = DEFAULT_CALCULATOR_OPTIONS
): number {
  const { roundingMode, decimalPlaces } = options;
  const multiplier = Math.pow(10, decimalPlaces);

  switch (roundingMode) {
    case 'floor':
      return Math.floor(number * multiplier) / multiplier;
    case 'ceil':
      return Math.ceil(number * multiplier) / multiplier;
    case 'round':
    default:
      return Math.round(number * multiplier) / multiplier;
  }
}

/**
 * Tét validálása
 * @param stake - Tét összege
 * @param minStake - Minimum tét
 * @param maxStake - Maximum tét
 * @returns Validációs eredmény
 */
export function validateStake(
  stake: number,
  minStake: number = 0,
  maxStake: number = 1000000
): { isValid: boolean; error?: string } {
  if (isNaN(stake)) {
    return { isValid: false, error: 'A tét nem lehet üres' };
  }

  if (stake < minStake) {
    return { isValid: false, error: `A minimum tét ${minStake.toLocaleString()} Ft` };
  }

  if (stake > maxStake) {
    return { isValid: false, error: `A maximum tét ${maxStake.toLocaleString()} Ft` };
  }

  return { isValid: true };
}

/**
 * Odds validálása
 * @param odds - Odds érték
 * @returns Validációs eredmény
 */
export function validateOdds(odds: number): { isValid: boolean; error?: string } {
  if (isNaN(odds)) {
    return { isValid: false, error: 'Az odds nem lehet üres' };
  }

  if (odds <= 0) {
    return { isValid: false, error: 'Az odds nagyobb kell legyen, mint 0' };
  }

  if (odds > 1000) {
    return { isValid: false, error: 'Az odds nem lehet nagyobb, mint 1000' };
  }

  return { isValid: true };
}

/**
 * Profit kategória meghatározása
 * @param profit - Profit összege
 * @returns Profit kategória
 */
export function getProfitCategory(profit: number): 'positive' | 'negative' | 'neutral' {
  if (profit > 0) {
    return 'positive';
  } else if (profit < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * Profit szín meghatározása
 * @param profit - Profit összege
 * @returns CSS szín osztály
 */
export function getProfitColorClass(profit: number): string {
  const category = getProfitCategory(profit);
  
  switch (category) {
    case 'positive':
      return 'text-green-400';
    case 'negative':
      return 'text-red-400';
    case 'neutral':
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Pénzösszeg formázása
 * @param amount - Pénzösszeg
 * @param currency - Pénznem
 * @param options - Formázási opciók
 * @returns Formázott pénzösszeg
 */
export function formatCurrency(
  amount: number,
  currency: 'HUF' | 'EUR' | 'USD' = 'HUF',
  options: Intl.NumberFormatOptions = {}
): string {
  // Biztonságos amount kezelés
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat('hu-HU', defaultOptions).format(safeAmount);
}

/**
 * Százalék formázása
 * @param percentage - Százalék érték
 * @param options - Formázási opciók
 * @returns Formázott százalék
 */
export function formatPercentage(
  percentage: number,
  options: Intl.NumberFormatOptions = {}
): string {
  // Biztonságos percentage kezelés
  const safePercentage = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 0;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat('hu-HU', defaultOptions).format(safePercentage / 100);
}

/**
 * Kalkulátor beállítások mentése localStorage-ba
 * @param options - Kalkulátor beállítások
 */
export function saveCalculatorOptions(options: CalculatorOptions): void {
  try {
    localStorage.setItem('calculator-options', JSON.stringify(options));
  } catch (error) {
    console.error('Hiba a kalkulátor beállítások mentése során:', error);
  }
}

/**
 * Kalkulátor beállítások betöltése localStorage-ból
 * @returns Kalkulátor beállítások
 */
export function loadCalculatorOptions(): CalculatorOptions {
  try {
    const saved = localStorage.getItem('calculator-options');
    if (saved) {
      return { ...DEFAULT_CALCULATOR_OPTIONS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Hiba a kalkulátor beállítások betöltése során:', error);
  }

  return DEFAULT_CALCULATOR_OPTIONS;
}
