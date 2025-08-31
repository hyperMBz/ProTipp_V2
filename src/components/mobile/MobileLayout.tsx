"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  fullHeight?: boolean;
}

export function MobileLayout({
  children,
  className,
  showHeader = true,
  showFooter = true,
  fullHeight = true,
}: MobileLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-screen bg-background",
        fullHeight && "h-screen",
        className
      )}
    >
      {/* Mobil Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center px-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-purple-400" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                ProTipp
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Mobil Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          {children}
        </div>
      </main>

      {/* Mobil Footer */}
      {showFooter && (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-12 max-w-screen-2xl items-center justify-between px-4">
            <span className="text-sm text-muted-foreground">
              © 2024 ProTipp V2
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">
                Mobile Optimized
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
