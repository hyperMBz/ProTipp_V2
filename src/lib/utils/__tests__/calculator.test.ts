/**
 * Calculator utility függvények tesztek
 * Sprint 6 - Kalkulátor Funkció Implementálása
 */

import {
  calculatePayout,
  calculateProfit,
  calculateProfitPercentage,
  calculateROI,
  calculateResult,
  roundNumber,
  validateStake,
  validateOdds,
  getProfitCategory,
  getProfitColorClass,
  formatCurrency,
  formatPercentage,
  saveCalculatorOptions,
  loadCalculatorOptions,
  DEFAULT_CALCULATOR_OPTIONS
} from '../calculator';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Calculator Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePayout', () => {
    it('calculates payout correctly for basic case', () => {
      const result = calculatePayout(1000, 2.5);
      expect(result).toBe(2500);
    });

    it('returns 0 for invalid inputs', () => {
      expect(calculatePayout(0, 2.5)).toBe(0);
      expect(calculatePayout(1000, 0)).toBe(0);
      expect(calculatePayout(-100, 2.5)).toBe(0);
    });

    it('applies tax correctly when enabled', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, includeTaxes: true, taxRate: 0.1 };
      const result = calculatePayout(1000, 2.5, options);
      expect(result).toBe(2250); // 2500 * (1 - 0.1)
    });

    it('applies fees correctly when enabled', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, includeFees: true, feeRate: 0.05 };
      const result = calculatePayout(1000, 2.5, options);
      expect(result).toBe(2375); // 2500 * (1 - 0.05)
    });

    it('applies both tax and fees when enabled', () => {
      const options = { 
        ...DEFAULT_CALCULATOR_OPTIONS, 
        includeTaxes: true, 
        taxRate: 0.1,
        includeFees: true, 
        feeRate: 0.05 
      };
      const result = calculatePayout(1000, 2.5, options);
      expect(result).toBe(2137.5); // 2500 * (1 - 0.1) * (1 - 0.05)
    });
  });

  describe('calculateProfit', () => {
    it('calculates profit correctly for positive case', () => {
      const result = calculateProfit(1000, 2500);
      expect(result).toBe(1500);
    });

    it('calculates profit correctly for negative case', () => {
      const result = calculateProfit(1000, 800);
      expect(result).toBe(-200);
    });

    it('returns 0 for zero stake', () => {
      const result = calculateProfit(0, 2500);
      expect(result).toBe(0);
    });
  });

  describe('calculateProfitPercentage', () => {
    it('calculates profit percentage correctly', () => {
      const result = calculateProfitPercentage(1000, 1500);
      expect(result).toBe(150);
    });

    it('calculates negative profit percentage correctly', () => {
      const result = calculateProfitPercentage(1000, -200);
      expect(result).toBe(-20);
    });

    it('returns 0 for zero stake', () => {
      const result = calculateProfitPercentage(0, 1500);
      expect(result).toBe(0);
    });
  });

  describe('calculateROI', () => {
    it('calculates ROI correctly', () => {
      const result = calculateROI(1000, 2500);
      expect(result).toBe(150);
    });

    it('calculates negative ROI correctly', () => {
      const result = calculateROI(1000, 800);
      expect(result).toBe(-20);
    });

    it('returns 0 for zero stake', () => {
      const result = calculateROI(0, 2500);
      expect(result).toBe(0);
    });
  });

  describe('calculateResult', () => {
    const mockOpportunity = {
      id: 'test',
      event: 'Test Event',
      sport: 'Football',
      outcome: 'Home Win',
      bet1: { bookmaker: 'Book1', odds: 2.5, outcome: 'Home Win' },
      bet2: { bookmaker: 'Book2', odds: 2.1, outcome: 'Away Win' },
      profitMargin: 5.2,
      expectedProfit: 1000,
      totalStake: 20000,
      stakes: { bet1: { stake: 10000, profit: 5000 }, bet2: { stake: 10000, profit: 5000 } },
      probability: 95,
      timeToExpiry: '2h 30m',
      category: 'arbitrage' as const
    };

    it('calculates complete result correctly', () => {
      const input = { stake: 1000, opportunity: mockOpportunity };
      const result = calculateResult(input);

      expect(result.stake).toBe(1000);
      expect(result.payout).toBe(2500);
      expect(result.profit).toBe(1500);
      expect(result.profitPercentage).toBe(150);
      expect(result.roi).toBe(150);
    });

    it('returns zero values for invalid inputs', () => {
      const input = { stake: 0, opportunity: mockOpportunity };
      const result = calculateResult(input);

      expect(result.stake).toBe(0);
      expect(result.payout).toBe(0);
      expect(result.profit).toBe(0);
      expect(result.profitPercentage).toBe(0);
      expect(result.roi).toBe(0);
    });
  });

  describe('roundNumber', () => {
    it('rounds numbers correctly with default settings', () => {
      expect(roundNumber(1.234)).toBe(1.23);
      expect(roundNumber(1.236)).toBe(1.24);
    });

    it('rounds numbers correctly with custom decimal places', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, decimalPlaces: 3 };
      expect(roundNumber(1.2345, options)).toBe(1.235);
    });

    it('uses floor rounding mode correctly', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, roundingMode: 'floor' as const };
      expect(roundNumber(1.9, options)).toBe(1);
    });

    it('uses ceil rounding mode correctly', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, roundingMode: 'ceil' as const };
      expect(roundNumber(1.1, options)).toBe(2);
    });
  });

  describe('validateStake', () => {
    it('validates correct stake', () => {
      const result = validateStake(1000);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('validates stake with custom limits', () => {
      const result = validateStake(500, 100, 2000);
      expect(result.isValid).toBe(true);
    });

    it('rejects negative stake', () => {
      const result = validateStake(-100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('minimum tét');
    });

    it('rejects stake below minimum', () => {
      const result = validateStake(50, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('minimum tét');
    });

    it('rejects stake above maximum', () => {
      const result = validateStake(2000, 0, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('maximum tét');
    });

    it('rejects NaN stake', () => {
      const result = validateStake(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nem lehet üres');
    });
  });

  describe('validateOdds', () => {
    it('validates correct odds', () => {
      const result = validateOdds(2.5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects zero odds', () => {
      const result = validateOdds(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nagyobb kell legyen, mint 0');
    });

    it('rejects negative odds', () => {
      const result = validateOdds(-1.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nagyobb kell legyen, mint 0');
    });

    it('rejects odds above 1000', () => {
      const result = validateOdds(1500);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nem lehet nagyobb, mint 1000');
    });

    it('rejects NaN odds', () => {
      const result = validateOdds(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nem lehet üres');
    });
  });

  describe('getProfitCategory', () => {
    it('returns positive for positive profit', () => {
      expect(getProfitCategory(100)).toBe('positive');
    });

    it('returns negative for negative profit', () => {
      expect(getProfitCategory(-100)).toBe('negative');
    });

    it('returns neutral for zero profit', () => {
      expect(getProfitCategory(0)).toBe('neutral');
    });
  });

  describe('getProfitColorClass', () => {
    it('returns correct color class for positive profit', () => {
      expect(getProfitColorClass(100)).toBe('text-green-400');
    });

    it('returns correct color class for negative profit', () => {
      expect(getProfitColorClass(-100)).toBe('text-red-400');
    });

    it('returns correct color class for neutral profit', () => {
      expect(getProfitColorClass(0)).toBe('text-muted-foreground');
    });
  });

  describe('formatCurrency', () => {
    it('formats HUF currency correctly', () => {
      const result = formatCurrency(1000, 'HUF');
      expect(result).toContain('1,000');
      expect(result).toContain('Ft');
    });

    it('formats EUR currency correctly', () => {
      const result = formatCurrency(1000, 'EUR');
      expect(result).toContain('1,000');
      expect(result).toContain('€');
    });

    it('formats USD currency correctly', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toContain('1,000');
      expect(result).toContain('$');
    });

    it('uses custom formatting options', () => {
      const result = formatCurrency(1000.50, 'HUF', { minimumFractionDigits: 2 });
      expect(result).toContain('1,000.50');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage correctly', () => {
      const result = formatPercentage(15.5);
      expect(result).toContain('15.50%');
    });

    it('uses custom formatting options', () => {
      const result = formatPercentage(15.5, { minimumFractionDigits: 1 });
      expect(result).toContain('15.5%');
    });
  });

  describe('saveCalculatorOptions', () => {
    it('saves options to localStorage', () => {
      const options = { ...DEFAULT_CALCULATOR_OPTIONS, decimalPlaces: 3 };
      saveCalculatorOptions(options);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'calculator-options',
        JSON.stringify(options)
      );
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const options = { ...DEFAULT_CALCULATOR_OPTIONS };
      saveCalculatorOptions(options);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('loadCalculatorOptions', () => {
    it('loads options from localStorage', () => {
      const savedOptions = { ...DEFAULT_CALCULATOR_OPTIONS, decimalPlaces: 3 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedOptions));
      
      const result = loadCalculatorOptions();
      expect(result).toEqual(savedOptions);
    });

    it('returns default options when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = loadCalculatorOptions();
      expect(result).toEqual(DEFAULT_CALCULATOR_OPTIONS);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = loadCalculatorOptions();
      expect(result).toEqual(DEFAULT_CALCULATOR_OPTIONS);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = loadCalculatorOptions();
      expect(result).toEqual(DEFAULT_CALCULATOR_OPTIONS);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
