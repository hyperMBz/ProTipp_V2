/**
 * AnalyticsDashboard Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { useAnalytics } from '@/lib/hooks/use-analytics';

// Mock the useAnalytics hook
jest.mock('@/lib/hooks/use-analytics');
const mockUseAnalytics = useAnalytics as jest.MockedFunction<typeof useAnalytics>;

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

const mockAnalyticsState = {
  data: mockAnalyticsData,
  isLoading: false,
  error: null,
  refetch: jest.fn()
};

describe('AnalyticsDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    mockUseAnalytics.mockReturnValue(mockAnalyticsState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render analytics dashboard with all components', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Check if main dashboard elements are present
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Teljesítmény Mutatók')).toBeInTheDocument();
    expect(screen.getByText('Profit/Loss Grafikon')).toBeInTheDocument();
    expect(screen.getByText('Fogadási Trendek')).toBeInTheDocument();
    expect(screen.getByText('Export Panel')).toBeInTheDocument();
  });

  it('should display correct summary statistics', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Check summary statistics
    expect(screen.getByText('150')).toBeInTheDocument(); // totalBets
    expect(screen.getByText('95')).toBeInTheDocument(); // wonBets
    expect(screen.getByText('45')).toBeInTheDocument(); // lostBets
    expect(screen.getByText('10')).toBeInTheDocument(); // pendingBets
    expect(screen.getByText('50,000')).toBeInTheDocument(); // totalStake
    expect(screen.getByText('75,000')).toBeInTheDocument(); // totalPayout
    expect(screen.getByText('25,000')).toBeInTheDocument(); // totalProfit
    expect(screen.getByText('63.33%')).toBeInTheDocument(); // winRate
  });

  it('should display performance metrics correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Check performance metrics
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // ROI
    expect(screen.getByText('1.2')).toBeInTheDocument(); // Sharpe Ratio
    expect(screen.getByText('-2,000')).toBeInTheDocument(); // Max Drawdown
    expect(screen.getByText('333.33')).toBeInTheDocument(); // Avg Bet Size
    expect(screen.getByText('2,500')).toBeInTheDocument(); // Best Day
    expect(screen.getByText('-1,000')).toBeInTheDocument(); // Worst Day
  });

  it('should display sport breakdown correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Check sport breakdown
    expect(screen.getByText('soccer')).toBeInTheDocument();
    expect(screen.getByText('basketball')).toBeInTheDocument();
    expect(screen.getByText('tennis')).toBeInTheDocument();
    
    // Check sport statistics
    expect(screen.getByText('80')).toBeInTheDocument(); // soccer bets
    expect(screen.getByText('50')).toBeInTheDocument(); // basketball bets
    expect(screen.getByText('20')).toBeInTheDocument(); // tennis bets
  });

  it('should display bookmaker breakdown correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    // Check bookmaker breakdown
    expect(screen.getByText('Bet365')).toBeInTheDocument();
    expect(screen.getByText('William Hill')).toBeInTheDocument();
    expect(screen.getByText('Unibet')).toBeInTheDocument();
    
    // Check bookmaker statistics
    expect(screen.getByText('60')).toBeInTheDocument(); // Bet365 bets
    expect(screen.getByText('50')).toBeInTheDocument(); // William Hill bets
    expect(screen.getByText('40')).toBeInTheDocument(); // Unibet bets
  });

  it('should show loading state when data is loading', async () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsState,
      isLoading: true
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Betöltés...')).toBeInTheDocument();
  });

  it('should show error state when there is an error', async () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsState,
      error: new Error('Failed to load analytics data')
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Hiba történt az adatok betöltése során')).toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', async () => {
    const mockRefetch = jest.fn();
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsState,
      refetch: mockRefetch
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    const refreshButton = screen.getByText('Frissítés');
    refreshButton.click();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle empty data gracefully', async () => {
    mockUseAnalytics.mockReturnValue({
      data: {
        summary: {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          totalStake: 0,
          totalPayout: 0,
          totalProfit: 0,
          winRate: 0,
          avgProfitPerBet: 0
        },
        trends: [],
        performance: {
          roi: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          avgBetSize: 0,
          bestDay: 0,
          worstDay: 0
        },
        sportBreakdown: [],
        bookmakerBreakdown: []
      },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText('Nincs elérhető adat')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    const dashboard = screen.getByTestId('analytics-dashboard');
    expect(dashboard).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
  });

  it('should have proper accessibility attributes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsDashboard />
      </QueryClientProvider>
    );

    const dashboard = screen.getByTestId('analytics-dashboard');
    expect(dashboard).toHaveAttribute('role', 'main');
    expect(dashboard).toHaveAttribute('aria-label', 'Analytics Dashboard');
  });
});