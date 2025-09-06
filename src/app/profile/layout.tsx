"use client";

import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, History, CreditCard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profil navigáció */}
        <Card className="lg:col-span-1 h-fit">
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
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profil áttekintés
                  </Button>
                </Link>
                
                <Link href="/profile/settings">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Beállítások
                  </Button>
                </Link>
                
                <Link href="/profile/history">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Fogadási előzmények
                  </Button>
                </Link>
                
                <Link href="/profile/subscriptions">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Előfizetések
                  </Button>
                </Link>
              </nav>
            </div>
          </CardContent>
        </Card>
        
        {/* Fő tartalom */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
