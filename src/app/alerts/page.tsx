import { Metadata } from 'next';
import { AlertsPageContent } from '@/components/pages/AlertsPageContent';

export const metadata: Metadata = {
  title: 'Értesítések | ProTipp V2',
  description: 'Értesítési beállítások és alert előzmények. Személyre szabott értesítések arbitrage és value betting lehetőségekről.',
  keywords: ['értesítések', 'alerts', 'email', 'push notification', 'arbitrage alerts'],
  openGraph: {
    title: 'Értesítések | ProTipp V2',
    description: 'Személyre szabott értesítések arbitrage lehetőségekről.',
    type: 'website',
  },
};

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AlertsPageContent />
    </div>
  );
}
