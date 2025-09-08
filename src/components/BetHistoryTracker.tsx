"use client";

import { useState, useMemo } from "react";
import { mockBetHistory, type BetHistoryItem } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { useBetHistoryWithFallback, useBetHistoryStats, useAddBet, useUpdateBet, useDeleteBet } from "@/lib/hooks/use-bet-history";
import { useAuth } from "@/lib/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { History, TrendingUp, TrendingDown, DollarSign, Target, Clock, Search, Filter, Plus } from "lucide-react";
import { AddBetDialog } from "./AddBetDialog";
import { UnifiedBetHistory, getBetEventName, getBetPlacedDate, getBetSettledDate, getBetProfit, getBetCLV } from "@/lib/types/bet-history";

export function BetHistoryTracker() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("Összes");
  const [sportFilter, setSportFilter] = useState<string>("Összes");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("30nap");

  const statusOptions = ["Összes", "pending", "won", "lost", "refunded", "cancelled"];
  const sportOptions = ["Összes", "Labdarúgás", "Kosárlabda", "Tenisz", "Ökölvívás", "MMA", "Baseball", "Esports", "Motorsport"];
  const dateOptions = [
    { label: "7 nap", value: "7nap" },
    { label: "30 nap", value: "30nap" },
    { label: "90 nap", value: "90nap" },
    { label: "Minden", value: "mind" }
  ];

  // Prepare filters for the hook
  const hookFilters = useMemo(() => {
    const filters: Record<string, string> = {};

    if (statusFilter !== "Összes") {
      filters.status = statusFilter;
    }
    if (sportFilter !== "Összes") {
      filters.sport = sportFilter;
    }

    // Date filtering
    if (dateRange !== "mind") {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filters.dateFrom = cutoffDate.toISOString();
    }

    return filters;
  }, [statusFilter, sportFilter, dateRange]);

  // Get bet history data
  const betHistoryQuery = useBetHistoryWithFallback(hookFilters);
  const statsQuery = useBetHistoryStats();

  // Client-side search filtering (since we can't do text search in Supabase easily)
  const filteredHistory = useMemo(() => {
    const data = betHistoryQuery.data || [];

    if (!searchTerm) return data;

    return data.filter(bet => {
      const eventName = getBetEventName(bet as UnifiedBetHistory);
      const outcome = bet.outcome || '';
      const bookmaker = bet.bookmaker || '';

      return eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             outcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
             bookmaker.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [betHistoryQuery.data, searchTerm]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (user && statsQuery.data) {
      // Use real stats from database for authenticated users
      const dbStats = statsQuery.data;
      return {
        totalBets: dbStats.total_bets || 0,
        wonBets: filteredHistory.filter(bet => bet.status === 'won').length,
        lostBets: filteredHistory.filter(bet => bet.status === 'lost').length,
        pendingBets: filteredHistory.filter(bet => bet.status === 'pending').length,
        totalStaked: dbStats.total_wagered || 0,
        totalProfit: dbStats.total_profit || 0,
        totalROI: dbStats.total_wagered > 0 ? ((dbStats.total_profit || 0) / dbStats.total_wagered) * 100 : 0,
        avgCLV: filteredHistory
          .filter(bet => bet.clv !== undefined)
          .reduce((sum, bet, _, arr) => sum + (bet.clv || 0) / arr.length, 0),
        winRate: dbStats.win_rate || 0,
      };
    }

    // Fallback to client-side calculation for mock data
    const totalBets = filteredHistory.length;
    const wonBets = filteredHistory.filter(bet => bet.status === 'won').length;
    const lostBets = filteredHistory.filter(bet => bet.status === 'lost').length;
    const pendingBets = filteredHistory.filter(bet => bet.status === 'pending').length;

    const totalStaked = filteredHistory.reduce((sum, bet) => sum + (bet.stake || 0), 0);
    const totalProfit = filteredHistory.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalROI = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    const avgCLV = filteredHistory
      .filter(bet => bet.clv !== undefined)
      .reduce((sum, bet, _, arr) => sum + (bet.clv || 0) / arr.length, 0);

    const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      totalStaked,
      totalProfit,
      totalROI,
      avgCLV,
      winRate
    };
  }, [filteredHistory, user, statsQuery.data]);

  const getStatusBadge = (status: BetHistoryItem['status']) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      won: "bg-green-500/20 text-green-400 border-green-500/30",
      lost: "bg-red-500/20 text-red-400 border-red-500/30",
      refunded: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };

    const labels = {
      pending: "Függőben",
      won: "Nyert",
      lost: "Vesztett",
      refunded: "Visszafizetve",
      cancelled: "Lemondva"
    };

    return (
      <Badge className={`text-xs ${variants[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getCLVColor = (clv?: number) => {
    if (clv === undefined) return "text-muted-foreground";
    if (clv > 5) return "text-green-400";
    if (clv > 0) return "text-yellow-400";
    return "text-red-400";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Összes Fogadás</div>
                <div className="text-xl font-bold text-primary">{stats.totalBets}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm text-muted-foreground">Nyerési Ráta</div>
                <div className="text-xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Összprofit</div>
                <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatNumber(stats.totalProfit)} Ft
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {stats.totalROI >= 0 ?
                <TrendingUp className="h-5 w-5 text-green-400" /> :
                <TrendingDown className="h-5 w-5 text-red-400" />
              }
              <div>
                <div className="text-sm text-muted-foreground">ROI</div>
                <div className={`text-xl font-bold ${stats.totalROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalROI >= 0 ? '+' : ''}{stats.totalROI.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{stats.wonBets}</div>
              <div className="text-xs text-muted-foreground">Nyert</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.lostBets}</div>
              <div className="text-xs text-muted-foreground">Vesztett</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{stats.pendingBets}</div>
              <div className="text-xs text-muted-foreground">Függőben</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="text-center">
              <div className={`text-lg font-bold ${getCLVColor(stats.avgCLV)}`}>
                {stats.avgCLV >= 0 ? '+' : ''}{stats.avgCLV.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Átlag CLV</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Szűrők</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keresés</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Keresés eseményre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Státusz</label>
                              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
                              <Select value={sportFilter} onValueChange={(value: string) => setSportFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sportOptions.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Időszak</label>
                              <Select value={dateRange} onValueChange={(value: string) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Műveletek</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatusFilter("Összes");
                  setSportFilter("Összes");
                  setSearchTerm("");
                  setDateRange("30nap");
                }}
              >
                Szűrők törlése
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bet History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-primary" />
              <span>Fogadási Előzmények</span>
              <Badge variant="outline" className="ml-4">
                {filteredHistory.length} fogadás
              </Badge>
            </CardTitle>
            {user && (
              <AddBetDialog>
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Új fogadás</span>
                </Button>
              </AddBetDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Esemény</TableHead>
                  <TableHead className="font-semibold">Sport</TableHead>
                  <TableHead className="font-semibold">Fogadóiroda</TableHead>
                  <TableHead className="font-semibold">Odds</TableHead>
                  <TableHead className="font-semibold">Tét</TableHead>
                  <TableHead className="font-semibold">Kimenetel</TableHead>
                  <TableHead className="font-semibold">Profit</TableHead>
                  <TableHead className="font-semibold">CLV</TableHead>
                  <TableHead className="font-semibold">Státusz</TableHead>
                  <TableHead className="font-semibold">Dátum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((bet) => (
                  <TableRow
                    key={bet.id}
                    className="hover:bg-secondary/30 transition-colors border-border/50"
                  >
                    <TableCell className="font-medium">
                      <div className="max-w-[180px]">
                        <div className="text-sm font-semibold truncate">{getBetEventName(bet as UnifiedBetHistory)}</div>
                        <div className="text-xs text-muted-foreground truncate">{bet.outcome}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {bet.sport}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {bet.bookmaker}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-sm">{bet.odds.toFixed(2)}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">{formatNumber(bet.stake)} Ft</span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {bet.outcome}
                      </div>
                    </TableCell>

                    <TableCell>
                      {bet.profit !== undefined && bet.profit !== null ? (
                        <span className={`text-sm font-semibold ${
                          getBetProfit(bet as UnifiedBetHistory) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {getBetProfit(bet as UnifiedBetHistory) >= 0 ? '+' : ''}{formatNumber(getBetProfit(bet as UnifiedBetHistory))} Ft
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {bet.clv !== undefined && bet.clv !== null ? (
                        <span className={`text-sm font-semibold ${getCLVColor(getBetCLV(bet as UnifiedBetHistory))}`}>
                          {getBetCLV(bet as UnifiedBetHistory) >= 0 ? '+' : ''}{getBetCLV(bet as UnifiedBetHistory).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(bet.status)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs">{formatDate(getBetPlacedDate(bet as UnifiedBetHistory))}</div>
                        {getBetSettledDate(bet as UnifiedBetHistory) && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(getBetSettledDate(bet as UnifiedBetHistory)!)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">Nincsenek fogadási előzmények</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Próbáld meg megváltoztatni a szűrőket.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
