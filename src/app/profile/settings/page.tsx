"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Bell, Shield, CreditCard, User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

interface FormData {
  username: string;
  email: string;
  fullname: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  fullname?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "johndoe",
    email: "john.doe@example.com",
    fullname: "John Doe",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Felhasználónév validáció
    if (!formData.username.trim()) {
      newErrors.username = "Felhasználónév kötelező";
    } else if (formData.username.length < 3) {
      newErrors.username = "Felhasználónév legalább 3 karakter";
    }

    // Email validáció
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email cím kötelező";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Érvényes email cím szükséges";
    }

    // Teljes név validáció
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Teljes név kötelező";
    }

    // Jelszó validáció (csak ha van kitöltve)
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Jelszó legalább 8 karakter";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Jelszavak nem egyeznek";
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Jelenlegi jelszó szükséges";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Töröljük a hibát, ha a felhasználó elkezd gépelni
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProfileUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Profil sikeresen frissítve!");
    } catch (error) {
      setErrorMessage("Hiba történt a profil frissítése során");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Szimulált API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Jelszó sikeresen módosítva!");
      setFormData(prev => ({ 
        ...prev, 
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: "" 
      }));
    } catch (error) {
      setErrorMessage("Hiba történt a jelszó módosítása során");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Beállítások
          </h1>
          <p className="text-muted-foreground mt-1">
            Felhasználói beállítások és preferenciák kezelése
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profil információk */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profil Információk</span>
            </CardTitle>
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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Felhasználónév</Label>
                <Input 
                  id="username" 
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email cím</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullname">Teljes név</Label>
                <Input 
                  id="fullname" 
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  className={errors.fullname ? "border-red-500" : ""}
                />
                {errors.fullname && (
                  <p className="text-sm text-red-500">{errors.fullname}</p>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleProfileUpdate}
              disabled={isLoading}
            >
              <User className="h-4 w-4 mr-2" />
              {isLoading ? "Frissítés..." : "Profil frissítése"}
            </Button>
          </CardContent>
        </Card>

        {/* Beállítások */}
        <div className="space-y-6">
          {/* Értesítések */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Értesítések</span>
              </CardTitle>
              <CardDescription>
                Email és push értesítések beállítása
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Email értesítések</p>
                    <p className="text-sm text-muted-foreground">Arbitrage lehetőségek és frissítések</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Push értesítések</p>
                    <p className="text-sm text-muted-foreground">Azonnali értesítések böngészőben</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">SMS értesítések</p>
                    <p className="text-sm text-muted-foreground">Kritikus értesítések SMS-ben</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biztonság */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Biztonság</span>
              </CardTitle>
              <CardDescription>
                Fiók biztonsági beállítások
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Jelenlegi jelszó</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    className={errors.currentPassword ? "border-red-500" : ""}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500">{errors.currentPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Új jelszó</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Jelszó megerősítése</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
                <Button 
                  variant="outline"
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isLoading ? "Módosítás..." : "Jelszó módosítása"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Két faktoros hitelesítés</p>
                    <p className="text-sm text-muted-foreground">Extra biztonság a fiókodhoz</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Beállítás
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Bejelentkezési munkamenetek</p>
                    <p className="text-sm text-muted-foreground">Aktív bejelentkezések kezelése</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Megtekintés
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Előfizetés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Előfizetés</span>
              </CardTitle>
              <CardDescription>
                Előfizetési terv és számlázási adatok
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Premium terv</p>
                    <p className="text-sm text-muted-foreground">29.99€/hó</p>
                  </div>
                  <Badge variant="secondary">Aktív</Badge>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-number">Bankkártya szám</Label>
                  <Input id="card-number" placeholder="**** **** **** 1234" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Lejárat</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="***" />
                  </div>
                </div>
                
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fizetési mód frissítése
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
