"use client";

import { useState } from "react";
import { AdvancedArbitrageOpportunity } from "@/lib/arbitrage-engine/ml-detector";
import { RiskAssessment } from "@/lib/arbitrage-engine/risk-assessor";
import { MarketAnalysis } from "@/lib/arbitrage-engine/market-analyzer";
import { formatNumber } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  Shield, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface AdvancedArbitrageTableProps {
  opportunities: AdvancedArbitrageOpportunity[];
  riskAssessments: Map<string, RiskAssessment>;
  marketAnalyses: Map<string, MarketAnalysis>;
  onAddToTracker?: (opportunity: AdvancedArbitrageOpportunity) => void;
  isLoading?: boolean;
}

export function AdvancedArbitrageTable({ 
  opportunities, 
  riskAssessments, 
  marketAnalyses, 
  onAddToTracker,
  isLoading = false 
}: AdvancedArbitrageTableProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (confidence >= 0.6) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 0.3) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (risk <= 0.6) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getProfitColor = (profitMargin: number) => {
    if (profitMargin >= 5) return "text-green-400";
    if (profitMargin >= 3) return "text-yellow-400";
    return "text-orange-400";
  };

  const getMarketTypeColor = (marketType: string) => {
    switch (marketType) {
      case 'mainline': return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 'props': return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case 'futures': return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 'live': return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const addToBetTracker = (opportunity: AdvancedArbitrageOpportunity) => {
    if (onAddToTracker) {
      onAddToTracker(opportunity);
    }
    setSelectedOpportunity(opportunity.id);
    setTimeout(() => setSelectedOpportunity(null), 1000);
  };

  const renderConfidenceIndicator = (confidence: number) => (
    <div className="flex items-center gap-2">
      <Brain className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <Progress value={confidence * 100} className="h-2" />
      </div>
    </div>
  );

  const renderRiskIndicator = (risk: number) => (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span>Risk</span>
          <span>{Math.round(risk * 100)}%</span>
        </div>
        <Progress value={risk * 100} className="h-2" />
      </div>
    </div>
  );

  const renderMarketEfficiency = (marketAnalysis: MarketAnalysis | undefined) => {
    if (!marketAnalysis) return <span className="text-muted-foreground">N/A</span>;
    
    const efficiency = marketAnalysis.efficiency_metrics.efficiency_score;
    const color = efficiency >= 0.8 ? "text-green-400" : efficiency >= 0.6 ? "text-yellow-400" : "text-red-400";
    
    return (
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className={color}>{Math.round(efficiency * 100)}%</span>
      </div>
    );
  };

  const renderRiskRecommendations = (riskAssessment: RiskAssessment | undefined) => {
    if (!riskAssessment || riskAssessment.recommendations.length === 0) {
      return <span className="text-muted-foreground">No recommendations</span>;
    }

    const criticalRecommendations = riskAssessment.recommendations.filter(r => r.priority === 'critical');
    const highRecommendations = riskAssessment.recommendations.filter(r => r.priority === 'high');

    return (
      <div className="space-y-1">
        {criticalRecommendations.map((rec, index) => (
          <div key={index} className="flex items-center gap-1 text-xs text-red-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{rec.description}</span>
          </div>
        ))}
        {highRecommendations.slice(0, 2).map((rec, index) => (
          <div key={index} className="flex items-center gap-1 text-xs text-yellow-400">
            <Info className="h-3 w-3" />
            <span>{rec.description}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderKellyCriterion = (riskAssessment: RiskAssessment | undefined) => {
    if (!riskAssessment) return <span className="text-muted-foreground">N/A</span>;
    
    const kelly = riskAssessment.kelly_criterion;
    const isPositive = kelly.is_kelly_positive;
    
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <CheckCircle className="h-3 w-3 text-green-400" />
          ) : (
            <XCircle className="h-3 w-3 text-red-400" />
          )}
          <span className="text-xs">
            {isPositive ? 'Positive' : 'Negative'} Kelly
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(kelly.kelly_percentage * 100)}% optimal
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Advanced Arbitrage Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Advanced Arbitrage Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No advanced arbitrage opportunities found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-bg border-primary/20">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Advanced Arbitrage Opportunities
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          ML-powered arbitrage detection with risk assessment and market analysis
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Kelly</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opportunity) => {
                  const riskAssessment = riskAssessments.get(opportunity.id);
                  const marketAnalysis = marketAnalyses.get(opportunity.id);
                  
                  return (
                    <TableRow 
                      key={opportunity.id}
                      className={selectedOpportunity === opportunity.id ? "bg-primary/10" : ""}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{opportunity.event}</div>
                          <div className="text-sm text-muted-foreground">{opportunity.sport}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMarketTypeColor(opportunity.market_type)}>
                          {opportunity.market_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          {renderConfidenceIndicator(opportunity.confidence_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          {renderRiskIndicator(opportunity.risk_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className={getProfitColor(opportunity.profit_margin)}>
                            {formatNumber(opportunity.profit_margin)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(opportunity.expected_profit)} Ft
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderKellyCriterion(riskAssessment)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => addToBetTracker(opportunity)}
                          disabled={selectedOpportunity === opportunity.id}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opportunity) => {
                const riskAssessment = riskAssessments.get(opportunity.id);
                const marketAnalysis = marketAnalyses.get(opportunity.id);
                
                return (
                  <Card key={opportunity.id} className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{opportunity.event}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getMarketTypeColor(opportunity.market_type)}>
                          {opportunity.market_type}
                        </Badge>
                        <Badge className={getConfidenceColor(opportunity.confidence_score)}>
                          {Math.round(opportunity.confidence_score * 100)}% Confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">ML Analysis</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Confidence Score:</span>
                              <span>{Math.round(opportunity.confidence_score * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>False Positive:</span>
                              <span>{Math.round(opportunity.false_positive_probability * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Market Efficiency:</span>
                              <span>{Math.round(opportunity.market_efficiency * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Overall Risk:</span>
                              <span>{Math.round(opportunity.risk_score * 100)}%</span>
                            </div>
                            {riskAssessment && (
                              <>
                                <div className="flex justify-between">
                                  <span>Kelly %:</span>
                                  <span>{Math.round(riskAssessment.kelly_criterion.kelly_percentage * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Risk Level:</span>
                                  <Badge className={getRiskColor(riskAssessment.overall_risk_score)}>
                                    {riskAssessment.risk_level}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {riskAssessment && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                          {renderRiskRecommendations(riskAssessment)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {opportunities.map((opportunity) => {
              const riskAssessment = riskAssessments.get(opportunity.id);
              const marketAnalysis = marketAnalyses.get(opportunity.id);
              
              return (
                <Card key={opportunity.id} className="border-primary/20">
                  <CardHeader>
                    <CardTitle>{opportunity.event}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getMarketTypeColor(opportunity.market_type)}>
                        {opportunity.market_type}
                      </Badge>
                      <Badge variant="outline">{opportunity.sport}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Arbitrage Bets</h4>
                        <div className="space-y-2">
                          {opportunity.opportunities.map((bet, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{bet.bookmaker_id}</span>
                                <Badge variant="outline">{bet.outcome}</Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Odds:</span>
                                  <span className="font-mono">{bet.odds.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Stake:</span>
                                  <span className="font-mono">{formatNumber(bet.stake)} Ft</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Risk Factor:</span>
                                  <span>{Math.round(bet.risk_factor * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Confidence:</span>
                                  <span>{Math.round(bet.confidence * 100)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Risk Analysis</h4>
                        {riskAssessment ? (
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h5 className="text-xs font-medium mb-2">Kelly Criterion</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Kelly %:</span>
                                  <span>{Math.round(riskAssessment.kelly_criterion.kelly_percentage * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Optimal Stake:</span>
                                  <span>{formatNumber(riskAssessment.kelly_criterion.kelly_stake)} Ft</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Expected Value:</span>
                                  <span>{formatNumber(riskAssessment.kelly_criterion.kelly_expected_value)} Ft</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                              <h5 className="text-xs font-medium mb-2">Portfolio Risk</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Concentration:</span>
                                  <span>{Math.round(riskAssessment.portfolio_risk.concentration_risk * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Diversification:</span>
                                  <span>{Math.round(riskAssessment.portfolio_risk.diversification_score * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>VaR (95%):</span>
                                  <span>{formatNumber(riskAssessment.portfolio_risk.var_95)} Ft</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No risk assessment available</div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Market Analysis</h4>
                        {marketAnalysis ? (
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h5 className="text-xs font-medium mb-2">Efficiency Metrics</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Efficiency Score:</span>
                                  <span>{Math.round(marketAnalysis.efficiency_metrics.efficiency_score * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Price Discovery:</span>
                                  <span>{Math.round(marketAnalysis.efficiency_metrics.price_discovery * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Market Depth:</span>
                                  <span>{Math.round(marketAnalysis.efficiency_metrics.market_depth * 100)}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 border rounded-lg">
                              <h5 className="text-xs font-medium mb-2">Volatility</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Historical:</span>
                                  <span>{Math.round(marketAnalysis.volatility_analysis.historical_volatility * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Regime:</span>
                                  <Badge variant="outline">{marketAnalysis.volatility_analysis.volatility_regime}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Trend:</span>
                                  <span>{marketAnalysis.volatility_analysis.volatility_trend}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No market analysis available</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
