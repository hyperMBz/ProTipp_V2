"use client";

import { Metadata } from "next";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { handleHashNavigation } from "@/lib/utils";
import { usePerformance } from "@/hooks/use-performance";

// Lazy load components for better performance
const HeroSection = lazy(() => import("@/components/home").then(module => ({ default: module.HeroSection })));
const FeaturesSection = lazy(() => import("@/components/home").then(module => ({ default: module.FeaturesSection })));
const HowItWorksSection = lazy(() => import("@/components/home").then(module => ({ default: module.HowItWorksSection })));
const TestimonialsSection = lazy(() => import("@/components/home").then(module => ({ default: module.TestimonialsSection })));
const StatsSection = lazy(() => import("@/components/home").then(module => ({ default: module.StatsSection })));
const CallToActionSection = lazy(() => import("@/components/home").then(module => ({ default: module.CallToActionSection })));

// Loading component
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}


// Client component for homepage with performance monitoring
function HomePageContent() {
  const { metrics, getOverallScore, getPerformanceGrade } = usePerformance();

  // Handle hash navigation on mount and when hash changes
  useEffect(() => {
    handleHashNavigation();

    const handleHashChange = () => {
      handleHashNavigation();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Development-only performance overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
          <div className="text-sm font-bold mb-2">Performance Metrics</div>
          <div>FCP: {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : '...'}</div>
          <div>LCP: {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : '...'}</div>
          <div>FID: {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : '...'}</div>
          <div>CLS: {metrics.cls ? metrics.cls.toFixed(4) : '...'}</div>
          <div>TTFB: {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : '...'}</div>
          <div className="mt-2 font-bold">
            Score: {getOverallScore()} ({getPerformanceGrade(getOverallScore())})
          </div>
        </div>
      )}

      {/* Hero section loads immediately */}
      <Suspense fallback={<SectionLoader />}>
        <HeroSection />
      </Suspense>

      {/* Features section with lazy loading */}
      <Suspense fallback={<SectionLoader />}>
        <section id="features">
          <FeaturesSection />
        </section>
      </Suspense>

      {/* How it works section with lazy loading */}
      <Suspense fallback={<SectionLoader />}>
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
      </Suspense>

      {/* Testimonials section with lazy loading */}
      <Suspense fallback={<SectionLoader />}>
        <section id="testimonials">
          <TestimonialsSection />
        </section>
      </Suspense>

      {/* Stats section with lazy loading */}
      <Suspense fallback={<SectionLoader />}>
        <section id="stats">
          <StatsSection />
        </section>
      </Suspense>

      {/* Call to action section with lazy loading */}
      <Suspense fallback={<SectionLoader />}>
        <section id="cta">
          <CallToActionSection />
        </section>
      </Suspense>
    </div>
  );
}

export default function HomePage() {
  return <HomePageContent />;
}