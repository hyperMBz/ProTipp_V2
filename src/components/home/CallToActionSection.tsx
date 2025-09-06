"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Play, Mail } from "lucide-react";
import Link from "next/link";

export function CallToActionSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-purple-500/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Fő üzenet */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Kezdje el a profit realizálását ma!
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Csatlakozzon több mint 10,000 felhasználóhoz, akik már profitálnak a ProTipp V2 platformmal.
          </p>
          
          {/* CTA gombok */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            {/* Elsődleges gomb - Ingyenes Regisztráció */}
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            >
              <Link href="/dashboard">
                <UserPlus className="mr-2 h-5 w-5" />
                Ingyenes Regisztráció
              </Link>
            </Button>
            
            {/* Másodlagos gomb - Demo Megtekintése */}
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border border-border hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg font-semibold"
            >
              <Link href="/dashboard">
                <Play className="mr-2 h-5 w-5" />
                Demo Megtekintése
              </Link>
            </Button>
            
            {/* Harmadlagos gomb - Kapcsolatfelvétel */}
            <Button 
              asChild 
              variant="ghost" 
              size="lg"
              className="hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg font-semibold"
            >
              <Link href="/dashboard">
                <Mail className="mr-2 h-5 w-5" />
                Kapcsolatfelvétel
              </Link>
            </Button>
          </div>
          
          {/* További információ */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p>
              Ingyenes regisztráció • Nincs kötelező előfizetés • Azonnali hozzáférés
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
