"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArbitrageTable } from '@/components/ArbitrageTable';
import { BetTrackerProvider } from '@/components/bet-tracker/BetTrackerProvider';
import { mockArbitrageOpportunities } from '@/lib/mock-data';
import { 
  TrendingUp, 
  Filter, 
  Search, 
  RefreshCw, 
  Download, 
  Settings,
  Target,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ArbitragePageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [minProfit, setMinProfit] = useState('2');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const sportOptions = [
    { value: 'all', label: 'Összes sport' },
    { value: 'football', label: 'Futball' },
    { value: 'basketball', label: 'Kosárlabda' },
    { value: 'tennis', label: 'Tenisz' },
    { value: 'hockey', label: 'Jégkorong' },
    { value: 'baseball', label: 'Baseball' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Arbitrage Lehetőségek
          </h1>
          <p className="text-muted-foreground text-lg">
            Fedezd fel a legjobb arbitrage lehetőségeket valós idejű adatokkal
          </p>
        </div>
        
        <div className="flex items-center gap-3">
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
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Beállítások
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív Lehetőségek</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">24</div>
            <p className="text-xs text-muted-foreground">
              +12% az elmúlt órában
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlagos Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% az elmúlt órában
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legmagasabb Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">8.7%</div>
            <p className="text-xs text-muted-foreground">
              Real Madrid vs Barcelona
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-bg border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utolsó Frissítés</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">2s</div>
            <p className="text-xs text-muted-foreground">
              Valós idejű adatok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="gradient-bg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Szűrők és Keresés
          </CardTitle>
          <CardDescription>
            Finomhangold a keresést a legjobb lehetőségek megtalálásához
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keresés</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mérkőzés keresése..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Sport kiválasztása" />
                </SelectTrigger>
                <SelectContent>
                  {sportOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Profit (%)</label>
              <Input
                type="number"
                placeholder="2"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Műveletek</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Szűrők Törlése
                </Button>
                <Button size="sm" className="flex-1">
                  Alkalmaz
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Lehetőségek</TabsTrigger>
          <TabsTrigger value="history">Előzmények</TabsTrigger>
          <TabsTrigger value="alerts">Értesítések</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Valós Idejű Arbitrage Lehetőségek</CardTitle>
                  <CardDescription>
                    Legfrissebb arbitrage lehetőségek valós idejű adatokkal
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Élő
                  </Badge>
                  <Badge variant="outline">
                    24 aktív
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BetTrackerProvider>
                <ArbitrageTable opportunities={mockArbitrageOpportunities} />
              </BetTrackerProvider>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>Arbitrage Előzmények</CardTitle>
              <CardDescription>
                Korábbi arbitrage lehetőségek és eredmények
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Előzmények</h3>
                <p className="text-muted-foreground">
                  Az arbitrage előzmények hamarosan elérhetők lesznek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>Értesítési Beállítások</CardTitle>
              <CardDescription>
                Konfiguráld az arbitrage értesítéseket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Értesítések</h3>
                <p className="text-muted-foreground">
                  Az értesítési beállítások hamarosan elérhetők lesznek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
