/**
 * BetTrackerPanel Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BetTrackerPanel } from '../BetTrackerPanel';
import { useBetTrackerData, useBetTrackerActions } from '../BetTrackerProvider';
import { BetTrackerItem as BetTrackerItemType } from '@/lib/types/bet-tracker';

// Mock the BetTrackerProvider hooks
jest.mock('../BetTrackerProvider');
const mockUseBetTrackerData = useBetTrackerData as jest.MockedFunction<typeof useBetTrackerData>;
const mockUseBetTrackerActions = useBetTrackerActions as jest.MockedFunction<typeof useBetTrackerActions>;

// Mock data
const mockTrackedBets: BetTrackerItemType[] = [
  {
    id: '1',
    event_name: 'Manchester United vs Liverpool',
    sport: 'soccer',
    bookmaker: 'Bet365',
    odds: 2.5,
    stake: 100,
    potential_payout: 250,
    profit: 150,
    status: 'pending',
    notes: 'Test bet 1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    event_name: 'Lakers vs Warriors',
    sport: 'basketball',
    bookmaker: 'William Hill',
    odds: 1.8,
    stake: 200,
    potential_payout: 360,
    profit: 160,
    status: 'won',
    notes: 'Test bet 2',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02')
  },
  {
    id: '3',
    event_name: 'Djokovic vs Nadal',
    sport: 'tennis',
    bookmaker: 'Unibet',
    odds: 3.0,
    stake: 150,
    potential_payout: 450,
    profit: -150,
    status: 'lost',
    notes: 'Test bet 3',
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03')
  }
];

const mockBetTrackerData = {
  trackedBets: mockTrackedBets,
  isLoading: false,
  error: null
};

const mockBetTrackerActions = {
  removeFromTracker: jest.fn(),
  updateBet: jest.fn(),
  clearTracker: jest.fn()
};

describe('BetTrackerPanel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    mockUseBetTrackerData.mockReturnValue(mockBetTrackerData);
    mockUseBetTrackerActions.mockReturnValue(mockBetTrackerActions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render bet tracker panel with correct title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Bet Tracker')).toBeInTheDocument();
  });

  it('should display tracked bets', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
    expect(screen.getByText('Djokovic vs Nadal')).toBeInTheDocument();
  });

  it('should display correct statistics', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    // Check summary statistics
    expect(screen.getByText('3')).toBeInTheDocument(); // totalBets
    expect(screen.getByText('1')).toBeInTheDocument(); // pendingBets
    expect(screen.getByText('1')).toBeInTheDocument(); // wonBets
    expect(screen.getByText('1')).toBeInTheDocument(); // lostBets
  });

  it('should display profit summary', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Összes Tét')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument(); // totalStake
    expect(screen.getByText('Összes Profit')).toBeInTheDocument();
    expect(screen.getByText('160')).toBeInTheDocument(); // totalProfit
    expect(screen.getByText('Sikerességi Arány')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // winRate
  });

  it('should handle filter by status', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const filterSelect = screen.getByDisplayValue('Összes');
    fireEvent.change(filterSelect, { target: { value: 'pending' } });

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
    expect(screen.queryByText('Djokovic vs Nadal')).not.toBeInTheDocument();
  });

  it('should handle search functionality', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Keresés...');
    fireEvent.change(searchInput, { target: { value: 'Manchester' } });

    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
    expect(screen.queryByText('Djokovic vs Nadal')).not.toBeInTheDocument();
  });

  it('should handle clear all button', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const clearButton = screen.getByText('Törlés');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockBetTrackerActions.clearTracker).toHaveBeenCalledTimes(1);
    });
  });

  it('should show loading state when data is loading', () => {
    mockUseBetTrackerData.mockReturnValue({
      ...mockBetTrackerData,
      isLoading: true
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Betöltés...')).toBeInTheDocument();
  });

  it('should show error state when there is an error', () => {
    mockUseBetTrackerData.mockReturnValue({
      ...mockBetTrackerData,
      error: new Error('Failed to load bet tracker data')
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
  });

  it('should show empty state when no bets are tracked', () => {
    mockUseBetTrackerData.mockReturnValue({
      ...mockBetTrackerData,
      trackedBets: []
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Nincs követett fogadás')).toBeInTheDocument();
    expect(screen.getByText('Kezdje el a fogadások követését az arbitrage táblából')).toBeInTheDocument();
  });

  it('should handle bet removal', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const removeButtons = screen.getAllByText('Törlés');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockBetTrackerActions.removeFromTracker).toHaveBeenCalledWith('1');
    });
  });

  it('should handle bet update', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByText('Szerkesztés');
    fireEvent.click(editButtons[0]);

    const stakeInput = screen.getByDisplayValue('100');
    fireEvent.change(stakeInput, { target: { value: '150' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockBetTrackerActions.updateBet).toHaveBeenCalledWith('1', {
        stake: 150,
        notes: 'Test bet 1',
        status: 'pending'
      });
    });
  });

  it('should handle bet status change', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByText('Szerkesztés');
    fireEvent.click(editButtons[0]);

    const statusSelect = screen.getByDisplayValue('Függőben');
    fireEvent.change(statusSelect, { target: { value: 'won' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockBetTrackerActions.updateBet).toHaveBeenCalledWith('1', {
        stake: 100,
        notes: 'Test bet 1',
        status: 'won'
      });
    });
  });

  it('should handle bet notes update', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByText('Szerkesztés');
    fireEvent.click(editButtons[0]);

    const notesInput = screen.getByDisplayValue('Test bet 1');
    fireEvent.change(notesInput, { target: { value: 'Updated notes' } });

    const saveButton = screen.getByText('Mentés');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockBetTrackerActions.updateBet).toHaveBeenCalledWith('1', {
        stake: 100,
        notes: 'Updated notes',
        status: 'pending'
      });
    });
  });

  it('should handle edit cancellation', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const editButtons = screen.getAllByText('Szerkesztés');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByText('Mégse');
    fireEvent.click(cancelButton);

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bet 1')).toBeInTheDocument();
  });

  it('should display correct status badges', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('Függőben')).toBeInTheDocument();
    expect(screen.getByText('Nyert')).toBeInTheDocument();
    expect(screen.getByText('Vesztett')).toBeInTheDocument();
  });

  it('should display correct profit colors', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const profitElements = screen.getAllByText(/\d+/);
    // Check if profit elements have correct colors
    expect(profitElements[0]).toHaveClass('text-green-400'); // Positive profit
    expect(profitElements[1]).toHaveClass('text-red-400'); // Negative profit
  });

  it('should handle search with different fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Keresés...');
    
    // Search by sport
    fireEvent.change(searchInput, { target: { value: 'soccer' } });
    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();

    // Search by bookmaker
    fireEvent.change(searchInput, { target: { value: 'Bet365' } });
    expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();

    // Search by event name
    fireEvent.change(searchInput, { target: { value: 'Lakers' } });
    expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
  });

  it('should handle combined filters and search', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    // Set filter to won bets
    const filterSelect = screen.getByDisplayValue('Összes');
    fireEvent.change(filterSelect, { target: { value: 'won' } });

    // Search for basketball
    const searchInput = screen.getByPlaceholderText('Keresés...');
    fireEvent.change(searchInput, { target: { value: 'basketball' } });

    expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
    expect(screen.queryByText('Manchester United vs Liverpool')).not.toBeInTheDocument();
    expect(screen.queryByText('Djokovic vs Nadal')).not.toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel className="w-full md:w-1/2 lg:w-1/3" />
      </QueryClientProvider>
    );

    const panel = screen.getByTestId('bet-tracker-panel');
    expect(panel).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const panel = screen.getByTestId('bet-tracker-panel');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-label', 'Bet Tracker Panel');

    const searchInput = screen.getByPlaceholderText('Keresés...');
    expect(searchInput).toHaveAttribute('aria-label', 'Search bets');

    const filterSelect = screen.getByDisplayValue('Összes');
    expect(filterSelect).toHaveAttribute('aria-label', 'Filter by status');
  });

  it('should handle keyboard navigation', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const clearButton = screen.getByText('Törlés');
    clearButton.focus();

    fireEvent.keyDown(clearButton, { key: 'Enter' });
    expect(mockBetTrackerActions.clearTracker).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(clearButton, { key: ' ' });
    expect(mockBetTrackerActions.clearTracker).toHaveBeenCalledTimes(2);
  });

  it('should handle large number of bets', () => {
    const largeBetList = Array.from({ length: 100 }, (_, i) => ({
      ...mockTrackedBets[0],
      id: `bet-${i}`,
      event_name: `Event ${i}`,
      created_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
    }));

    mockUseBetTrackerData.mockReturnValue({
      ...mockBetTrackerData,
      trackedBets: largeBetList
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    expect(screen.getByText('100')).toBeInTheDocument(); // totalBets
    expect(screen.getByText('Event 0')).toBeInTheDocument();
    expect(screen.getByText('Event 99')).toBeInTheDocument();
  });

  it('should handle debounced search', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BetTrackerPanel />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText('Keresés...');
    
    // Type quickly
    fireEvent.change(searchInput, { target: { value: 'M' } });
    fireEvent.change(searchInput, { target: { value: 'Ma' } });
    fireEvent.change(searchInput, { target: { value: 'Man' } });
    fireEvent.change(searchInput, { target: { value: 'Manchester' } });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});