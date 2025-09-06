/**
 * CalculatorButton Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorButton } from '../CalculatorButton';
import { useCalculator } from '@/lib/hooks/use-calculator';

// Mock the useCalculator hook
jest.mock('@/lib/hooks/use-calculator');
const mockUseCalculator = useCalculator as jest.MockedFunction<typeof useCalculator>;

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

const mockOnClick = jest.fn();

describe('CalculatorButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCalculator.mockReturnValue(mockCalculatorState);
  });

  it('should render calculator button with correct text', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Kalkulátor')).toBeInTheDocument();
  });

  it('should render calculator button with icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      />
    );

    const calculatorIcon = screen.getByTestId('calculator-icon');
    expect(calculatorIcon).toBeInTheDocument();
  });

  it('should handle button click', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByText('Kalkulátor');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle button click with opportunity data', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByText('Kalkulátor');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(mockOpportunity);
  });

  it('should handle keyboard navigation', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByText('Kalkulátor');
    button.focus();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('should handle disabled state', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByText('Kalkulátor');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByText('Kalkulátor');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        isLoading={true}
      />
    );

    expect(screen.getByText('Betöltés...')).toBeInTheDocument();
    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should not call onClick when loading', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        isLoading={true}
      />
    );

    const button = screen.getByText('Betöltés...');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should handle different button variants', () => {
    const { rerender } = render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        variant="default"
      />
    );

    let button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('bg-primary');

    rerender(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        variant="outline"
      />
    );

    button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('border-primary');

    rerender(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        variant="ghost"
      />
    );

    button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('hover:bg-primary/10');
  });

  it('should handle different button sizes', () => {
    const { rerender } = render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        size="sm"
      />
    );

    let button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('h-8', 'px-3', 'text-sm');

    rerender(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        size="lg"
      />
    );

    button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('h-12', 'px-8', 'text-lg');
  });

  it('should handle custom className', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        className="custom-class"
      />
    );

    const button = screen.getByText('Kalkulátor');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle button with tooltip', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        tooltip="Open calculator for this opportunity"
      />
    );

    const button = screen.getByText('Kalkulátor');
    expect(button).toHaveAttribute('title', 'Open calculator for this opportunity');
  });

  it('should handle button with custom text', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        text="Custom Text"
      />
    );

    expect(screen.getByText('Custom Text')).toBeInTheDocument();
    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should handle button with custom icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        icon="custom-icon"
      />
    );

    const customIcon = screen.getByTestId('custom-icon');
    expect(customIcon).toBeInTheDocument();
  });

  it('should handle button with no icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showIcon={false}
      />
    );

    expect(screen.queryByTestId('calculator-icon')).not.toBeInTheDocument();
  });

  it('should handle button with no text', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showText={false}
      />
    );

    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should handle button with only icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showText={false}
        showIcon={true}
      />
    );

    expect(screen.getByTestId('calculator-icon')).toBeInTheDocument();
    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should handle button with only text', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showText={true}
        showIcon={false}
      />
    );

    expect(screen.getByText('Kalkulátor')).toBeInTheDocument();
    expect(screen.queryByTestId('calculator-icon')).not.toBeInTheDocument();
  });

  it('should handle button with no content', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showText={false}
        showIcon={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('');
  });

  it('should handle button with custom aria-label', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        ariaLabel="Custom aria label"
      />
    );

    const button = screen.getByText('Kalkulátor');
    expect(button).toHaveAttribute('aria-label', 'Custom aria label');
  });

  it('should handle button with custom data attributes', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        data-testid="custom-calculator-button"
      />
    );

    const button = screen.getByTestId('custom-calculator-button');
    expect(button).toBeInTheDocument();
  });

  it('should handle button with custom event handlers', () => {
    const mockOnMouseEnter = jest.fn();
    const mockOnMouseLeave = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onMouseEnter={mockOnMouseEnter}
        onMouseLeave={mockOnMouseLeave}
      />
    );

    const button = screen.getByText('Kalkulátor');
    
    fireEvent.mouseEnter(button);
    expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(button);
    expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom focus handlers', () => {
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    const button = screen.getByText('Kalkulátor');
    
    fireEvent.focus(button);
    expect(mockOnFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(button);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom key handlers', () => {
    const mockOnKeyDown = jest.fn();
    const mockOnKeyUp = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
      />
    );

    const button = screen.getByText('Kalkulátor');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);

    fireEvent.keyUp(button, { key: 'Enter' });
    expect(mockOnKeyUp).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom ref', () => {
    const mockRef = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        ref={mockRef}
      />
    );

    expect(mockRef).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom children', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(screen.getByText('Custom Children')).toBeInTheDocument();
    expect(screen.queryByText('Kalkulátor')).not.toBeInTheDocument();
  });

  it('should handle button with custom children and text', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        text="Button Text"
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(screen.getByText('Custom Children')).toBeInTheDocument();
    expect(screen.queryByText('Button Text')).not.toBeInTheDocument();
  });

  it('should handle button with custom children and icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        icon="custom-icon"
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(screen.getByText('Custom Children')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
  });

  it('should handle button with custom children and no text/icon', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        showText={false}
        showIcon={false}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(screen.getByText('Custom Children')).toBeInTheDocument();
  });

  it('should handle button with custom children and loading state', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        isLoading={true}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(screen.getByText('Betöltés...')).toBeInTheDocument();
    expect(screen.queryByText('Custom Children')).not.toBeInTheDocument();
  });

  it('should handle button with custom children and disabled state', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        disabled={true}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    expect(button).toBeDisabled();
  });

  it('should handle button with custom children and custom className', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        className="custom-class"
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle button with custom children and custom aria-label', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        ariaLabel="Custom aria label"
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    expect(button).toHaveAttribute('aria-label', 'Custom aria label');
  });

  it('should handle button with custom children and custom data attributes', () => {
    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        data-testid="custom-calculator-button"
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByTestId('custom-calculator-button');
    expect(button).toBeInTheDocument();
  });

  it('should handle button with custom children and custom event handlers', () => {
    const mockOnMouseEnter = jest.fn();
    const mockOnMouseLeave = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onMouseEnter={mockOnMouseEnter}
        onMouseLeave={mockOnMouseLeave}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    
    fireEvent.mouseEnter(button);
    expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(button);
    expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom children and custom focus handlers', () => {
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    
    fireEvent.focus(button);
    expect(mockOnFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(button);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom children and custom key handlers', () => {
    const mockOnKeyDown = jest.fn();
    const mockOnKeyUp = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    const button = screen.getByText('Custom Children');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);

    fireEvent.keyUp(button, { key: 'Enter' });
    expect(mockOnKeyUp).toHaveBeenCalledTimes(1);
  });

  it('should handle button with custom children and custom ref', () => {
    const mockRef = jest.fn();

    render(
      <CalculatorButton 
        opportunity={mockOpportunity}
        onClick={mockOnClick}
        ref={mockRef}
      >
        <span>Custom Children</span>
      </CalculatorButton>
    );

    expect(mockRef).toHaveBeenCalledTimes(1);
  });
});