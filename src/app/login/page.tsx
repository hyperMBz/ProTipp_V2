"use client";

import { LoginDialog } from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Vissza gomb */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza a főoldalra
            </Link>
          </Button>
        </div>

        {/* Fő kártya */}
        <Card className="gradient-bg border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Bejelentkezés
            </CardTitle>
            <CardDescription>
              Jelentkezz be a ProTipp V2 platformra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bejelentkezés gomb */}
            <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <Button className="w-full" size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Bejelentkezés
              </Button>
            </LoginDialog>

            {/* Regisztráció link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Még nincs fiókod?{" "}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/register">
                    Regisztrálj itt
                  </Link>
                </Button>
              </p>
            </div>

            {/* További opciók */}
            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Vagy folytasd a böngészést
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href="/">
                      Főoldal
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* További információk */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            A bejelentkezéssel elfogadod a{" "}
            <Link href="/terms" className="text-primary hover:underline">
              felhasználási feltételeket
            </Link>{" "}
            és a{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              adatvédelmi szabályzatot
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
