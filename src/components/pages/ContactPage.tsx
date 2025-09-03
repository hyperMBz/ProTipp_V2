"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/ContactForm";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin,
  Phone,
  Globe
} from "lucide-react";

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Kapcsolat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kérdése van? Segítségre van szüksége? Vegye fel velünk a kapcsolatot, 
            és csapatunk hamarosan válaszol.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Üzenet küldése</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Support Info */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Támogatás</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">E-mail támogatás</h3>
                  <p className="text-muted-foreground mb-2">
                    Küldje el kérdését e-mailben, és 24 órán belül válaszolunk.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@protipp.hu">
                      support@protipp.hu
                    </a>
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Válaszidő</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Általában 2-4 óra</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Info */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Céginformációk</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">ProTipp Technologies Kft.</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        1051 Budapest, Október 6. utca 7.<br />
                        Magyarország
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>+36 1 234 5678</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Adószám</h3>
                  <p className="text-sm text-muted-foreground">12345678-1-41</p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="gradient-bg border-primary/20">
              <CardHeader>
                <CardTitle>Gyakori kérdések</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Mielőtt kapcsolatba lépne velünk, nézze meg gyakori kérdéseinket.
                </p>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Hogyan működik az arbitrage betting?
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Milyen fogadóirodákat támogatnak?
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Mennyibe kerül a szolgáltatás?
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Biztonságos az adataim?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Support Options */}
        <div className="mt-12 text-center">
          <Card className="gradient-bg border-primary/20 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">
                Sürgős segítségre van szüksége?
              </h3>
              <p className="text-muted-foreground mb-6">
                Kritikus problémák esetén azonnal segítünk. Használja az alábbi 
                gyors elérhetőségeket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button>
                  <Phone className="h-4 w-4 mr-2" />
                  Azonnali hívás
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
