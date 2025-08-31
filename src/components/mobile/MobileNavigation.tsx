"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  User,
  Menu,
  X,
  Bell
} from "lucide-react";

interface MobileNavigationProps {
  className?: string;
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "home", label: "Főoldal", icon: Home, route: "/" },
  { id: "arbitrage", label: "Arbitrage", icon: TrendingUp, route: "/arbitrage" },
  { id: "analytics", label: "Analytics", icon: BarChart3, route: "/analytics" },
  { id: "profile", label: "Profil", icon: User, route: "/profile" },
  { id: "settings", label: "Beállítások", icon: Settings, route: "/settings" },
];

export function MobileNavigation({
  className,
  onNavigate,
  currentRoute = "/",
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (route: string) => {
    onNavigate?.(route);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobil Top Navigation */}
      <div className={cn("flex items-center justify-between p-4", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-purple-400" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            ProTipp
          </span>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobil Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-background border-r border-border/40 shadow-lg">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <span className="font-semibold text-lg">Menü</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.route;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-12 text-left",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleNavClick(item.route)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary-foreground text-primary text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </nav>

              {/* Menu Footer */}
              <div className="p-4 border-t border-border/40">
                <div className="text-xs text-muted-foreground text-center">
                  ProTipp V2 Mobile
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <Card className="mx-4 mb-4 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex items-center justify-around p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center space-y-1 h-auto p-2",
                    isActive && "text-primary"
                  )}
                  onClick={() => handleNavClick(item.route)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </Card>
      </div>
    </>
  );
}
