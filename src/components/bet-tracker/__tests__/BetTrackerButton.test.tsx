import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BetTrackerButton } from '../BetTrackerButton';
import { BetTrackerProvider } from '../BetTrackerProvider';
import { ArbitrageOpportunity } from '@/lib/mock-data';

// Mock data
const mockOpportunity: ArbitrageOpportunity = {
  id: 'test-opportunity-1',
  event: 'Test Match',
  sport: 'Football',
  outcome: 'Home Win',
  profitMargin: 5.2,
  bet1: {
    bookmaker: 'TestBookmaker1',
    odds: 2.5,
    outcome: 'Home Win'
  },
  bet2: {
    bookmaker: 'TestBookmaker2',
    odds: 2.1,
    outcome: 'Away Win'
  },
  stakes: {
    bet1: {
      stake: 100,
      profit: 150
    },
    bet2: {
      stake: 119,
      profit: 250
    }
  },
  totalStake: 219,
  expectedProfit: 50,
  timeToExpiry: '2h 30m',
  probability: 0.4,
  category: 'arbitrage' as const
};

// Mock BetTrackerProvider
const MockBetTrackerProvider = ({ children }: { children: React.ReactNode }) => (
  <BetTrackerProvider>
    {children}
  </BetTrackerProvider>
);

describe('BetTrackerButton', () => {
  it('should render with correct initial state', () => {
    render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} />
      </MockBetTrackerProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border-primary/20');
  });

  it('should show loading state when clicked', async () => {
    render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} />
      </MockBetTrackerProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveClass('opacity-50');
    });
  });

  it('should show success state after successful add', async () => {
    render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} />
      </MockBetTrackerProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveClass('border-green-500/50');
    }, { timeout: 3000 });
  });

  it('should be disabled when already added', () => {
    render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} isAdded={true} />
      </MockBetTrackerProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should handle different sizes correctly', () => {
    const { rerender } = render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} size="sm" />
      </MockBetTrackerProvider>
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');

    rerender(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} size="lg" />
      </MockBetTrackerProvider>
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('should handle different variants correctly', () => {
    const { rerender } = render(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} variant="outline" />
      </MockBetTrackerProvider>
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('border-primary/20');

    rerender(
      <MockBetTrackerProvider>
        <BetTrackerButton opportunity={mockOpportunity} variant="default" />
      </MockBetTrackerProvider>
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });
});
