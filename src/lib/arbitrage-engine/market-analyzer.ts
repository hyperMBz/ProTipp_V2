"use client";

import { AdvancedArbitrageOpportunity } from './ml-detector';

// Market Analysis Interfaces
export interface MarketAnalysis {
  market_id: string;
  sport: string;
  market_type: 'mainline' | 'props' | 'futures' | 'live';
  efficiency_metrics: MarketEfficiencyMetrics;
  volatility_analysis: VolatilityAnalysis;
  liquidity_analysis: LiquidityAnalysis;
  sharp_money_analysis: SharpMoneyAnalysis;
  closing_line_analysis: ClosingLineAnalysis;
  market_sentiment: MarketSentiment;
  created_at: Date;
  updated_at: Date;
}

export interface MarketEfficiencyMetrics {
  efficiency_score: number; // 0-1 (1 = perfectly efficient)
  price_discovery: number; // How quickly prices reflect information
  arbitrage_opportunities: number; // Number of opportunities detected
  opportunity_duration: number; // Average duration of opportunities
  market_depth: number; // Market depth and liquidity
  bid_ask_spread: number; // Average bid-ask spread
}

export interface VolatilityAnalysis {
  historical_volatility: number; // Historical price volatility
  implied_volatility: number; // Implied volatility from options
  volatility_regime: 'low' | 'medium' | 'high' | 'extreme';
  volatility_trend: 'increasing' | 'decreasing' | 'stable';
  volatility_forecast: number; // Predicted volatility
  volatility_breakpoints: number[]; // Significant volatility changes
}

export interface LiquidityAnalysis {
  liquidity_score: number; // 0-1 (1 = highly liquid)
  trading_volume: number; // Trading volume
  bid_depth: number; // Depth of bid orders
  ask_depth: number; // Depth of ask orders
  market_impact: number; // Price impact of large orders
  liquidity_providers: string[]; // Major liquidity providers
  liquidity_risk: 'low' | 'medium' | 'high';
}

export interface SharpMoneyAnalysis {
  sharp_money_indicator: number; // -1 to 1 (sharp money flow)
  money_flow_direction: 'inflow' | 'outflow' | 'neutral';
  sharp_money_volume: number; // Volume of sharp money
  sharp_money_timing: number; // Timing of sharp money bets
  sharp_money_accuracy: number; // Historical accuracy of sharp money
  sharp_money_confidence: number; // Confidence in sharp money signal
}

export interface ClosingLineAnalysis {
  closing_line_value: number; // Closing line value
  line_movement: number; // Movement from opening to closing
  line_accuracy: number; // Historical accuracy of closing line
  line_volatility: number; // Volatility of line movements
  line_trend: 'up' | 'down' | 'stable';
  line_confidence: number; // Confidence in line prediction
}

export interface MarketSentiment {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  sentiment_score: number; // -1 to 1
  public_sentiment: number; // Public betting sentiment
  sharp_sentiment: number; // Sharp money sentiment
  media_sentiment: number; // Media sentiment
  social_sentiment: number; // Social media sentiment
  sentiment_confidence: number; // Confidence in sentiment analysis
}

// Market data types
interface MarketData {
  timestamp: number;
  odds: number;
  volume: number;
  liquidity: number;
  bookmaker: string;
  market: string;
  closing_line?: number;
  volatility?: number;
}

interface EfficiencyMetrics {
  score: number;
  confidence: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
}

interface MarketEfficiency {
  market: string;
  efficiency: number;
  confidence: number;
  lastUpdated: number;
  metrics: EfficiencyMetrics;
}

// Market Analyzer Engine
export class MarketAnalyzer {
  private historicalData: Map<string, MarketData[]> = new Map();
  private efficiencyThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  constructor() {
    this.initializeHistoricalData();
  }

  private initializeHistoricalData() {
    // Initialize with mock historical data
    const sports = ['Labdarúgás', 'Kosárlabda', 'Tenisz', 'Amerikai Futball', 'Baseball'];
    const marketTypes = ['mainline', 'props', 'futures', 'live'];
    
    sports.forEach(sport => {
      marketTypes.forEach(marketType => {
        const marketId = `${sport}_${marketType}`;
        this.historicalData.set(marketId, this.generateMockHistoricalData(sport, marketType));
      });
    });
  }

