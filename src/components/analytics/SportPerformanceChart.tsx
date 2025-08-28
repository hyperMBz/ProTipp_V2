"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { UnifiedBetHistory } from '@/lib/types/bet-history';
import { PieChart as PieChartIcon, BarChart3, Trophy, Target } from 'lucide-react';
import { ChartTooltipPayload } from '@/lib/types/charts';

interface SportPerformanceChartProps {
  data: UnifiedBetHistory[];
  className?: string;
}

export function SportPerformanceChart({ data, className }: SportPerformanceChartProps) {

  const sportData = useMemo(() => {
    if (data.length === 0) {
      // Generate sample data for demo
      return [
        {
          sport: 'Labdarúgás',
          profit: 25000,
          bets: 45,
          wins: 28,
          winRate: 62.2,
          roi: 8.5,
          totalStaked: 180000,
          color: '#10b981'
        },
        {
          sport: 'Kosárlabda',
          profit: 18000,
          bets: 32,
          wins: 19,
          winRate: 59.4,
          roi: 12.1,
          totalStaked: 148000,
          color: '#3b82f6'
        },
        {
          sport: 'Tenisz',
          profit: -5000,
          bets: 25,
          wins: 11,
          winRate: 44.0,
          roi: -3.8,
          totalStaked: 132000,
          color: '#ef4444'
        },
        {
          sport: 'Ökölvívás',
          profit: 12000,
          bets: 18,
          wins: 12,
          winRate: 66.7,
          roi: 15.2,
          totalStaked: 79000,
          color: '#f59e0b'
        },
        {
          sport: 'MMA',
          profit: 8000,
          bets: 15,
          wins: 9,
          winRate: 60.0,
          roi: 11.4,
          totalStaked: 70000,
          color: '#8b5cf6'
        }
      ];
    }

    // Group bets by sport
    const sportMap = new Map<string, {
      profit: number;
      bets: number;
      wins: number;
      totalStaked: number;
    }>();

    data.forEach(bet => {
      if (!sportMap.has(bet.sport)) {
        sportMap.set(bet.sport, {
          profit: 0,
          bets: 0,
          wins: 0,
          totalStaked: 0
        });
      }

      const sportStats = sportMap.get(bet.sport)!;
      sportStats.profit += bet.profit || 0;
      sportStats.bets += 1;
      sportStats.totalStaked += bet.stake;
      if (bet.status === 'won') {
        sportStats.wins += 1;
      }
    });

    // Colors for different sports
    const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let colorIndex = 0;

    return Array.from(sportMap.entries())
      .map(([sport, stats]) => ({
        sport,
        profit: stats.profit,
        bets: stats.bets,
        wins: stats.wins,
        winRate: stats.bets > 0 ? (stats.wins / stats.bets) * 100 : 0,
        roi: stats.totalStaked > 0 ? (stats.profit / stats.totalStaked) * 100 : 0,
        totalStaked: stats.totalStaked,
        color: colors[colorIndex++ % colors.length]
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [data]);

  const totalProfit = sportData.reduce((sum, sport) => sum + sport.profit, 0);
  const totalBets = sportData.reduce((sum, sport) => sum + sport.bets, 0);
  const bestSport = sportData.find(sport => sport.profit > 0);
  const worstSport = sportData.find(sport => sport.profit < 0);

  type PieTooltipPayloadData = {
    sport: string;
    profit: number;
    bets: number;
    roi: number;
  };

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: ChartTooltipPayload<PieTooltipPayloadData>[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.sport}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Profit:</span>{' '}
              <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.profit >= 0 ? '+' : ''}{formatNumber(data.profit)} Ft
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Fogadások:</span>{' '}
              <span className="font-semibold text-primary">{data.bets}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">ROI:</span>{' '}
              <span className={`font-semibold ${data.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.roi >= 0 ? '+' : ''}{data.roi.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  type BarTooltipPayloadData = {
    roi: number;
    winRate: number;
    profit: number;
  };

  const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload<BarTooltipPayloadData>[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">ROI:</span>{' '}
              <span className={`font-semibold ${data.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.roi >= 0 ? '+' : ''}{data.roi.toFixed(1)}%
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Nyerési ráta:</span>{' '}
              <span className="font-semibold text-blue-400">{data.winRate.toFixed(1)}%</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Profit:</span>{' '}
              <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.profit >= 0 ? '+' : ''}{formatNumber(data.profit)} Ft
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-sm text-muted-foreground">Legjobb sport</div>
                <div className="font-semibold text-yellow-400">
                  {bestSport?.sport || 'N/A'}
                </div>
                {bestSport && (
                  <div className="text-xs text-green-400">
                    +{formatNumber(bestSport.profit)} Ft
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-muted-foreground">Legaktívabb</div>
                <div className="font-semibold text-blue-400">
                  {sportData[0]?.sport || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sportData[0]?.bets || 0} fogadás
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm text-muted-foreground">Sportok száma</div>
                <div className="font-semibold text-purple-400">
                  {sportData.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalBets} összes fogadás
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Profit Distribution */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <span>Profit megoszlás sportok szerint</span>
            </CardTitle>
            <CardDescription>
              Teljes profit megoszlása a különböző sportokban
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sportData.filter(d => d.profit > 0)} // Only show profitable sports
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="profit"
                    label={({ sport, percent }: { sport: string; percent?: number }) => `${sport}: ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sportData.filter(d => d.profit > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - ROI Comparison */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>ROI összehasonlítás</span>
            </CardTitle>
            <CardDescription>
              Befektetés megtérülési ráta (ROI) sportok szerint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sportData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    type="number"
                    stroke="#9ca3af"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="sport"
                    stroke="#9ca3af"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="roi"
                    fill="#8884d8"
                    radius={[0, 4, 4, 0]}
                  >
                    {sportData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.roi >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle>Részletes sport statisztikák</CardTitle>
          <CardDescription>
            Teljes breakdown minden sport teljesítményéről
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold text-muted-foreground">Sport</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Fogadások</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Nyerések</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Nyerési ráta</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Összeg</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Profit</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sportData.map((sport, index) => (
                  <tr key={sport.sport} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sport.color }}
                        />
                        <span className="font-medium">{sport.sport}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 text-primary font-semibold">
                      {sport.bets}
                    </td>
                    <td className="text-right py-3 text-green-400">
                      {sport.wins}
                    </td>
                    <td className="text-right py-3">
                      <Badge
                        variant="outline"
                        className={sport.winRate >= 50 ? 'border-green-400 text-green-400' : 'border-orange-400 text-orange-400'}
                      >
                        {sport.winRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 text-muted-foreground">
                      {formatNumber(sport.totalStaked)} Ft
                    </td>
                    <td className="text-right py-3">
                      <span className={`font-semibold ${sport.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {sport.profit >= 0 ? '+' : ''}{formatNumber(sport.profit)} Ft
                      </span>
                    </td>
                    <td className="text-right py-3">
                      <Badge
                        variant="outline"
                        className={sport.roi >= 0 ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'}
                      >
                        {sport.roi >= 0 ? '+' : ''}{sport.roi.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
