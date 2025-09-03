import { Metadata } from 'next';
import { TermsPage } from '@/components/pages/TermsPage';
import { getPageMetadata } from '@/lib/seo/page-metadata';
import { createArticleStructuredData, generateStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = getPageMetadata('terms');

export default function Terms() {
  const articleStructuredData = createArticleStructuredData({
    title: 'Általános Szerződési Feltételek',
    description: 'A ProTipp V2 platform használatára vonatkozó általános szerződési feltételek.',
    author: 'ProTipp Technologies Kft.',
    datePublished: '2024-12-19',
    dateModified: '2024-12-19',
    url: '/terms'
  });

  const structuredDataScript = generateStructuredData(articleStructuredData);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredDataScript
        }}
      />
      <TermsPage />
    </>
  );
}
