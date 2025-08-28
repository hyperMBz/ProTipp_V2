"use client";

import { useState, useMemo } from "react";
import { mockArbitrageOpportunities, type ArbitrageOpportunity } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, Plus, AlertTriangle } from "lucide-react";

export function EVBettingFinder() {
  const [evFilter, setEvFilter] = useState<string>("positive");
  const [minEVPercent, setMinEVPercent] = useState<string>("3");
  const [selectedSport, setSelectedSport] = useState<string>("Összes");

  const evOpportunities = useMemo(() => {
    // Filter for positive EV and negative EV opportunities
    return mockArbitrageOpportunities.filter(opp => {
      if (evFilter === "positive") {
        return opp.category === 'positive-ev' && (opp.ev || 0) >= parseFloat(minEVPercent);
      } else if (evFilter === "negative") {
        return opp.category === 'negative-ev' || (opp.profitMargin < 0);
      } else {
        return opp.category === 'positive-ev' || opp.category === 'negative-ev' || opp.profitMargin < 0;
      }
    }).filter(opp => {
      return selectedSport === "Összes" || opp.sport === selectedSport;
    });
  }, [evFilter, minEVPercent, selectedSport]);

  const stats = useMemo(() => {
    const positiveEVCount = evOpportunities.filter(opp => (opp.ev || 0) > 0).length;
    const negativeEVCount = evOpportunities.filter(opp => (opp.ev || 0) < 0 || opp.profitMargin < 0).length;
    const avgEV = evOpportunities.reduce((sum, opp) => sum + (opp.ev || 0), 0) / evOpportunities.length || 0;
    const totalPotentialValue = evOpportunities.reduce((sum, opp) => {
      if (opp.ev && opp.ev > 0) {
        return sum + (opp.totalStake * opp.ev / 100);
      }
      return sum;
    }, 0);

    return {
      positiveEVCount,
      negativeEVCount,
      avgEV,
      totalPotentialValue
    };
  }, [evOpportunities]);

  const getEVColor = (ev?: number) => {
    if (ev === undefined) return "text-muted-foreground";
    if (ev > 10) return "text-green-400";
    if (ev > 5) return "text-yellow-400";
    if (ev > 0) return "text-orange-400";
    return "text-red-400";
  };

  const getEVBadge = (ev?: number, profitMargin?: number) => {
    if (ev !== undefined && ev > 0) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          +EV {ev.toFixed(1)}%
        </Badge>
      );
    }
    if (profitMargin !== undefined && profitMargin < 0) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
          -EV {Math.abs(profitMargin).toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Neutral
      </Badge>
    );
  };

  const calculateKellyStake = (odds: number, ev: number, bankroll: number = 1000000) => {
    if (ev <= 0) return 0;
    const probability = ev / 100 + 1 / odds;
    const kellyFraction = (probability * odds - 1) / (odds - 1);
    return Math.max(0, Math.min(kellyFraction * bankroll, bankroll * 0.1)); // Max 10% of bankroll
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm text-muted-foreground">Pozitív EV</div>
                <div className="text-xl font-bold text-green-400">{stats.positiveEVCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-sm text-muted-foreground">Negatív EV</div>
                <div className="text-xl font-bold text-red-400">{stats.negativeEVCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Átlag EV</div>
                <div className={`text-xl font-bold ${getEVColor(stats.avgEV)}`}>
                  {stats.avgEV >= 0 ? '+' : ''}{stats.avgEV.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm text-muted-foreground">Potenciális Érték</div>
                <div className="text-xl font-bold text-green-400">
                  {formatNumber(stats.totalPotentialValue)} Ft
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>EV Szűrők</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">EV Típus</label>
              <Select value={evFilter} onValueChange={setEvFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Csak Pozitív EV</SelectItem>
                  <SelectItem value="negative">Csak Negatív EV</SelectItem>
                  <SelectItem value="all">Minden EV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min. EV %</label>
              <Select value={minEVPercent} onValueChange={setMinEVPercent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%+</SelectItem>
                  <SelectItem value="3">3%+</SelectItem>
                  <SelectItem value="5">5%+</SelectItem>
                  <SelectItem value="10">10%+</SelectItem>
                  <SelectItem value="15">15%+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Összes">Összes Sport</SelectItem>
                  <SelectItem value="Labdarúgás">Labdarúgás</SelectItem>
                  <SelectItem value="Golf">Golf</SelectItem>
                  <SelectItem value="Motorsport">Motorsport</SelectItem>
                  <SelectItem value="Tenisz">Tenisz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Műveletek</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEvFilter("positive");
                  setMinEVPercent("3");
                  setSelectedSport("Összes");
                }}
              >
                Szűrők törlése
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EV Information Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-400">Mi az Expected Value (EV)?</h4>
              <p className="text-sm text-muted-foreground">
                Az Expected Value (Várható Érték) azt mutatja meg, hogy egy fogadás hosszú távon milyen profitot/veszteséget várhatunk.
                Pozitív EV esetén a fogadás matematikailag előnyös, negatív EV esetén viszont hátrányos.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Kelly kritérium:</strong> Az optimális tét méretét a Kelly-formula alapján számoljuk ki,
                amely figyelembe veszi az EV-t és a bankroll-t a kockázatkezelés érdekében.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EV Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span>Expected Value Lehetőségek</span>
            <Badge variant="outline" className="ml-auto">
              {evOpportunities.length} lehetőség
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Sport</TableHead>
                  <TableHead className="font-semibold">Esemény</TableHead>
                  <TableHead className="font-semibold">Fogadóiroda</TableHead>
                  <TableHead className="font-semibold">Odds</TableHead>
                  <TableHead className="font-semibold">EV</TableHead>
                  <TableHead className="font-semibold">Kelly Tét</TableHead>
                  <TableHead className="font-semibold">Potenciális Profit</TableHead>
                  <TableHead className="font-semibold">Kockázat</TableHead>
                  <TableHead className="font-semibold">Műveletek</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evOpportunities.map((opportunity) => {
                  const kellyStake = calculateKellyStake(opportunity.bet1.odds, opportunity.ev || 0);
                  const potentialProfit = kellyStake * (opportunity.bet1.odds - 1);

                  return (
                    <TableRow
                      key={opportunity.id}
                      className="hover:bg-secondary/30 transition-colors border-border/50"
                    >
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.sport}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="max-w-[200px]">
                          <div className="text-sm font-semibold truncate">{opportunity.event}</div>
                          <div className="text-xs text-muted-foreground">{opportunity.outcome}</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {opportunity.bet1.bookmaker}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-sm">{opportunity.bet1.odds.toFixed(2)}</span>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {getEVBadge(opportunity.ev, opportunity.profitMargin)}
                          <div className={`text-sm font-semibold ${getEVColor(opportunity.ev)}`}>
                            {opportunity.ev !== undefined ? (
                              `${opportunity.ev >= 0 ? '+' : ''}${opportunity.ev.toFixed(1)}%`
                            ) : (
                              `${opportunity.profitMargin >= 0 ? '+' : ''}${opportunity.profitMargin.toFixed(1)}%`
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold">
                            {formatNumber(Math.round(kellyStake))} Ft
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((kellyStake / 1000000) * 100).toFixed(1)}% bankroll
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-green-400">
                            +{formatNumber(Math.round(potentialProfit))} Ft
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((potentialProfit / kellyStake) * 100).toFixed(0)}% return
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              (opportunity.ev || 0) > 10 ? 'border-green-500/30 text-green-400' :
                              (opportunity.ev || 0) > 5 ? 'border-yellow-500/30 text-yellow-400' :
                              'border-red-500/30 text-red-400'
                            }`}
                          >
                            {(opportunity.ev || 0) > 10 ? 'Alacsony' :
                             (opportunity.ev || 0) > 5 ? 'Közepes' : 'Magas'}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {opportunity.probability.toFixed(1)}% biztos
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {evOpportunities.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nincsenek EV lehetőségek</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Próbáld meg csökkenteni a minimum EV követelményt vagy változtasd meg a szűrőket.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
