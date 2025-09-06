/**
 * BettingTrends Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen } from '@testing-library/react';
import { BettingTrends } from '../BettingTrends';
import { BettingTrend } from '@/lib/types/analytics';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`bar-${dataKey}`} data-key={dataKey} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`x-axis-${dataKey}`} data-key={dataKey} />
  ),
  YAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`y-axis-${dataKey}`} data-key={dataKey} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock data
const mockBettingTrends: BettingTrend[] = [
  { date: '2024-01-01', profit: 1000, bets: 5, stake: 2500, winRate: 80 },
  { date: '2024-01-02', profit: 1500, bets: 8, stake: 4000, winRate: 75 },
  { date: '2024-01-03', profit: -500, bets: 3, stake: 1500, winRate: 33 },
  { date: '2024-01-04', profit: 2000, bets: 10, stake: 5000, winRate: 90 },
  { date: '2024-01-05', profit: 800, bets: 6, stake: 3000, winRate: 67 }
];

describe('BettingTrends', () => {
  it('should render betting trends with correct title', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    expect(screen.getByText('Fogadási Trendek')).toBeInTheDocument();
  });

  it('should render chart with correct data', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    // Check if chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
    expect(screen.getByTestId('bar-bets')).toBeInTheDocument();
    expect(screen.getByTestId('bar-stake')).toBeInTheDocument();
  });

  it('should render correct axes', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    expect(screen.getByTestId('x-axis-date')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-profit')).toBeInTheDocument();
  });

  it('should render chart controls', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should display trend summary statistics', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    // Check if summary statistics are displayed
    expect(screen.getByText('Összes Profit')).toBeInTheDocument();
    expect(screen.getByText('4,800')).toBeInTheDocument(); // Sum of profits

    expect(screen.getByText('Összes Fogadás')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument(); // Sum of bets

    expect(screen.getByText('Összes Tét')).toBeInTheDocument();
    expect(screen.getByText('16,000')).toBeInTheDocument(); // Sum of stakes

    expect(screen.getByText('Átlagos Sikerességi Arány')).toBeInTheDocument();
    expect(screen.getByText('69.0%')).toBeInTheDocument(); // Average win rate
  });

  it('should handle empty data gracefully', () => {
    render(
      <BettingTrends 
        trends={[]} 
      />
    );

    expect(screen.getByText('Nincs elérhető adat a trendekhez')).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    render(
      <BettingTrends 
        trends={null as any} 
      />
    );

    expect(screen.getByText('Nincs elérhető adat a trendekhez')).toBeInTheDocument();
  });

  it('should display trend indicators correctly', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    // Check if trend indicators are present
    expect(screen.getByText('📈')).toBeInTheDocument(); // Positive trend
    expect(screen.getByText('📉')).toBeInTheDocument(); // Negative trend
  });

  it('should handle data with negative profits correctly', () => {
    const dataWithLosses: BettingTrend[] = [
      { date: '2024-01-01', profit: -1000, bets: 5, stake: 2500, winRate: 20 },
      { date: '2024-01-02', profit: -500, bets: 3, stake: 1500, winRate: 33 },
      { date: '2024-01-03', profit: 2000, bets: 10, stake: 5000, winRate: 90 }
    ];

    render(
      <BettingTrends 
        trends={dataWithLosses} 
      />
    );

    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument(); // Net profit
  });

  it('should handle data with zero values correctly', () => {
    const dataWithZeros: BettingTrend[] = [
      { date: '2024-01-01', profit: 0, bets: 0, stake: 0, winRate: 0 },
      { date: '2024-01-02', profit: 0, bets: 0, stake: 0, winRate: 0 }
    ];

    render(
      <BettingTrends 
        trends={dataWithZeros} 
      />
    );

    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle large datasets correctly', () => {
    const largeDataset: BettingTrend[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      profit: Math.random() * 2000 - 1000,
      bets: Math.floor(Math.random() * 20) + 1,
      stake: Math.random() * 10000 + 1000,
      winRate: Math.random() * 100
    }));

    render(
      <BettingTrends 
        trends={largeDataset} 
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    const chart = screen.getByTestId('responsive-container');
    expect(chart).toHaveAttribute('role', 'img');
    expect(chart).toHaveAttribute('aria-label', 'Betting Trends Chart');
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
        className="w-full h-64"
      />
    );

    const chart = screen.getByTestId('responsive-container');
    expect(chart).toHaveClass('w-full', 'h-64');
  });

  it('should display trend analysis correctly', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    // Check if trend analysis is displayed
    expect(screen.getByText('Trend Elemzés')).toBeInTheDocument();
    expect(screen.getByText('Legjobb Nap')).toBeInTheDocument();
    expect(screen.getByText('Legrosszabb Nap')).toBeInTheDocument();
    expect(screen.getByText('2024-01-04')).toBeInTheDocument(); // Best day
    expect(screen.getByText('2024-01-03')).toBeInTheDocument(); // Worst day
  });

  it('should handle decimal win rates correctly', () => {
    const decimalWinRates: BettingTrend[] = [
      { date: '2024-01-01', profit: 1000, bets: 5, stake: 2500, winRate: 66.67 },
      { date: '2024-01-02', profit: 1500, bets: 8, stake: 4000, winRate: 75.5 }
    ];

    render(
      <BettingTrends 
        trends={decimalWinRates} 
      />
    );

    expect(screen.getByText('71.09%')).toBeInTheDocument(); // Average win rate
  });

  it('should maintain chart state when data updates', () => {
    const { rerender } = render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    const initialChart = screen.getByTestId('bar-chart');

    const updatedTrends: BettingTrend[] = [
      ...mockBettingTrends,
      { date: '2024-01-06', profit: 1200, bets: 7, stake: 3500, winRate: 71 }
    ];

    rerender(
      <BettingTrends 
        trends={updatedTrends} 
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should display trend summary with correct calculations', () => {
    render(
      <BettingTrends 
        trends={mockBettingTrends} 
      />
    );

    // Verify calculations
    const totalProfit = mockBettingTrends.reduce((sum, trend) => sum + trend.profit, 0);
    const totalBets = mockBettingTrends.reduce((sum, trend) => sum + trend.bets, 0);
    const totalStake = mockBettingTrends.reduce((sum, trend) => sum + trend.stake, 0);
    const avgWinRate = mockBettingTrends.reduce((sum, trend) => sum + trend.winRate, 0) / mockBettingTrends.length;

    expect(screen.getByText(totalProfit.toString())).toBeInTheDocument();
    expect(screen.getByText(totalBets.toString())).toBeInTheDocument();
    expect(screen.getByText(totalStake.toString())).toBeInTheDocument();
    expect(screen.getByText(`${avgWinRate.toFixed(1)}%`)).toBeInTheDocument();
  });

  it('should handle edge cases with extreme values', () => {
    const extremeTrends: BettingTrend[] = [
      { date: '2024-01-01', profit: 99999, bets: 100, stake: 50000, winRate: 100 },
      { date: '2024-01-02', profit: -99999, bets: 1, stake: 100, winRate: 0 }
    ];

    render(
      <BettingTrends 
        trends={extremeTrends} 
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Net profit
  });

  it('should display trend indicators based on data', () => {
    const positiveTrends: BettingTrend[] = [
      { date: '2024-01-01', profit: 1000, bets: 5, stake: 2500, winRate: 80 },
      { date: '2024-01-02', profit: 1500, bets: 8, stake: 4000, winRate: 75 },
      { date: '2024-01-03', profit: 2000, bets: 10, stake: 5000, winRate: 90 }
    ];

    render(
      <BettingTrends 
        trends={positiveTrends} 
      />
    );

    expect(screen.getByText('📈')).toBeInTheDocument(); // Positive trend
  });

  it('should display negative trend indicators for declining data', () => {
    const negativeTrends: BettingTrend[] = [
      { date: '2024-01-01', profit: 2000, bets: 10, stake: 5000, winRate: 90 },
      { date: '2024-01-02', profit: 1500, bets: 8, stake: 4000, winRate: 75 },
      { date: '2024-01-03', profit: 1000, bets: 5, stake: 2500, winRate: 80 }
    ];

    render(
      <BettingTrends 
        trends={negativeTrends} 
      />
    );

    expect(screen.getByText('📉')).toBeInTheDocument(); // Negative trend
  });
});