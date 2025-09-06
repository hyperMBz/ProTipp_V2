import { Metadata } from 'next';
import { ArbitragePageContent } from '@/components/pages/ArbitragePageContent';

export const metadata: Metadata = {
  title: 'Arbitrage Lehetőségek | ProTipp V2',
  description: 'Fedezd fel a legjobb arbitrage lehetőségeket valós idejű adatokkal. Profi szintű arbitrage keresés és elemzés.',
  keywords: ['arbitrage', 'fogadás', 'profit', 'valós idejű', 'odds'],
  openGraph: {
    title: 'Arbitrage Lehetőségek | ProTipp V2',
    description: 'Fedezd fel a legjobb arbitrage lehetőségeket valós idejű adatokkal.',
    type: 'website',
  },
};

export default function ArbitragePage() {
  return (
    <div className="min-h-screen bg-background">
      <ArbitragePageContent />
    </div>
  );
}
