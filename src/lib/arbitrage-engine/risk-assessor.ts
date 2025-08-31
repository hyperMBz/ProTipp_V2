"use client";

import { ArbitrageBet, AdvancedArbitrageOpportunity } from './ml-detector';

// Risk Assessment Interfaces
export interface RiskAssessment {
  opportunity_id: string;
  kelly_criterion: KellyCriterionResult;
  portfolio_risk: PortfolioRiskAnalysis;
  market_risk: MarketRiskAnalysis;
  bookmaker_risk: BookmakerRiskAnalysis;
  overall_risk_score: number; // 0-1 (0 = no risk, 1 = high risk)
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  recommendations: RiskRecommendation[];
  created_at: Date;
}

export interface KellyCriterionResult {
  kelly_percentage: number; // Optimal bet size as percentage of bankroll
  kelly_stake: number; // Optimal stake amount
  kelly_expected_value: number; // Expected value using Kelly
  kelly_volatility: number; // Volatility of Kelly bet
  fractional_kelly: number; // Conservative Kelly (usually 1/4 or 1/2)
  is_kelly_positive: boolean; // Whether Kelly criterion suggests betting
}

export interface PortfolioRiskAnalysis {
  total_exposure: number; // Total amount at risk
  concentration_risk: number; // Risk from betting too much on one event
  correlation_risk: number; // Risk from correlated bets
  diversification_score: number; // How well diversified the portfolio is
  max_drawdown_potential: number; // Maximum potential loss
  var_95: number; // Value at Risk (95% confidence)
  expected_shortfall: number; // Expected loss beyond VaR
}

export interface MarketRiskAnalysis {
  market_volatility: number; // Market price volatility
  liquidity_risk: number; // Risk of not being able to close position
  timing_risk: number; // Risk from market timing
  event_risk: number; // Risk from unexpected events
  regulatory_risk: number; // Risk from regulatory changes
  market_efficiency: number; // How efficient the market is
}

export interface BookmakerRiskAnalysis {
  bookmaker_credit_risk: number; // Risk of bookmaker default
  withdrawal_risk: number; // Risk of withdrawal issues
  limit_risk: number; // Risk of hitting betting limits
  account_closure_risk: number; // Risk of account being closed
  odds_manipulation_risk: number; // Risk of odds being manipulated
  overall_bookmaker_risk: number; // Combined bookmaker risk
}

export interface RiskRecommendation {
  type: 'stake_adjustment' | 'diversification' | 'timing' | 'bookmaker' | 'market';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// Risk Assessor Engine
export class RiskAssessor {
  private bankrollSize: number = 100000; // Default bankroll size
  private maxStakePercentage: number = 0.05; // Max 5% of bankroll per bet
  private fractionalKellyRatio: number = 0.25; // Use 1/4 Kelly for safety

  constructor(bankrollSize?: number) {
    if (bankrollSize) {
      this.bankrollSize = bankrollSize;
    }
  }

  // Main risk assessment method
  public assessRisk(opportunity: AdvancedArbitrageOpportunity): RiskAssessment {
    const kellyCriterion = this.calculateKellyCriterion(opportunity);
    const portfolioRisk = this.analyzePortfolioRisk(opportunity);
    const marketRisk = this.analyzeMarketRisk(opportunity);
    const bookmakerRisk = this.analyzeBookmakerRisk(opportunity);
    
    const overallRiskScore = this.calculateOverallRiskScore({
      kellyCriterion,
      portfolioRisk,
      marketRisk,
      bookmakerRisk
    });

    const riskLevel = this.determineRiskLevel(overallRiskScore);
    const recommendations = this.generateRecommendations({
      opportunity,
      kellyCriterion,
      portfolioRisk,
      marketRisk,
      bookmakerRisk,
      overallRiskScore
    });

    return {
      opportunity_id: opportunity.id,
      kelly_criterion: kellyCriterion,
      portfolio_risk: portfolioRisk,
      market_risk: marketRisk,
      bookmaker_risk: bookmakerRisk,
      overall_risk_score: overallRiskScore,
      risk_level: riskLevel,
      recommendations: recommendations,
      created_at: new Date()
    };
  }

