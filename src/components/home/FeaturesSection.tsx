"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calculator, Target } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Arbitrage Lehetőségek",
      description: "Valós idejű arbitrage lehetőségek automatikus detektálással",
      features: [
        "Real-time odds frissítések",
        "Automatikus profit számítás",
        "Szűrés sport és profit szerint",
        "Értesítések magas profit lehetőségekről"
      ]
    },
    {
      icon: Calculator,
      title: "Profit Kalkulátor",
      description: "Pontos profit számítás tét elosztással és kockázat elemzéssel",
      features: [
        "Tét elosztás optimalizálás",
        "ROI számítás",
        "Kockázat elemzés",
        "Arbitrage profit kalkuláció"
      ]
    },
    {
      icon: Target,
      title: "Fogadáskövető",
      description: "Követse fogadásait és elemzze teljesítményét",
      features: [
        "Fogadások mentése",
        "Teljesítmény statisztikák",
        "Profit/veszteség követés",
        "Export funkciók"
      ]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Fő Funkciók
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fedezze fel a ProTipp V2 platform teljes funkcionalitását
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 hover:scale-105 transform"
              >
                <CardHeader className="text-center">
                  <div className="h-12 w-12 text-primary mb-4 mx-auto">
                    <IconComponent className="h-full w-full" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
