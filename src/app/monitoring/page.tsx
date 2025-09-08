import { Metadata } from 'next';
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard';

export const metadata: Metadata = {
  title: 'Performance Monitoring | ProTipp V2',
  description: 'Monitor and analyze your application\'s performance metrics',
  robots: 'noindex, nofollow', // Don't index monitoring pages
};

export default function MonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PerformanceDashboard />
    </div>
  );
}
