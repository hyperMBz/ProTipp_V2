/**
 * ProfitLossChart Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen } from '@testing-library/react';
import { ProfitLossChart } from '../ProfitLossChart';
import { ProfitLossData } from '@/lib/types/analytics';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`} data-key={dataKey} />
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
const mockProfitLossData: ProfitLossData[] = [
  { date: '2024-01-01', profit: 1000, bets: 5, stake: 2500 },
  { date: '2024-01-02', profit: 1500, bets: 8, stake: 4000 },
  { date: '2024-01-03', profit: -500, bets: 3, stake: 1500 },
  { date: '2024-01-04', profit: 2000, bets: 10, stake: 5000 },
  { date: '2024-01-05', profit: 800, bets: 6, stake: 3000 }
];

describe('ProfitLossChart', () => {
  it('should render profit/loss chart with correct title', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    expect(screen.getByText('Profit/Loss Grafikon')).toBeInTheDocument();
  });

  it('should render chart with correct data', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    // Check if chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-profit')).toBeInTheDocument();
    expect(screen.getByTestId('line-bets')).toBeInTheDocument();
    expect(screen.getByTestId('line-stake')).toBeInTheDocument();
  });

  it('should render correct axes', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    expect(screen.getByTestId('x-axis-date')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-profit')).toBeInTheDocument();
  });

  it('should render chart controls', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should display period selector with correct options', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    // Check if period selector is present
    expect(screen.getByText('Heti')).toBeInTheDocument();
  });

  it('should handle different periods correctly', () => {
    const { rerender } = render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="day" 
      />
    );

    expect(screen.getByText('Napi')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="month" 
      />
    );

    expect(screen.getByText('Havi')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="year" 
      />
    );

    expect(screen.getByText('Éves')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(
      <ProfitLossChart 
        data={[]} 
        period="week" 
      />
    );

    expect(screen.getByText('Nincs elérhető adat a grafikonhoz')).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    render(
      <ProfitLossChart 
        data={null as any} 
        period="week" 
      />
    );

    expect(screen.getByText('Nincs elérhető adat a grafikonhoz')).toBeInTheDocument();
  });

  it('should display correct chart title based on period', () => {
    const { rerender } = render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="day" 
      />
    );

    expect(screen.getByText('Napi Profit/Loss Grafikon')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    expect(screen.getByText('Heti Profit/Loss Grafikon')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="month" 
      />
    );

    expect(screen.getByText('Havi Profit/Loss Grafikon')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="year" 
      />
    );

    expect(screen.getByText('Éves Profit/Loss Grafikon')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    const chart = screen.getByTestId('responsive-container');
    expect(chart).toHaveAttribute('role', 'img');
    expect(chart).toHaveAttribute('aria-label', 'Profit/Loss Chart');
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
        className="w-full h-64"
      />
    );

    const chart = screen.getByTestId('responsive-container');
    expect(chart).toHaveClass('w-full', 'h-64');
  });

  it('should handle data with negative profits correctly', () => {
    const dataWithLosses: ProfitLossData[] = [
      { date: '2024-01-01', profit: -1000, bets: 5, stake: 2500 },
      { date: '2024-01-02', profit: -500, bets: 3, stake: 1500 },
      { date: '2024-01-03', profit: 2000, bets: 10, stake: 5000 }
    ];

    render(
      <ProfitLossChart 
        data={dataWithLosses} 
        period="week" 
      />
    );

    expect(screen.getByTestId('line-profit')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should handle data with zero profits correctly', () => {
    const dataWithZeros: ProfitLossData[] = [
      { date: '2024-01-01', profit: 0, bets: 0, stake: 0 },
      { date: '2024-01-02', profit: 0, bets: 0, stake: 0 }
    ];

    render(
      <ProfitLossChart 
        data={dataWithZeros} 
        period="week" 
      />
    );

    expect(screen.getByTestId('line-profit')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should handle large datasets correctly', () => {
    const largeDataset: ProfitLossData[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      profit: Math.random() * 2000 - 1000,
      bets: Math.floor(Math.random() * 20) + 1,
      stake: Math.random() * 10000 + 1000
    }));

    render(
      <ProfitLossChart 
        data={largeDataset} 
        period="month" 
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-profit')).toBeInTheDocument();
  });

  it('should handle period change correctly', () => {
    const { rerender } = render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="day" 
      />
    );

    expect(screen.getByText('Napi')).toBeInTheDocument();

    rerender(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    expect(screen.getByText('Heti')).toBeInTheDocument();
  });

  it('should maintain chart state when data updates', () => {
    const { rerender } = render(
      <ProfitLossChart 
        data={mockProfitLossData} 
        period="week" 
      />
    );

    const initialChart = screen.getByTestId('line-chart');

    const updatedData: ProfitLossData[] = [
      ...mockProfitLossData,
      { date: '2024-01-06', profit: 1200, bets: 7, stake: 3500 }
    ];

    rerender(
      <ProfitLossChart 
        data={updatedData} 
        period="week" 
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});