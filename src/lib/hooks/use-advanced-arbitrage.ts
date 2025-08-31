"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  AdvancedArbitrageOpportunity, 
  mlDetector 
} from '../arbitrage-engine/ml-detector';
import { 
  RiskAssessment, 
  riskAssessor 
} from '../arbitrage-engine/risk-assessor';
import { 
  MarketAnalysis, 
  marketAnalyzer 
} from '../arbitrage-engine/market-analyzer';
import { 
  performanceOptimizer 
} from '../arbitrage-engine/optimizer';

// Hook interfaces
export interface AdvancedArbitrageFilters {
  sport?: string;
  market_type?: 'mainline' | 'props' | 'futures' | 'live';
  min_confidence?: number;
  max_risk?: number;
  min_profit_margin?: number;
  max_false_positive?: number;
}

export interface AdvancedArbitrageState {
  opportunities: AdvancedArbitrageOpportunity[];
  riskAssessments: Map<string, RiskAssessment>;
  marketAnalyses: Map<string, MarketAnalysis>;
  filters: AdvancedArbitrageFilters;
  isLoading: boolean;
  error: Error | null;
  metrics: {
    totalOpportunities: number;
    averageConfidence: number;
    averageRisk: number;
    averageProfitMargin: number;
    falsePositiveRate: number;
  };
}

