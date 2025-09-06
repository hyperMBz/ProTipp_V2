/**
 * Analytics Integration Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { analyticsApi } from '@/lib/api/analytics-api';

// Mock the analytics API
vi.mock('@/lib/api/analytics-api');
const mockAnalyticsApi = analyticsApi as any;

// Mock the useAnalytics hook
vi.mock('@/lib/hooks/use-analytics');
const mockUseAnalytics = useAnalytics as any;

// Mock data
const mockAnalyticsData = {
  summary: {
    totalBets: 150,
    wonBets: 95,
    lostBets: 45,
    pendingBets: 10,
    totalStake: 50000,
    totalPayout: 75000,
    totalProfit: 25000,
    winRate: 63.33,
    avgProfitPerBet: 166.67
  },
  trends: [
    { date: '2024-01-01', profit: 1000, bets: 5 },
    { date: '2024-01-02', profit: 1500, bets: 8 },
    { date: '2024-01-03', profit: -500, bets: 3 }
  ],
  performance: {
    roi: 50.0,
    sharpeRatio: 1.2,
    maxDrawdown: -2000,
    avgBetSize: 333.33,
    bestDay: 2500,
    worstDay: -1000
  },
  sportBreakdown: [
    { sport: 'soccer', bets: 80, profit: 15000, winRate: 65 },
    { sport: 'basketball', bets: 50, profit: 8000, winRate: 60 },
    { sport: 'tennis', bets: 20, profit: 2000, winRate: 70 }
  ],
  bookmakerBreakdown: [
    { bookmaker: 'Bet365', bets: 60, profit: 12000, winRate: 65 },
    { bookmaker: 'William Hill', bets: 50, profit: 8000, winRate: 60 },
    { bookmaker: 'Unibet', bets: 40, profit: 5000, winRate: 62.5 }
  ]
};

describe('Analytics Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    mockUseAnalytics.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching Integration', () => {
    it('should fetch analytics data on component mount', async () => {
      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle data fetching error', async () => {
      const error = new Error('Failed to fetch analytics data');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(error);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: error,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should refetch data when refresh button is clicked', async () => {
      const mockRefetch = vi.fn();
      mockUseAnalytics.mockReturnValue({
        data: mockAnalyticsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      const refreshButton = screen.getByText('Frissítés');
      refreshButton.click();

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle loading state during data fetch', async () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      expect(screen.getByText('Betöltés...')).toBeInTheDocument();
    });
  });

  describe('Real-time Data Integration', () => {
    it('should subscribe to real-time analytics updates', async () => {
      const mockSubscribe = vi.fn();
      mockAnalyticsApi.subscribeToAnalyticsUpdates.mockReturnValue(mockSubscribe);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockAnalyticsApi.subscribeToAnalyticsUpdates).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle real-time data updates', async () => {
      const mockSubscribe = vi.fn();
      mockAnalyticsApi.subscribeToAnalyticsUpdates.mockReturnValue(mockSubscribe);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate real-time update
      const updatedData = {
        ...mockAnalyticsData,
        summary: {
          ...mockAnalyticsData.summary,
          totalBets: 151
        }
      };

      mockUseAnalytics.mockReturnValue({
        data: updatedData,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      await waitFor(() => {
        expect(screen.getByText('151')).toBeInTheDocument();
      });
    });

    it('should handle real-time subscription errors', async () => {
      const error = new Error('Real-time subscription failed');
      mockAnalyticsApi.subscribeToAnalyticsUpdates.mockRejectedValue(error);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Integration', () => {
    it('should apply date range filters', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate filter application
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith({
          dateRange: dateRange
        });
      });
    });

    it('should apply sport filters', async () => {
      const sportFilters = ['soccer', 'basketball'];

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate filter application
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith({
          sports: sportFilters
        });
      });
    });

    it('should apply bookmaker filters', async () => {
      const bookmakerFilters = ['Bet365', 'William Hill'];

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate filter application
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith({
          bookmakers: bookmakerFilters
        });
      });
    });

    it('should apply combined filters', async () => {
      const filters = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        sports: ['soccer'],
        bookmakers: ['Bet365'],
        minProfit: 100,
        maxProfit: 5000
      };

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate filter application
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledWith(filters);
      });
    });
  });

  describe('Export Integration', () => {
    it('should export analytics data to PDF', async () => {
      const mockExportPDF = vi.fn();
      mockAnalyticsApi.exportToPDF.mockResolvedValue(mockExportPDF);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      const exportButton = screen.getByText('PDF Export');
      exportButton.click();

      await waitFor(() => {
        expect(mockAnalyticsApi.exportToPDF).toHaveBeenCalledWith(mockAnalyticsData);
      });
    });

    it('should export analytics data to CSV', async () => {
      const mockExportCSV = vi.fn();
      mockAnalyticsApi.exportToCSV.mockResolvedValue(mockExportCSV);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      const exportButton = screen.getByText('CSV Export');
      exportButton.click();

      await waitFor(() => {
        expect(mockAnalyticsApi.exportToCSV).toHaveBeenCalledWith(mockAnalyticsData);
      });
    });

    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      mockAnalyticsApi.exportToPDF.mockRejectedValue(error);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      const exportButton = screen.getByText('PDF Export');
      exportButton.click();

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az export során')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = {
        ...mockAnalyticsData,
        trends: Array.from({ length: 1000 }, (_, i) => ({
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          profit: Math.random() * 2000 - 1000,
          bets: Math.floor(Math.random() * 20) + 1
        }))
      };

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(largeDataset);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle concurrent data requests', async () => {
      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // Simulate multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        mockAnalyticsApi.getAnalyticsData()
      );

      await Promise.all(promises);

      expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(6); // 1 initial + 5 concurrent
    });

    it('should handle data caching', async () => {
      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(mockAnalyticsData);

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      // First render
      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(1);
      });

      // Re-render should use cached data
      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockAnalyticsApi.getAnalyticsData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(networkError);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: networkError,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(timeoutError);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: timeoutError,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(serverError);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: serverError,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle malformed data', async () => {
      const malformedData = {
        summary: null,
        trends: null,
        performance: null,
        sportBreakdown: null,
        bookmakerBreakdown: null
      };

      mockAnalyticsApi.getAnalyticsData.mockResolvedValue(malformedData);

      mockUseAnalytics.mockReturnValue({
        data: malformedData,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Nincs elérhető adat')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should handle unauthenticated requests', async () => {
      const authError = new Error('Unauthorized');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(authError);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: authError,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });

    it('should handle token expiration', async () => {
      const tokenError = new Error('Token expired');
      mockAnalyticsApi.getAnalyticsData.mockRejectedValue(tokenError);

      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: tokenError,
        refetch: vi.fn()
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AnalyticsDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
      });
    });
  });
});
