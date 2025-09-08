import { Metadata } from 'next';
import { SettingsPageContent } from '@/components/pages/SettingsPageContent';

export const metadata: Metadata = {
  title: 'Beállítások & Profil | ProTipp V2',
  description: 'Felhasználói profil, beállítások és alkalmazás konfiguráció. Személyre szabd a ProTipp V2 platformot.',
  keywords: ['beállítások', 'profil', 'konfiguráció', 'felhasználó', 'személyre szabás'],
  openGraph: {
    title: 'Beállítások & Profil | ProTipp V2',
    description: 'Felhasználói profil és alkalmazás beállítások.',
    type: 'website',
  },
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SettingsPageContent />
    </div>
  );
}
