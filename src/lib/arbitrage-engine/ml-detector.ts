"use client";

import * as tf from '@tensorflow/tfjs';

// Advanced arbitrage opportunity interface
export interface AdvancedArbitrageOpportunity {
  id: string;
  sport: string;
  event: string;
  market_type: 'mainline' | 'props' | 'futures' | 'live';
  opportunities: ArbitrageBet[];
  total_stake: number;
  expected_profit: number;
  profit_margin: number;
  confidence_score: number; // ML confidence (0-1)
  risk_score: number; // Risk assessment (0-1)
  false_positive_probability: number; // ML prediction
  market_efficiency: number; // Market efficiency score
  time_to_expiry: string;
  created_at: Date;
  updated_at: Date;
}

export interface ArbitrageBet {
  bookmaker_id: string;
  outcome: string;
  odds: number;
  stake: number;
  expected_return: number;
  risk_factor: number;
  confidence: number;
}

export interface MarketEfficiency {
  market_id: string;
  efficiency_score: number; // 0-1 (1 = perfectly efficient)
  volatility: number;
  liquidity: number;
  sharp_money_indicator: number;
  closing_line_value: number;
  last_updated: Date;
}

// ML Model Features
interface MLFeatures {
  profit_margin: number;
  market_volatility: number;
  bookmaker_consensus: number;
  historical_accuracy: number;
  time_to_expiry_hours: number;
  stake_size_ratio: number;
  odds_movement_velocity: number;
  market_efficiency_score: number;
}

// ML Input Opportunity Interface
interface MLInputOpportunity {
  id: string;
  sport: string;
  event: string;
  bet1: {
    bookmaker: string;
    odds: number;
    outcome: string;
  };
  bet2: {
    bookmaker: string;
    odds: number;
    outcome: string;
  };
  stakes: {
    bet1: {
      stake: number;
      profit: number;
    };
    bet2: {
      stake: number;
      profit: number;
    };
  };
  totalStake: number;
  expectedProfit: number;
  profitMargin: number;
  timeToExpiry: string;
  probability: number;
}

// ML Detection Engine
export class MLArbitrageDetector {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private confidenceThreshold = 0.7;
  private falsePositiveThreshold = 0.3;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // In production, load a pre-trained model
      // this.model = await tf.loadLayersModel('/models/arbitrage-detector.json');
      
