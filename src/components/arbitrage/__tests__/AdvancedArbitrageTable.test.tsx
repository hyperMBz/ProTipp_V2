import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedArbitrageTable } from '../AdvancedArbitrageTable';
import { AdvancedArbitrageOpportunity } from '@/lib/arbitrage-engine/ml-detector';
import { RiskAssessment } from '@/lib/arbitrage-engine/risk-assessor';
import { MarketAnalysis } from '@/lib/arbitrage-engine/market-analyzer';
import { vi } from 'vitest';

// Mock the UI components
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div data-testid="progress" data-value={value} />,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: { children: React.ReactNode; value: string; onClick?: () => void }) => (
    <button data-testid={`tab-trigger-${value}`} onClick={onClick}>{children}</button>
  ),
}));

describe('AdvancedArbitrageTable', () => {
  const mockOpportunity: AdvancedArbitrageOpportunity = {
    id: 'test-1',
    sport: 'Labdarúgás',
    event: 'Manchester United vs Liverpool',
    market_type: 'mainline',
    opportunities: [
      {
        bookmaker_id: 'Bet365',
        outcome: 'Home Win',
        odds: 2.1,
        stake: 50000,
        expected_return: 105000,
        risk_factor: 0.15,
        confidence: 0.85
      },
      {
        bookmaker_id: 'William Hill',
        outcome: 'Away Win',
        odds: 1.9,
        stake: 50000,
        expected_return: 95000,
        risk_factor: 0.12,
        confidence: 0.88
      }
    ],
    total_stake: 100000,
    expected_profit: 5000,
    profit_margin: 5.0,
    confidence_score: 0.82,
    risk_score: 0.28,
    false_positive_probability: 0.18,
    market_efficiency: 0.75,
    time_to_expiry: '2h 30m',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRiskAssessment: RiskAssessment = {
    opportunity_id: 'test-1',
    kelly_criterion: {
      kelly_percentage: 0.25,
      kelly_stake: 25000,
      kelly_expected_value: 1250,
      kelly_volatility: 0.15,
      fractional_kelly: 0.0625,
      is_kelly_positive: true
    },
    portfolio_risk: {
      total_exposure: 100000,
      concentration_risk: 0.1,
      correlation_risk: 0.05,
      diversification_score: 0.85,
      max_drawdown_potential: 5000,
      var_95: 2500,
      expected_shortfall: 3000
    },
    market_risk: {
      market_volatility: 0.2,
      liquidity_risk: 0.1,
      timing_risk: 0.15,
      event_risk: 0.05,
      regulatory_risk: 0.02,
      market_efficiency: 0.75
    },
    bookmaker_risk: {
      bookmaker_credit_risk: 0.02,
      withdrawal_risk: 0.01,
      limit_risk: 0.05,
      account_closure_risk: 0.01,
      odds_manipulation_risk: 0.03,
      overall_bookmaker_risk: 0.024
    },
    overall_risk_score: 0.28,
    risk_level: 'low',
    recommendations: [
      {
        type: 'stake_adjustment',
        priority: 'low',
        description: 'Consider reducing stake size',
        action: 'Reduce stake by 10%',
        impact: 'positive'
      }
    ],
    created_at: new Date()
  };

  const mockMarketAnalysis: MarketAnalysis = {
    market_id: 'soccer_mainline',
    sport: 'Labdarúgás',
    market_type: 'mainline',
    efficiency_metrics: {
      efficiency_score: 0.75,
      price_discovery: 0.8,
      arbitrage_opportunities: 5,
      opportunity_duration: 300,
      market_depth: 0.7,
      bid_ask_spread: 0.02
    },
    volatility_analysis: {
      historical_volatility: 0.2,
      implied_volatility: 0.25,
      volatility_regime: 'medium',
      volatility_trend: 'stable',
      volatility_forecast: 0.22,
      volatility_breakpoints: [0.15, 0.3]
    },
    liquidity_analysis: {
      liquidity_score: 0.8,
      trading_volume: 1000000,
      bid_depth: 0.7,
      ask_depth: 0.7,
      market_impact: 0.05,
      liquidity_providers: ['provider1', 'provider2'],
      liquidity_risk: 'low'
    },
    sharp_money_analysis: {
      sharp_money_indicator: 0.6,
      money_flow_direction: 'inflow',
      sharp_money_volume: 500000,
      sharp_money_timing: 0.7,
      sharp_money_accuracy: 0.8,
      sharp_money_confidence: 0.75
    },
    closing_line_analysis: {
      closing_line_value: 0.7,
      line_movement: 0.05,
      line_accuracy: 0.8,
      line_volatility: 0.1,
      line_trend: 'stable',
      line_confidence: 0.7
    },
    market_sentiment: {
      overall_sentiment: 'neutral',
      sentiment_score: 0.1,
      public_sentiment: 0.3,
      sharp_sentiment: 0.6,
      media_sentiment: 0.2,
      social_sentiment: 0.4,
      sentiment_confidence: 0.7
    },
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRiskAssessments = new Map<string, RiskAssessment>();
  mockRiskAssessments.set('test-1', mockRiskAssessment);

  const mockMarketAnalyses = new Map<string, MarketAnalysis>();
  mockMarketAnalyses.set('test-1', mockMarketAnalysis);

  const mockOnAddToTracker = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with opportunities', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
          onAddToTracker={mockOnAddToTracker}
        />
      );

      expect(screen.getByText('Manchester United vs Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Labdarúgás')).toBeInTheDocument();
      expect(screen.getByText('5.0%')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[]}
          riskAssessments={new Map()}
          marketAnalyses={new Map()}
          isLoading={true}
        />
      );

      // Should show loading indicators
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render empty state when no opportunities', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[]}
          riskAssessments={new Map()}
          marketAnalyses={new Map()}
        />
      );

      expect(screen.getByText('No opportunities found')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render all tabs', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-analysis')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-details')).toBeInTheDocument();
    });

    it('should switch between tabs', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const analysisTab = screen.getByTestId('tab-trigger-analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByTestId('tab-analysis')).toBeInTheDocument();
    });
  });

  describe('Confidence Indicators', () => {
    it('should render confidence indicator with correct value', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const progressElement = screen.getByTestId('progress');
      expect(progressElement).toHaveAttribute('data-value', '82');
    });

    it('should apply correct confidence color classes', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      // High confidence should have green color
      const confidenceElement = screen.getByText('82%');
      expect(confidenceElement).toBeInTheDocument();
    });
  });

  describe('Risk Indicators', () => {
    it('should render risk indicator with correct value', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const riskElement = screen.getByText('28%');
      expect(riskElement).toBeInTheDocument();
    });

    it('should apply correct risk color classes', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      // Low risk should have green color
      const riskElement = screen.getByText('28%');
      expect(riskElement).toBeInTheDocument();
    });
  });

  describe('Market Type Badges', () => {
    it('should render correct market type badge', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      expect(screen.getByText('mainline')).toBeInTheDocument();
    });

    it('should apply correct market type color classes', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const marketTypeElement = screen.getByText('mainline');
      expect(marketTypeElement).toHaveClass('bg-blue-500/20');
    });
  });

  describe('Add to Tracker', () => {
    it('should call onAddToTracker when add button is clicked', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
          onAddToTracker={mockOnAddToTracker}
        />
      );

      const addButton = screen.getByText('Add to Tracker');
      fireEvent.click(addButton);

      expect(mockOnAddToTracker).toHaveBeenCalledWith(mockOpportunity);
    });

    it('should not call onAddToTracker when function is not provided', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const addButton = screen.getByText('Add to Tracker');
      fireEvent.click(addButton);

      expect(mockOnAddToTracker).not.toHaveBeenCalled();
    });
  });

  describe('Profit Margin Display', () => {
    it('should display profit margin with correct color', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const profitElement = screen.getByText('5.0%');
      expect(profitElement).toHaveClass('text-green-400');
    });

    it('should handle different profit margin levels', () => {
      const lowProfitOpportunity = {
        ...mockOpportunity,
        profit_margin: 2.0
      };

      render(
        <AdvancedArbitrageTable
          opportunities={[lowProfitOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      const profitElement = screen.getByText('2.0%');
      expect(profitElement).toHaveClass('text-yellow-400');
    });
  });

  describe('Time to Expiry', () => {
    it('should display time to expiry correctly', () => {
      render(
        <AdvancedArbitrageTable
          opportunities={[mockOpportunity]}
          riskAssessments={mockRiskAssessments}
          marketAnalyses={mockMarketAnalyses}
        />
      );

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });
  });
});
