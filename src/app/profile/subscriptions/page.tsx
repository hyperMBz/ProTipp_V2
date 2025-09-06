"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Crown, Star, Check, X, Calendar, Download, AlertCircle, Loader2 } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface BillingHistory {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}

export default function SubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentPlan: SubscriptionPlan = {
    id: "premium",
    name: "Premium",
    price: 29.99,
    currency: "€",
    period: "havonta",
    features: [
      "Korlátlan arbitrage lehetőség",
      "Haladó kalkulátor",
      "Real-time értesítések",
      "API hozzáférés",
      "Prioritásos támogatás"
    ],
    isCurrent: true
  };

  const availablePlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      currency: "€",
      period: "havonta",
      features: [
        "Napi 5 arbitrage lehetőség",
        "Alapvető kalkulátor",
        "Email támogatás"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 29.99,
      currency: "€",
      period: "havonta",
      features: [
        "Korlátlan arbitrage lehetőség",
        "Haladó kalkulátor",
        "Real-time értesítések",
        "API hozzáférés",
        "Prioritásos támogatás"
      ],
      isPopular: true,
      isCurrent: true
    }
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: "1",
      plan: "Premium előfizetés",
      amount: 29.99,
      currency: "€",
      date: "2024. december 15.",
      status: "paid"
    },
    {
      id: "2",
      plan: "Premium előfizetés",
      amount: 29.99,
      currency: "€",
      date: "2024. november 15.",
      status: "paid"
    },
    {
      id: "3",
      plan: "Premium előfizetés",
      amount: 29.99,
      currency: "€",
      date: "2024. október 15.",
      status: "paid"
    }
  ];

  const handlePlanChange = async (planId: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Előfizetési terv sikeresen módosítva!");
    } catch (err) {
      setError("Hiba történt a terv módosítása során");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Előfizetés sikeresen lemondva!");
    } catch (err) {
      setError("Hiba történt az előfizetés lemondása során");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setIsLoading(true);
    setError("");

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Számla sikeresen letöltve!");
    } catch (err) {
      setError("Hiba történt a számla letöltése során");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Előfizetések
          </h1>
          <p className="text-muted-foreground mt-1">
            Előfizetési terv és számlázási információk
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jelenlegi terv */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Jelenlegi Terv</span>
            </CardTitle>
            <CardDescription>
              Aktív előfizetési terv
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-3xl font-bold text-primary">{currentPlan.price}{currentPlan.currency}</p>
              <p className="text-sm text-muted-foreground">{currentPlan.period}</p>
              <Badge className="bg-green-500">Aktív</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Következő számlázás</span>
                <span className="text-sm font-medium">2025. január 15.</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Előfizetés kezdete</span>
                <span className="text-sm font-medium">2024. december 15.</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fizetési mód</span>
                <span className="text-sm font-medium">**** 1234</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handlePlanChange("basic")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Terv módosítása
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Előfizetés lemondása
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Elérhető tervek */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Elérhető Előfizetési Tervek</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.isPopular ? 'border-primary' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Népszerű</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      {plan.isPopular ? (
                        <Star className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Badge variant="outline">Ingyenes</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {plan.name === "Basic" ? "Alapvető funkciók" : "Teljes funkcionalitás"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{plan.price}{plan.currency}</p>
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.name === "Basic" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">Real-time értesítések</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">API hozzáférés</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.isCurrent ? "outline" : "default"}
                      disabled={plan.isCurrent || isLoading}
                      onClick={() => handlePlanChange(plan.id)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {plan.isCurrent ? "Aktív terv" : "Választás"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Számlázási előzmények */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Számlázási Előzmények</span>
              </CardTitle>
              <CardDescription>
                Korábbi számlák és fizetések
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        invoice.status === 'paid' ? 'bg-green-100' : 
                        invoice.status === 'pending' ? 'bg-yellow-100' : 
                        'bg-red-100'
                      }`}>
                        <Check className={`h-4 w-4 ${
                          invoice.status === 'paid' ? 'text-green-600' : 
                          invoice.status === 'pending' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.plan}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}{invoice.currency}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Letöltés
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
