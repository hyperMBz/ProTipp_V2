"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Users, 
  Award, 
  Zap,
  BarChart3,
  Clock
} from "lucide-react";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              ProTipp V2
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A legfejlettebb arbitrage betting platform Magyarországon. 
            Professzionális eszközök a sikeres sportfogadáshoz.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="px-3 py-1">
              <Target className="h-3 w-3 mr-1" />
              Arbitrage Detection
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              Advanced Analytics
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Real-time Odds
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Miért válassza a ProTipp V2-t?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Arbitrage Detektálás</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatikus arbitrage lehetőségek felismerése több mint 50 
                  fogadóiroda odds-ai alapján valós időben.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Professzionális Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Részletes statisztikák, profit tracking, ROI elemzés és 
                  teljesítmény optimalizálás fejlett dashboardon.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Biztonság</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-szintű biztonsági protokollok, titkosított adattárolás 
                  és GDPR megfelelőség.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Valós Idejű Odds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Milliszekundumos pontossággal frissülő odds adatok a 
                  leggyorsabb arbitrage lehetőségek azonosításához.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Közösség</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Csatlakozzon több ezer sikeres arbitrage bettorhoz és 
                  ossza meg tapasztalatait.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Támogatás</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  24/7 szakmai támogatás, oktatóanyagok és személyre szabott 
                  stratégiai tanácsadás.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                A ProTipp Csapatáról
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                A ProTipp V2-t tapasztalt fejlesztők és professzionális sportfogadók 
                csapata hozta létre, akik évek óta foglalkoznak arbitrage betting-gel.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">50+</h3>
                  <p className="text-muted-foreground">Támogatott fogadóiroda</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">10,000+</h3>
                  <p className="text-muted-foreground">Aktív felhasználó</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">99.9%</h3>
                  <p className="text-muted-foreground">Uptime garancia</p>
                </div>
              </div>

              <div className="text-center pt-6">
                <Button size="lg" className="px-8">
                  Kezdje el még ma
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
