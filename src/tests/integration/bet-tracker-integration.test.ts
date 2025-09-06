/**
 * Bet Tracker Integration Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BetTrackerPanel } from '@/components/bet-tracker/BetTrackerPanel';
import { useBetTrackerData, useBetTrackerActions } from '@/components/bet-tracker/BetTrackerProvider';
import { betTrackerApi } from '@/lib/api/bet-tracker-api';

// Mock the bet tracker API
vi.mock('@/lib/api/bet-tracker-api');
const mockBetTrackerApi = betTrackerApi as any;

// Mock the BetTrackerProvider hooks
vi.mock('@/components/bet-tracker/BetTrackerProvider');
const mockUseBetTrackerData = useBetTrackerData as any;
const mockUseBetTrackerActions = useBetTrackerActions as any;

// Mock data
const mockTrackedBets = [
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
  }
];

describe('Bet Tracker Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    mockUseBetTrackerData.mockReturnValue({
      trackedBets: mockTrackedBets,
      isLoading: false,
      error: null
    });

    mockUseBetTrackerActions.mockReturnValue({
      removeFromTracker: vi.fn(),
      updateBet: vi.fn(),
      clearTracker: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching Integration', () => {
    it('should fetch tracked bets on component mount', async () => {
      mockBetTrackerApi.getTrackedBets.mockResolvedValue(mockTrackedBets);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockBetTrackerApi.getTrackedBets).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle data fetching error', async () => {
      const error = new Error('Failed to fetch tracked bets');
      mockBetTrackerApi.getTrackedBets.mockRejectedValue(error);

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: false,
        error: error
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle loading state during data fetch', async () => {
      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: true,
        error: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      expect(screen.getByText('Betöltés...')).toBeInTheDocument();
    });
  });

  describe('Bet Management Integration', () => {
    it('should add bet to tracker', async () => {
      const newBet = {
        event_name: 'New Event',
        sport: 'tennis',
        bookmaker: 'Unibet',
        odds: 3.0,
        stake: 150,
        potential_payout: 450,
        profit: 300,
        status: 'pending',
        notes: 'New bet'
      };

      mockBetTrackerApi.addToTracker.mockResolvedValue({ id: '3', ...newBet });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate adding bet
      await waitFor(() => {
        expect(mockBetTrackerApi.addToTracker).toHaveBeenCalledWith(newBet);
      });
    });

    it('should remove bet from tracker', async () => {
      const mockRemoveFromTracker = vi.fn();
      mockUseBetTrackerActions.mockReturnValue({
        removeFromTracker: mockRemoveFromTracker,
        updateBet: vi.fn(),
        clearTracker: vi.fn()
      });

      mockBetTrackerApi.removeFromTracker.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const removeButton = screen.getAllByText('Törlés')[0];
      removeButton.click();

      await waitFor(() => {
        expect(mockRemoveFromTracker).toHaveBeenCalledWith('1');
      });
    });

    it('should update bet in tracker', async () => {
      const mockUpdateBet = vi.fn();
      mockUseBetTrackerActions.mockReturnValue({
        removeFromTracker: vi.fn(),
        updateBet: mockUpdateBet,
        clearTracker: vi.fn()
      });

      const updateData = {
        stake: 150,
        notes: 'Updated notes',
        status: 'won'
      };

      mockBetTrackerApi.updateBet.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const editButton = screen.getAllByText('Szerkesztés')[0];
      editButton.click();

      const stakeInput = screen.getByDisplayValue('100');
      fireEvent.change(stakeInput, { target: { value: '150' } });

      const saveButton = screen.getByText('Mentés');
      saveButton.click();

      await waitFor(() => {
        expect(mockUpdateBet).toHaveBeenCalledWith('1', updateData);
      });
    });

    it('should clear all bets from tracker', async () => {
      const mockClearTracker = vi.fn();
      mockUseBetTrackerActions.mockReturnValue({
        removeFromTracker: vi.fn(),
        updateBet: vi.fn(),
        clearTracker: mockClearTracker
      });

      mockBetTrackerApi.clearTracker.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const clearButton = screen.getByText('Törlés');
      clearButton.click();

      await waitFor(() => {
        expect(mockClearTracker).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should subscribe to real-time bet updates', async () => {
      const mockSubscribe = vi.fn();
      mockBetTrackerApi.subscribeToBetUpdates.mockReturnValue(mockSubscribe);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockBetTrackerApi.subscribeToBetUpdates).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle real-time bet updates', async () => {
      const mockSubscribe = vi.fn();
      mockBetTrackerApi.subscribeToBetUpdates.mockReturnValue(mockSubscribe);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate real-time update
      const updatedBets = [
        ...mockTrackedBets,
        {
          id: '3',
          event_name: 'New Event',
          sport: 'tennis',
          bookmaker: 'Unibet',
          odds: 3.0,
          stake: 150,
          potential_payout: 450,
          profit: 300,
          status: 'pending',
          notes: 'New bet',
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-03')
        }
      ];

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: updatedBets,
        isLoading: false,
        error: null
      });

      await waitFor(() => {
        expect(screen.getByText('New Event')).toBeInTheDocument();
      });
    });

    it('should handle real-time subscription errors', async () => {
      const error = new Error('Real-time subscription failed');
      mockBetTrackerApi.subscribeToBetUpdates.mockRejectedValue(error);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration', () => {
    it('should handle search functionality', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const searchInput = screen.getByPlaceholderText('Keresés...');
      fireEvent.change(searchInput, { target: { value: 'Manchester' } });

      await waitFor(() => {
        expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
        expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
      });
    });

    it('should handle status filter', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const filterSelect = screen.getByDisplayValue('Összes');
      fireEvent.change(filterSelect, { target: { value: 'pending' } });

      await waitFor(() => {
        expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
        expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
      });
    });

    it('should handle combined search and filter', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      const searchInput = screen.getByPlaceholderText('Keresés...');
      fireEvent.change(searchInput, { target: { value: 'basketball' } });

      const filterSelect = screen.getByDisplayValue('Összes');
      fireEvent.change(filterSelect, { target: { value: 'won' } });

      await waitFor(() => {
        expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
        expect(screen.queryByText('Manchester United vs Liverpool')).not.toBeInTheDocument();
      });
    });
  });

  describe('Statistics Integration', () => {
    it('should calculate and display correct statistics', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Check summary statistics
      expect(screen.getByText('2')).toBeInTheDocument(); // totalBets
      expect(screen.getByText('1')).toBeInTheDocument(); // pendingBets
      expect(screen.getByText('1')).toBeInTheDocument(); // wonBets
      expect(screen.getByText('0')).toBeInTheDocument(); // lostBets
    });

    it('should calculate and display profit summary', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Check profit summary
      expect(screen.getByText('300')).toBeInTheDocument(); // totalStake
      expect(screen.getByText('310')).toBeInTheDocument(); // totalProfit
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // winRate
    });

    it('should handle empty tracker statistics', async () => {
      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: false,
        error: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      expect(screen.getByText('0')).toBeInTheDocument(); // totalBets
      expect(screen.getByText('0')).toBeInTheDocument(); // totalStake
      expect(screen.getByText('0')).toBeInTheDocument(); // totalProfit
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockBetTrackerApi.getTrackedBets.mockRejectedValue(networkError);

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: false,
        error: networkError
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle add bet errors', async () => {
      const addError = new Error('Failed to add bet');
      mockBetTrackerApi.addToTracker.mockRejectedValue(addError);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate adding bet
      await waitFor(() => {
        expect(screen.getByText('Hiba történt a fogadás hozzáadása során')).toBeInTheDocument();
      });
    });

    it('should handle update bet errors', async () => {
      const updateError = new Error('Failed to update bet');
      mockBetTrackerApi.updateBet.mockRejectedValue(updateError);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate updating bet
      await waitFor(() => {
        expect(screen.getByText('Hiba történt a frissítés során')).toBeInTheDocument();
      });
    });

    it('should handle remove bet errors', async () => {
      const removeError = new Error('Failed to remove bet');
      mockBetTrackerApi.removeFromTracker.mockRejectedValue(removeError);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate removing bet
      await waitFor(() => {
        expect(screen.getByText('Hiba történt a törlés során')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large number of tracked bets', async () => {
      const largeBetList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTrackedBets[0],
        id: `bet-${i}`,
        event_name: `Event ${i}`,
        created_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
      }));

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: largeBetList,
        isLoading: false,
        error: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument(); // totalBets
      });
    });

    it('should handle concurrent operations', async () => {
      mockBetTrackerApi.getTrackedBets.mockResolvedValue(mockTrackedBets);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // Simulate multiple concurrent operations
      const promises = [
        mockBetTrackerApi.getTrackedBets(),
        mockBetTrackerApi.addToTracker({}),
        mockBetTrackerApi.updateBet('1', {}),
        mockBetTrackerApi.removeFromTracker('1')
      ];

      await Promise.all(promises);

      expect(mockBetTrackerApi.getTrackedBets).toHaveBeenCalledTimes(2); // 1 initial + 1 concurrent
    });

    it('should handle data caching', async () => {
      mockBetTrackerApi.getTrackedBets.mockResolvedValue(mockTrackedBets);

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      // First render
      await waitFor(() => {
        expect(mockBetTrackerApi.getTrackedBets).toHaveBeenCalledTimes(1);
      });

      // Re-render should use cached data
      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockBetTrackerApi.getTrackedBets).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should handle unauthenticated requests', async () => {
      const authError = new Error('Unauthorized');
      mockBetTrackerApi.getTrackedBets.mockRejectedValue(authError);

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: false,
        error: authError
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle token expiration', async () => {
      const tokenError = new Error('Token expired');
      mockBetTrackerApi.getTrackedBets.mockRejectedValue(tokenError);

      mockUseBetTrackerData.mockReturnValue({
        trackedBets: [],
        isLoading: false,
        error: tokenError
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BetTrackerPanel />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });
  });
});
