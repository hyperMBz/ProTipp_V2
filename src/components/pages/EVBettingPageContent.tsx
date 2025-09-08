"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EVBettingFinder } from '@/components/EVBettingFinder';
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
  AlertCircle,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function EVBettingPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [minEV, setMinEV] = useState('5');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            EV Betting
          </h1>
          <p className="text-muted-foreground mt-2">
            Expected Value alapú value betting lehetőségek keresése
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Frissítés
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív EV Lehetőségek</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% az elmúlt órában
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlagos EV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% az elmúlt napban
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legjobb EV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-muted-foreground">
              Futball - Premier League
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frissítés</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30s</div>
            <p className="text-xs text-muted-foreground">
              Utolsó frissítés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Szűrők</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keresés</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Csapat, liga keresése..."
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
                  <SelectValue />
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
              <label className="text-sm font-medium">Minimum EV (%)</label>
              <Input
                type="number"
                placeholder="5"
                value={minEV}
                onChange={(e) => setMinEV(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Műveletek</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Szűrők törlése
                </Button>
                <Button size="sm" className="flex-1">
                  Alkalmazás
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EV Betting Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>EV Betting Lehetőségek</span>
          </CardTitle>
          <CardDescription>
            Expected Value alapú value betting lehetőségek valós idejű adatokkal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EVBettingFinder />
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-600">
            <AlertCircle className="h-5 w-5" />
            <span>EV Betting Információ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Mi az EV Betting?</h4>
              <p className="text-sm text-muted-foreground">
                Az Expected Value (EV) betting egy olyan stratégia, ahol olyan fogadásokat keresünk, 
                amelyeknek pozitív várható értéke van. Ez azt jelenti, hogy hosszú távon profitot 
                várhatunk el ezekből a fogadásokból.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Hogyan számítjuk ki az EV-t?</h4>
              <p className="text-sm text-muted-foreground">
                EV = (Valószínűség × Nyeremény) - (Valószínűség × Veszteség)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Mikor érdemes EV betting-et alkalmazni?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ha van megfelelő bankroll kezelés</li>
                <li>• Ha hosszú távú profitot szeretnél</li>
                <li>• Ha megérted a valószínűségszámítást</li>
                <li>• Ha türelmes vagy és nem keresed a gyors profitot</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
