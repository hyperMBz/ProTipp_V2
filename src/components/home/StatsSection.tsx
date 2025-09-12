"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Trophy } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Aktív Felhasználók",
      description: "Regisztrált felhasználók száma"
    },
    {
      icon: TrendingUp,
      value: "50,000+",
      label: "Arbitrage Lehetőségek",
      description: "Naponta detektált lehetőségek"
    },
    {
      icon: DollarSign,
      value: "8.5%",
      label: "Átlagos Profit",
      description: "Felhasználók átlagos profitja"
    },
    {
      icon: Trophy,
      value: "25+",
      label: "Sportágak",
      description: "Elérhető sportágak száma"
    }
  ];

  return (
    <section id="stats" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Platform Statisztikák
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Impresszív számok, amelyek bizonyítják a platform hatékonyságát
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={index}
                className="bg-card border border-border/50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300 hover:scale-105 transform"
              >
                <CardContent className="p-0">
                  {/* Ikon */}
                  <div className="h-12 w-12 mx-auto mb-4 text-primary">
                    <IconComponent className="h-full w-full" />
                  </div>
                  
                  {/* Érték */}
                  <div className="text-3xl font-bold mb-2 text-foreground">
                    {stat.value}
                  </div>
                  
                  {/* Címke */}
                  <div className="text-lg font-semibold mb-2 text-foreground">
                    {stat.label}
                  </div>
                  
                  {/* Leírás */}
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
