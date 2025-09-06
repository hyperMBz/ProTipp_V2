/**
 * CalculatorResults Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorResults } from '../CalculatorResults';
import { CalculatorResult } from '@/lib/types/calculator';

// Mock data
const mockOpportunity = {
  id: '1',
  event_name: 'Manchester United vs Liverpool',
  sport: 'soccer',
  bookmaker: 'Bet365',
  odds: 2.5,
  profit_margin: 5.2,
  arbitrage_type: 'back_lay',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
};

const mockResult: CalculatorResult = {
  stake: 100,
  totalStake: 100,
  totalPayout: 250,
  profit: 150,
  roi: 150,
  breakdown: [
    {
      bookmaker: 'Bet365',
      stake: 100,
      odds: 2.5,
      payout: 250
    }
  ]
};

const mockOnSave = jest.fn();
const mockOnShare = jest.fn();

describe('CalculatorResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calculator results with correct title', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Számítási Eredmények')).toBeInTheDocument();
  });

  it('should display calculation results correctly', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument(); // stake
    expect(screen.getByText('250')).toBeInTheDocument(); // payout
    expect(screen.getByText('150')).toBeInTheDocument(); // profit
    expect(screen.getByText('150%')).toBeInTheDocument(); // roi
  });

  it('should display breakdown information', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('should display positive profit with green color', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const profitElement = screen.getByText('150');
    expect(profitElement).toHaveClass('text-green-400');
  });

  it('should display negative profit with red color', () => {
    const negativeResult = { ...mockResult, profit: -50 };
    
    render(
      <CalculatorResults 
        result={negativeResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const profitElement = screen.getByText('-50');
    expect(profitElement).toHaveClass('text-red-400');
  });

  it('should display zero profit with neutral color', () => {
    const zeroResult = { ...mockResult, profit: 0 };
    
    render(
      <CalculatorResults 
        result={zeroResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const profitElement = screen.getByText('0');
    expect(profitElement).toHaveClass('text-muted-foreground');
  });

  it('should display positive ROI with green color', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const roiElement = screen.getByText('150%');
    expect(roiElement).toHaveClass('text-green-400');
  });

  it('should display negative ROI with red color', () => {
    const negativeROIResult = { ...mockResult, roi: -25 };
    
    render(
      <CalculatorResults 
        result={negativeROIResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const roiElement = screen.getByText('-25%');
    expect(roiElement).toHaveClass('text-red-400');
  });

  it('should display zero ROI with neutral color', () => {
    const zeroROIResult = { ...mockResult, roi: 0 };
    
    render(
      <CalculatorResults 
        result={zeroROIResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const roiElement = screen.getByText('0%');
    expect(roiElement).toHaveClass('text-muted-foreground');
  });

  it('should handle save button click', async () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle share button click', async () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByText('Megosztás');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle save error', async () => {
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Hiba történt a mentés során')).toBeInTheDocument();
    });
  });

  it('should handle share error', async () => {
    mockOnShare.mockRejectedValue(new Error('Share failed'));

    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByText('Megosztás');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Hiba történt a megosztás során')).toBeInTheDocument();
    });
  });

  it('should show loading state during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    expect(screen.getByText('Mentés...')).toBeInTheDocument();
  });

  it('should show loading state during share', async () => {
    mockOnShare.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const shareButton = screen.getByText('Megosztás');
    fireEvent.click(shareButton);

    expect(screen.getByText('Megosztás...')).toBeInTheDocument();
  });

  it('should handle multiple breakdown items', () => {
    const multiBreakdownResult = {
      ...mockResult,
      breakdown: [
        {
          bookmaker: 'Bet365',
          stake: 50,
          odds: 2.5,
          payout: 125
        },
        {
          bookmaker: 'William Hill',
          stake: 50,
          odds: 2.0,
          payout: 100
        }
      ]
    };

    render(
      <CalculatorResults 
        result={multiBreakdownResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('William Hill')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should handle empty breakdown', () => {
    const emptyBreakdownResult = { ...mockResult, breakdown: [] };

    render(
      <CalculatorResults 
        result={emptyBreakdownResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Nincs elérhető részletezés')).toBeInTheDocument();
  });

  it('should handle very large numbers', () => {
    const largeNumbersResult = {
      ...mockResult,
      stake: 1000000,
      totalStake: 1000000,
      totalPayout: 2500000,
      profit: 1500000,
      roi: 150
    };

    render(
      <CalculatorResults 
        result={largeNumbersResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('2,500,000')).toBeInTheDocument();
    expect(screen.getByText('1,500,000')).toBeInTheDocument();
  });

  it('should handle decimal numbers', () => {
    const decimalResult = {
      ...mockResult,
      stake: 100.50,
      totalStake: 100.50,
      totalPayout: 251.25,
      profit: 150.75,
      roi: 150.25
    };

    render(
      <CalculatorResults 
        result={decimalResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('100.50')).toBeInTheDocument();
    expect(screen.getByText('251.25')).toBeInTheDocument();
    expect(screen.getByText('150.75')).toBeInTheDocument();
    expect(screen.getByText('150.25%')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    const zeroResult = {
      ...mockResult,
      stake: 0,
      totalStake: 0,
      totalPayout: 0,
      profit: 0,
      roi: 0
    };

    render(
      <CalculatorResults 
        result={zeroResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const results = screen.getByTestId('calculator-results');
    expect(results).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const results = screen.getByTestId('calculator-results');
    expect(results).toHaveAttribute('role', 'region');
    expect(results).toHaveAttribute('aria-label', 'Calculator Results');

    const saveButton = screen.getByText('Mentés');
    expect(saveButton).toHaveAttribute('aria-label', 'Save calculation results');

    const shareButton = screen.getByText('Megosztás');
    expect(shareButton).toHaveAttribute('aria-label', 'Share calculation results');
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalculatorResults 
        result={mockResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    const saveButton = screen.getByText('Mentés');
    saveButton.focus();

    fireEvent.keyDown(saveButton, { key: 'Enter' });
    expect(mockOnSave).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(saveButton, { key: ' ' });
    expect(mockOnSave).toHaveBeenCalledTimes(2);
  });

  it('should handle result with missing optional fields', () => {
    const incompleteResult = {
      stake: 100,
      totalStake: 100,
      totalPayout: 250,
      profit: 150,
      roi: 150,
      breakdown: []
    };

    render(
      <CalculatorResults 
        result={incompleteResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should handle result with very high ROI', () => {
    const highROIResult = { ...mockResult, roi: 999.99 };

    render(
      <CalculatorResults 
        result={highROIResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('999.99%')).toBeInTheDocument();
  });

  it('should handle result with very low ROI', () => {
    const lowROIResult = { ...mockResult, roi: -99.99 };

    render(
      <CalculatorResults 
        result={lowROIResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('-99.99%')).toBeInTheDocument();
  });

  it('should handle result with very high profit', () => {
    const highProfitResult = { ...mockResult, profit: 999999.99 };

    render(
      <CalculatorResults 
        result={highProfitResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('999,999.99')).toBeInTheDocument();
  });

  it('should handle result with very low profit', () => {
    const lowProfitResult = { ...mockResult, profit: -999999.99 };

    render(
      <CalculatorResults 
        result={lowProfitResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('-999,999.99')).toBeInTheDocument();
  });

  it('should handle result with very high stake', () => {
    const highStakeResult = { ...mockResult, stake: 999999.99 };

    render(
      <CalculatorResults 
        result={highStakeResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('999,999.99')).toBeInTheDocument();
  });

  it('should handle result with very high payout', () => {
    const highPayoutResult = { ...mockResult, totalPayout: 999999.99 };

    render(
      <CalculatorResults 
        result={highPayoutResult}
        opportunity={mockOpportunity}
        onSave={mockOnSave}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('999,999.99')).toBeInTheDocument();
  });
});