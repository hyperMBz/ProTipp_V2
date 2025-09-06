"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, LogIn, HelpCircle } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-1000">
          {/* Fő cím */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            ProTipp V2
          </h1>
          
          {/* Alcím */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90">
            Professzionális Arbitrage Platform
          </h2>
          
          {/* Leírás */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Fedezze fel a profitot a különböző fogadóirodák közötti odds különbségekből. 
            Automatikus arbitrage detektálás, kalkulátor és fogadáskövető rendszer.
          </p>
          
          {/* CTA gombok */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
            {/* Elsődleges gomb - Ingyenes Regisztráció */}
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
            >
              <Link href="/dashboard">
                <UserPlus className="mr-2 h-5 w-5" />
                Ingyenes Regisztráció
              </Link>
            </Button>
            
            {/* Másodlagos gomb - Bejelentkezés */}
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border border-border hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg font-semibold"
            >
              <Link href="/dashboard">
                <LogIn className="mr-2 h-5 w-5" />
                Bejelentkezés
              </Link>
            </Button>
            
            {/* Harmadlagos gomb - Hogyan működik */}
            <Button 
              asChild 
              variant="ghost" 
              size="lg"
              className="hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg font-semibold"
            >
              <Link href="#how-it-works">
                <HelpCircle className="mr-2 h-5 w-5" />
                Hogyan működik?
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
