"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Clock,
  Scale
} from "lucide-react";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Általános Szerződési Feltételek
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Utolsó frissítés: 2024. december 19.</span>
            </div>
            <Badge variant="secondary">v2.0</Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Bevezetés</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Jelen Általános Szerződési Feltételek (továbbiakban: "ÁSZF") szabályozzák 
                a ProTipp V2 platform (továbbiakban: "Szolgáltatás") használatát, amelyet 
                a ProTipp Technologies Kft. (továbbiakban: "Társaság") nyújt.
              </p>
              <p className="text-muted-foreground">
                A Szolgáltatás használatával Ön elfogadja jelen ÁSZF-et és kötelezi magát 
                annak betartására.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>1. A Szolgáltatás leírása</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A ProTipp V2 egy professzionális arbitrage betting platform, amely:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Valós idejű odds összehasonlítást biztosít különböző fogadóirodák között</li>
                <li>Arbitrage lehetőségeket azonosít automatikusan</li>
                <li>Részletes analitikai és statisztikai eszközöket kínál</li>
                <li>Professzionális dashboard-ot és jelentéseket nyújt</li>
              </ul>
              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-400 mb-1">Fontos figyelmeztetés</p>
                    <p className="text-sm text-muted-foreground">
                      A Szolgáltatás nem fogadóiroda, nem fogad el fogadásokat, és nem 
                      garantálja a profit elérését. A fogadás mindig kockázattal jár.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>2. Felhasználói kötelezettségek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">A Szolgáltatás használatával Ön vállalja, hogy:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Betartja a hatályos jogszabályokat és a fogadóirodák szabályait</li>
                <li>Nem használja a Szolgáltatást illegális célokra</li>
                <li>Pontos és naprakész adatokat ad meg regisztrációkor</li>
                <li>Nem osztja meg fiókadatait harmadik felekkel</li>
                <li>Nem próbálja meg megkerülni a biztonsági intézkedéseket</li>
                <li>Felelősségteljesen fogad, saját kockázatára</li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>3. Tiltott tevékenységek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">A következő tevékenységek szigorúan tilosak:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Automatizált bot-ok vagy script-ek használata</li>
                <li>A rendszer túlterhelése vagy DDoS támadások</li>
                <li>Adatok illegális másolása vagy terjesztése</li>
                <li>Hamis vagy megtévesztő információk megadása</li>
                <li>Más felhasználók zaklatása vagy károsítása</li>
                <li>A Szolgáltatás reverse engineering-je</li>
              </ul>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>4. Felelősség korlátozása</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A Társaság nem vállal felelősséget:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>A fogadásokból származó veszteségekért</li>
                <li>A harmadik fél szolgáltatások (fogadóirodák) működéséért</li>
                <li>Az odds-ok pontosságáért vagy elérhetőségéért</li>
                <li>Technikai hibákból vagy szolgáltatás-kiesésből eredő károkért</li>
                <li>A felhasználó döntéseiből származó következményekért</li>
              </ul>
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400 mb-1">Kockázati nyilatkozat</p>
                    <p className="text-sm text-muted-foreground">
                      A sportfogadás kockázatos tevékenység. Csak olyan összeget 
                      fogadjon, amelynek elvesztését megengedheti magának.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>5. Adatvédelem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Az adatok kezelésével kapcsolatos részletes információkat az 
                Adatvédelmi Tájékoztatóban találja meg.
              </p>
              <p className="text-muted-foreground">
                A Szolgáltatás használatával hozzájárul személyes adatainak 
                GDPR-megfelelő kezeléséhez.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>6. Fizetési feltételek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A Szolgáltatás előfizetéses modellben működik:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Havi vagy éves előfizetési díj fizetendő</li>
                <li>A díjak előre fizetendők</li>
                <li>Automatikus megújítás, bármikor lemondható</li>
                <li>Visszatérítés csak jogszabály által előírt esetekben</li>
                <li>ÁFA-t tartalmazzák a megjelenített árak</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>7. Szerződés megszüntetése</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A szerződés megszüntethető:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Bármely fél által, 30 napos felmondási idővel</li>
                <li>Azonnali hatállyal, ÁSZF súlyos megsértése esetén</li>
                <li>Automatikusan, fizetési kötelezettség elmulasztása esetén</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>8. ÁSZF módosítása</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A Társaság jogosult jelen ÁSZF-et módosítani. A módosításokról 
                a felhasználók e-mailben és a platformon keresztül értesítést kapnak.
              </p>
              <p className="text-muted-foreground">
                A módosított ÁSZF a közlést követő 15. napon lép hatályba.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>9. Alkalmazandó jog és jogviták</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Jelen ÁSZF-re és a kapcsolódó jogviszonyokra a magyar jog az irányadó.
              </p>
              <p className="text-muted-foreground">
                Jogviták esetén a felek elsősorban békés megoldásra törekednek. 
                Ennek sikertelensége esetén a Budapesti Törvényszék illetékes.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="gradient-bg border-primary/20">
            <CardHeader>
              <CardTitle>10. Kapcsolat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Kérdések esetén forduljon hozzánk bizalommal:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>ProTipp Technologies Kft.</strong></p>
                <p>1051 Budapest, Október 6. utca 7.</p>
                <p>E-mail: legal@protipp.hu</p>
                <p>Telefon: +36 1 234 5678</p>
                <p>Adószám: 12345678-1-41</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
