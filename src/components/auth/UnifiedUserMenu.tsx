"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth/unified-auth-provider';
import { UnifiedLoginDialog } from './UnifiedLoginDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, User, Settings, CreditCard, BarChart3, Loader2, TrendingUp } from "lucide-react";

export function UnifiedUserMenu() {
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }

    setIsSigningOut(false);
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }

    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return 'U';
  };

  const getSubscriptionBadge = () => {
    if (!user) return null;

    const tierColors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
    };

    const tierLabels = {
      free: 'Ingyenes',
      pro: 'Pro',
      premium: 'Premium',
    };

    return (
      <Badge 
        variant="secondary" 
        className={`text-xs ${tierColors[user.subscription_tier]}`}
      >
        {tierLabels[user.subscription_tier]}
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <UnifiedLoginDialog>
        <Button variant="default" size="sm" className="flex items-center space-x-2">
          <LogIn className="h-4 w-4" />
          <span>Bejelentkezés</span>
        </Button>
      </UnifiedLoginDialog>
    );
  }

  // User is logged in
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials(user.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.full_name || 'Felhasználó'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              {getSubscriptionBadge()}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Statisztikák</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>Teljesítmény</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Beállítások</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Előfizetés</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600"
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Kijelentkezés</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