// Main advanced arbitrage hook
export function useAdvancedArbitrage(
  baseOpportunities: any[],
  filters: AdvancedArbitrageFilters = {}
) {
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<AdvancedArbitrageFilters>(filters);

  // ML Detection Query
  const mlDetectionQuery = useQuery({
    queryKey: ['advanced-arbitrage', 'ml-detection', baseOpportunities, localFilters],
    queryFn: async () => {
      const opportunities = await mlDetector.detectArbitrageOpportunities(baseOpportunities);
      return filterOpportunities(opportunities, localFilters);
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: baseOpportunities.length > 0
  });

  // Risk Assessment Query
  const riskAssessmentQuery = useQuery({
    queryKey: ['advanced-arbitrage', 'risk-assessment', mlDetectionQuery.data],
    queryFn: async () => {
      if (!mlDetectionQuery.data) return new Map();
      
      const riskAssessments = new Map<string, RiskAssessment>();
      
      for (const opportunity of mlDetectionQuery.data) {
        const assessment = riskAssessor.assessRisk(opportunity);
        riskAssessments.set(opportunity.id, assessment);
      }
      
      return riskAssessments;
    },
    enabled: !!mlDetectionQuery.data && mlDetectionQuery.data.length > 0,
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Market Analysis Query
  const marketAnalysisQuery = useQuery({
    queryKey: ['advanced-arbitrage', 'market-analysis', mlDetectionQuery.data],
    queryFn: async () => {
      if (!mlDetectionQuery.data) return new Map();
      
      const marketAnalyses = new Map<string, MarketAnalysis>();
      const opportunitiesByMarket = groupOpportunitiesByMarket(mlDetectionQuery.data);
      
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
      
      return marketAnalyses;
    },
    enabled: !!mlDetectionQuery.data && mlDetectionQuery.data.length > 0,
    staleTime: 120000, // 2 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Performance Optimization Mutation
  const optimizationMutation = useMutation({
    mutationFn: async (opportunities: AdvancedArbitrageOpportunity[]) => {
      return performanceOptimizer.optimizeArbitrageProcessing(
        opportunities,
        async (opp) => {
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 10));
          return opp;
        }
      );
    },
    onSuccess: (optimizedOpportunities) => {
      queryClient.setQueryData(
        ['advanced-arbitrage', 'ml-detection', baseOpportunities, localFilters],
        optimizedOpportunities
      );
    }
  });

  // Filter opportunities based on criteria
  const filterOpportunities = useCallback((
    opportunities: AdvancedArbitrageOpportunity[],
    filters: AdvancedArbitrageFilters
  ): AdvancedArbitrageOpportunity[] => {
    return opportunities.filter(opportunity => {
      if (filters.sport && opportunity.sport !== filters.sport) return false;
      if (filters.market_type && opportunity.market_type !== filters.market_type) return false;
      if (filters.min_confidence && opportunity.confidence_score < filters.min_confidence) return false;
      if (filters.max_risk && opportunity.risk_score > filters.max_risk) return false;
      if (filters.min_profit_margin && opportunity.profit_margin < filters.min_profit_margin) return false;
      if (filters.max_false_positive && opportunity.false_positive_probability > filters.max_false_positive) return false;
      return true;
    });
  }, []);

  // Group opportunities by market
  const groupOpportunitiesByMarket = useCallback((
    opportunities: AdvancedArbitrageOpportunity[]
  ): Map<string, AdvancedArbitrageOpportunity[]> => {
    const grouped = new Map<string, AdvancedArbitrageOpportunity[]>();
    
    for (const opportunity of opportunities) {
      const marketKey = `${opportunity.sport}_${opportunity.market_type}`;
      if (!grouped.has(marketKey)) {
        grouped.set(marketKey, []);
      }
      grouped.get(marketKey)!.push(opportunity);
    }
    
    return grouped;
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const opportunities = mlDetectionQuery.data || [];
    
    if (opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        averageConfidence: 0,
        averageRisk: 0,
        averageProfitMargin: 0,
        falsePositiveRate: 0
      };
    }

    const totalOpportunities = opportunities.length;
    const averageConfidence = opportunities.reduce((sum, opp) => sum + opp.confidence_score, 0) / totalOpportunities;
    const averageRisk = opportunities.reduce((sum, opp) => sum + opp.risk_score, 0) / totalOpportunities;
    const averageProfitMargin = opportunities.reduce((sum, opp) => sum + opp.profit_margin, 0) / totalOpportunities;
    const falsePositiveRate = opportunities.reduce((sum, opp) => sum + opp.false_positive_probability, 0) / totalOpportunities;

    return {
      totalOpportunities,
      averageConfidence,
      averageRisk,
      averageProfitMargin,
      falsePositiveRate
    };
  }, [mlDetectionQuery.data]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AdvancedArbitrageFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  // Optimize opportunities
  const optimizeOpportunities = useCallback(() => {
    if (mlDetectionQuery.data) {
      optimizationMutation.mutate(mlDetectionQuery.data);
    }
  }, [mlDetectionQuery.data, optimizationMutation]);

  // Get opportunity by ID
  const getOpportunityById = useCallback((id: string) => {
    return mlDetectionQuery.data?.find(opp => opp.id === id);
  }, [mlDetectionQuery.data]);

  // Get risk assessment by opportunity ID
  const getRiskAssessment = useCallback((opportunityId: string) => {
    return riskAssessmentQuery.data?.get(opportunityId);
  }, [riskAssessmentQuery.data]);

  // Get market analysis by opportunity ID
  const getMarketAnalysis = useCallback((opportunityId: string) => {
    return marketAnalysisQuery.data?.get(opportunityId);
  }, [marketAnalysisQuery.data]);

  // Get opportunities by sport
  const getOpportunitiesBySport = useCallback((sport: string) => {
    return mlDetectionQuery.data?.filter(opp => opp.sport === sport) || [];
  }, [mlDetectionQuery.data]);

  // Get opportunities by market type
  const getOpportunitiesByMarketType = useCallback((marketType: 'mainline' | 'props' | 'futures' | 'live') => {
    return mlDetectionQuery.data?.filter(opp => opp.market_type === marketType) || [];
  }, [mlDetectionQuery.data]);

  // Get high confidence opportunities
  const getHighConfidenceOpportunities = useCallback((threshold: number = 0.8) => {
    return mlDetectionQuery.data?.filter(opp => opp.confidence_score >= threshold) || [];
  }, [mlDetectionQuery.data]);

  // Get low risk opportunities
  const getLowRiskOpportunities = useCallback((threshold: number = 0.3) => {
    return mlDetectionQuery.data?.filter(opp => opp.risk_score <= threshold) || [];
  }, [mlDetectionQuery.data]);

  // Get high profit opportunities
  const getHighProfitOpportunities = useCallback((threshold: number = 5) => {
    return mlDetectionQuery.data?.filter(opp => opp.profit_margin >= threshold) || [];
  }, [mlDetectionQuery.data]);

  // State object
  const state: AdvancedArbitrageState = {
    opportunities: mlDetectionQuery.data || [],
    riskAssessments: riskAssessmentQuery.data || new Map(),
    marketAnalyses: marketAnalysisQuery.data || new Map(),
    filters: localFilters,
    isLoading: mlDetectionQuery.isLoading || riskAssessmentQuery.isLoading || marketAnalysisQuery.isLoading,
    error: mlDetectionQuery.error || riskAssessmentQuery.error || marketAnalysisQuery.error,
    metrics
  };

  return {
    // State
    state,
    
    // Data
    opportunities: mlDetectionQuery.data || [],
    riskAssessments: riskAssessmentQuery.data || new Map(),
    marketAnalyses: marketAnalysisQuery.data || new Map(),
    metrics,
    
    // Loading states
    isLoading: mlDetectionQuery.isLoading || riskAssessmentQuery.isLoading || marketAnalysisQuery.isLoading,
    isOptimizing: optimizationMutation.isPending,
    
    // Error states
    error: mlDetectionQuery.error || riskAssessmentQuery.error || marketAnalysisQuery.error,
    optimizationError: optimizationMutation.error,
    
    // Filters
    filters: localFilters,
    updateFilters,
    clearFilters,
    
    // Actions
    optimizeOpportunities,
    refetch: mlDetectionQuery.refetch,
    
    // Utility methods
    getOpportunityById,
    getRiskAssessment,
    getMarketAnalysis,
    getOpportunitiesBySport,
    getOpportunitiesByMarketType,
    getHighConfidenceOpportunities,
    getLowRiskOpportunities,
    getHighProfitOpportunities,
    
    // Query objects for advanced usage
    mlDetectionQuery,
    riskAssessmentQuery,
    marketAnalysisQuery,
    optimizationMutation
  };
}

// Specialized hooks for specific use cases

// Hook for ML model configuration
export function useMLModelConfig() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [falsePositiveThreshold, setFalsePositiveThreshold] = useState(0.3);

  const updateModelConfig = useCallback((config: { confidenceThreshold?: number; falsePositiveThreshold?: number }) => {
    if (config.confidenceThreshold !== undefined) {
      setConfidenceThreshold(config.confidenceThreshold);
      mlDetector.setConfidenceThreshold(config.confidenceThreshold);
    }
    if (config.falsePositiveThreshold !== undefined) {
      setFalsePositiveThreshold(config.falsePositiveThreshold);
      mlDetector.setFalsePositiveThreshold(config.falsePositiveThreshold);
    }
  }, []);

  const getModelStatus = useCallback(() => {
    return mlDetector.getModelStatus();
  }, []);

  return {
    confidenceThreshold,
    falsePositiveThreshold,
    updateModelConfig,
    getModelStatus
  };
}

// Hook for risk assessment configuration
export function useRiskAssessmentConfig() {
  const [bankrollSize, setBankrollSize] = useState(100000);
  const [fractionalKellyRatio, setFractionalKellyRatio] = useState(0.25);

  const updateRiskConfig = useCallback((config: { bankrollSize?: number; fractionalKellyRatio?: number }) => {
    if (config.bankrollSize !== undefined) {
      setBankrollSize(config.bankrollSize);
      riskAssessor.setBankrollSize(config.bankrollSize);
    }
    if (config.fractionalKellyRatio !== undefined) {
      setFractionalKellyRatio(config.fractionalKellyRatio);
      riskAssessor.setFractionalKellyRatio(config.fractionalKellyRatio);
    }
  }, []);

  const getRiskSettings = useCallback(() => {
    return riskAssessor.getSettings();
  }, []);

  return {
    bankrollSize,
    fractionalKellyRatio,
    updateRiskConfig,
    getRiskSettings
  };
}

// Hook for performance optimization configuration
export function usePerformanceOptimizationConfig() {
  const [config, setConfig] = useState(performanceOptimizer.getConfig());

  const updateOptimizationConfig = useCallback((newConfig: Partial<typeof config>) => {
    performanceOptimizer.updateConfig(newConfig);
    setConfig(performanceOptimizer.getConfig());
  }, []);

  const getMetrics = useCallback(() => {
    return performanceOptimizer.getMetrics();
  }, []);

  const getCacheStats = useCallback(() => {
    return performanceOptimizer.getCacheStats();
  }, []);

  const clearCache = useCallback(() => {
    performanceOptimizer.clearCache();
  }, []);

  const resetMetrics = useCallback(() => {
    performanceOptimizer.resetMetrics();
  }, []);

  return {
    config,
    updateOptimizationConfig,
    getMetrics,
    getCacheStats,
    clearCache,
    resetMetrics
  };
}

// Hook for market analysis configuration
export function useMarketAnalysisConfig() {
  const [efficiencyThresholds, setEfficiencyThresholds] = useState({
    low: 0.3,
    medium: 0.6,
    high: 0.8
  });

  const updateEfficiencyThresholds = useCallback((thresholds: { low?: number; medium?: number; high?: number }) => {
    const newThresholds = { ...efficiencyThresholds, ...thresholds };
    setEfficiencyThresholds(newThresholds);
    marketAnalyzer.setEfficiencyThresholds(newThresholds);
  }, [efficiencyThresholds]);

  const getMarketSettings = useCallback(() => {
    return marketAnalyzer.getSettings();
  }, []);

  return {
    efficiencyThresholds,
    updateEfficiencyThresholds,
    getMarketSettings
  };
}

// Hook for real-time updates
export function useAdvancedArbitrageRealTime(
  baseOpportunities: any[],
  filters: AdvancedArbitrageFilters = {},
  updateInterval: number = 30000 // 30 seconds
) {
  // Memoize inputs to prevent unnecessary re-renders
  const memoizedOpportunities = useMemo(() => baseOpportunities, [baseOpportunities]);
  const memoizedFilters = useMemo(() => filters, [filters]);
  const memoizedUpdateInterval = useMemo(() => updateInterval, [updateInterval]);
  
  const arbitrageHook = useAdvancedArbitrage(memoizedOpportunities, memoizedFilters);
  
  // Set up real-time updates
  const startRealTimeUpdates = useCallback(() => {
    const interval = setInterval(() => {
      arbitrageHook.refetch();
    }, memoizedUpdateInterval);
    
    return () => clearInterval(interval);
  }, [arbitrageHook, memoizedUpdateInterval]);

  return {
    ...arbitrageHook,
    startRealTimeUpdates
  };
}
