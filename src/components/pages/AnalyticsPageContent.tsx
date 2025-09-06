"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Utolsó 7 nap' },
    { value: '30d', label: 'Utolsó 30 nap' },
    { value: '90d', label: 'Utolsó 90 nap' },
    { value: '1y', label: 'Utolsó év' },
    { value: 'all', label: 'Összes' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Analytics & Elemzések
          </h1>
          <p className="text-muted-foreground text-lg">
            Részletes analytics és reporting a fogadási teljesítményedről
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Frissítés
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">+€2,847.50</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% az elmúlt 30 napban
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">+8.7%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +1.2% az elmúlt 30 napban
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikeres Fogadások</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">78.5%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3.2% az elmúlt 30 napban
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Fogadás</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">247</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18 az elmúlt 30 napban
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Áttekintés</TabsTrigger>
          <TabsTrigger value="performance">Teljesítmény</TabsTrigger>
          <TabsTrigger value="sports">Sportok</TabsTrigger>
          <TabsTrigger value="reports">Jelentések</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Trend Chart */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Profit Trend
                </CardTitle>
                <CardDescription>
                  Napi profit alakulás az elmúlt 30 napban
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Profit trend grafikon</p>
                    <p className="text-sm text-muted-foreground">Hamarosan elérhető</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sport Distribution */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sport Eloszlás
                </CardTitle>
                <CardDescription>
                  Fogadások eloszlása sportok szerint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sport eloszlás grafikon</p>
                    <p className="text-sm text-muted-foreground">Hamarosan elérhető</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Legutóbbi Tevékenység
              </CardTitle>
              <CardDescription>
                Legfrissebb fogadások és eredmények
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { sport: 'Futball', match: 'Real Madrid vs Barcelona', profit: '+€45.20', status: 'won', time: '2 órája' },
                  { sport: 'Kosárlabda', match: 'Lakers vs Warriors', profit: '+€23.50', status: 'won', time: '5 órája' },
                  { sport: 'Tenisz', match: 'Djokovic vs Nadal', profit: '-€12.30', status: 'lost', time: '1 napja' },
                  { sport: 'Futball', match: 'Manchester City vs Liverpool', profit: '+€67.80', status: 'won', time: '2 napja' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.match}</p>
                        <p className="text-sm text-muted-foreground">{activity.sport} • {activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold",
                        activity.status === 'won' ? "text-green-400" : "text-red-400"
                      )}>
                        {activity.profit}
                      </p>
                      <Badge variant={activity.status === 'won' ? 'default' : 'destructive'} className="text-xs">
                        {activity.status === 'won' ? 'Nyert' : 'Vesztett'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle>Teljesítmény Metrikák</CardTitle>
                <CardDescription>
                  Részletes teljesítmény elemzés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Átlagos Profit</span>
                    <span className="text-green-400 font-semibold">+€11.52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Legmagasabb Profit</span>
                    <span className="text-green-400 font-semibold">+€156.80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Legnagyobb Veszteség</span>
                    <span className="text-red-400 font-semibold">-€45.20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profit Factor</span>
                    <span className="text-blue-400 font-semibold">2.34</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Win Rate by Sport */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle>Győzelmi Arány Sportok Szerint</CardTitle>
                <CardDescription>
                  Sikeres fogadások aránya sportok szerint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { sport: 'Futball', winRate: 82.5, total: 45 },
                    { sport: 'Kosárlabda', winRate: 75.0, total: 32 },
                    { sport: 'Tenisz', winRate: 68.2, total: 28 },
                    { sport: 'Jégkorong', winRate: 71.4, total: 21 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.sport}</span>
                        <span className="text-sm text-muted-foreground">{item.winRate}% ({item.total})</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.winRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sports" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>Sport Részletek</CardTitle>
              <CardDescription>
                Részletes elemzés sportok szerint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sport Elemzés</h3>
                <p className="text-muted-foreground">
                  Részletes sport elemzés hamarosan elérhető lesz.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>Jelentések</CardTitle>
              <CardDescription>
                Részletes jelentések és export lehetőségek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Jelentések</h3>
                <p className="text-muted-foreground">
                  Részletes jelentések hamarosan elérhetők lesznek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
