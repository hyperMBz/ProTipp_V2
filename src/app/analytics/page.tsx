"use client";

import { AnalyticsDashboard } from "@/components/analytics";
import { useAuth } from "@/lib/hooks/use-auth";

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