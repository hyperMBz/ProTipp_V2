/**
 * PerformanceMetrics Unit Tests
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

import { render, screen } from '@testing-library/react';
import { PerformanceMetrics } from '../PerformanceMetrics';
import { PerformanceMetrics as PerformanceMetricsType } from '@/lib/types/analytics';

// Mock data
const mockPerformanceMetrics: PerformanceMetricsType = {
  roi: 50.0,
  sharpeRatio: 1.2,
  maxDrawdown: -2000,
  avgBetSize: 333.33,
  bestDay: 2500,
  worstDay: -1000,
  totalBets: 150,
  winRate: 63.33,
  avgProfitPerBet: 166.67,
  totalProfit: 25000,
  totalStake: 50000,
  totalPayout: 75000
};

describe('PerformanceMetrics', () => {
  it('should render performance metrics with correct title', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    expect(screen.getByText('Teljesítmény Mutatók')).toBeInTheDocument();
  });

  it('should display all performance metrics correctly', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    // Check ROI
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();

    // Check Sharpe Ratio
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();

    // Check Max Drawdown
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    expect(screen.getByText('-2,000')).toBeInTheDocument();

    // Check Average Bet Size
    expect(screen.getByText('Átlagos Tét')).toBeInTheDocument();
    expect(screen.getByText('333.33')).toBeInTheDocument();

    // Check Best Day
    expect(screen.getByText('Legjobb Nap')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();

    // Check Worst Day
    expect(screen.getByText('Legrosszabb Nap')).toBeInTheDocument();
    expect(screen.getByText('-1,000')).toBeInTheDocument();
  });

  it('should display summary statistics correctly', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    // Check summary statistics
    expect(screen.getByText('Összes Fogadás')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    expect(screen.getByText('Sikerességi Arány')).toBeInTheDocument();
    expect(screen.getByText('63.33%')).toBeInTheDocument();

    expect(screen.getByText('Átlagos Profit/Fogadás')).toBeInTheDocument();
    expect(screen.getByText('166.67')).toBeInTheDocument();

    expect(screen.getByText('Összes Profit')).toBeInTheDocument();
    expect(screen.getByText('25,000')).toBeInTheDocument();

    expect(screen.getByText('Összes Tét')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();

    expect(screen.getByText('Összes Kifizetés')).toBeInTheDocument();
    expect(screen.getByText('75,000')).toBeInTheDocument();
  });

  it('should display positive ROI with green color', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    const roiElement = screen.getByText('50.0%');
    expect(roiElement).toHaveClass('text-green-400');
  });

  it('should display negative ROI with red color', () => {
    const negativeROIMetrics = {
      ...mockPerformanceMetrics,
      roi: -15.5
    };

    render(
      <PerformanceMetrics 
        metrics={negativeROIMetrics} 
      />
    );

    const roiElement = screen.getByText('-15.5%');
    expect(roiElement).toHaveClass('text-red-400');
  });

  it('should display zero ROI with neutral color', () => {
    const zeroROIMetrics = {
      ...mockPerformanceMetrics,
      roi: 0
    };

    render(
      <PerformanceMetrics 
        metrics={zeroROIMetrics} 
      />
    );

    const roiElement = screen.getByText('0.0%');
    expect(roiElement).toHaveClass('text-muted-foreground');
  });

  it('should display positive profit with green color', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    const profitElement = screen.getByText('25,000');
    expect(profitElement).toHaveClass('text-green-400');
  });

  it('should display negative profit with red color', () => {
    const negativeProfitMetrics = {
      ...mockPerformanceMetrics,
      totalProfit: -5000
    };

    render(
      <PerformanceMetrics 
        metrics={negativeProfitMetrics} 
      />
    );

    const profitElement = screen.getByText('-5,000');
    expect(profitElement).toHaveClass('text-red-400');
  });

  it('should handle zero values correctly', () => {
    const zeroMetrics = {
      ...mockPerformanceMetrics,
      roi: 0,
      totalProfit: 0,
      avgProfitPerBet: 0,
      bestDay: 0,
      worstDay: 0
    };

    render(
      <PerformanceMetrics 
        metrics={zeroMetrics} 
      />
    );

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle very large numbers correctly', () => {
    const largeNumbersMetrics = {
      ...mockPerformanceMetrics,
      totalProfit: 1000000,
      totalStake: 5000000,
      totalPayout: 6000000,
      bestDay: 50000,
      worstDay: -25000
    };

    render(
      <PerformanceMetrics 
        metrics={largeNumbersMetrics} 
      />
    );

    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('5,000,000')).toBeInTheDocument();
    expect(screen.getByText('6,000,000')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('-25,000')).toBeInTheDocument();
  });

  it('should handle decimal numbers correctly', () => {
    const decimalMetrics = {
      ...mockPerformanceMetrics,
      roi: 12.345,
      sharpeRatio: 0.789,
      avgBetSize: 123.456,
      avgProfitPerBet: 45.678
    };

    render(
      <PerformanceMetrics 
        metrics={decimalMetrics} 
      />
    );

    expect(screen.getByText('12.35%')).toBeInTheDocument();
    expect(screen.getByText('0.79')).toBeInTheDocument();
    expect(screen.getByText('123.46')).toBeInTheDocument();
    expect(screen.getByText('45.68')).toBeInTheDocument();
  });

  it('should be responsive on different screen sizes', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      />
    );

    const metricsContainer = screen.getByTestId('performance-metrics');
    expect(metricsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    const metricsContainer = screen.getByTestId('performance-metrics');
    expect(metricsContainer).toHaveAttribute('role', 'region');
    expect(metricsContainer).toHaveAttribute('aria-label', 'Performance Metrics');
  });

  it('should display metric cards with proper structure', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    // Check if metric cards are present
    const metricCards = screen.getAllByTestId('metric-card');
    expect(metricCards).toHaveLength(12); // 6 performance + 6 summary metrics
  });

  it('should handle missing optional metrics gracefully', () => {
    const partialMetrics = {
      roi: 25.0,
      totalBets: 100,
      winRate: 60.0,
      totalProfit: 15000
    } as PerformanceMetricsType;

    render(
      <PerformanceMetrics 
        metrics={partialMetrics} 
      />
    );

    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('15,000')).toBeInTheDocument();
  });

  it('should display performance indicators correctly', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    // Check if performance indicators are present
    expect(screen.getByText('Kiváló')).toBeInTheDocument(); // For high ROI
    expect(screen.getByText('Jó')).toBeInTheDocument(); // For good Sharpe ratio
  });

  it('should handle edge cases with extreme values', () => {
    const extremeMetrics = {
      ...mockPerformanceMetrics,
      roi: 999.99,
      sharpeRatio: 10.0,
      maxDrawdown: -99999,
      bestDay: 99999,
      worstDay: -99999
    };

    render(
      <PerformanceMetrics 
        metrics={extremeMetrics} 
      />
    );

    expect(screen.getByText('999.99%')).toBeInTheDocument();
    expect(screen.getByText('10.0')).toBeInTheDocument();
    expect(screen.getByText('-99,999')).toBeInTheDocument();
    expect(screen.getByText('99,999')).toBeInTheDocument();
  });

  it('should maintain consistent formatting across all metrics', () => {
    render(
      <PerformanceMetrics 
        metrics={mockPerformanceMetrics} 
      />
    );

    // Check if all percentage values are formatted consistently
    const percentageElements = screen.getAllByText(/\d+\.\d+%/);
    percentageElements.forEach(element => {
      expect(element).toHaveClass('font-mono');
    });

    // Check if all currency values are formatted consistently
    const currencyElements = screen.getAllByText(/\d{1,3}(,\d{3})*/);
    currencyElements.forEach(element => {
      expect(element).toHaveClass('font-mono');
    });
  });
});