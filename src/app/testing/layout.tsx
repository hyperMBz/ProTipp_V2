/**
 * Testing Layout for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Layout configuration for testing pages
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testing Dashboard - ProTipp V2',
  description: 'Comprehensive testing and quality assurance dashboard for ProTipp V2 platform',
};

export default function TestingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