  // Kelly Criterion calculation
  private calculateKellyCriterion(opportunity: AdvancedArbitrageOpportunity): KellyCriterionResult {
    const { opportunities, total_stake, expected_profit } = opportunity;
    
    // Calculate probability from odds (assuming fair odds)
    const probabilities = opportunities.map(bet => 1 / bet.odds);
    const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);
    
    // Normalize probabilities
    const normalizedProbabilities = probabilities.map(prob => prob / totalProbability);
    
    // Calculate Kelly percentage for each bet
    const kellyPercentages = opportunities.map((bet, index) => {
      const probability = normalizedProbabilities[index];
      const odds = bet.odds;
      const kellyPct = (probability * odds - 1) / (odds - 1);
      return kellyPct; // Allow negative Kelly for risk assessment
    });

    // Calculate weighted average Kelly percentage
    const totalKellyPercentage = kellyPercentages.reduce((sum, kelly) => sum + kelly, 0);
    const averageKellyPercentage = totalKellyPercentage / opportunities.length;
    
    // Ensure Kelly percentage is not negative for stake calculation
    const positiveKellyPercentage = Math.max(0, averageKellyPercentage);
    
    // Calculate Kelly stake
    const kellyStake = this.bankrollSize * positiveKellyPercentage;
    const fractionalKellyStake = kellyStake * this.fractionalKellyRatio;
    
    // Calculate expected value
    const kellyExpectedValue = fractionalKellyStake * (opportunity.profit_margin / 100);
    
    // Calculate volatility (simplified)
    const kellyVolatility = this.calculateKellyVolatility(opportunity, fractionalKellyStake);
    
    return {
      kelly_percentage: averageKellyPercentage,
      kelly_stake: fractionalKellyStake,
      kelly_expected_value: kellyExpectedValue,
      kelly_volatility: kellyVolatility,
      fractional_kelly: this.fractionalKellyRatio,
      is_kelly_positive: averageKellyPercentage > 0
    };
  }

  private calculateKellyVolatility(opportunity: AdvancedArbitrageOpportunity, stake: number): number {
    // Simplified volatility calculation based on profit margin and stake
    const profitMargin = opportunity.profit_margin / 100;
    const baseVolatility = 0.15; // Base volatility for arbitrage
    const marginAdjustment = profitMargin > 0.05 ? 0.1 : 0.2; // Higher margins = lower volatility
    const stakeAdjustment = stake > this.bankrollSize * 0.02 ? 0.1 : 0.05; // Higher stakes = higher volatility
    
    return baseVolatility + marginAdjustment + stakeAdjustment;
  }

  // Portfolio risk analysis
  private analyzePortfolioRisk(opportunity: AdvancedArbitrageOpportunity): PortfolioRiskAnalysis {
    const totalExposure = opportunity.total_stake;
    const concentrationRisk = this.calculateConcentrationRisk(opportunity);
    const correlationRisk = this.calculateCorrelationRisk(opportunity);
    const diversificationScore = this.calculateDiversificationScore(opportunity);
    const maxDrawdownPotential = this.calculateMaxDrawdown(opportunity);
    const var95 = this.calculateValueAtRisk(opportunity, 0.95);
    const expectedShortfall = this.calculateExpectedShortfall(opportunity, var95);

    return {
      total_exposure: totalExposure,
      concentration_risk: concentrationRisk,
      correlation_risk: correlationRisk,
      diversification_score: diversificationScore,
      max_drawdown_potential: maxDrawdownPotential,
      var_95: var95,
      expected_shortfall: expectedShortfall
    };
  }

  private calculateConcentrationRisk(opportunity: AdvancedArbitrageOpportunity): number {
    const stakePercentage = opportunity.total_stake / this.bankrollSize;
    
    // Higher concentration = higher risk
    if (stakePercentage > 0.1) return 0.9; // >10% of bankroll
    if (stakePercentage > 0.05) return 0.7; // >5% of bankroll
    if (stakePercentage > 0.02) return 0.5; // >2% of bankroll
    return 0.2; // <2% of bankroll
  }

