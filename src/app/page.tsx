"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArbitrageTable } from "@/components/ArbitrageTable";
import { OddsTable } from "@/components/OddsTable";
import { ProfitCalculator } from "@/components/ProfitCalculator";
import { BetHistoryTracker } from "@/components/BetHistoryTracker";
import { EVBettingFinder } from "@/components/EVBettingFinder";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { LiveAlertsSystem } from "@/components/alerts/LiveAlertsSystem";
import { sportsCategories, profitRanges, stakeRanges, timeFilters, getTimeToExpiryInHours } from "@/lib/mock-data";
import { useArbitrageWithFallback, useRealTimeStatus, useApiUsage } from "@/lib/hooks/use-odds-data";
import { formatNumber } from "@/lib/utils";
import {
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
  Settings,
  Zap,
  Wifi,
  WifiOff,
  Activity,
  BarChart3,
  Bell,
  Calculator,
  Brain
} from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { AdvancedArbitrageTest } from "@/components/AdvancedArbitrageTest";

const TRACKED_SPORTS = ['soccer_epl', 'basketball_nba', 'tennis_atp', 'americanfootball_nfl'];

export default function Home() {
  const [selectedSport, setSelectedSport] = useState("Összes");
  const [selectedProfitRange, setSelectedProfitRange] = useState("Összes");
  const [selectedStakeRange, setSelectedStakeRange] = useState("Összes");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("Összes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minProfitMargin, setMinProfitMargin] = useState<string>("");
  const [maxStake, setMaxStake] = useState<string>("");
  const [oddsUpdateTrigger, setOddsUpdateTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // API hooks
  const { isRealTime, isDemo } = useRealTimeStatus();
  const apiUsage = useApiUsage();
  
  // Memoize the sports array to prevent unnecessary re-renders
  const trackedSports = useMemo(() => 
    isRealTimeActive ? TRACKED_SPORTS : ['demo'], 
    [isRealTimeActive]
  );
  
  const arbitrageQuery = useArbitrageWithFallback(trackedSports);

  // Real-time odds updates trigger
  useEffect(() => {
    if (isRealTimeActive) {
      const interval = setInterval(() => {
        setOddsUpdateTrigger(prev => prev + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeActive]);

  // Get opportunities data
  const opportunities = arbitrageQuery.data || [];
  const isLoading = arbitrageQuery.isLoading;
  const error = arbitrageQuery.error;

  // Filter arbitrage opportunities with advanced filters
  const filteredOpportunities = opportunities.filter(opp => {
    const sportMatch = selectedSport === "Összes" || opp.sport === selectedSport;

    const profitRange = profitRanges.find(range => range.label === selectedProfitRange);
    const profitMatch = !profitRange || (opp.profitMargin >= profitRange.min && opp.profitMargin <= profitRange.max);

    const stakeRange = stakeRanges.find(range => range.label === selectedStakeRange);
    const stakeMatch = !stakeRange || (opp.totalStake >= stakeRange.min && opp.totalStake <= stakeRange.max);

    const timeFilter = timeFilters.find(filter => filter.label === selectedTimeFilter);
    const timeMatch = !timeFilter || getTimeToExpiryInHours(opp.timeToExpiry) <= timeFilter.hours;

    const searchMatch = searchTerm === "" ||
      opp.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.outcome.toLowerCase().includes(searchTerm.toLowerCase());

    // Advanced filters
    const minProfitMatch = minProfitMargin === "" || opp.profitMargin >= parseFloat(minProfitMargin);
    const maxStakeMatch = maxStake === "" || opp.totalStake <= parseFloat(maxStake);

    return sportMatch && profitMatch && stakeMatch && timeMatch && searchMatch && minProfitMatch && maxStakeMatch;
  });

  // Calculate stats
  const totalOpportunities = filteredOpportunities.length;
  const avgProfit = filteredOpportunities.reduce((sum, opp) => sum + opp.profitMargin, 0) / totalOpportunities || 0;
  const totalStake = filteredOpportunities.reduce((sum, opp) => sum + opp.stakes.bet1.stake + opp.stakes.bet2.stake, 0);
  const bestOpportunity = filteredOpportunities.reduce((best, opp) =>
    opp.profitMargin > best.profitMargin ? opp : best,
    { profitMargin: 0, expectedProfit: 0 }
  );

  const clearAllFilters = () => {
    setSelectedSport("Összes");
    setSelectedProfitRange("Összes");
    setSelectedStakeRange("Összes");
    setSelectedTimeFilter("Összes");
    setSearchTerm("");
    setMinProfitMargin("");
    setMaxStake("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                ProTipp V2
              </h1>
              <Badge
                variant={isRealTimeActive ? "default" : "secondary"}
                className={isRealTimeActive ? "animate-pulse" : ""}
              >
                {isRealTimeActive ? "🟢 ÉLŐ" : "⏸️ SZÜNET"}
              </Badge>
              {isDemo && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  Demo mód
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {isRealTimeActive ? "Szünet" : "Indítás"}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arbitrage Lehetőségek</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                Aktív lehetőségek most
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Átlag Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{avgProfit.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Szűrt lehetőségek átlaga
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legjobb Lehetőség</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {bestOpportunity.profitMargin ? `${bestOpportunity.profitMargin.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {bestOpportunity.expectedProfit ? `+${formatNumber(bestOpportunity.expectedProfit)} Ft` : 'Nincs adat'}
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kapcsolat</CardTitle>
              {isClient && (
                <>
                  {isRealTime ? (
                    <Wifi className="h-4 w-4 text-green-400" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  )}
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isClient && isRealTime ? 'text-green-400' : 'text-red-400'}`}>
                {isClient && isRealTime ? 'ÉLŐ' : 'OFFLINE'}
              </div>
              <p className="text-xs text-muted-foreground">
                {apiUsage.data ? `${apiUsage.data.requestsUsed}/${apiUsage.data.requestsRemaining} API hívás` : 'API státusz'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Szűrők</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Speciális szűrők
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keresés</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Keresés mérkőzésre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sport</label>
                  <Select value={selectedSport} onValueChange={(value: string) => setSelectedSport(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sportsCategories.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profit Margin</label>
                  <Select value={selectedProfitRange} onValueChange={(value: string) => setSelectedProfitRange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {profitRanges.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tét Méret</label>
                  <Select value={selectedStakeRange} onValueChange={(value: string) => setSelectedStakeRange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stakeRanges.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lejárat</label>
                  <Select value={selectedTimeFilter} onValueChange={(value: string) => setSelectedTimeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilters.map((filter) => (
                        <SelectItem key={filter.label} value={filter.label}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min. Profit Margin (%)</label>
                      <Input
                        type="number"
                        placeholder="pl. 2.5"
                        value={minProfitMargin}
                        onChange={(e) => setMinProfitMargin(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max. Tét (Ft)</label>
                      <Input
                        type="number"
                        placeholder="pl. 100000"
                        value={maxStake}
                        onChange={(e) => setMaxStake(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Műveletek</label>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearAllFilters}
                      >
                        Minden szűrő törlése
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="arbitrage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="arbitrage" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Arbitrage</span>
            </TabsTrigger>
            <TabsTrigger value="ev-betting" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>EV Betting</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Odds</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Előzmények</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Kalkulátor</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arbitrage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Arbitrage Lehetőségek</span>
                  {isRealTimeActive && (
                    <Badge variant="outline" className="animate-pulse">
                      Real-time frissítés
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Real-time arbitrage lehetőségek különböző fogadóirodák között
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArbitrageTable
                  opportunities={filteredOpportunities}
                  oddsUpdateTrigger={oddsUpdateTrigger}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ev-betting" className="space-y-6">
            <EVBettingFinder />
          </TabsContent>

          {/* NEW: Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          {/* NEW: Live Alerts System */}
          <TabsContent value="alerts" className="space-y-6">
            <LiveAlertsSystem />
          </TabsContent>

          <TabsContent value="odds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Odds Összehasonlítás</CardTitle>
                <CardDescription>
                  Hasonlítsd össze az odds-okat különböző fogadóirodák között
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OddsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <BetHistoryTracker />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arbitrage Kalkulátor</CardTitle>
                <CardDescription>
                  Számítsd ki a tét elosztást és a várható profitot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedArbitrageTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
