/**
 * CalculatorForm Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorForm } from '../CalculatorForm';
import { validateStake, formatCurrency } from '@/lib/utils/calculator';

// Mock the utility functions
jest.mock('@/lib/utils/calculator');
const mockValidateStake = validateStake as jest.MockedFunction<typeof validateStake>;
const mockFormatCurrency = formatCurrency as jest.MockedFunction<typeof formatCurrency>;

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

const mockOnCalculate = jest.fn();
const mockOnReset = jest.fn();

describe('CalculatorForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateStake.mockReturnValue({ isValid: true, error: null });
    mockFormatCurrency.mockReturnValue('100.00');
  });

  it('should render calculator form with correct title', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Kalkulátor Form')).toBeInTheDocument();
  });

  it('should display opportunity information', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.getByText('soccer')).toBeInTheDocument();
    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('should render stake input field', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    expect(stakeInput).toBeInTheDocument();
    expect(stakeInput).toHaveAttribute('type', 'number');
    expect(stakeInput).toHaveAttribute('placeholder', 'Adja meg a tét összegét');
  });

  it('should handle stake input change', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '150' } });

    expect(stakeInput).toHaveValue(150);
  });

  it('should validate stake input', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '150' } });

    expect(mockValidateStake).toHaveBeenCalledWith(150, 0, 1000000);
  });

  it('should display validation error for invalid stake', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl alacsony' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '10' } });

    expect(screen.getByText('A tét összege túl alacsony')).toBeInTheDocument();
  });

  it('should display validation error for stake too high', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl magas' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '2000000' } });

    expect(screen.getByText('A tét összege túl magas')).toBeInTheDocument();
  });

  it('should handle calculate button click with valid stake', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '150' } });

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).toHaveBeenCalledWith(150);
  });

  it('should not call onCalculate with invalid stake', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl alacsony' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '10' } });

    const calculateButton = screen.getByText('Számítás');
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  it('should handle reset button click', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should handle Enter key press for calculation', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '150' } });
    fireEvent.keyDown(stakeInput, { key: 'Enter' });

    expect(mockOnCalculate).toHaveBeenCalledWith(150);
  });

  it('should not handle Enter key press with invalid stake', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl alacsony' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '10' } });
    fireEvent.keyDown(stakeInput, { key: 'Enter' });

    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  it('should display quick stake buttons', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2500')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('should handle quick stake button clicks', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const quickStakeButton = screen.getByText('500');
    fireEvent.click(quickStakeButton);

    const stakeInput = screen.getByLabelText('Tét összege');
    expect(stakeInput).toHaveValue(500);
  });

  it('should show loading state when calculating', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
        isLoading={true}
      />
    );

    expect(screen.getByText('Számítás...')).toBeInTheDocument();
    expect(screen.getByText('Számítás')).toBeDisabled();
  });

  it('should show error state when there is an error', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
        error="Calculation failed"
      />
    );

    expect(screen.getByText('Calculation failed')).toBeInTheDocument();
  });

  it('should disable calculate button when loading', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
        isLoading={true}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    expect(calculateButton).toBeDisabled();
  });

  it('should disable calculate button when stake is invalid', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl alacsony' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '10' } });

    const calculateButton = screen.getByText('Számítás');
    expect(calculateButton).toBeDisabled();
  });

  it('should handle stake input with decimal values', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '150.50' } });

    expect(stakeInput).toHaveValue(150.50);
  });

  it('should handle stake input with negative values', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege nem lehet negatív' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '-100' } });

    expect(screen.getByText('A tét összege nem lehet negatív')).toBeInTheDocument();
  });

  it('should handle stake input with zero value', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege nem lehet nulla' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '0' } });

    expect(screen.getByText('A tét összege nem lehet nulla')).toBeInTheDocument();
  });

  it('should handle stake input with very large values', () => {
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl magas' 
    });

    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '999999999' } });

    expect(screen.getByText('A tét összege túl magas')).toBeInTheDocument();
  });

  it('should clear validation error when stake becomes valid', () => {
    const { rerender } = render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    // First set invalid stake
    mockValidateStake.mockReturnValue({ 
      isValid: false, 
      error: 'A tét összege túl alacsony' 
    });

    const stakeInput = screen.getByLabelText('Tét összege');
    fireEvent.change(stakeInput, { target: { value: '10' } });

    expect(screen.getByText('A tét összege túl alacsony')).toBeInTheDocument();

    // Then set valid stake
    mockValidateStake.mockReturnValue({ 
      isValid: true, 
      error: null 
    });

    fireEvent.change(stakeInput, { target: { value: '150' } });

    expect(screen.queryByText('A tét összege túl alacsony')).not.toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
        className="w-full md:w-1/2 lg:w-1/3"
      />
    );

    const form = screen.getByTestId('calculator-form');
    expect(form).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const form = screen.getByTestId('calculator-form');
    expect(form).toHaveAttribute('role', 'form');
    expect(form).toHaveAttribute('aria-label', 'Calculator Form');

    const stakeInput = screen.getByLabelText('Tét összege');
    expect(stakeInput).toHaveAttribute('aria-label', 'Stake amount');
    expect(stakeInput).toHaveAttribute('aria-required', 'true');

    const calculateButton = screen.getByText('Számítás');
    expect(calculateButton).toHaveAttribute('aria-label', 'Calculate results');

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toHaveAttribute('aria-label', 'Reset form');
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const calculateButton = screen.getByText('Számítás');
    calculateButton.focus();

    fireEvent.keyDown(calculateButton, { key: 'Enter' });
    expect(mockOnCalculate).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(calculateButton, { key: ' ' });
    expect(mockOnCalculate).toHaveBeenCalledTimes(2);
  });

  it('should handle form submission', () => {
    render(
      <CalculatorForm 
        opportunity={mockOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    const form = screen.getByTestId('calculator-form');
    const stakeInput = screen.getByLabelText('Tét összege');
    
    fireEvent.change(stakeInput, { target: { value: '150' } });
    fireEvent.submit(form);

    expect(mockOnCalculate).toHaveBeenCalledWith(150);
  });

  it('should handle opportunity without profit margin', () => {
    const opportunityWithoutMargin = { ...mockOpportunity, profit_margin: 0 };
    
    render(
      <CalculatorForm 
        opportunity={opportunityWithoutMargin}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle opportunity with very high profit margin', () => {
    const highMarginOpportunity = { ...mockOpportunity, profit_margin: 99.99 };
    
    render(
      <CalculatorForm 
        opportunity={highMarginOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
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
      <CalculatorForm 
        opportunity={longEventNameOpportunity}
        onCalculate={mockOnCalculate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Very Long Event Name That Should Be Truncated Because It Is Too Long To Display Properly')).toBeInTheDocument();
  });
});