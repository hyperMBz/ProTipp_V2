import { Metadata } from 'next';
import { CalculatorPageContent } from '@/components/pages/CalculatorPageContent';

export const metadata: Metadata = {
  title: 'Profit Kalkulátor | ProTipp V2',
  description: 'Számítsa ki a profitot és tét elosztást arbitrage és value betting fogadásokhoz. Professzionális kalkulátor eszközök.',
  keywords: ['profit kalkulátor', 'tét elosztás', 'arbitrage számítás', 'betting kalkulátor'],
  openGraph: {
    title: 'Profit Kalkulátor | ProTipp V2',
    description: 'Számítsa ki a profitot és tét elosztást.',
    type: 'website',
  },
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <CalculatorPageContent />
    </div>
  );
}
