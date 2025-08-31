import { NextRequest, NextResponse } from 'next/server';
import { marketAnalyzer } from '@/lib/arbitrage-engine/market-analyzer';

interface MarketAnalysis {
  market_id: string;
  sport: string;
  market_type: string;
  analysis: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const sport = searchParams.get('sport');
    const marketType = searchParams.get('market_type') as 'mainline' | 'props' | 'futures' | 'live' | null;
    const timeRange = searchParams.get('time_range') || '7d'; // 1d, 7d, 30d, 90d

    // Get market data (in real implementation, this would fetch from database)
    const marketData = await getMarketData(sport, marketType, timeRange);

    // Perform market analysis
    const analyses: MarketAnalysis[] = [];
    
    for (const data of marketData) {
      const analysis = marketAnalyzer.analyzeMarket(
        data.sport,
        data.market_type as 'mainline' | 'props' | 'futures' | 'live',
        data.opportunities || []
      );
      
      analyses.push({
        market_id: data.market_id,
        sport: data.sport,
        market_type: data.market_type,
        analysis: analysis as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate aggregate metrics
    const aggregateMetrics = calculateAggregateMetrics(analyses);

    const response = {
      analyses,
      aggregate_metrics: aggregateMetrics,
      filters: {
        sport,
        market_type: marketType,
        time_range: timeRange
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Market efficiency API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markets, analysis_config } = body;

    if (!markets || !Array.isArray(markets)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected markets array.' },
        { status: 400 }
      );
    }

    // Apply analysis configuration if provided
    if (analysis_config?.efficiency_thresholds) {
      marketAnalyzer.setEfficiencyThresholds(analysis_config.efficiency_thresholds);
    }

    // Perform market analysis for provided markets
    const analyses: MarketAnalysis[] = [];
    
    for (const market of markets) {
      const analysis = marketAnalyzer.analyzeMarket(
        market.sport,
        market.market_type,
        market.opportunities || []
      );
      
      analyses.push({
        market_id: market.market_id || `${market.sport}_${market.market_type}`,
        sport: market.sport,
        market_type: market.market_type,
        analysis: analysis as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      });
    }

    const response = {
      analyses,
      settings: marketAnalyzer.getSettings(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Market efficiency POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getMarketData(sport: string | null, marketType: string | null, timeRange: string) {
  // Mock market data - in real implementation, this would fetch from database
  const allSports = ['Labdarúgás', 'Kosárlabda', 'Tenisz', 'Amerikai Futball', 'Baseball'];
  const allMarketTypes = ['mainline', 'props', 'futures', 'live'];
  
  const markets = [];
  
  for (const s of allSports) {
    if (sport && s !== sport) continue;
    
    for (const mt of allMarketTypes) {
      if (marketType && mt !== marketType) continue;
      
      markets.push({
        market_id: `${s}_${mt}`,
        sport: s,
        market_type: mt,
        opportunities: generateMockOpportunities(s, mt, timeRange),
        historical_data: generateMockHistoricalData(s, mt, timeRange)
      });
    }
  }
  
  return markets;
}

function generateMockOpportunities(sport: string, marketType: string, timeRange: string) {
  const count = Math.floor(Math.random() * 10) + 5; // 5-15 opportunities
  const opportunities = [];
  
  for (let i = 0; i < count; i++) {
    opportunities.push({
      id: `${sport}_${marketType}_${i}`,
      sport,
      market_type: marketType as 'mainline' | 'props' | 'futures' | 'live',
      event: `Event ${i + 1}`,
      opportunities: [
        {
          bookmaker_id: 'Bet365',
          outcome: 'Outcome 1',
          odds: 1.5 + Math.random() * 1.5,
          stake: Math.random() * 25000 + 10000,
          expected_return: Math.random() * 50000 + 20000,
          risk_factor: Math.random() * 0.3 + 0.1,
          confidence: Math.random() * 0.4 + 0.6
        },
        {
          bookmaker_id: 'William Hill',
          outcome: 'Outcome 2',
          odds: 1.5 + Math.random() * 1.5,
          stake: Math.random() * 25000 + 10000,
          expected_return: Math.random() * 50000 + 20000,
          risk_factor: Math.random() * 0.3 + 0.1,
          confidence: Math.random() * 0.4 + 0.6
        }
      ],
      profit_margin: Math.random() * 10 + 1, // 1-11%
      confidence_score: Math.random() * 0.4 + 0.6, // 0.6-1.0
      risk_score: Math.random() * 0.5 + 0.2, // 0.2-0.7
      false_positive_probability: Math.random() * 0.3 + 0.1, // 0.1-0.4
      market_efficiency: Math.random() * 0.4 + 0.6, // 0.6-1.0
      total_stake: Math.random() * 50000 + 10000, // 10K-60K
      expected_profit: Math.random() * 5000 + 1000, // 1K-6K
      time_to_expiry: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return opportunities;
}

function generateMockHistoricalData(sport: string, marketType: string, timeRange: string) {
  const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      efficiency: Math.random() * 0.4 + 0.6, // 0.6-1.0
      volatility: Math.random() * 0.3 + 0.1, // 0.1-0.4
      volume: Math.random() * 1000000 + 100000, // 100K-1.1M
      sharp_money: (Math.random() - 0.5) * 2, // -1 to 1
      closing_line: 1.5 + (Math.random() - 0.5) * 0.5, // 1.25-1.75
      sentiment: (Math.random() - 0.5) * 2 // -1 to 1
    });
  }
  
  return data;
}

function calculateAggregateMetrics(analyses: MarketAnalysis[]) {
  if (analyses.length === 0) {
    return {
      average_efficiency: 0,
      average_volatility: 0,
      average_liquidity: 0,
      market_count: 0,
      total_opportunities: 0,
      efficiency_distribution: {},
      volatility_regime_distribution: {}
    };
  }

  let totalEfficiency = 0;
  let totalVolatility = 0;
  let totalLiquidity = 0;
  let totalOpportunities = 0;
  const efficiencyDistribution: { [key: string]: number } = {};
  const volatilityRegimeDistribution: { [key: string]: number } = {};

  for (const analysis of analyses) {
    const analysisData = analysis.analysis as Record<string, unknown>;
            const efficiency = (analysisData.efficiency_metrics as { efficiency_score?: number })?.efficiency_score || 0;
        const volatility = (analysisData.volatility_analysis as { historical_volatility?: number })?.historical_volatility || 0;
        const liquidity = (analysisData.liquidity_analysis as { liquidity_score?: number })?.liquidity_score || 0;
        const opportunities = (analysisData.efficiency_metrics as { arbitrage_opportunities?: number })?.arbitrage_opportunities || 0;

    totalEfficiency += efficiency;
    totalVolatility += volatility;
    totalLiquidity += liquidity;
    totalOpportunities += opportunities;

    // Efficiency distribution
    if (efficiency >= 0.8) efficiencyDistribution.high = (efficiencyDistribution.high || 0) + 1;
    else if (efficiency >= 0.6) efficiencyDistribution.medium = (efficiencyDistribution.medium || 0) + 1;
    else efficiencyDistribution.low = (efficiencyDistribution.low || 0) + 1;

    // Volatility regime distribution
            const regime = (analysisData.volatility_analysis as { volatility_regime?: string })?.volatility_regime || 'unknown';
    volatilityRegimeDistribution[regime] = (volatilityRegimeDistribution[regime] || 0) + 1;
  }

  const marketCount = analyses.length;

  return {
    average_efficiency: totalEfficiency / marketCount,
    average_volatility: totalVolatility / marketCount,
    average_liquidity: totalLiquidity / marketCount,
    market_count: marketCount,
    total_opportunities: totalOpportunities,
    efficiency_distribution: efficiencyDistribution,
    volatility_regime_distribution: volatilityRegimeDistribution
  };
}
