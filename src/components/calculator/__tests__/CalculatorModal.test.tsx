/**
 * CalculatorModal Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorModal } from '../CalculatorModal';
import { useCalculator } from '@/lib/hooks/use-calculator';
import { calculateResult } from '@/lib/utils/calculator';

// Mock the useCalculator hook
jest.mock('@/lib/hooks/use-calculator');
const mockUseCalculator = useCalculator as jest.MockedFunction<typeof useCalculator>;

// Mock the calculateResult utility
jest.mock('@/lib/utils/calculator');
const mockCalculateResult = calculateResult as jest.MockedFunction<typeof calculateResult>;

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

const mockCalculatorState = {
  stake: 100,
  setStake: jest.fn(),
  reset: jest.fn()
};

const mockCalculationResult = {
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

const mockOnClose = jest.fn();

describe('CalculatorModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCalculator.mockReturnValue(mockCalculatorState);
    mockCalculateResult.mockReturnValue(mockCalculationResult);
  });

  it('should render calculator modal when open', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    expect(screen.getByText('Kalkulátor')).toBeInTheDocument();
    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
  });

  it('should not render calculator modal when closed', () => {
    render(
      <CalculatorModal 
        isOpen={false}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should display opportunity information', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.getByText('soccer')).toBeInTheDocument();
    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('should handle close button click', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const closeButton = screen.getByText('Bezárás');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle close button with X icon', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const closeIcon = screen.getByTestId('close-icon');
    fireEvent.click(closeIcon);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle calculation', async () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 100,
        opportunity: mockOpportunity
      });
    });
  });

  it('should display calculation results', async () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Számítási Eredmények')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // stake
      expect(screen.getByText('250')).toBeInTheDocument(); // payout
      expect(screen.getByText('150')).toBeInTheDocument(); // profit
      expect(screen.getByText('150%')).toBeInTheDocument(); // roi
    });
  });

  it('should handle calculation error', async () => {
    mockCalculateResult.mockImplementation(() => {
      throw new Error('Calculation failed');
    });

    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Hiba történt a számítás során')).toBeInTheDocument();
    });
  });

  it('should show loading state during calculation', async () => {
    mockCalculateResult.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockCalculationResult), 1000);
      });
    });

    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    expect(screen.getByText('Számítás...')).toBeInTheDocument();
  });

  it('should handle reset button click', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockCalculatorState.reset).toHaveBeenCalledTimes(1);
  });

  it('should handle save button click', async () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Mentés');
      fireEvent.click(saveButton);
    });

    expect(screen.getByText('Kalkuláció mentve!')).toBeInTheDocument();
  });

  it('should handle share button click', async () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      const shareButton = screen.getByText('Megosztás');
      fireEvent.click(shareButton);
    });

    expect(screen.getByText('Kalkuláció megosztva!')).toBeInTheDocument();
  });

  it('should handle modal close with escape key', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle modal close with backdrop click', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close modal when clicking inside content', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle opportunity without profit margin', () => {
    const opportunityWithoutMargin = { ...mockOpportunity, profit_margin: 0 };
    
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={opportunityWithoutMargin}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle opportunity with very high profit margin', () => {
    const highMarginOpportunity = { ...mockOpportunity, profit_margin: 99.99 };
    
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={highMarginOpportunity}
      />
    );

    expect(screen.getByText('99.99%')).toBeInTheDocument();
  });

  it('should handle opportunity with very long event name', () => {
    const longEventNameOpportunity = { 
      ...mockOpportunity, 
      event_name: 'Very Long Event Name That Should Be Truncated Because It Is Too Long To Display Properly'
    };
    
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={longEventNameOpportunity}
      />
    );

    expect(screen.getByText('Very Long Event Name That Should Be Truncated Because It Is Too Long To Display Properly')).toBeInTheDocument();
  });

  it('should handle opportunity with zero odds', () => {
    const zeroOddsOpportunity = { ...mockOpportunity, odds: 0 };
    
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={zeroOddsOpportunity}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle opportunity with very high odds', () => {
    const highOddsOpportunity = { ...mockOpportunity, odds: 999.99 };
    
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={highOddsOpportunity}
      />
    );

    expect(screen.getByText('999.99')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const modal = screen.getByTestId('calculator-modal');
    expect(modal).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const modal = screen.getByTestId('calculator-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'calculator-title');

    const closeButton = screen.getByText('Bezárás');
    expect(closeButton).toHaveAttribute('aria-label', 'Close calculator');

    const calculateButton = screen.getByText('Számítás');
    expect(calculateButton).toHaveAttribute('aria-label', 'Calculate results');
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    calculateButton.focus();

    fireEvent.keyDown(calculateButton, { key: 'Enter' });
    expect(mockCalculateResult).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(calculateButton, { key: ' ' });
    expect(mockCalculateResult).toHaveBeenCalledTimes(2);
  });

  it('should handle calculation with different stake amounts', async () => {
    const { rerender } = render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 100,
        opportunity: mockOpportunity
      });
    });

    // Test with different stake
    mockUseCalculator.mockReturnValue({
      ...mockCalculatorState,
      stake: 200
    });

    rerender(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 200,
        opportunity: mockOpportunity
      });
    });
  });

  it('should handle calculation with different opportunities', async () => {
    const differentOpportunity = {
      ...mockOpportunity,
      id: '2',
      event_name: 'Different Event',
      odds: 3.0,
      profit_margin: 10.5
    };

    const { rerender } = render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 100,
        opportunity: mockOpportunity
      });
    });

    rerender(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={differentOpportunity}
      />
    );

    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 100,
        opportunity: differentOpportunity
      });
    });
  });

  it('should handle calculation with zero stake', async () => {
    mockUseCalculator.mockReturnValue({
      ...mockCalculatorState,
      stake: 0
    });

    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 0,
        opportunity: mockOpportunity
      });
    });
  });

  it('should handle calculation with very high stake', async () => {
    mockUseCalculator.mockReturnValue({
      ...mockCalculatorState,
      stake: 1000000
    });

    render(
      <CalculatorModal 
        isOpen={true}
        onClose={mockOnClose}
        opportunity={mockOpportunity}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(mockCalculateResult).toHaveBeenCalledWith({
        stake: 1000000,
        opportunity: mockOpportunity
      });
    });
  });
});
