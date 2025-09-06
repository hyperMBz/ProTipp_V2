"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { History, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, AlertCircle, Loader2 } from "lucide-react";

interface BetHistory {
  id: string;
  match: string;
  league: string;
  bet: string;
  odds: number;
  stake: number;
  result: number;
  status: 'won' | 'lost' | 'pending';
  date: string;
}

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data - jövőben API-ból jön
  const betHistory: BetHistory[] = [
    {
      id: "1",
      match: "Manchester United vs Liverpool",
      league: "Premier League",
      bet: "Manchester United győzelem",
      odds: 2.45,
      stake: 100,
      result: 145,
      status: "won",
      date: "2024. december 15. 15:30"
    },
    {
      id: "2",
      match: "Barcelona vs Real Madrid",
      league: "La Liga",
      bet: "Barcelona győzelem",
      odds: 1.85,
      stake: 200,
      result: -200,
      status: "lost",
      date: "2024. december 14. 21:00"
    },
    {
      id: "3",
      match: "Bayern München vs Borussia Dortmund",
      league: "Bundesliga",
      bet: "Bayern München győzelem",
      odds: 1.75,
      stake: 100,
      result: 75,
      status: "pending",
      date: "2024. december 13. 18:30"
    },
    {
      id: "4",
      match: "Arbitrage: Chelsea vs Arsenal",
      league: "Premier League",
      bet: "Chelsea győzelem (Bet365: 2.10) + Arsenal győzelem (William Hill: 2.20)",
      odds: 2.15,
      stake: 500,
      result: 45,
      status: "won",
      date: "2024. december 12. 17:00"
    }
  ];

  const filteredBets = betHistory.filter(bet => {
    if (activeTab === "all") return true;
    return bet.status === activeTab;
  });

  const stats = {
    totalProfit: betHistory.reduce((sum, bet) => sum + bet.result, 0),
    wonBets: betHistory.filter(bet => bet.status === "won").length,
    lostBets: betHistory.filter(bet => bet.status === "lost").length,
    winRate: betHistory.length > 0 ? 
      (betHistory.filter(bet => bet.status === "won").length / betHistory.length * 100).toFixed(1) : "0"
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError("Hiba történt az adatok frissítése során");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Fogadási Előzmények
          </h1>
          <p className="text-muted-foreground mt-1">
            Teljes fogadási történet és statisztikák
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Összes Profit</p>
                <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sikeres Fogadások</p>
                <p className="text-2xl font-bold">{stats.wonBets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sikertelen Fogadások</p>
                <p className="text-2xl font-bold">{stats.lostBets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sikerességi Arány</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Összes</TabsTrigger>
            <TabsTrigger value="won">Nyert</TabsTrigger>
            <TabsTrigger value="lost">Vesztett</TabsTrigger>
            <TabsTrigger value="pending">Folyamatban</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Filter className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Frissítés..." : "Szűrők"}
          </Button>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredBets.map((bet) => (
              <Card key={bet.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{bet.match}</h3>
                        <Badge variant="secondary">{bet.league}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bet.bet} - {bet.odds} odds
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bet.date}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-lg font-bold ${
                        bet.status === 'won' ? 'text-green-400' : 
                        bet.status === 'lost' ? 'text-red-400' : 
                        'text-yellow-400'
                      }`}>
                        {bet.result >= 0 ? '+' : ''}{bet.result}€
                      </p>
                      <p className="text-sm text-muted-foreground">{bet.stake}€ tét</p>
                      <Badge className={
                        bet.status === 'won' ? 'bg-green-500' : 
                        bet.status === 'lost' ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }>
                        {bet.status === 'won' ? 'Nyert' : 
                         bet.status === 'lost' ? 'Vesztett' : 
                         'Folyamatban'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nyert fogadások</h3>
            <p className="text-muted-foreground">
              Itt jelennek meg a sikeres fogadásaid
            </p>
          </div>
        </TabsContent>

        <TabsContent value="lost" className="space-y-4">
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vesztett fogadások</h3>
            <p className="text-muted-foreground">
              Itt jelennek meg a sikertelen fogadásaid
            </p>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Folyamatban lévő fogadások</h3>
            <p className="text-muted-foreground">
              Itt jelennek meg a még nem lezajlott fogadásaid
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
