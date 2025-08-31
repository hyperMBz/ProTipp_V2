"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            ProTipp V2 - Egyszerű Teszt
          </h1>
          <p className="text-muted-foreground text-lg">
            Egyszerű teszt oldal Supabase komponensek nélkül
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

          <Card className="gradient-bg border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Supabase Adatok
              </CardTitle>
              <CardDescription>
                A környezeti változók be vannak állítva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="default" className="bg-green-500">
                Beállítva
              </Badge>
              <div className="text-sm text-muted-foreground">
                <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Beállítva' : '❌ Hiányzik'}</p>
                <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Beállítva' : '❌ Hiányzik'}</p>
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
                A bejelentkezés tesztelésre vár
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Tesztelésre vár
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
                A dashboard tesztelésre vár
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                Tesztelésre vár
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
                  <li>• Supabase környezeti változók</li>
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
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/test'}
            className="mx-2"
          >
            Teljes Teszt
          </Button>
        </div>
      </div>
    </div>
  );
}
