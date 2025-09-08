import { Metadata } from 'next';
import { OddsPageContent } from '@/components/pages/OddsPageContent';

export const metadata: Metadata = {
  title: 'Valós Idejű Odds | ProTipp V2',
  description: 'Valós idejű odds összehasonlítás több fogadóiroda között. Legfrissebb odds adatok és piac elemzés.',
  keywords: ['odds', 'valós idejű', 'odds összehasonlítás', 'fogadóiroda', 'piac elemzés'],
  openGraph: {
    title: 'Valós Idejű Odds | ProTipp V2',
    description: 'Valós idejű odds összehasonlítás több fogadóiroda között.',
    type: 'website',
  },
};

export default function OddsPage() {
  return (
    <div className="min-h-screen bg-background">
      <OddsPageContent />
    </div>
  );
}
