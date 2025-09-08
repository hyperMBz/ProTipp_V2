import { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Bet Tracker | ProTipp V2',
  description: 'Kövesse fogadásait és elemezze teljesítményét. Részletes bet tracking rendszer profit optimalizáláshoz.',
  keywords: ['bet tracker', 'fogadás követés', 'profit elemzés', 'betting history'],
  openGraph: {
    title: 'Bet Tracker | ProTipp V2',
    description: 'Kövesse fogadásait és elemezze teljesítményét.',
    type: 'website',
  },
};

// Dynamic import for Bet Tracker to reduce initial bundle size
const BetTrackerPageContent = dynamic(() => import('@/components/pages/BetTrackerPageContent').then(mod => ({ default: mod.BetTrackerPageContent })), {
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Bet Tracker betöltése...</p>
      </div>
    </div>
  )
});

export default function BetTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <BetTrackerPageContent />
    </div>
  );
}
