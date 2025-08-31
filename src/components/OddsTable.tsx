"use client";

import { useState } from "react";
import { mockOddsComparisons } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trophy, TrendingUp } from "lucide-react";

export function OddsTable() {
  const [selectedSport, setSelectedSport] = useState("Összes");
  const [selectedMarket, setSelectedMarket] = useState("Összes");

  const markets = ["Összes", "1X2", "Match Winner", "Moneyline", "Spread", "Total Points"];

  const filteredComparisons = mockOddsComparisons.filter(comparison => {
    const sportMatch = selectedSport === "Összes" || comparison.sport === selectedSport;
    const marketMatch = selectedMarket === "Összes" || comparison.market === selectedMarket;
    return sportMatch && marketMatch;
  });

  const getBestOddsHighlight = (odds: number, bestOdds: number) => {
    if (Math.abs(odds - bestOdds) < 0.01) {
      return "bg-green-500/20 text-green-400 font-bold";
    }
    return "";
  };

  const addToTracker = (event: string, bookmaker: string, odds: number, outcome: string) => {
    console.log("Adding to tracker:", { event, bookmaker, odds, outcome });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Odds Szűrők</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
                              <Select value={selectedSport} onValueChange={(value: string) => setSelectedSport(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Összes">Összes Sport</SelectItem>
                  <SelectItem value="Labdarúgás">Labdarúgás</SelectItem>
                  <SelectItem value="Tenisz">Tenisz</SelectItem>
                  <SelectItem value="Kosárlabda">Kosárlabda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Piac</label>
                              <Select value={selectedMarket} onValueChange={(value: string) => setSelectedMarket(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market} value={market}>
                      {market}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Odds Comparison Table */}
      <div className="space-y-4">
        {filteredComparisons.map((comparison) => (
          <Card key={comparison.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{comparison.event}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{comparison.sport}</Badge>
                    <Badge variant="secondary">{comparison.market}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Legjobb odds kijelölve</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="font-semibold">Fogadóiroda</TableHead>
                      <TableHead className="font-semibold text-center">Kimenetel 1</TableHead>
                      {comparison.bestOdds.outcomeDraw && (
                        <TableHead className="font-semibold text-center">Döntetlen</TableHead>
                      )}
                      <TableHead className="font-semibold text-center">Kimenetel 2</TableHead>
                      <TableHead className="font-semibold text-center">Műveletek</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(comparison.odds).map(([bookmaker, odds]) => (
                      <TableRow key={bookmaker} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="text-sm">
                            {bookmaker}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className={`inline-block px-2 py-1 rounded text-sm font-mono ${
                              getBestOddsHighlight(odds.outcome1, comparison.bestOdds.outcome1.odds)
                            }`}>
                              {odds.outcome1.toFixed(2)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => addToTracker(comparison.event, bookmaker, odds.outcome1, "Outcome 1")}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>

                        {comparison.bestOdds.outcomeDraw && odds.outcomeDraw && (
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className={`inline-block px-2 py-1 rounded text-sm font-mono ${
                                getBestOddsHighlight(odds.outcomeDraw, comparison.bestOdds.outcomeDraw.odds)
                              }`}>
                                {odds.outcomeDraw.toFixed(2)}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 ml-2"
                                onClick={() => addToTracker(comparison.event, bookmaker, odds.outcomeDraw!, "Draw")}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        )}

                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className={`inline-block px-2 py-1 rounded text-sm font-mono ${
                              getBestOddsHighlight(odds.outcome2, comparison.bestOdds.outcome2.odds)
                            }`}>
                              {odds.outcome2.toFixed(2)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => addToTracker(comparison.event, bookmaker, odds.outcome2, "Outcome 2")}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Összes hozzáadása
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Best Odds Summary */}
              <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Trophy className="h-4 w-4 text-primary mr-2" />
                  Legjobb Odds Összefoglaló
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Kimenetel 1</div>
                    <div className="font-semibold text-green-400">
                      {comparison.bestOdds.outcome1.odds} @ {comparison.bestOdds.outcome1.bookmaker}
                    </div>
                  </div>
                  {comparison.bestOdds.outcomeDraw && (
                    <div>
                      <div className="text-muted-foreground">Döntetlen</div>
                      <div className="font-semibold text-green-400">
                        {comparison.bestOdds.outcomeDraw.odds} @ {comparison.bestOdds.outcomeDraw.bookmaker}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Kimenetel 2</div>
                    <div className="font-semibold text-green-400">
                      {comparison.bestOdds.outcome2.odds} @ {comparison.bestOdds.outcome2.bookmaker}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComparisons.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nincsenek odds adatok</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Próbáld meg megváltoztatni a szűrőket.
          </p>
        </div>
      )}
    </div>
  );
}
