"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BetTrackerPanel } from '@/components/bet-tracker/BetTrackerPanel';
import { BetHistoryTracker } from '@/components/BetHistoryTracker';
import { 
  Target, 
  History, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Plus,
  Filter,
  Download,
  BarChart3,
  Calendar
} from 'lucide-react';

export function BetTrackerPageContent() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Bet Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Fogadás követés és teljesítmény elemzés
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Szűrők
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Új fogadás
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív fogadások</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 az elmúlt napban
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teljes profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+€1,247</div>
            <p className="text-xs text-muted-foreground">
              +15.3% az elmúlt hétben
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikeres fogadások</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              34/50 fogadás nyert
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Átlagos ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.4%</div>
            <p className="text-xs text-muted-foreground">
              Az elmúlt 30 napban
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Aktív fogadások</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Előzmények</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Elemzés</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Aktív fogadások</span>
              </CardTitle>
              <CardDescription>
                Jelenleg nyitott fogadások és állapotuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BetTrackerPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Fogadás előzmények</span>
              </CardTitle>
              <CardDescription>
                Összes lezárt fogadás és eredményeik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BetHistoryTracker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Teljesítmény trendek</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Teljesítmény grafikon</p>
                    <p className="text-sm">Hamarosan elérhető</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Heti összefoglaló</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ez a hét</span>
                    <Badge variant="secondary">+€234</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Múlt hét</span>
                    <Badge variant="secondary">+€189</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2 hete</span>
                    <Badge variant="destructive">-€45</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">3 hete</span>
                    <Badge variant="secondary">+€312</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-green-200 bg-green-50/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <Plus className="h-5 w-5" />
            <span>Gyors műveletek</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Új fogadás hozzáadása</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Adatok exportálása</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Részletes elemzés</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