  private generateMockHistoricalData(sport: string, marketType: string): MarketData[] {
    const data: MarketData[] = [];
    const baseEfficiency = this.getBaseEfficiency(sport, marketType);
    const baseVolatility = this.getBaseVolatility(sport, marketType);
    
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        timestamp: date.getTime(),
        odds: 1.5 + (Math.random() - 0.5) * 0.5,
        volume: Math.random() * 1000000,
        liquidity: Math.random() * 100000,
        bookmaker: 'mock',
        market: marketType,
        closing_line: 1.5 + (Math.random() - 0.5) * 0.5,
        volatility: baseVolatility + (Math.random() - 0.5) * 0.1
      });
    }
    
    return data;
  }

  private getBaseEfficiency(sport: string, marketType: string): number {
    // Base efficiency by sport and market type
    const sportEfficiency: { [key: string]: number } = {
      'Labdarúgás': 0.85,
      'Kosárlabda': 0.78,
      'Tenisz': 0.82,
      'Amerikai Futball': 0.75,
      'Baseball': 0.70
    };
    
    const marketTypeEfficiency: { [key: string]: number } = {
      'mainline': 0.9,
      'props': 0.7,
      'futures': 0.8,
      'live': 0.6
    };
    
    return (sportEfficiency[sport] || 0.75) * (marketTypeEfficiency[marketType] || 0.8);
  }

  private getBaseVolatility(sport: string, marketType: string): number {
    // Base volatility by sport and market type
    const sportVolatility: { [key: string]: number } = {
      'Labdarúgás': 0.15,
      'Kosárlabda': 0.20,
      'Tenisz': 0.18,
      'Amerikai Futball': 0.25,
      'Baseball': 0.22
    };
    
    const marketTypeVolatility: { [key: string]: number } = {
      'mainline': 0.15,
      'props': 0.30,
      'futures': 0.25,
      'live': 0.40
    };
    
    return (sportVolatility[sport] || 0.20) * (marketTypeVolatility[marketType] || 0.25);
  }

  // Main market analysis method
  public analyzeMarket(
    sport: string,
    marketType: 'mainline' | 'props' | 'futures' | 'live',
    opportunities: AdvancedArbitrageOpportunity[]
  ): MarketAnalysis {
    const marketId = `${sport}_${marketType}`;
    const historicalData = this.historicalData.get(marketId) || [];
    
    const efficiencyMetrics = this.calculateEfficiencyMetrics(opportunities, historicalData);
    const volatilityAnalysis = this.analyzeVolatility(historicalData);
    const liquidityAnalysis = this.analyzeLiquidity(opportunities, historicalData);
    const sharpMoneyAnalysis = this.analyzeSharpMoney(historicalData);
    const closingLineAnalysis = this.analyzeClosingLine(historicalData);
    const marketSentiment = this.analyzeMarketSentiment(historicalData);

    return {
      market_id: marketId,
      sport,
      market_type: marketType,
      efficiency_metrics: efficiencyMetrics,
      volatility_analysis: volatilityAnalysis,
      liquidity_analysis: liquidityAnalysis,
      sharp_money_analysis: sharpMoneyAnalysis,
      closing_line_analysis: closingLineAnalysis,
      market_sentiment: marketSentiment,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Calculate market efficiency metrics
  private calculateEfficiencyMetrics(
    opportunities: AdvancedArbitrageOpportunity[],
    historicalData: MarketData[]
  ): MarketEfficiencyMetrics {
    const efficiencyScore = this.calculateEfficiencyScore(opportunities, historicalData);
    const priceDiscovery = this.calculatePriceDiscovery(historicalData);
    const arbitrageOpportunities = opportunities.length;
    const opportunityDuration = this.calculateAverageOpportunityDuration(opportunities);
    const marketDepth = this.calculateMarketDepth(opportunities);
    const bidAskSpread = this.calculateBidAskSpread(opportunities);

    return {
      efficiency_score: efficiencyScore,
      price_discovery: priceDiscovery,
      arbitrage_opportunities: arbitrageOpportunities,
      opportunity_duration: opportunityDuration,
      market_depth: marketDepth,
      bid_ask_spread: bidAskSpread
    };
  }

  private calculateEfficiencyScore(
    opportunities: AdvancedArbitrageOpportunity[],
    historicalData: MarketData[]
  ): number {
    if (opportunities.length === 0) return 0.9; // No opportunities = efficient market
    
    // Calculate efficiency based on opportunity characteristics
    const avgProfitMargin = opportunities.reduce((sum, opp) => sum + opp.profit_margin, 0) / opportunities.length;
    const avgConfidence = opportunities.reduce((sum, opp) => sum + opp.confidence_score, 0) / opportunities.length;
    const avgFalsePositive = opportunities.reduce((sum, opp) => sum + opp.false_positive_probability, 0) / opportunities.length;
    
    // Higher profit margins and confidence indicate less efficient markets
    const profitMarginEfficiency = Math.max(0, 1 - avgProfitMargin / 20); // Normalize to 0-1
    const confidenceEfficiency = Math.max(0, 1 - avgConfidence);
    const falsePositiveEfficiency = avgFalsePositive; // Higher false positive = more efficient
    
    // Weighted average
    const efficiencyScore = (
      profitMarginEfficiency * 0.4 +
      confidenceEfficiency * 0.3 +
      falsePositiveEfficiency * 0.3
    );
    
    return Math.min(Math.max(efficiencyScore, 0), 1);
  }

  private calculatePriceDiscovery(historicalData: MarketData[]): number {
    if (historicalData.length < 2) return 0.5;
    
    // Calculate how quickly prices reflect new information
    const recentData = historicalData.slice(0, 10);
    const priceChanges = recentData.map((data, i) => {
      if (i === 0) return 0;
      const current = data.closing_line ?? 0;
      const prev = recentData[i - 1].closing_line ?? 0;
      return Math.abs(current - prev);
    });
    
    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const priceDiscovery = Math.max(0, 1 - avgPriceChange); // Lower changes = faster discovery
    
    return Math.min(Math.max(priceDiscovery, 0), 1);
  }

  private calculateAverageOpportunityDuration(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 0;
    
    // Mock calculation based on time to expiry
    const durations = opportunities.map(opp => this.parseTimeToExpiry(opp.time_to_expiry));
    const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    
    return avgDuration;
  }

  private calculateMarketDepth(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 0.5;
    
    // Calculate market depth based on total stakes and number of opportunities
    const totalStakes = opportunities.reduce((sum, opp) => sum + opp.total_stake, 0);
    const avgStake = totalStakes / opportunities.length;
    
    // Normalize to 0-1 (assuming max stake of 100K)
    const depthScore = Math.min(avgStake / 100000, 1);
    
    return depthScore;
  }

  private calculateBidAskSpread(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 0.02; // Default 2% spread
    
    // Calculate average bid-ask spread from opportunities
    const spreads = opportunities.map(opp => {
      const odds1 = opp.opportunities[0]?.odds || 2.0;
      const odds2 = opp.opportunities[1]?.odds || 2.0;
      return Math.abs(odds1 - odds2) / Math.min(odds1, odds2);
    });
    
    const avgSpread = spreads.reduce((sum, spread) => sum + spread, 0) / spreads.length;
    
    return avgSpread;
  }

  // Analyze market volatility
  private analyzeVolatility(historicalData: MarketData[]): VolatilityAnalysis {
    if (historicalData.length < 10) {
      return this.getDefaultVolatilityAnalysis();
    }
    
    const recentData = historicalData.slice(0, 30); // Last 30 data points
    const volatilities = recentData.map(data => data.volatility).filter((v): v is number => typeof v === 'number');
    
    const historicalVolatility = this.calculateHistoricalVolatility(volatilities);
    const impliedVolatility = this.calculateImpliedVolatility(historicalData);
    const volatilityRegime = this.determineVolatilityRegime(historicalVolatility);
    const volatilityTrend = this.calculateVolatilityTrend(volatilities);
    const volatilityForecast = this.forecastVolatility(volatilities);
    const volatilityBreakpoints = this.findVolatilityBreakpoints(volatilities);

    return {
      historical_volatility: historicalVolatility,
      implied_volatility: impliedVolatility,
      volatility_regime: volatilityRegime,
      volatility_trend: volatilityTrend,
      volatility_forecast: volatilityForecast,
      volatility_breakpoints: volatilityBreakpoints
    };
  }

  private calculateHistoricalVolatility(volatilities: number[]): number {
    if (volatilities.length < 2) return 0.2;
    
    const mean = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    const variance = volatilities.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volatilities.length;
    
    return Math.sqrt(variance);
  }

  private calculateImpliedVolatility(historicalData: MarketData[]): number {
    // Simplified implied volatility calculation
    const recentData = historicalData.slice(0, 10);
    const priceChanges = recentData.map((data, i) => {
      if (i === 0) return 0;
      const curr = data.closing_line ?? 0;
      const prev = recentData[i - 1].closing_line ?? 0;
      return Math.abs(curr - prev);
    });
    
    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    
    return avgPriceChange * 10; // Scale to volatility range
  }

  private determineVolatilityRegime(volatility: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (volatility < 0.1) return 'low';
    if (volatility < 0.2) return 'medium';
    if (volatility < 0.4) return 'high';
    return 'extreme';
  }

  private calculateVolatilityTrend(volatilities: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (volatilities.length < 5) return 'stable';
    
    const recent = volatilities.slice(0, 5);
    const older = volatilities.slice(5, 10);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, vol) => sum + vol, 0) / recent.length;
    const olderAvg = older.reduce((sum, vol) => sum + vol, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  private forecastVolatility(volatilities: number[]): number {
    if (volatilities.length < 5) return 0.2;
    
    // Simple moving average forecast
    const recent = volatilities.slice(0, 5);
    const forecast = recent.reduce((sum, vol) => sum + vol, 0) / recent.length;
    
    return forecast;
  }

  private findVolatilityBreakpoints(volatilities: number[]): number[] {
    if (volatilities.length < 10) return [];
    
    const breakpoints: number[] = [];
    const threshold = 0.1; // Significant change threshold
    
    for (let i = 1; i < volatilities.length; i++) {
      const change = Math.abs(volatilities[i] - volatilities[i - 1]);
      if (change > threshold) {
        breakpoints.push(i);
      }
    }
    
    return breakpoints.slice(-3); // Return last 3 breakpoints
  }

  private getDefaultVolatilityAnalysis(): VolatilityAnalysis {
    return {
      historical_volatility: 0.2,
      implied_volatility: 0.2,
      volatility_regime: 'medium',
      volatility_trend: 'stable',
      volatility_forecast: 0.2,
      volatility_breakpoints: []
    };
  }

  // Analyze market liquidity
  private analyzeLiquidity(
    opportunities: AdvancedArbitrageOpportunity[],
    historicalData: MarketData[]
  ): LiquidityAnalysis {
    const liquidityScore = this.calculateLiquidityScore(opportunities);
    const tradingVolume = this.calculateTradingVolume(historicalData);
    const bidDepth = this.calculateBidDepth(opportunities);
    const askDepth = this.calculateAskDepth(opportunities);
    const marketImpact = this.calculateMarketImpact(opportunities);
    const liquidityProviders = this.identifyLiquidityProviders(opportunities);
    const liquidityRisk = this.determineLiquidityRisk(liquidityScore);

    return {
      liquidity_score: liquidityScore,
      trading_volume: tradingVolume,
      bid_depth: bidDepth,
      ask_depth: askDepth,
      market_impact: marketImpact,
      liquidity_providers: liquidityProviders,
      liquidity_risk: liquidityRisk
    };
  }

  private calculateLiquidityScore(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 0.5;
    
    // Calculate liquidity based on number of opportunities and total stakes
    const totalStakes = opportunities.reduce((sum, opp) => sum + opp.total_stake, 0);
    const avgStake = totalStakes / opportunities.length;
    const opportunityDensity = opportunities.length / 100; // Normalize to 0-1
    
    const liquidityScore = (
      Math.min(avgStake / 50000, 1) * 0.4 + // Stake component
      Math.min(opportunityDensity, 1) * 0.6 // Density component
    );
    
    return Math.min(Math.max(liquidityScore, 0), 1);
  }

  private calculateTradingVolume(historicalData: any[]): number {
    if (historicalData.length === 0) return 500000;
    
    const recentData = historicalData.slice(0, 10);
    const volumes = recentData.map(data => data.volume);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    return avgVolume;
  }

  private calculateBidDepth(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 100000;
    
    const totalStakes = opportunities.reduce((sum, opp) => sum + opp.total_stake, 0);
    return totalStakes * 0.6; // Assume 60% of total is bid depth
  }

  private calculateAskDepth(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 100000;
    
    const totalStakes = opportunities.reduce((sum, opp) => sum + opp.total_stake, 0);
    return totalStakes * 0.4; // Assume 40% of total is ask depth
  }

  private calculateMarketImpact(opportunities: AdvancedArbitrageOpportunity[]): number {
    if (opportunities.length === 0) return 0.02;
    
    // Calculate market impact based on average stake size
    const avgStake = opportunities.reduce((sum, opp) => sum + opp.total_stake, 0) / opportunities.length;
    const totalMarketSize = avgStake * opportunities.length;
    
    // Market impact = stake size / market size
    const marketImpact = avgStake / totalMarketSize;
    
    return Math.min(marketImpact, 0.1); // Cap at 10%
  }

  private identifyLiquidityProviders(opportunities: AdvancedArbitrageOpportunity[]): string[] {
    const bookmakers = new Set<string>();
    
    opportunities.forEach(opp => {
      opp.opportunities.forEach(bet => {
        bookmakers.add(bet.bookmaker_id);
      });
    });
    
    return Array.from(bookmakers);
  }

  private determineLiquidityRisk(liquidityScore: number): 'low' | 'medium' | 'high' {
    if (liquidityScore > 0.7) return 'low';
    if (liquidityScore > 0.4) return 'medium';
    return 'high';
  }

  // Analyze sharp money
  private analyzeSharpMoney(historicalData: any[]): SharpMoneyAnalysis {
    if (historicalData.length === 0) {
      return this.getDefaultSharpMoneyAnalysis();
    }
    
    const recentData = historicalData.slice(0, 10);
    const sharpMoneyIndicators = recentData.map(data => data.sharp_money);
    
    const sharpMoneyIndicator = this.calculateSharpMoneyIndicator(sharpMoneyIndicators);
    const moneyFlowDirection = this.determineMoneyFlowDirection(sharpMoneyIndicator);
    const sharpMoneyVolume = this.calculateSharpMoneyVolume(historicalData);
    const sharpMoneyTiming = this.calculateSharpMoneyTiming(historicalData);
    const sharpMoneyAccuracy = this.calculateSharpMoneyAccuracy(historicalData);
    const sharpMoneyConfidence = this.calculateSharpMoneyConfidence(sharpMoneyIndicators);

    return {
      sharp_money_indicator: sharpMoneyIndicator,
      money_flow_direction: moneyFlowDirection,
      sharp_money_volume: sharpMoneyVolume,
      sharp_money_timing: sharpMoneyTiming,
      sharp_money_accuracy: sharpMoneyAccuracy,
      sharp_money_confidence: sharpMoneyConfidence
    };
  }

  private calculateSharpMoneyIndicator(sharpMoneyIndicators: number[]): number {
    if (sharpMoneyIndicators.length === 0) return 0;
    
    const avgIndicator = sharpMoneyIndicators.reduce((sum, indicator) => sum + indicator, 0) / sharpMoneyIndicators.length;
    
    return Math.max(-1, Math.min(1, avgIndicator)); // Clamp to -1 to 1
  }

  private determineMoneyFlowDirection(sharpMoneyIndicator: number): 'inflow' | 'outflow' | 'neutral' {
    if (sharpMoneyIndicator > 0.1) return 'inflow';
    if (sharpMoneyIndicator < -0.1) return 'outflow';
    return 'neutral';
  }

  private calculateSharpMoneyVolume(historicalData: any[]): number {
    if (historicalData.length === 0) return 100000;
    
    const recentData = historicalData.slice(0, 10);
    const volumes = recentData.map(data => data.volume);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    return avgVolume * 0.3; // Assume 30% is sharp money
  }

  private calculateSharpMoneyTiming(historicalData: any[]): number {
    // Mock calculation - in reality this would analyze timing patterns
    return Math.random() * 24; // Hours before event
  }

  private calculateSharpMoneyAccuracy(historicalData: any[]): number {
    // Mock calculation - in reality this would analyze historical accuracy
    return 0.75 + Math.random() * 0.2; // 75-95% accuracy
  }

  private calculateSharpMoneyConfidence(sharpMoneyIndicators: number[]): number {
    if (sharpMoneyIndicators.length === 0) return 0.5;
    
    // Calculate confidence based on consistency of signals
    const variance = this.calculateVariance(sharpMoneyIndicators);
    const confidence = Math.max(0, 1 - variance);
    
    return confidence;
  }

  private getDefaultSharpMoneyAnalysis(): SharpMoneyAnalysis {
    return {
      sharp_money_indicator: 0,
      money_flow_direction: 'neutral',
      sharp_money_volume: 100000,
      sharp_money_timing: 12,
      sharp_money_accuracy: 0.8,
      sharp_money_confidence: 0.5
    };
  }

  // Analyze closing line
  private analyzeClosingLine(historicalData: any[]): ClosingLineAnalysis {
    if (historicalData.length === 0) {
      return this.getDefaultClosingLineAnalysis();
    }
    
    const recentData = historicalData.slice(0, 10);
    const closingLines = recentData.map(data => data.closing_line);
    
    const closingLineValue = this.calculateClosingLineValue(closingLines);
    const lineMovement = this.calculateLineMovement(historicalData);
    const lineAccuracy = this.calculateLineAccuracy(historicalData);
    const lineVolatility = this.calculateLineVolatility(closingLines);
    const lineTrend = this.calculateLineTrend(closingLines);
    const lineConfidence = this.calculateLineConfidence(closingLines);

    return {
      closing_line_value: closingLineValue,
      line_movement: lineMovement,
      line_accuracy: lineAccuracy,
      line_volatility: lineVolatility,
      line_trend: lineTrend,
      line_confidence: lineConfidence
    };
  }

  private calculateClosingLineValue(closingLines: number[]): number {
    if (closingLines.length === 0) return 1.5;
    
    return closingLines[closingLines.length - 1]; // Most recent value
  }

  private calculateLineMovement(historicalData: MarketData[]): number {
    if (historicalData.length < 2) return 0;
    
    const first = historicalData[historicalData.length - 1].closing_line ?? 0;
    const last = historicalData[0].closing_line ?? 0;
    
    return (last - first) / first; // Percentage change
  }

  private calculateLineAccuracy(historicalData: any[]): number {
    // Mock calculation - in reality this would compare predictions to outcomes
    return 0.8 + Math.random() * 0.15; // 80-95% accuracy
  }

  private calculateLineVolatility(closingLines: number[]): number {
    if (closingLines.length < 2) return 0.1;
    
    return this.calculateHistoricalVolatility(closingLines.filter((n) => typeof n === 'number'));
  }

  private calculateLineTrend(closingLines: number[]): 'up' | 'down' | 'stable' {
    if (closingLines.length < 5) return 'stable';
    
    const filtered = closingLines.filter((n) => typeof n === 'number');
    const recent = filtered.slice(0, 3);
    const older = filtered.slice(3, 6);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, line) => sum + line, 0) / recent.length;
    const olderAvg = older.reduce((sum, line) => sum + line, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  private calculateLineConfidence(closingLines: number[]): number {
    if (closingLines.length < 3) return 0.5;
    
    // Calculate confidence based on consistency
    const variance = this.calculateVariance(closingLines);
    const confidence = Math.max(0, 1 - variance);
    
    return confidence;
  }

  private getDefaultClosingLineAnalysis(): ClosingLineAnalysis {
    return {
      closing_line_value: 1.5,
      line_movement: 0,
      line_accuracy: 0.8,
      line_volatility: 0.1,
      line_trend: 'stable',
      line_confidence: 0.5
    };
  }

  // Analyze market sentiment
  private analyzeMarketSentiment(historicalData: any[]): MarketSentiment {
    if (historicalData.length === 0) {
      return this.getDefaultMarketSentiment();
    }
    
    const recentData = historicalData.slice(0, 10);
    const sentiments = recentData.map(data => data.sentiment);
    
    const overallSentiment = this.calculateOverallSentiment(sentiments);
    const sentimentScore = this.calculateSentimentScore(sentiments);
    const publicSentiment = this.calculatePublicSentiment(historicalData);
    const sharpSentiment = this.calculateSharpSentiment(historicalData);
    const mediaSentiment = this.calculateMediaSentiment(historicalData);
    const socialSentiment = this.calculateSocialSentiment(historicalData);
    const sentimentConfidence = this.calculateSentimentConfidence(sentiments);

    return {
      overall_sentiment: overallSentiment,
      sentiment_score: sentimentScore,
      public_sentiment: publicSentiment,
      sharp_sentiment: sharpSentiment,
      media_sentiment: mediaSentiment,
      social_sentiment: socialSentiment,
      sentiment_confidence: sentimentConfidence
    };
  }

  private calculateOverallSentiment(sentiments: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (sentiments.length === 0) return 'neutral';
    
    const avgSentiment = sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
    
    if (avgSentiment > 0.1) return 'bullish';
    if (avgSentiment < -0.1) return 'bearish';
    return 'neutral';
  }

  private calculateSentimentScore(sentiments: number[]): number {
    if (sentiments.length === 0) return 0;
    
    const avgSentiment = sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
    
    return Math.max(-1, Math.min(1, avgSentiment)); // Clamp to -1 to 1
  }

  private calculatePublicSentiment(historicalData: any[]): number {
    // Mock calculation - in reality this would analyze public betting patterns
    return (Math.random() - 0.5) * 2; // -1 to 1
  }

  private calculateSharpSentiment(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;
    
    const recentData = historicalData.slice(0, 5);
    const sharpMoney = recentData.map(data => data.sharp_money);
    const avgSharpMoney = sharpMoney.reduce((sum, money) => sum + money, 0) / sharpMoney.length;
    
    return Math.max(-1, Math.min(1, avgSharpMoney));
  }

  private calculateMediaSentiment(historicalData: any[]): number {
    // Mock calculation - in reality this would analyze media coverage
    return (Math.random() - 0.5) * 2; // -1 to 1
  }

  private calculateSocialSentiment(historicalData: any[]): number {
    // Mock calculation - in reality this would analyze social media
    return (Math.random() - 0.5) * 2; // -1 to 1
  }

  private calculateSentimentConfidence(sentiments: number[]): number {
    if (sentiments.length < 3) return 0.5;
    
    // Calculate confidence based on consistency
    const variance = this.calculateVariance(sentiments);
    const confidence = Math.max(0, 1 - variance);
    
    return confidence;
  }

  private getDefaultMarketSentiment(): MarketSentiment {
    return {
      overall_sentiment: 'neutral',
      sentiment_score: 0,
      public_sentiment: 0,
      sharp_sentiment: 0,
      media_sentiment: 0,
      social_sentiment: 0,
      sentiment_confidence: 0.5
    };
  }

  // Utility methods
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  private parseTimeToExpiry(timeString: string | undefined | null): number {
    // Handle undefined or null timeString
    if (!timeString) {
      return 0;
    }
    
    const hours = timeString.match(/(\d+)h/)?.[1] || '0';
    const days = timeString.match(/(\d+)d/)?.[1] || '0';
    const minutes = timeString.match(/(\d+)m/)?.[1] || '0';
    
    return parseInt(days) * 24 + parseInt(hours) + parseInt(minutes) / 60;
  }

  // Update efficiency thresholds
  public setEfficiencyThresholds(thresholds: { low: number; medium: number; high: number }) {
    this.efficiencyThresholds = thresholds;
  }

  // Get current settings
  public getSettings() {
    return {
      efficiencyThresholds: this.efficiencyThresholds
    };
  }
}

// Singleton instance
export const marketAnalyzer = new MarketAnalyzer();
