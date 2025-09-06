"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, DollarSign } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Regisztráció",
      description: "Hozzon létre ingyenes fiókot 2 perc alatt",
      details: "Egyszerű regisztrációs folyamat email címmel és jelszóval. Azonnali hozzáférés az összes funkcióhoz."
    },
    {
      number: "2", 
      icon: Search,
      title: "Arbitrage Keresés",
      description: "Fedezze fel a legjobb arbitrage lehetőségeket",
      details: "Valós idejű odds összehasonlítás több fogadóiroda között. Automatikus arbitrage detektálás."
    },
    {
      number: "3",
      icon: DollarSign,
      title: "Profit Realizálás", 
      description: "Helyezze el fogadásait és realizálja a profitot",
      details: "Pontos tét elosztás kalkulációval. Követés és teljesítmény elemzés a fogadások után."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Hogyan Működik?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Három egyszerű lépésben kezdje el a profit realizálását
          </p>
        </div>
        
        {/* Desktop: Vízszintes layout */}
        <div className="hidden lg:flex flex-row justify-between items-start space-x-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="flex-1 text-center px-4">
                <Card className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    {/* Számozás badge */}
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    
                    {/* Ikon */}
                    <div className="h-16 w-16 text-primary mx-auto mb-4">
                      <IconComponent className="h-full w-full" />
                    </div>
                    
                    <CardTitle className="text-xl font-semibold">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {step.details}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Mobile: Függőleges layout */}
        <div className="lg:hidden flex flex-col space-y-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                {/* Számozás badge */}
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                
                <Card className="flex-1 bg-card border border-border/50 rounded-lg p-6">
                  <CardHeader className="p-0 pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-8 w-8 text-primary">
                        <IconComponent className="h-full w-full" />
                      </div>
                      <CardTitle className="text-lg font-semibold">
                        {step.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">
                      {step.details}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
