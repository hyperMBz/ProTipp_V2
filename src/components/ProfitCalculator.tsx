"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function ProfitCalculator() {
  const [totalStake, setTotalStake] = useState<string>("100000");
  const [odds1, setOdds1] = useState<string>("2.10");
  const [odds2, setOdds2] = useState<string>("2.05");
  const [bookmaker1, setBookmaker1] = useState<string>("Bet365");
  const [bookmaker2, setBookmaker2] = useState<string>("Pinnacle");

  const [calculations, setCalculations] = useState({
    stake1: 0,
    stake2: 0,
    profit1: 0,
    profit2: 0,
    profitMargin: 0,
    totalProfit: 0,
    isArbitrage: false
  });

  const calculateArbitrage = useCallback(() => {
    const stake = parseFloat(totalStake) || 0;
    const o1 = parseFloat(odds1) || 0;
    const o2 = parseFloat(odds2) || 0;

    if (stake <= 0 || o1 <= 0 || o2 <= 0) {
      setCalculations({
        stake1: 0,
        stake2: 0,
        profit1: 0,
        profit2: 0,
        profitMargin: 0,
        totalProfit: 0,
        isArbitrage: false
      });
      return;
    }

    // Calculate implied probabilities
    const impliedProb1 = 1 / o1;
    const impliedProb2 = 1 / o2;
    const totalImpliedProb = impliedProb1 + impliedProb2;

    // Check if arbitrage exists
    const isArbitrage = totalImpliedProb < 1;

    if (isArbitrage) {
      // Calculate optimal stakes
      const stake1 = stake * (impliedProb1 / totalImpliedProb);
      const stake2 = stake * (impliedProb2 / totalImpliedProb);

      // Calculate profits
      const profit1 = stake1 * o1 - stake;
      const profit2 = stake2 * o2 - stake;
      const avgProfit = (profit1 + profit2) / 2;
      const profitMargin = (avgProfit / stake) * 100;

      setCalculations({
        stake1: Math.round(stake1),
        stake2: Math.round(stake2),
        profit1: Math.round(profit1),
        profit2: Math.round(profit2),
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalProfit: Math.round(avgProfit),
        isArbitrage: true
      });
    } else {
      setCalculations({
        stake1: 0,
        stake2: 0,
        profit1: 0,
        profit2: 0,
        profitMargin: 0,
        totalProfit: 0,
        isArbitrage: false
      });
    }
  }, [odds1, odds2, totalStake]);

  useEffect(() => {
    calculateArbitrage();
  }, [calculateArbitrage]);

  const resetCalculator = () => {
    setTotalStake("100000");
    setOdds1("2.10");
    setOdds2("2.05");
    setBookmaker1("Bet365");
    setBookmaker2("Pinnacle");
  };

  const quickStakeOptions = [10000, 50000, 100000, 250000, 500000];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span>Arbitrage Kalkulátor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Stake */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Teljes Tét (Ft)</label>
            <Input
              type="number"
              value={totalStake}
              onChange={(e) => setTotalStake(e.target.value)}
              placeholder="100000"
              className="text-lg font-mono"
            />
            <div className="flex flex-wrap gap-2">
              {quickStakeOptions.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTotalStake(amount.toString())}
                  className="text-xs"
                >
                  {formatNumber(amount)} Ft
                </Button>
              ))}
            </div>
          </div>

          {/* Bookmakers and Odds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-primary">Fogadóiroda 1</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fogadóiroda neve</label>
                <Input
                  value={bookmaker1}
                  onChange={(e) => setBookmaker1(e.target.value)}
                  placeholder="Bet365"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Odds</label>
                <Input
                  type="number"
                  step="0.01"
                  value={odds1}
                  onChange={(e) => setOdds1(e.target.value)}
                  placeholder="2.10"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-primary">Fogadóiroda 2</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fogadóiroda neve</label>
                <Input
                  value={bookmaker2}
                  onChange={(e) => setBookmaker2(e.target.value)}
                  placeholder="Pinnacle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Odds</label>
                <Input
                  type="number"
                  step="0.01"
                  value={odds2}
                  onChange={(e) => setOdds2(e.target.value)}
                  placeholder="2.05"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetCalculator}>
              Visszaállítás
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Kalkuláció Eredmények</span>
            {calculations.isArbitrage ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Arbitrage Lehetőség
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Nincs Arbitrage
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculations.isArbitrage ? (
            <div className="space-y-6">
              {/* Profit Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="gradient-bg border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="text-sm text-muted-foreground">Profit Margin</div>
                        <div className="text-xl font-bold text-green-400">
                          {calculations.profitMargin.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gradient-bg border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Várható Profit</div>
                        <div className="text-xl font-bold text-primary">
                          {formatNumber(calculations.totalProfit)} Ft
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gradient-bg border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-yellow-400" />
                      <div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {calculations.profitMargin.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stake Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{bookmaker1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tét:</span>
                      <span className="font-semibold">{formatNumber(calculations.stake1)} Ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Odds:</span>
                      <span className="font-mono">{odds1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potenciális Profit:</span>
                      <span className="font-semibold text-green-400">
                        +{formatNumber(calculations.profit1)} Ft
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Teljes Nyeremény:</span>
                      <span className="font-bold">
                        {formatNumber(calculations.stake1 * parseFloat(odds1))} Ft
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{bookmaker2}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tét:</span>
                      <span className="font-semibold">{formatNumber(calculations.stake2)} Ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Odds:</span>
                      <span className="font-mono">{odds2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potenciális Profit:</span>
                      <span className="font-semibold text-green-400">
                        +{formatNumber(calculations.profit2)} Ft
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Teljes Nyeremény:</span>
                      <span className="font-bold">
                        {formatNumber(calculations.stake2 * parseFloat(odds2))} Ft
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Instructions */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 text-primary">Arbitrage Utasítások:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Fogadj {formatNumber(calculations.stake1)} Ft-ot {bookmaker1}-nél {odds1} odds-szal</li>
                    <li>Fogadj {formatNumber(calculations.stake2)} Ft-ot {bookmaker2}-nél {odds2} odds-szal</li>
                    <li>Garantált profit: {formatNumber(calculations.totalProfit)} Ft ({calculations.profitMargin.toFixed(2)}%)</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nincs Arbitrage Lehetőség</h3>
              <p className="text-sm text-muted-foreground mt-2">
                A megadott odds-ok alapján nincs profit biztosítható. Próbáld meg más odds-okkal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
