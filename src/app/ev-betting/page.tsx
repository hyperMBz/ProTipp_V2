import { Metadata } from 'next';
import { EVBettingPageContent } from '@/components/pages/EVBettingPageContent';

export const metadata: Metadata = {
  title: 'EV Betting | ProTipp V2',
  description: 'Fedezd fel a legjobb value betting lehetőségeket. EV (Expected Value) alapú fogadási stratégia és elemzés.',
  keywords: ['ev betting', 'value betting', 'expected value', 'fogadás', 'profit'],
  openGraph: {
    title: 'EV Betting | ProTipp V2',
    description: 'Fedezd fel a legjobb value betting lehetőségeket.',
    type: 'website',
  },
};

export default function EVBettingPage() {
  return (
    <div className="min-h-screen bg-background">
      <EVBettingPageContent />
    </div>
  );
}
