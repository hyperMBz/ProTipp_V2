"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfitCalculator } from '@/components/ProfitCalculator';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { CalculatorResults } from '@/components/calculator/CalculatorResults';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  Percent,
  Zap,
  Brain,
  Info
} from 'lucide-react';

export function CalculatorPageContent() {
  const [activeTab, setActiveTab] = useState('arbitrage');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Profit Kalkulátor
          </h1>
          <p className="text-muted-foreground mt-2">
            Számítsa ki a profitot és tét elosztást fogadásaihoz
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Segítség
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalkulációk</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +23 ma
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlagos profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+4.2%</div>
            <p className="text-xs text-muted-foreground">
              Arbitrage fogadások
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legjobb profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.8%</div>
            <p className="text-xs text-muted-foreground">
              Futball - Premier League
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentett kalkulációk</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +5 az elmúlt hétben
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calculator */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="arbitrage" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Arbitrage</span>
          </TabsTrigger>
          <TabsTrigger value="value" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Value Betting</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Haladó</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arbitrage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Arbitrage Kalkulátor</span>
                </CardTitle>
                <CardDescription>
                  Számítsa ki a profitot és tét elosztást arbitrage fogadásokhoz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalculatorForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Eredmények</span>
                </CardTitle>
                <CardDescription>
                  Számított profit és tét elosztás
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalculatorResults result={null} opportunity={null} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Value Betting Kalkulátor</span>
              </CardTitle>
              <CardDescription>
                Expected Value alapú fogadási kalkulátor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="odds">Odds</Label>
                    <Input id="odds" placeholder="2.50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Valószínűség (%)</Label>
                    <Input id="probability" placeholder="45" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stake">Tét (€)</Label>
                    <Input id="stake" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankroll">Bankroll (€)</Label>
                    <Input id="bankroll" placeholder="1000" />
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Value Betting Eredmények:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Expected Value:</span>
                      <Badge variant="secondary">+€12.50</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Kelly Criterion:</span>
                      <Badge variant="secondary">2.5%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajánlott tét:</span>
                      <Badge variant="secondary">€25</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Haladó Kalkulátor</span>
              </CardTitle>
              <CardDescription>
                Komplex fogadási számítások és elemzések
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfitCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calculator Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5" />
              <span>Odds Konverter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Decimal Odds</Label>
                  <Input placeholder="2.50" />
                </div>
                <div className="space-y-2">
                  <Label>Fractional Odds</Label>
                  <Input placeholder="3/2" />
                </div>
                <div className="space-y-2">
                  <Label>American Odds</Label>
                  <Input placeholder="+150" />
                </div>
                <div className="space-y-2">
                  <Label>Implied Probability</Label>
                  <Input placeholder="40%" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Bankroll Kezelés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Teljes bankroll (€)</Label>
                <Input placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label>Kockázati szint (%)</Label>
                <Input placeholder="2" />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Maximális tét:</span>
                    <Badge variant="secondary">€20</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ajánlott tét:</span>
                    <Badge variant="secondary">€10</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-600">
            <Info className="h-5 w-5" />
            <span>Kalkulátor Segítség</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Arbitrage Kalkulátor</h4>
              <p className="text-sm text-muted-foreground">
                Az arbitrage kalkulátor segít megtalálni a garantiált profitot, 
                amikor különböző fogadóirodáknál eltérő odds-ok vannak ugyanarra az eseményre.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Value Betting</h4>
              <p className="text-sm text-muted-foreground">
                A value betting kalkulátor segít meghatározni, hogy egy fogadásnak 
                pozitív várható értéke van-e, és mekkora tétet érdemes rátenni.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Kelly Criterion</h4>
              <p className="text-sm text-muted-foreground">
                A Kelly Criterion egy matematikai formula, amely segít meghatározni 
                az optimális tét méretét a bankroll százalékában.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
