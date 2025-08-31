"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Profil
          </h1>
          <p className="text-muted-foreground mt-2">
            Felhasználói beállítások és adatok kezelése
          </p>
        </div>
        <Button variant="outline">
          Szerkesztés
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil információk */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profil Információk</CardTitle>
            <CardDescription>
              Alapvető felhasználói adatok
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                <Badge variant="secondary" className="mt-1">Premium</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Felhasználónév</label>
                <p className="text-sm text-muted-foreground">johndoe</p>
              </div>
              <div>
                <label className="text-sm font-medium">Regisztráció dátuma</label>
                <p className="text-sm text-muted-foreground">2024. január 15.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Utolsó bejelentkezés</label>
                <p className="text-sm text-muted-foreground">2024. december 19. 14:30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beállítások */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Beállítások</CardTitle>
            <CardDescription>
              Platform beállítások és preferenciák
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Értesítések</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email értesítések</p>
                    <p className="text-sm text-muted-foreground">Arbitrage lehetőségek emailben</p>
                  </div>
                  <Button variant="outline" size="sm">Beállítás</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push értesítések</p>
                    <p className="text-sm text-muted-foreground">Azonnali értesítések</p>
                  </div>
                  <Button variant="outline" size="sm">Beállítás</Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Biztonság</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Jelszó módosítása</p>
                    <p className="text-sm text-muted-foreground">Új jelszó beállítása</p>
                  </div>
                  <Button variant="outline" size="sm">Módosítás</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Két faktoros hitelesítés</p>
                    <p className="text-sm text-muted-foreground">Extra biztonság</p>
                  </div>
                  <Button variant="outline" size="sm">Beállítás</Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Előfizetés</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Jelenlegi terv</p>
                    <p className="text-sm text-muted-foreground">Premium - 29.99€/hó</p>
                  </div>
                  <Button variant="outline" size="sm">Módosítás</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Számlázási adatok</p>
                    <p className="text-sm text-muted-foreground">Fizetési módok kezelése</p>
                  </div>
                  <Button variant="outline" size="sm">Beállítás</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
