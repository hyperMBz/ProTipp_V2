import { NextRequest, NextResponse } from 'next/server';
import { mlDetector } from '@/lib/arbitrage-engine/ml-detector';
import { riskAssessor } from '@/lib/arbitrage-engine/risk-assessor';
import { marketAnalyzer } from '@/lib/arbitrage-engine/market-analyzer';
import { performanceOptimizer } from '@/lib/arbitrage-engine/optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const sport = searchParams.get('sport');
    const marketType = searchParams.get('market_type') as 'mainline' | 'props' | 'futures' | 'live' | null;
    const minConfidence = searchParams.get('min_confidence') ? parseFloat(searchParams.get('min_confidence')!) : undefined;
    const maxRisk = searchParams.get('max_risk') ? parseFloat(searchParams.get('max_risk')!) : undefined;
    const minProfitMargin = searchParams.get('min_profit_margin') ? parseFloat(searchParams.get('min_profit_margin')!) : undefined;
    const maxFalsePositive = searchParams.get('max_false_positive') ? parseFloat(searchParams.get('max_false_positive')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Get base opportunities from mock data or external source
    const baseOpportunities = await getBaseOpportunities();

    // Apply ML detection
    const mlOpportunities = await mlDetector.detectArbitrageOpportunities(baseOpportunities);

    // Filter opportunities based on query parameters
    const filteredOpportunities = mlOpportunities.filter(opportunity => {
      if (sport && opportunity.sport !== sport) return false;
      if (marketType && opportunity.market_type !== marketType) return false;
      if (minConfidence && opportunity.confidence_score < minConfidence) return false;
      if (maxRisk && opportunity.risk_score > maxRisk) return false;
      if (minProfitMargin && opportunity.profit_margin < minProfitMargin) return false;
      if (maxFalsePositive && opportunity.false_positive_probability > maxFalsePositive) return false;
      return true;
    });

    // Apply pagination
    const paginatedOpportunities = filteredOpportunities.slice(offset, offset + limit);

    // Perform risk assessment for filtered opportunities
    const riskAssessments = new Map();
    for (const opportunity of paginatedOpportunities) {
      const assessment = riskAssessor.assessRisk(opportunity);
      riskAssessments.set(opportunity.id, assessment);
    }

    // Perform market analysis
    const marketAnalyses = new Map();
    const opportunitiesByMarket = groupOpportunitiesByMarket(paginatedOpportunities);
    
    for (const [marketKey, opportunities] of opportunitiesByMarket) {
      const [sport, marketType] = marketKey.split('_');
      const analysis = marketAnalyzer.analyzeMarket(
        sport,
        marketType as 'mainline' | 'props' | 'futures' | 'live',
        opportunities
      );
      
      for (const opportunity of opportunities) {
        marketAnalyses.set(opportunity.id, analysis);
      }
    }

    // Calculate metrics
    const metrics = calculateMetrics(paginatedOpportunities);

    // Prepare response
    const response = {
      opportunities: paginatedOpportunities.map(opportunity => ({
        ...opportunity,
        risk_assessment: riskAssessments.get(opportunity.id),
        market_analysis: marketAnalyses.get(opportunity.id)
      })),
      pagination: {
        total: filteredOpportunities.length,
        limit,
        offset,
        hasMore: offset + limit < filteredOpportunities.length
      },
      filters: {
        sport,
        market_type: marketType,
        min_confidence: minConfidence,
        max_risk: maxRisk,
        min_profit_margin: minProfitMargin,
        max_false_positive: maxFalsePositive
      },
      metrics,
      performance: performanceOptimizer.getMetrics()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Advanced arbitrage API error:', error);
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
    const { opportunities, optimization_config } = body;

    if (!opportunities || !Array.isArray(opportunities)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected opportunities array.' },
        { status: 400 }
      );
    }

    // Apply optimization configuration if provided
    if (optimization_config) {
      performanceOptimizer.updateConfig(optimization_config);
    }

    // Process opportunities with ML detection and optimization
    const optimizedOpportunities = await performanceOptimizer.optimizeArbitrageProcessing(
      opportunities,
      async (opp) => {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return opp;
      }
    );

    // Perform risk assessment
    const riskAssessments = new Map();
    for (const opportunity of optimizedOpportunities) {
      const assessment = riskAssessor.assessRisk(opportunity);
      riskAssessments.set(opportunity.id, assessment);
    }

    // Perform market analysis
    const marketAnalyses = new Map();
    const opportunitiesByMarket = groupOpportunitiesByMarket(optimizedOpportunities);
    
    for (const [marketKey, opportunities] of opportunitiesByMarket) {
      const [sport, marketType] = marketKey.split('_');
      const analysis = marketAnalyzer.analyzeMarket(
        sport,
        marketType as 'mainline' | 'props' | 'futures' | 'live',
        opportunities
      );
      
      for (const opportunity of opportunities) {
        marketAnalyses.set(opportunity.id, analysis);
      }
    }

    const response = {
      opportunities: optimizedOpportunities.map(opportunity => ({
        ...opportunity,
        risk_assessment: riskAssessments.get(opportunity.id),
        market_analysis: marketAnalyses.get(opportunity.id)
      })),
      performance: performanceOptimizer.getMetrics(),
      cache_stats: performanceOptimizer.getCacheStats()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Advanced arbitrage POST error:', error);
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
async function getBaseOpportunities() {
  // In a real implementation, this would fetch from database or external API
  // For now, return mock data
  return [
    {
      id: '1',
      sport: 'Labdarúgás',
      event: 'Manchester United vs Liverpool',
      bet1: { bookmaker: 'Bet365', odds: 2.1, outcome: 'Home Win' },
      bet2: { bookmaker: 'William Hill', odds: 1.9, outcome: 'Away Win' },
      stakes: {
        bet1: { stake: 50000, profit: 55000 },
        bet2: { stake: 50000, profit: 55000 }
      },
      totalStake: 100000,
      expectedProfit: 5000,
      profitMargin: 5.0,
      timeToExpiry: '2h 30m',
      probability: 95
    },
    {
      id: '2',
      sport: 'Tenisz',
      event: 'Djokovic vs Nadal',
      bet1: { bookmaker: 'Unibet', odds: 1.8, outcome: 'Djokovic' },
      bet2: { bookmaker: 'Bwin', odds: 2.2, outcome: 'Nadal' },
      stakes: {
        bet1: { stake: 60000, profit: 64800 },
        bet2: { stake: 40000, profit: 64800 }
      },
      totalStake: 100000,
      expectedProfit: 4800,
      profitMargin: 4.8,
      timeToExpiry: '1h 45m',
      probability: 92
    },
    {
      id: '3',
      sport: 'Kosárlabda',
      event: 'Lakers vs Warriors',
      bet1: { bookmaker: 'Pinnacle', odds: 1.95, outcome: 'Lakers' },
      bet2: { bookmaker: 'SBOBET', odds: 2.05, outcome: 'Warriors' },
      stakes: {
        bet1: { stake: 52000, profit: 55100 },
        bet2: { stake: 48000, profit: 55100 }
      },
      totalStake: 100000,
      expectedProfit: 5100,
      profitMargin: 5.1,
      timeToExpiry: '3h 15m',
      probability: 88
    }
  ];
}

interface ArbitrageOpportunity {
  id: string;
  sport: string;
  market_type?: string;
  confidence_score: number;
  risk_score: number;
  profit_margin: number;
  false_positive_probability: number;
}

function groupOpportunitiesByMarket(opportunities: ArbitrageOpportunity[]) {
  const grouped = new Map();
  
  for (const opportunity of opportunities) {
    const marketKey = `${opportunity.sport}_${opportunity.market_type || 'mainline'}`;
    if (!grouped.has(marketKey)) {
      grouped.set(marketKey, []);
    }
    grouped.get(marketKey).push(opportunity);
  }
  
  return grouped;
}

function calculateMetrics(opportunities: ArbitrageOpportunity[]) {
  if (opportunities.length === 0) {
    return {
      total_opportunities: 0,
      average_confidence: 0,
      average_risk: 0,
      average_profit_margin: 0,
      false_positive_rate: 0,
      market_distribution: {},
      risk_distribution: {}
    };
  }

  const totalOpportunities = opportunities.length;
  const averageConfidence = opportunities.reduce((sum, opp) => sum + opp.confidence_score, 0) / totalOpportunities;
  const averageRisk = opportunities.reduce((sum, opp) => sum + opp.risk_score, 0) / totalOpportunities;
  const averageProfitMargin = opportunities.reduce((sum, opp) => sum + opp.profit_margin, 0) / totalOpportunities;
  const falsePositiveRate = opportunities.reduce((sum, opp) => sum + opp.false_positive_probability, 0) / totalOpportunities;

  // Market distribution
  const marketDistribution: { [key: string]: number } = {};
  opportunities.forEach(opp => {
    const marketType = opp.market_type || 'mainline';
    marketDistribution[marketType] = (marketDistribution[marketType] || 0) + 1;
  });

  // Risk distribution
  const riskDistribution = {
    low: opportunities.filter(opp => opp.risk_score <= 0.3).length,
    medium: opportunities.filter(opp => opp.risk_score > 0.3 && opp.risk_score <= 0.6).length,
    high: opportunities.filter(opp => opp.risk_score > 0.6).length
  };

  return {
    total_opportunities: totalOpportunities,
    average_confidence: averageConfidence,
    average_risk: averageRisk,
    average_profit_margin: averageProfitMargin,
    false_positive_rate: falsePositiveRate,
    market_distribution: marketDistribution,
    risk_distribution: riskDistribution
  };
}
