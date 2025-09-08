"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/unified-auth-provider';
import { UnifiedUserMenu } from '@/components/auth/UnifiedUserMenu';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Bell,
  Menu,
  X,
  Zap,
  Target,
  Calendar,
  Users,
  Award,
  Info,
  Mail,
  FileText,
  Shield,
  Calculator,
  Activity,
  History,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "Főoldal és áttekintés"
  },
  {
    href: "/arbitrage",
    label: "Arbitrage",
    icon: <TrendingUp className="h-5 w-5" />,
    badge: "ÚJ",
    description: "Arbitrage lehetőségek"
  },
  {
    href: "/ev-betting",
    label: "EV Betting",
    icon: <Target className="h-5 w-5" />,
    description: "Expected Value fogadások"
  },
  {
    href: "/bet-tracker",
    label: "Fogadás Követő",
    icon: <History className="h-5 w-5" />,
    description: "Fogadások nyomon követése"
  },
  {
    href: "/calculator",
    label: "Kalkulátor",
    icon: <Calculator className="h-5 w-5" />,
    description: "Profit és kockázat számítás"
  },
  {
    href: "/odds",
    label: "Odds Összehasonlítás",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Valós idejű odds"
  },
  {
    href: "/alerts",
    label: "Értesítések",
    icon: <Bell className="h-5 w-5" />,
    description: "Arbitrage riasztások"
  },
  {
    href: "/analytics",
    label: "Analitika",
    icon: <Activity className="h-5 w-5" />,
    description: "Teljesítmény elemzés"
  }
];

const secondaryNavigationItems: NavigationItem[] = [
  {
    href: "/settings",
    label: "Beállítások",
    icon: <Settings className="h-5 w-5" />,
    description: "Fiók és alkalmazás beállítások"
  },
  {
    href: "/about",
    label: "Rólunk",
    icon: <Info className="h-5 w-5" />,
    description: "Információk a platformról"
  },
  {
    href: "/contact",
    label: "Kapcsolat",
    icon: <Mail className="h-5 w-5" />,
    description: "Segítség és támogatás"
  },
  {
    href: "/terms",
    label: "Felhasználási feltételek",
    icon: <FileText className="h-5 w-5" />,
    description: "Jogi információk"
  },
  {
    href: "/privacy",
    label: "Adatvédelem",
    icon: <Shield className="h-5 w-5" />,
    description: "Adatvédelmi szabályzat"
  }
];

interface UnifiedNavigationProps {
  className?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export function UnifiedNavigation({ 
  className, 
  showMobileMenu = false, 
  onMobileMenuToggle 
}: UnifiedNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loading } = useAuth();

  // Ha loading állapotban van vagy nincs bejelentkezve, ne jelenjen meg a navigáció
  if (loading || !user) {
    return null;
  }

  return (
    <nav className={cn("bg-card border-r border-border", className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold gradient-text">ProTipp</h1>
              <p className="text-xs text-muted-foreground">V2</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
                title={item.description}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            {secondaryNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  title={item.description}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.full_name || 'Felhasználó'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <UnifiedUserMenu />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">ProTipp</h1>
              <p className="text-xs text-muted-foreground">V2</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <UnifiedUserMenu />
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="md:hidden"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="border-b border-border">
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={onMobileMenuToggle}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