      // For now, create a simple neural network
      this.model = this.createSimpleModel();
      this.isModelLoaded = true;
      console.log('ML Arbitrage Detector initialized');
    } catch (error: unknown) {
      console.error('Failed to initialize ML model:', error);
      this.isModelLoaded = false;
    }
  }

  private createSimpleModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8], // 8 features
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Extract features from arbitrage opportunity
  private extractFeatures(opportunity: MLInputOpportunity): MLFeatures {
    const timeToExpiryHours = this.parseTimeToExpiry(opportunity.timeToExpiry);
    const stakeSizeRatio = opportunity.totalStake / 100000; // Normalize to 100K base
    
    return {
      profit_margin: opportunity.profitMargin, // Keep as percentage for consistency
      market_volatility: this.calculateVolatility(opportunity),
      bookmaker_consensus: this.calculateBookmakerConsensus(opportunity),
      historical_accuracy: this.getHistoricalAccuracy(opportunity.sport),
      time_to_expiry_hours: Math.min(timeToExpiryHours / 24, 1), // Normalize to 0-1
      stake_size_ratio: Math.min(stakeSizeRatio, 1), // Cap at 1
      odds_movement_velocity: this.calculateOddsMovement(opportunity),
      market_efficiency_score: this.calculateMarketEfficiency(opportunity)
    };
  }

  private parseTimeToExpiry(timeString: string | undefined | null): number {
    // Handle undefined or null timeString
    if (!timeString) {
      return 0;
    }
    
    // Parse time strings like "2h 30m", "1d 5h", etc.
    const hours = timeString.match(/(\d+)h/)?.[1] || '0';
    const days = timeString.match(/(\d+)d/)?.[1] || '0';
    const minutes = timeString.match(/(\d+)m/)?.[1] || '0';
    
    return parseInt(days) * 24 + parseInt(hours) + parseInt(minutes) / 60;
  }

  private calculateVolatility(opportunity: any): number {
    // Calculate market volatility based on odds spread
    const odds1 = opportunity.bet1.odds;
    const odds2 = opportunity.bet2.odds;
    const spread = Math.abs(odds1 - odds2) / Math.min(odds1, odds2);
    return Math.min(spread, 1); // Normalize to 0-1
  }

  private calculateBookmakerConsensus(opportunity: any): number {
    // Calculate how much bookmakers agree on the outcome
    const bookmaker1 = opportunity.bet1.bookmaker;
    const bookmaker2 = opportunity.bet2.bookmaker;
    
    // Different bookmakers = higher consensus (less agreement)
    return bookmaker1 !== bookmaker2 ? 0.8 : 0.2;
  }

  private getHistoricalAccuracy(sport: string): number {
    // Historical accuracy by sport (mock data)
    const sportAccuracy: { [key: string]: number } = {
      'Labdarúgás': 0.85,
      'Kosárlabda': 0.78,
      'Tenisz': 0.82,
      'Amerikai Futball': 0.75,
      'Baseball': 0.70,
      'Jégkorong': 0.80,
      'Ökölvívás': 0.65,
      'MMA': 0.60,
      'Esports': 0.72,
      'Golf': 0.68,
      'Darts': 0.75,
      'Snooker': 0.78,
      'Motorsport': 0.70,
      'Krikett': 0.73
    };
    
    return sportAccuracy[sport] || 0.70;
  }

  private calculateOddsMovement(opportunity: any): number {
    // Calculate how fast odds are moving (mock implementation)
    return Math.random() * 0.5 + 0.2; // 0.2-0.7 range
  }

  private calculateMarketEfficiency(opportunity: any): number {
    // Calculate market efficiency based on profit margin and time
    const profitMargin = opportunity.profitMargin;
    const timeToExpiry = this.parseTimeToExpiry(opportunity.timeToExpiry);
    
    // Higher profit margins in efficient markets are suspicious
    const efficiencyPenalty = profitMargin > 5 ? 0.3 : 0.8;
    const timeEfficiency = timeToExpiry > 24 ? 0.9 : 0.6;
    
    return (efficiencyPenalty + timeEfficiency) / 2;
  }

  // Main detection method
  public async detectArbitrageOpportunities(
    opportunities: MLInputOpportunity[]
  ): Promise<AdvancedArbitrageOpportunity[]> {
    if (!this.isModelLoaded || !this.model) {
      console.warn('ML model not loaded, using fallback detection');
      return this.fallbackDetection(opportunities);
    }

    const advancedOpportunities: AdvancedArbitrageOpportunity[] = [];

    for (const opportunity of opportunities) {
      try {
        const features = this.extractFeatures(opportunity);
        const prediction = await this.predictOpportunity(features);
        
        if (prediction.confidence_score >= this.confidenceThreshold &&
            prediction.false_positive_probability <= this.falsePositiveThreshold) {
          
          const advancedOpportunity: AdvancedArbitrageOpportunity = {
            id: opportunity.id,
            sport: opportunity.sport,
            event: opportunity.event,
            market_type: this.determineMarketType(opportunity),
            opportunities: this.createArbitrageBets(opportunity),
            total_stake: opportunity.totalStake,
            expected_profit: opportunity.expectedProfit,
            profit_margin: opportunity.profitMargin,
            confidence_score: prediction.confidence_score,
            risk_score: prediction.risk_score,
            false_positive_probability: prediction.false_positive_probability,
            market_efficiency: prediction.market_efficiency,
            time_to_expiry: opportunity.timeToExpiry,
            created_at: new Date(),
            updated_at: new Date()
          };

          advancedOpportunities.push(advancedOpportunity);
        }
      } catch (error) {
        console.error('Error processing opportunity:', error);
      }
    }

    return advancedOpportunities;
  }

  private async predictOpportunity(features: MLFeatures): Promise<{
    confidence_score: number;
    risk_score: number;
    false_positive_probability: number;
    market_efficiency: number;
  }> {
    if (!this.model) {
      throw new Error('ML model not available');
    }

    // Convert features to tensor
    const featureTensor = tf.tensor2d([
      [
        features.profit_margin,
        features.market_volatility,
        features.bookmaker_consensus,
        features.historical_accuracy,
        features.time_to_expiry_hours,
        features.stake_size_ratio,
        features.odds_movement_velocity,
        features.market_efficiency_score
      ]
    ]);

    // Make prediction
    const prediction = this.model.predict(featureTensor) as tf.Tensor;
    const confidenceScore = await prediction.data();

    // Clean up tensors
    featureTensor.dispose();
    prediction.dispose();

    // Calculate additional scores
    const riskScore = this.calculateRiskScore(features);
    const falsePositiveProb = this.calculateFalsePositiveProbability(features);
    const marketEfficiency = features.market_efficiency_score;

    return {
      confidence_score: confidenceScore[0],
      risk_score: riskScore,
      false_positive_probability: falsePositiveProb,
      market_efficiency: marketEfficiency
    };
  }

  private calculateRiskScore(features: MLFeatures): number {
    // Risk score based on multiple factors
    const volatilityRisk = features.market_volatility * 0.3;
    const timeRisk = (1 - features.time_to_expiry_hours) * 0.2;
    const stakeRisk = features.stake_size_ratio * 0.2;
    const movementRisk = features.odds_movement_velocity * 0.3;
    
    return Math.min(volatilityRisk + timeRisk + stakeRisk + movementRisk, 1);
  }

  private calculateFalsePositiveProbability(features: MLFeatures): number {
    // Calculate false positive probability
    const efficiencyPenalty = (1 - features.market_efficiency_score) * 0.4;
    const volatilityPenalty = features.market_volatility * 0.3;
    const consensusPenalty = features.bookmaker_consensus * 0.3;
    
    return Math.min(efficiencyPenalty + volatilityPenalty + consensusPenalty, 1);
  }

  private determineMarketType(opportunity: MLInputOpportunity): 'mainline' | 'props' | 'futures' | 'live' {
    // Determine market type based on event characteristics
    const event = opportunity.event.toLowerCase();
    const sport = opportunity.sport.toLowerCase();
    
    if (event.includes('live') || event.includes('élő')) return 'live';
    if (event.includes('prop') || event.includes('speciális')) return 'props';
    if (event.includes('futures') || event.includes('jövőbeli')) return 'futures';
    return 'mainline';
  }

  private createArbitrageBets(opportunity: MLInputOpportunity): ArbitrageBet[] {
    return [
      {
        bookmaker_id: opportunity.bet1.bookmaker,
        outcome: opportunity.bet1.outcome,
        odds: opportunity.bet1.odds,
        stake: opportunity.stakes.bet1.stake,
        expected_return: opportunity.stakes.bet1.stake * opportunity.bet1.odds,
        risk_factor: this.calculateBetRisk(opportunity.bet1),
        confidence: this.calculateBetConfidence(opportunity.bet1)
      },
      {
        bookmaker_id: opportunity.bet2.bookmaker,
        outcome: opportunity.bet2.outcome,
        odds: opportunity.bet2.odds,
        stake: opportunity.stakes.bet2.stake,
        expected_return: opportunity.stakes.bet2.stake * opportunity.bet2.odds,
        risk_factor: this.calculateBetRisk(opportunity.bet2),
        confidence: this.calculateBetConfidence(opportunity.bet2)
      }
    ];
  }

  private calculateBetRisk(bet: any): number {
    // Calculate risk for individual bet
    const oddsRisk = bet.odds > 3 ? 0.3 : 0.1;
    const bookmakerRisk = this.getBookmakerRisk(bet.bookmaker);
    return Math.min(oddsRisk + bookmakerRisk, 1);
  }

  private calculateBetConfidence(bet: any): number {
    // Calculate confidence for individual bet
    const oddsConfidence = bet.odds < 2 ? 0.9 : 0.7;
    const bookmakerConfidence = this.getBookmakerConfidence(bet.bookmaker);
    return (oddsConfidence + bookmakerConfidence) / 2;
  }

  private getBookmakerRisk(bookmaker: string): number {
    // Bookmaker risk assessment (mock data)
    const bookmakerRisks: { [key: string]: number } = {
      'Bet365': 0.1,
      'William Hill': 0.15,
      'Unibet': 0.2,
      'Bwin': 0.18,
      'Pinnacle': 0.05,
      'SBOBET': 0.25,
      '1xBet': 0.3,
      'Marathonbet': 0.12
    };
    
    return bookmakerRisks[bookmaker] || 0.2;
  }

  private getBookmakerConfidence(bookmaker: string): number {
    // Bookmaker confidence assessment (mock data)
    const bookmakerConfidence: { [key: string]: number } = {
      'Bet365': 0.95,
      'William Hill': 0.9,
      'Unibet': 0.85,
      'Bwin': 0.88,
      'Pinnacle': 0.98,
      'SBOBET': 0.8,
      '1xBet': 0.75,
      'Marathonbet': 0.92
    };
    
    return bookmakerConfidence[bookmaker] || 0.8;
  }

  // Fallback detection when ML model is not available
  private fallbackDetection(opportunities: MLInputOpportunity[]): AdvancedArbitrageOpportunity[] {
    return opportunities
      .filter(opp => opp.profitMargin >= 2) // Basic filter
      .map(opp => ({
        id: opp.id,
        sport: opp.sport,
        event: opp.event,
        market_type: this.determineMarketType(opp),
        opportunities: this.createArbitrageBets(opp),
        total_stake: opp.totalStake,
        expected_profit: opp.expectedProfit,
        profit_margin: opp.profitMargin,
        confidence_score: 0.6, // Default confidence
        risk_score: 0.4, // Default risk
        false_positive_probability: 0.4, // Default false positive
        market_efficiency: 0.7, // Default efficiency
        time_to_expiry: opp.timeToExpiry,
        created_at: new Date(),
        updated_at: new Date()
      }));
  }

  // Update model confidence threshold
  public setConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  // Update false positive threshold
  public setFalsePositiveThreshold(threshold: number) {
    this.falsePositiveThreshold = Math.max(0, Math.min(1, threshold));
  }

  // Get model status
  public getModelStatus(): { isLoaded: boolean; confidenceThreshold: number; falsePositiveThreshold: number } {
    return {
      isLoaded: this.isModelLoaded,
      confidenceThreshold: this.confidenceThreshold,
      falsePositiveThreshold: this.falsePositiveThreshold
    };
  }
}

// Singleton instance
export const mlDetector = new MLArbitrageDetector();
