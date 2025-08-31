"use client";

import { useState, useEffect } from "react";
import { useAdvancedArbitrage } from "@/lib/hooks/use-advanced-arbitrage";
import { AdvancedArbitrageTable } from "./arbitrage/AdvancedArbitrageTable";
import { mockAdvancedArbitrageOpportunities } from "@/lib/mock-data";
import { AdvancedArbitrageOpportunity } from "@/lib/arbitrage-engine/ml-detector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, BarChart3, Zap } from "lucide-react";

export function AdvancedArbitrageTest() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    opportunities,
    riskAssessments,
    marketAnalyses,
    metrics,
    isLoading: hookLoading,
    error,
    updateFilters,
    clearFilters,
    optimizeOpportunities,
    getHighConfidenceOpportunities,
    getLowRiskOpportunities,
    getHighProfitOpportunities
  } = useAdvancedArbitrage(mockAdvancedArbitrageOpportunities);

  const handleAddToTracker = (opportunity: AdvancedArbitrageOpportunity) => {
    console.log("Adding to tracker:", opportunity);
  };

  const handleOptimize = () => {
    setIsLoading(true);
    optimizeOpportunities();
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleHighConfidence = () => {
    updateFilters({ min_confidence: 0.8 });
  };

  const handleLowRisk = () => {
    updateFilters({ max_risk: 0.3 });
  };

  const handleHighProfit = () => {
    updateFilters({ min_profit_margin: 5 });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  if (error) {
    return (
      <Card className="gradient-bg border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Advanced Arbitrage Engine Test
          </CardTitle>
          <p className="text-muted-foreground">
            ML-powered arbitrage detection with risk assessment and market analysis
          </p>
        </CardHeader>
      </Card>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{metrics.totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{Math.round(metrics.averageConfidence * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk</p>
                <p className="text-2xl font-bold">{Math.round(metrics.averageRisk * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit</p>
                <p className="text-2xl font-bold">{metrics.averageProfitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleHighConfidence}
              variant="outline"
              size="sm"
            >
              High Confidence (80%+)
            </Button>
            <Button 
              onClick={handleLowRisk}
              variant="outline"
              size="sm"
            >
              Low Risk (30%↓)
            </Button>
            <Button 
              onClick={handleHighProfit}
              variant="outline"
              size="sm"
            >
              High Profit (5%+)
            </Button>
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
            <Button 
              onClick={handleOptimize}
              disabled={isLoading || hookLoading}
              size="sm"
            >
              {isLoading ? "Optimizing..." : "Optimize Processing"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              High Confidence: {getHighConfidenceOpportunities().length}
            </Badge>
            <Badge variant="outline">
              Low Risk: {getLowRiskOpportunities().length}
            </Badge>
            <Badge variant="outline">
              High Profit: {getHighProfitOpportunities().length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Arbitrage Table */}
      <AdvancedArbitrageTable
        opportunities={opportunities}
        riskAssessments={riskAssessments}
        marketAnalyses={marketAnalyses}
        onAddToTracker={handleAddToTracker}
        isLoading={hookLoading}
      />

      {/* Debug Info */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">ML Model Status</h4>
              <pre className="text-xs bg-gray-900 p-2 rounded">
                {JSON.stringify({
                  opportunitiesCount: opportunities.length,
                  riskAssessmentsCount: riskAssessments.size,
                  marketAnalysesCount: marketAnalyses.size,
                  metrics
                }, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Performance Metrics</h4>
              <pre className="text-xs bg-gray-900 p-2 rounded">
                {JSON.stringify({
                  falsePositiveRate: Math.round(metrics.falsePositiveRate * 100) + '%',
                  averageConfidence: Math.round(metrics.averageConfidence * 100) + '%',
                  averageRisk: Math.round(metrics.averageRisk * 100) + '%',
                  averageProfitMargin: metrics.averageProfitMargin.toFixed(2) + '%'
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
