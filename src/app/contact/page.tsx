import { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';
import { getPageMetadata } from '@/lib/seo/page-metadata';
import { generateStructuredData, commonStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = getPageMetadata('contact');

export default function Contact() {
  const structuredDataScript = commonStructuredData.contact
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
      <ContactPage />
    </>
  );
}
