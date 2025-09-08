"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/hooks/use-auth";

// Dynamic import for Analytics Dashboard to reduce initial bundle size
const AnalyticsDashboard = dynamic(() => import("@/components/analytics").then(mod => ({ default: mod.AnalyticsDashboard })), {
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Analytics betöltése...</p>
      </div>
    </div>
  ),
  ssr: false
});

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Betöltés...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Bejelentkezés szükséges</h1>
          <p className="text-muted-foreground">
            Az analytics oldal megtekintéséhez be kell jelentkezned.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard userId={user.id} />
    </div>
  );
}