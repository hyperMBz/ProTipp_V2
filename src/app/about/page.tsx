import { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { getPageMetadata } from '@/lib/seo/page-metadata';
import { generateStructuredData, commonStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = getPageMetadata('about');

export default function About() {
  const structuredDataScript = commonStructuredData.about
    .map(data => generateStructuredData(data))
    .join('\n');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredDataScript
        }}
      />
      <AboutPage />
    </>
  );
}
