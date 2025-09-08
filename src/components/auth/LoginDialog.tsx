"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/unified-auth-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Chrome } from "lucide-react";

interface LoginDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialMode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
}

export function LoginDialog({ children, open, onOpenChange, initialMode = 'login', onModeChange }: LoginDialogProps) {
  const { user, loading, error: authError, signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Figyeljük az initialMode változását
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen);

    if (!newOpen) {
      // Reset forms when dialog closes
      setError(null);
      setSuccess(null);
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ email: '', password: '', confirmPassword: '', fullName: '' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginForm.email || !loginForm.password) {
      setError('Kérjük töltse ki az összes mezőt');
      return;
    }

    console.log('🔐 LoginDialog - Attempting login for:', loginForm.email);
    const result = await signIn(loginForm.email, loginForm.password);

    if (result.success) {
      setSuccess('Sikeres bejelentkezés! Átirányítás a dashboard-ra...');
      console.log('✅ LoginDialog - Login successful, closing dialog');
      // Dialog bezárása - az átirányítás a AuthProvider-ben történik
      setTimeout(() => {
        handleOpenChange(false);
      }, 1000);
    } else {
      setError(result.error || 'Hibás email vagy jelszó');
      console.error('❌ LoginDialog - Login failed:', result.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.fullName) {
      setError('Kérjük töltse ki az összes mezőt');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
      return;
    }

    const result = await signUp(registerForm.email, registerForm.password, registerForm.fullName);

    if (result.success) {
      setSuccess('Regisztráció sikeres! Ellenőrizze az email fiókját a megerősítéshez.');
      setActiveTab('login');
    } else {
      setError(result.error || 'Hiba történt a regisztrálás során');
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || 'Hiba történt a Google bejelentkezés során');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LogIn className="h-5 w-5 text-primary" />
            <span>Bejelentkezés / Regisztráció</span>
          </DialogTitle>
          <DialogDescription>
            Jelentkezzen be vagy hozzon létre új fiókot a ProTipp V2 használatához
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'login' | 'register');
          onModeChange?.(value as 'login' | 'register');
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Bejelentkezés</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Regisztráció</span>
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email cím</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Jelszó</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Teljes név</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Kovács János"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email cím</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="email@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Jelszó</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Jelszó megerősítése</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Regisztráció...' : 'Fiók létrehozása'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Google Auth */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">vagy</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full"
        >
          <Chrome className="h-4 w-4 mr-2" />
          Bejelentkezés Google-lel
        </Button>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 text-green-700 bg-green-50/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
