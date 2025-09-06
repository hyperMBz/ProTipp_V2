import { Metadata } from "next";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  StatsSection,
  CallToActionSection
} from "@/components/home";

export const metadata: Metadata = {
  title: "ProTipp V2 - Professzionális Arbitrage Platform | Ingyenes Regisztráció",
  description: "Fedezze fel a profitot a sportszorzó arbitrage lehetőségekből. Valós idejű odds összehasonlítás, kalkulátor és fogadáskövető rendszer.",
  keywords: ["arbitrage", "sports betting", "odds comparison", "profit calculator", "fogadás", "profit"],
  openGraph: {
    title: "ProTipp V2 - Professzionális Arbitrage Platform",
    description: "Valós idejű sportszorzó arbitrage lehetőségek egy helyen",
    images: ["/og-image-home.png"],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <StatsSection />
      <CallToActionSection />
    </div>
  );
}