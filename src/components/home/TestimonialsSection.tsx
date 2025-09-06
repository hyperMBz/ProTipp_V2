"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Kovács Péter",
      position: "Amatőr fogadó",
      rating: 5,
      content: "A ProTipp V2 segítségével már 3 hónap alatt 15% profitot értem el. A platform egyszerűen használható és valós idejű adatokat szolgáltat."
    },
    {
      name: "Nagy Anna", 
      position: "Veterán fogadó",
      rating: 5,
      content: "A legjobb arbitrage platform, amit valaha használtam. A kalkulátor funkciók és a fogadáskövető rendszer nélkülözhetetlen."
    },
    {
      name: "Szabó Gábor",
      position: "Profi fogadó", 
      rating: 5,
      content: "Professzionális eszközök, amikor a legjobb odds-okat keressük. A real-time frissítések és a szűrési lehetőségek kiválóak."
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? "text-yellow-400 fill-yellow-400" 
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Felhasználói Vélemények
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lássa, mit mondanak a felhasználók a ProTipp V2-ről
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar placeholder */}
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.position}
                    </p>
                    
                    {/* Csillagos értékelés */}
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <blockquote className="text-muted-foreground italic">
                  "{testimonial.content}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
