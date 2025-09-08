"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/unified-auth-provider";
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  User, 
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
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: "Áttekintés és gyors műveletek"
  },
  {
    href: "/arbitrage",
    label: "Arbitrage",
    icon: <TrendingUp className="h-4 w-4" />,
    description: "Arbitrage lehetőségek"
  },
  {
    href: "/ev-betting",
    label: "EV Betting",
    icon: <Target className="h-4 w-4" />,
    description: "Value betting keresés"
  },
  {
    href: "/bet-tracker",
    label: "Bet Tracker",
    icon: <History className="h-4 w-4" />,
    description: "Fogadás követés"
  },
  {
    href: "/calculator",
    label: "Kalkulátor",
    icon: <Calculator className="h-4 w-4" />,
    description: "Profit számítás"
  },
  {
    href: "/odds",
    label: "Odds",
    icon: <Activity className="h-4 w-4" />,
    description: "Valós idejű odds"
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4" />,
    description: "Értesítések"
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Részletes elemzések"
  },
  {
    href: "/settings",
    label: "Beállítások",
    icon: <Settings className="h-4 w-4" />,
    description: "Profil és alkalmazás beállítások"
  }
];

const publicNavigationItems: NavigationItem[] = [
  {
    href: "/about",
    label: "Rólunk",
    icon: <Info className="h-4 w-4" />,
    description: "Cégről és csapatról"
  },
  {
    href: "/contact",
    label: "Kapcsolat",
    icon: <Mail className="h-4 w-4" />,
    description: "Vegye fel velünk a kapcsolatot"
  }
];

const legalNavigationItems: NavigationItem[] = [
  {
    href: "/terms",
    label: "ÁSZF",
    icon: <FileText className="h-4 w-4" />,
    description: "Általános Szerződési Feltételek"
  },
  {
    href: "/privacy",
    label: "Adatvédelem",
    icon: <Shield className="h-4 w-4" />,
    description: "Adatvédelmi Tájékoztató"
  }
];

interface MainNavigationProps {
  className?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export function MainNavigation({ 
  className, 
  showMobileMenu = false, 
  onMobileMenuToggle 
}: MainNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loading } = useAuth();

  // Ha loading állapotban van vagy nincs bejelentkezve, ne jelenjen meg a navigáció
  if (loading || !user) {
    return null; // Teljesen elrejtjük a navigációt, hogy ne legyen flash effect
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
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Separator */}
          <div className="border-t border-border my-4"></div>

          {/* Public Pages */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
              Információk
            </p>
            {publicNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Legal Pages */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
              Jogi információk
            </p>
            {legalNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-green-400/10 border border-green-400/20 rounded-md">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs font-medium">Online</span>
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Értesítések
          </Button>
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
            <h1 className="text-lg font-bold gradient-text">ProTipp</h1>
          </div>
          
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="p-4 space-y-4 border-b border-border max-h-screen overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onMobileMenuToggle}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-12",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <div className="border-t border-border"></div>

            {/* Public Pages */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-2">
                Információk
              </p>
              {publicNavigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onMobileMenuToggle}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <div className="flex-1 text-left">
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Legal Pages */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-2">
                Jogi információk
              </p>
              {legalNavigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onMobileMenuToggle}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <div className="flex-1 text-left">
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                      </div>
                    </Button>
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

// Breadcrumb Navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground">/</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
