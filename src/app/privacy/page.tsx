import { Metadata } from 'next';
import { PrivacyPage } from '@/components/pages/PrivacyPage';
import { getPageMetadata } from '@/lib/seo/page-metadata';
import { createArticleStructuredData, generateStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = getPageMetadata('privacy');

export default function Privacy() {
  const articleStructuredData = createArticleStructuredData({
    title: 'Adatvédelmi Tájékoztató',
    description: 'GDPR-megfelelő adatvédelmi tájékoztató a ProTipp V2 platform használatához.',
    author: 'ProTipp Technologies Kft.',
    datePublished: '2024-12-19',
    dateModified: '2024-12-19',
    url: '/privacy'
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
      <PrivacyPage />
    </>
  );
}
