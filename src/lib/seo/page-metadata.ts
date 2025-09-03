import { Metadata } from 'next';

export interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle: string;
  locale: string;
}

const defaultSEOConfig: SEOConfig = {
  siteName: 'ProTipp V2',
  siteUrl: 'https://protipp.hu',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@protipp_hu',
  locale: 'hu_HU'
};

export function generateMetadata(config: PageMetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage,
    canonicalUrl,
    noIndex = false,
    structuredData
  } = config;

  const fullTitle = title.includes('ProTipp') ? title : `${title} | ${defaultSEOConfig.siteName}`;
  const imageUrl = ogImage || defaultSEOConfig.defaultImage;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${defaultSEOConfig.siteUrl}${imageUrl}`;
  const fullCanonicalUrl = canonicalUrl || `${defaultSEOConfig.siteUrl}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Basic meta tags
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullCanonicalUrl,
      siteName: defaultSEOConfig.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: defaultSEOConfig.locale,
      type: 'website'
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImageUrl],
      creator: defaultSEOConfig.twitterHandle,
      site: defaultSEOConfig.twitterHandle
    },
    
    // Canonical URL
    alternates: {
      canonical: fullCanonicalUrl
    }
  };

  return metadata;
}

export const pageMetadata = {
  home: {
    title: 'ProTipp V2 - Professzionális Arbitrage Betting Platform',
    description: 'A legfejlettebb arbitrage betting platform Magyarországon. Valós idejű odds összehasonlítás, automatikus arbitrage detektálás és professzionális analytics.',
    keywords: ['arbitrage betting', 'sportfogadás', 'odds összehasonlítás', 'fogadási stratégia', 'betting analytics'],
    ogImage: '/images/og-home.jpg'
  },
  
  about: {
    title: 'Rólunk - ProTipp V2',
    description: 'Ismerd meg a ProTipp V2 csapatát és küldetését. Professzionális arbitrage betting platform több mint 10,000 aktív felhasználóval.',
    keywords: ['ProTipp csapat', 'arbitrage betting platform', 'sportfogadás szakértők'],
    ogImage: '/images/og-about.jpg'
  },
  
  contact: {
    title: 'Kapcsolat - ProTipp V2',
    description: 'Vedd fel velünk a kapcsolatot! 24/7 támogatás, technikai segítség és szakmai tanácsadás arbitrage betting témában.',
    keywords: ['kapcsolat', 'ügyfélszolgálat', 'támogatás', 'ProTipp'],
    ogImage: '/images/og-contact.jpg'
  },
  
  terms: {
    title: 'Általános Szerződési Feltételek - ProTipp V2',
    description: 'A ProTipp V2 platform használatára vonatkozó általános szerződési feltételek és felhasználói kötelezettségek.',
    keywords: ['ÁSZF', 'szerződési feltételek', 'felhasználói feltételek'],
    noIndex: false // Legal pages should be indexed
  },
  
  privacy: {
    title: 'Adatvédelmi Tájékoztató - ProTipp V2',
    description: 'GDPR-megfelelő adatvédelmi tájékoztató. Tudj meg mindent arról, hogyan kezeljük és védjük személyes adataidat.',
    keywords: ['adatvédelem', 'GDPR', 'személyes adatok', 'cookie szabályzat'],
    noIndex: false // Legal pages should be indexed
  },
  
  dashboard: {
    title: 'Dashboard - ProTipp V2',
    description: 'Professzionális arbitrage betting dashboard. Valós idejű arbitrage lehetőségek, részletes analytics és teljesítmény tracking.',
    keywords: ['arbitrage dashboard', 'betting analytics', 'odds monitoring'],
    noIndex: true // Private pages should not be indexed
  },
  
  arbitrage: {
    title: 'Arbitrage Lehetőségek - ProTipp V2',
    description: 'Aktuális arbitrage betting lehetőségek valós időben. Automatikus detektálás több mint 50 fogadóiroda odds-ai alapján.',
    keywords: ['arbitrage lehetőségek', 'sure bet', 'risk-free betting'],
    noIndex: true // Dynamic content, should not be indexed
  },
  
  analytics: {
    title: 'Analytics - ProTipp V2',
    description: 'Részletes betting analytics és statisztikák. ROI tracking, profit elemzés és teljesítmény optimalizálás.',
    keywords: ['betting analytics', 'ROI tracking', 'profit analysis'],
    noIndex: true // Private analytics should not be indexed
  },
  
  profile: {
    title: 'Profil - ProTipp V2',
    description: 'Felhasználói profil kezelése, beállítások és személyes statisztikák megtekintése.',
    keywords: ['felhasználói profil', 'beállítások', 'személyes statisztikák'],
    noIndex: true // Private profile should not be indexed
  }
};

export function getPageMetadata(page: keyof typeof pageMetadata): Metadata {
  const config = pageMetadata[page];
  return generateMetadata(config);
}

export function createBreadcrumbStructuredData(items: Array<{name: string, url?: string}>): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": `${defaultSEOConfig.siteUrl}${item.url}` })
    }))
  };
}

export function createFAQStructuredData(faqs: Array<{question: string, answer: string}>): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function createOrganizationStructuredData(): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": defaultSEOConfig.siteName,
    "url": defaultSEOConfig.siteUrl,
    "logo": `${defaultSEOConfig.siteUrl}/images/logo.png`,
    "description": "Professzionális arbitrage betting platform Magyarországon",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Október 6. utca 7.",
      "addressLocality": "Budapest",
      "postalCode": "1051",
      "addressCountry": "HU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+36-1-234-5678",
      "contactType": "customer service",
      "email": "support@protipp.hu",
      "availableLanguage": "Hungarian"
    },
    "sameAs": [
      "https://facebook.com/protipp",
      "https://twitter.com/protipp_hu",
      "https://linkedin.com/company/protipp"
    ]
  };
}
