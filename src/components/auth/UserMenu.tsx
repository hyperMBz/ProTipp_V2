"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { LoginDialog } from './LoginDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, User, Settings, CreditCard, BarChart3, Loader2 } from "lucide-react";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await signOut();

    if (error) {
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
    // For now, everyone is free tier
    // Later this will come from user profile
    return (
      <Badge variant="secondary" className="text-xs">
        Ingyenes
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
      <LoginDialog>
        <Button variant="default" size="sm" className="flex items-center space-x-2">
          <LogIn className="h-4 w-4" />
          <span>Bejelentkezés</span>
        </Button>
      </LoginDialog>
    );
  }

  // User is logged in
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || user.email || 'User'}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(user.user_metadata?.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || 'Felhasználó'}
              </p>
              {getSubscriptionBadge()}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Statisztikák</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Beállítások</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Előfizetés</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleSignOut}
          disabled={isSigningOut}
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
