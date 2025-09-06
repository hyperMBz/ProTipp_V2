"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, History, CreditCard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileNavigation() {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/profile",
      label: "Profil áttekintés",
      icon: <User className="h-4 w-4" />,
    },
    {
      href: "/profile/settings",
      label: "Beállítások",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      href: "/profile/history",
      label: "Fogadási előzmények",
      icon: <History className="h-4 w-4" />,
    },
    {
      href: "/profile/subscriptions",
      label: "Előfizetések",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Profil összefoglaló */}
          <div className="text-center space-y-4">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              <Badge variant="secondary" className="mt-2">Premium</Badge>
            </div>
          </div>
          
          <Separator />
          
          {/* Navigációs menü */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </CardContent>
    </Card>
  );
}