  private calculateCorrelationRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Simplified correlation risk based on sport and market type
    const sport = opportunity.sport.toLowerCase();
    const marketType = opportunity.market_type;
    
    // Higher correlation risk for same sport events
    let correlationRisk = 0.3; // Base risk
    
    if (marketType === 'live') correlationRisk += 0.2; // Live events more correlated
    if (sport.includes('futball') || sport.includes('football')) correlationRisk += 0.1; // Popular sports
    if (sport.includes('tenisz') || sport.includes('tennis')) correlationRisk += 0.1;
    
    return Math.min(correlationRisk, 1);
  }

  private calculateDiversificationScore(opportunity: AdvancedArbitrageOpportunity): number {
    // Calculate how well this opportunity diversifies the portfolio
    const sport = opportunity.sport;
    const marketType = opportunity.market_type;
    
    // Different sports and market types provide better diversification
    let diversificationScore = 0.5; // Base score
    
    // Add points for different characteristics
    if (marketType === 'props') diversificationScore += 0.2;
    if (marketType === 'futures') diversificationScore += 0.2;
    if (sport.includes('tenisz')) diversificationScore += 0.1;
    if (sport.includes('kosárlabda')) diversificationScore += 0.1;
    if (sport.includes('jégkorong')) diversificationScore += 0.1;
    
    return Math.min(diversificationScore, 1);
  }

  private calculateMaxDrawdown(opportunity: AdvancedArbitrageOpportunity): number {
    // Maximum potential loss if all bets lose
    return opportunity.total_stake;
  }

  private calculateValueAtRisk(opportunity: AdvancedArbitrageOpportunity, confidence: number): number {
    // Value at Risk calculation (simplified)
    const profitMargin = opportunity.profit_margin / 100;
    const volatility = 0.15; // Assumed volatility
    
    // Using normal distribution approximation
    const zScore = confidence === 0.95 ? 1.645 : 1.96; // 95% or 99% confidence
    const varAmount = opportunity.total_stake * (profitMargin - zScore * volatility);
    
    return Math.max(0, varAmount);
  }

  private calculateExpectedShortfall(opportunity: AdvancedArbitrageOpportunity, var95: number): number {
    // Expected shortfall (average loss beyond VaR)
    return var95 * 0.7; // Simplified calculation
  }

  // Market risk analysis
  private analyzeMarketRisk(opportunity: AdvancedArbitrageOpportunity): MarketRiskAnalysis {
    const marketVolatility = this.calculateMarketVolatility(opportunity);
    const liquidityRisk = this.calculateLiquidityRisk(opportunity);
    const timingRisk = this.calculateTimingRisk(opportunity);
    const eventRisk = this.calculateEventRisk(opportunity);
    const regulatoryRisk = this.calculateRegulatoryRisk(opportunity);
    const marketEfficiency = opportunity.market_efficiency;

    return {
      market_volatility: marketVolatility,
      liquidity_risk: liquidityRisk,
      timing_risk: timingRisk,
      event_risk: eventRisk,
      regulatory_risk: regulatoryRisk,
      market_efficiency: marketEfficiency
    };
  }

  private calculateMarketVolatility(opportunity: AdvancedArbitrageOpportunity): number {
    // Calculate market volatility based on odds movement and profit margin
    const profitMargin = opportunity.profit_margin;
    const timeToExpiry = this.parseTimeToExpiry(opportunity.time_to_expiry);
    
    let volatility = 0.2; // Base volatility
    
    // Higher profit margins often indicate higher volatility
    if (profitMargin > 5) volatility += 0.2;
    if (profitMargin > 10) volatility += 0.1;
    
    // Shorter time to expiry = higher volatility
    if (timeToExpiry < 1) volatility += 0.3; // <1 hour
    if (timeToExpiry < 24) volatility += 0.2; // <1 day
    
    return Math.min(volatility, 1);
  }

  private calculateLiquidityRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Liquidity risk based on market type and bookmakers
    const marketType = opportunity.market_type;
    const bookmakers = opportunity.opportunities.map(bet => bet.bookmaker_id);
    
    let liquidityRisk = 0.3; // Base risk
    
    // Different market types have different liquidity
    if (marketType === 'props') liquidityRisk += 0.3;
    if (marketType === 'futures') liquidityRisk += 0.2;
    if (marketType === 'live') liquidityRisk += 0.1;
    
    // Major bookmakers provide better liquidity
    const majorBookmakers = ['Bet365', 'William Hill', 'Pinnacle'];
    const hasMajorBookmaker = bookmakers.some(bm => majorBookmakers.includes(bm));
    if (!hasMajorBookmaker) liquidityRisk += 0.2;
    
    return Math.min(liquidityRisk, 1);
  }

  private calculateTimingRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Timing risk based on time to expiry
    const timeToExpiry = this.parseTimeToExpiry(opportunity.time_to_expiry);
    
    if (timeToExpiry < 0.5) return 0.9; // <30 minutes
    if (timeToExpiry < 2) return 0.7; // <2 hours
    if (timeToExpiry < 24) return 0.5; // <1 day
    if (timeToExpiry < 168) return 0.3; // <1 week
    return 0.2; // >1 week
  }

  private calculateEventRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Event-specific risks
    const sport = opportunity.sport.toLowerCase();
    const event = opportunity.event.toLowerCase();
    
    let eventRisk = 0.2; // Base risk
    
    // Higher risk for certain sports/events
    if (sport.includes('ökölvívás') || sport.includes('boxing')) eventRisk += 0.3;
    if (sport.includes('mma')) eventRisk += 0.3;
    if (event.includes('politika') || event.includes('politics')) eventRisk += 0.4;
    if (event.includes('covid') || event.includes('pandemic')) eventRisk += 0.3;
    
    return Math.min(eventRisk, 1);
  }

  private calculateRegulatoryRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Regulatory risk (simplified)
    const sport = opportunity.sport.toLowerCase();
    
    let regulatoryRisk = 0.1; // Base risk
    
    // Higher regulatory risk for certain sports
    if (sport.includes('esports')) regulatoryRisk += 0.2;
    if (sport.includes('ökölvívás') || sport.includes('boxing')) regulatoryRisk += 0.1;
    if (sport.includes('mma')) regulatoryRisk += 0.1;
    
    return Math.min(regulatoryRisk, 1);
  }

  // Bookmaker risk analysis
  private analyzeBookmakerRisk(opportunity: AdvancedArbitrageOpportunity): BookmakerRiskAnalysis {
    const bookmakers = opportunity.opportunities.map(bet => bet.bookmaker_id);
    
    const creditRisk = this.calculateCreditRisk(bookmakers);
    const withdrawalRisk = this.calculateWithdrawalRisk(bookmakers);
    const limitRisk = this.calculateLimitRisk(opportunity);
    const accountClosureRisk = this.calculateAccountClosureRisk(bookmakers);
    const oddsManipulationRisk = this.calculateOddsManipulationRisk(opportunity);
    
    const overallBookmakerRisk = (
      creditRisk * 0.3 +
      withdrawalRisk * 0.25 +
      limitRisk * 0.2 +
      accountClosureRisk * 0.15 +
      oddsManipulationRisk * 0.1
    );

    return {
      bookmaker_credit_risk: creditRisk,
      withdrawal_risk: withdrawalRisk,
      limit_risk: limitRisk,
      account_closure_risk: accountClosureRisk,
      odds_manipulation_risk: oddsManipulationRisk,
      overall_bookmaker_risk: overallBookmakerRisk
    };
  }

  private calculateCreditRisk(bookmakers: string[]): number {
    // Credit risk by bookmaker
    const bookmakerCreditRisks: { [key: string]: number } = {
      'Bet365': 0.05,
      'William Hill': 0.08,
      'Pinnacle': 0.03,
      'Unibet': 0.12,
      'Bwin': 0.10,
      'SBOBET': 0.25,
      '1xBet': 0.30,
      'Marathonbet': 0.15
    };
    
    const maxRisk = Math.max(...bookmakers.map(bm => bookmakerCreditRisks[bm] || 0.2));
    return maxRisk;
  }

  private calculateWithdrawalRisk(bookmakers: string[]): number {
    // Withdrawal risk by bookmaker
    const bookmakerWithdrawalRisks: { [key: string]: number } = {
      'Bet365': 0.05,
      'William Hill': 0.08,
      'Pinnacle': 0.03,
      'Unibet': 0.15,
      'Bwin': 0.12,
      'SBOBET': 0.30,
      '1xBet': 0.35,
      'Marathonbet': 0.18
    };
    
    const maxRisk = Math.max(...bookmakers.map(bm => bookmakerWithdrawalRisks[bm] || 0.25));
    return maxRisk;
  }

  private calculateLimitRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Risk of hitting betting limits
    const totalStake = opportunity.total_stake;
    
    if (totalStake > 50000) return 0.8; // High stakes
    if (totalStake > 20000) return 0.6; // Medium stakes
    if (totalStake > 10000) return 0.4; // Low-medium stakes
    return 0.2; // Low stakes
  }

  private calculateAccountClosureRisk(bookmakers: string[]): number {
    // Risk of account closure
    const bookmakerClosureRisks: { [key: string]: number } = {
      'Bet365': 0.05,
      'William Hill': 0.08,
      'Pinnacle': 0.03,
      'Unibet': 0.12,
      'Bwin': 0.10,
      'SBOBET': 0.25,
      '1xBet': 0.30,
      'Marathonbet': 0.15
    };
    
    const maxRisk = Math.max(...bookmakers.map(bm => bookmakerClosureRisks[bm] || 0.2));
    return maxRisk;
  }

  private calculateOddsManipulationRisk(opportunity: AdvancedArbitrageOpportunity): number {
    // Risk of odds manipulation
    const profitMargin = opportunity.profit_margin;
    const marketEfficiency = opportunity.market_efficiency;
    
    let manipulationRisk = 0.2; // Base risk
    
    // Higher profit margins might indicate manipulation
    if (profitMargin > 10) manipulationRisk += 0.3;
    if (profitMargin > 15) manipulationRisk += 0.2;
    
    // Lower market efficiency might indicate manipulation
    if (marketEfficiency < 0.5) manipulationRisk += 0.2;
    if (marketEfficiency < 0.3) manipulationRisk += 0.1;
    
    return Math.min(manipulationRisk, 1);
  }

  // Overall risk score calculation
  private calculateOverallRiskScore(risks: {
    kellyCriterion: KellyCriterionResult;
    portfolioRisk: PortfolioRiskAnalysis;
    marketRisk: MarketRiskAnalysis;
    bookmakerRisk: BookmakerRiskAnalysis;
  }): number {
    const { kellyCriterion, portfolioRisk, marketRisk, bookmakerRisk } = risks;
    
    // Weighted risk score
    const kellyRisk = kellyCriterion.kelly_percentage > 0.1 ? 0.8 : 0.2;
    const portfolioRiskScore = (
      portfolioRisk.concentration_risk * 0.4 +
      portfolioRisk.correlation_risk * 0.3 +
      (1 - portfolioRisk.diversification_score) * 0.3
    );
    const marketRiskScore = (
      marketRisk.market_volatility * 0.3 +
      marketRisk.liquidity_risk * 0.25 +
      marketRisk.timing_risk * 0.25 +
      marketRisk.event_risk * 0.2
    );
    const bookmakerRiskScore = bookmakerRisk.overall_bookmaker_risk;
    
    const overallScore = (
      kellyRisk * 0.2 +
      portfolioRiskScore * 0.3 +
      marketRiskScore * 0.3 +
      bookmakerRiskScore * 0.2
    );
    
    return Math.min(overallScore, 1);
  }

  private determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    if (riskScore < 0.8) return 'high';
    return 'extreme';
  }

  // Generate risk recommendations
  private generateRecommendations(data: {
    opportunity: AdvancedArbitrageOpportunity;
    kellyCriterion: KellyCriterionResult;
    portfolioRisk: PortfolioRiskAnalysis;
    marketRisk: MarketRiskAnalysis;
    bookmakerRisk: BookmakerRiskAnalysis;
    overallRiskScore: number;
  }): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];
    const { opportunity, kellyCriterion, portfolioRisk, marketRisk, bookmakerRisk, overallRiskScore } = data;

    // Kelly criterion recommendations
    if (kellyCriterion.kelly_percentage > 0.1) {
      recommendations.push({
        type: 'stake_adjustment',
        priority: 'high',
        description: 'Kelly criterion suggests high stake percentage',
        action: 'Consider reducing stake to fractional Kelly (25%)',
        impact: 'positive'
      });
    }

    if (!kellyCriterion.is_kelly_positive) {
      recommendations.push({
        type: 'stake_adjustment',
        priority: 'critical',
        description: 'Kelly criterion is negative',
        action: 'Avoid this opportunity or reduce stake significantly',
        impact: 'positive'
      });
    }

    // Portfolio risk recommendations
    if (portfolioRisk.concentration_risk > 0.7) {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        description: 'High concentration risk',
        action: 'Reduce stake or diversify across more opportunities',
        impact: 'positive'
      });
    }

    if (portfolioRisk.diversification_score < 0.4) {
      recommendations.push({
        type: 'diversification',
        priority: 'medium',
        description: 'Low diversification score',
        action: 'Consider opportunities in different sports or market types',
        impact: 'positive'
      });
    }

    // Market risk recommendations
    if (marketRisk.market_volatility > 0.7) {
      recommendations.push({
        type: 'market',
        priority: 'high',
        description: 'High market volatility',
        action: 'Monitor odds closely and be prepared for rapid changes',
        impact: 'neutral'
      });
    }

    if (marketRisk.liquidity_risk > 0.6) {
      recommendations.push({
        type: 'market',
        priority: 'medium',
        description: 'High liquidity risk',
        action: 'Ensure you can close positions if needed',
        impact: 'neutral'
      });
    }

    // Bookmaker risk recommendations
    if (bookmakerRisk.overall_bookmaker_risk > 0.6) {
      recommendations.push({
        type: 'bookmaker',
        priority: 'high',
        description: 'High bookmaker risk',
        action: 'Consider using more reputable bookmakers',
        impact: 'positive'
      });
    }

    if (bookmakerRisk.limit_risk > 0.7) {
      recommendations.push({
        type: 'bookmaker',
        priority: 'medium',
        description: 'High limit risk',
        action: 'Split bets across multiple bookmakers',
        impact: 'positive'
      });
    }

    // Overall risk recommendations
    if (overallRiskScore > 0.8) {
      recommendations.push({
        type: 'stake_adjustment',
        priority: 'critical',
        description: 'Extremely high overall risk',
        action: 'Avoid this opportunity or use minimal stakes',
        impact: 'positive'
      });
    }

    return recommendations;
  }

  // Utility method to parse time to expiry
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

  // Update bankroll size
  public setBankrollSize(bankrollSize: number) {
    this.bankrollSize = bankrollSize;
  }

  // Update fractional Kelly ratio
  public setFractionalKellyRatio(ratio: number) {
    this.fractionalKellyRatio = Math.max(0, Math.min(1, ratio));
  }

  // Get current settings
  public getSettings() {
    return {
      bankrollSize: this.bankrollSize,
      maxStakePercentage: this.maxStakePercentage,
      fractionalKellyRatio: this.fractionalKellyRatio
    };
  }
}

// Singleton instance
export const riskAssessor = new RiskAssessor();
