"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            ProTipp V2 - Teszt Oldal
          </h1>
          <p className="text-muted-foreground text-lg">
            Ez egy egyszerű teszt oldal a Supabase konfiguráció nélkül
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Next.js Szerver
              </CardTitle>
              <CardDescription>
                A Next.js szerver sikeresen fut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-500">
                Működik
              </Badge>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Tailwind CSS
              </CardTitle>
              <CardDescription>
                A stílusok megfelelően betöltődnek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-500">
                Működik
              </Badge>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                shadcn/ui Komponensek
              </CardTitle>
              <CardDescription>
                Az UI komponensek megfelelően működnek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-500">
                Működik
              </Badge>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Supabase Kapcsolat
              </CardTitle>
              <CardDescription>
                Az adatbázis kapcsolat nincs beállítva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="destructive">
                Hibás
              </Badge>
              <div className="text-sm text-muted-foreground">
                <p>A környezeti változók placeholder értékeket tartalmaznak.</p>
                <p>Kérjük, kövesse a <code className="bg-muted px-1 rounded">SUPABASE_SETUP.md</code> útmutatót.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Authentication
              </CardTitle>
              <CardDescription>
                A bejelentkezés nem működik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Nem elérhető
              </Badge>
            </CardContent>
          </Card>

          <Card className="gradient-bg border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Dashboard
              </CardTitle>
              <CardDescription>
                A dashboard nem töltődik be
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Nem elérhető
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-bg border-primary/20">
          <CardHeader>
            <CardTitle>Következő lépések</CardTitle>
            <CardDescription>
              A Supabase konfiguráció beállítása után a következő funkciók lesznek elérhetők:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Működő funkciók:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js szerver</li>
                  <li>• Tailwind CSS stílusok</li>
                  <li>• shadcn/ui komponensek</li>
                  <li>• Reszponzív design</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🔧 Beállítandó funkciók:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Supabase adatbázis kapcsolat</li>
                  <li>• Felhasználói autentikáció</li>
                  <li>• Dashboard widget-ek</li>
                  <li>• Arbitrage számítások</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="mx-2"
          >
            Dashboard megnyitása
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="mx-2"
          >
            Főoldal
          </Button>
        </div>
      </div>
    </div>
  );
}
