"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Clock,
  Mail,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Adatvédelmi Tájékoztató
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Utolsó frissítés: 2024. december 19.</span>
            </div>
            <Badge variant="secondary">GDPR megfelelő</Badge>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Tiszteletben tartjuk az Ön magánszféráját és elkötelezettek vagyunk 
            személyes adatainak védelme mellett.
          </p>
        </div>

        <div className="space-y-8">
          {/* GDPR Compliance */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>GDPR Megfelelőség</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A ProTipp Technologies Kft. teljes mértékben megfelel az Európai Unió 
                Általános Adatvédelmi Rendeletének (GDPR) és a magyar adatvédelmi 
                jogszabályoknak.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">GDPR Art. 6 - Jogalap</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">GDPR Art. 7 - Hozzájárulás</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">GDPR Art. 17 - Törléshez való jog</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">GDPR Art. 20 - Hordozhatóság</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Controller */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>1. Adatkezelő</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-card/50 rounded-lg">
                <h3 className="font-semibold mb-2">ProTipp Technologies Kft.</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Székhely: 1051 Budapest, Október 6. utca 7.</p>
                  <p>Cégjegyzékszám: 01-09-123456</p>
                  <p>Adószám: 12345678-1-41</p>
                  <p>E-mail: privacy@protipp.hu</p>
                  <p>Telefon: +36 1 234 5678</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>2. Gyűjtött adatok</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Regisztrációs adatok</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Név (vezetéknév, keresztnév)</li>
                  <li>E-mail cím</li>
                  <li>Jelszó (titkosított formában)</li>
                  <li>Regisztráció dátuma és időpontja</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Használati adatok</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Bejelentkezési adatok (IP cím, dátum, idő)</li>
                  <li>Böngésző információk</li>
                  <li>Eszköz információk (operációs rendszer, képernyő felbontás)</li>
                  <li>Oldal látogatottsági statisztikák</li>
                  <li>Klikkelési minták és navigációs útvonalak</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Funkcionális adatok</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Arbitrage keresési előzmények</li>
                  <li>Mentett szűrők és beállítások</li>
                  <li>Kedvenc fogadóirodák listája</li>
                  <li>Értesítési beállítások</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Purpose of Processing */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>3. Adatkezelés céljai és jogalapja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Szolgáltatás nyújtása</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    A platform funkcióinak biztosítása, felhasználói fiók kezelése.
                  </p>
                  <Badge variant="outline">Szerződés teljesítése</Badge>
                </div>
                
                <div className="p-4 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Biztonság</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visszaélések megelőzése, biztonsági incidensek kezelése.
                  </p>
                  <Badge variant="outline">Jogos érdek</Badge>
                </div>
                
                <div className="p-4 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Kommunikáció</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ügyfélszolgálat, technikai értesítések küldése.
                  </p>
                  <Badge variant="outline">Szerződés teljesítése</Badge>
                </div>
                
                <div className="p-4 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Fejlesztés</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Szolgáltatás javítása, új funkciók fejlesztése.
                  </p>
                  <Badge variant="outline">Jogos érdek</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>4. Adatbiztonság</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Személyes adatainak védelme érdekében a következő biztonsági 
                intézkedéseket alkalmazzuk:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">SSL titkosítás</h4>
                    <p className="text-sm text-muted-foreground">
                      Minden adatátvitel 256-bites SSL titkosítással védett.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Adatbázis védelem</h4>
                    <p className="text-sm text-muted-foreground">
                      Titkosított adatbázis, rendszeres biztonsági mentések.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Hozzáférés-kontroll</h4>
                    <p className="text-sm text-muted-foreground">
                      Kétfaktoros hitelesítés, szerepkör-alapú jogosultságok.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      24/7 biztonsági monitoring és incidenskezelés.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>5. Az Ön jogai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A GDPR alapján az alábbi jogokkal rendelkezik:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Hozzáférés joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Tájékoztatás kérése az adatkezelésről
                  </p>
                </div>
                
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Helyesbítés joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Pontatlan adatok javításának kérése
                  </p>
                </div>
                
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Törlés joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Adatok törlésének kérése ("elfeledtetéshez való jog")
                  </p>
                </div>
                
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Korlátozás joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Adatkezelés korlátozásának kérése
                  </p>
                </div>
                
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Hordozhatóság joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Adatok strukturált formában való kiadása
                  </p>
                </div>
                
                <div className="p-3 border border-primary/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Tiltakozás joga</h4>
                  <p className="text-xs text-muted-foreground">
                    Adatkezelés elleni tiltakozás
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>6. Adatmegőrzés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="font-medium">Aktív felhasználói adatok</span>
                  <Badge variant="secondary">Fiók törlésig</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="font-medium">Inaktív fiókok</span>
                  <Badge variant="secondary">2 év</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="font-medium">Biztonsági logok</span>
                  <Badge variant="secondary">1 év</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                  <span className="font-medium">Számlázási adatok</span>
                  <Badge variant="secondary">8 év (jogszabály)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>7. Sütik (Cookies)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Weboldalunk sütiket használ a felhasználói élmény javítása érdekében:
              </p>
              <div className="space-y-3">
                <div className="p-3 border border-green-400/20 bg-green-400/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Feltétlenül szükséges sütik</span>
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      Mindig aktív
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bejelentkezés, biztonsági funkciók
                  </p>
                </div>
                
                <div className="p-3 border border-blue-400/20 bg-blue-400/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Funkcionális sütik</span>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      Opcionális
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Beállítások mentése, nyelv kiválasztása
                  </p>
                </div>
                
                <div className="p-3 border border-purple-400/20 bg-purple-400/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Analitikai sütik</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      Opcionális
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Használati statisztikák, teljesítmény mérése
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>8. Kapcsolat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Adatvédelmi kérdéseivel forduljon hozzánk bizalommal:
              </p>
              <div className="p-4 bg-card/50 rounded-lg">
                <h3 className="font-semibold mb-2">Adatvédelmi tisztviselő</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>E-mail: privacy@protipp.hu</p>
                  <p>Telefon: +36 1 234 5678</p>
                  <p>Postacím: 1051 Budapest, Október 6. utca 7.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Adatvédelmi kérés
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Adatok exportálása
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
