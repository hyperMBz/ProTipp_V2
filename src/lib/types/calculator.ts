/**
 * Kalkulátor funkció TypeScript típusok
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

import { ArbitrageOpportunity } from './arbitrage';

/**
 * Kalkulátor számítási eredmények
 */
export interface CalculatorResult {
  stake: number;
  payout: number;
  profit: number;
  profitPercentage: number;
  roi: number; // Return on Investment
}

/**
 * Kalkulátor bemeneti paraméterek
 */
export interface CalculatorInput {
  opportunity: ArbitrageOpportunity;
  stake: number;
}

/**
 * Kalkulátor modal állapot
 */
export interface CalculatorModalState {
  isOpen: boolean;
  opportunity: ArbitrageOpportunity | null;
  stake: number;
  result: CalculatorResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Kalkulátor történet elem (opcionális)
 */
export interface CalculatorHistoryItem {
  id: string;
  user_id: string;
  opportunity_id: string;
  event_name: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake: number;
  payout: number;
  profit: number;
  calculated_at: string;
  created_at: string;
}

/**
 * Kalkulátor API válasz típusok
 */
export interface SaveCalculationRequest {
  opportunity_id: string;
  event_name: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake: number;
  payout: number;
  profit: number;
}

export interface GetCalculationHistoryResponse {
  calculations: CalculatorHistoryItem[];
  total: number;
}

/**
 * Kalkulátor komponens props típusok
 */
export interface CalculatorButtonProps {
  opportunity: ArbitrageOpportunity;
  onOpen: (opportunity: ArbitrageOpportunity) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: ArbitrageOpportunity | null;
}

export interface CalculatorFormProps {
  opportunity: ArbitrageOpportunity;
  onCalculate: (stake: number) => void;
  onReset: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface CalculatorResultsProps {
  result: CalculatorResult;
  opportunity: ArbitrageOpportunity;
  onSave?: () => void;
  onShare?: () => void;
}

/**
 * Kalkulátor hook visszatérési típus
 */
export interface UseCalculatorReturn {
  stake: number;
  setStake: (stake: number) => void;
  result: CalculatorResult | null;
  calculate: (stake: number) => CalculatorResult;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Kalkulátor validációs hibák
 */
export interface CalculatorValidationError {
  field: 'stake' | 'odds' | 'general';
  message: string;
}

/**
 * Kalkulátor beállítások
 */
export interface CalculatorSettings {
  defaultStake: number;
  maxStake: number;
  minStake: number;
  currency: 'HUF' | 'EUR' | 'USD';
  saveHistory: boolean;
  showAdvanced: boolean;
}

/**
 * Kalkulátor számítási opciók
 */
export interface CalculatorOptions {
  includeTaxes: boolean;
  taxRate: number;
  includeFees: boolean;
  feeRate: number;
  roundingMode: 'round' | 'floor' | 'ceil';
  decimalPlaces: number;
}
