"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Play, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/unified-auth-provider";
import { LoginDialog } from "@/components/auth/LoginDialog";

export function CallToActionSection() {
  const { user } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleRegisterClick = () => {
    setLoginDialogOpen(true);
  };

  return (
    <section id="cta" className="py-16 bg-gradient-to-r from-primary/10 to-purple-500/10">
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
              onClick={handleRegisterClick}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Ingyenes Regisztráció
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
              <Link href="/contact">
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

      {/* Login Dialog */}
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        initialMode="register"
      >
        <div />
      </LoginDialog>
    </section>
  );
}
