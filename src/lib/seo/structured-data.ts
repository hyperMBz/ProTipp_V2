export interface StructuredDataConfig {
  type: 'WebSite' | 'Organization' | 'Article' | 'FAQPage' | 'BreadcrumbList' | 'SoftwareApplication';
  data: Record<string, any>;
}

export function generateStructuredData(config: StructuredDataConfig): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": config.type,
    ...config.data
  };
  
  return JSON.stringify(structuredData, null, 2);
}

export function createWebSiteStructuredData(): StructuredDataConfig {
  return {
    type: 'WebSite',
    data: {
      "name": "ProTipp V2",
      "url": "https://protipp.hu",
      "description": "Professzionális arbitrage betting platform Magyarországon",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://protipp.hu/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ProTipp Technologies Kft.",
        "logo": {
          "@type": "ImageObject",
          "url": "https://protipp.hu/images/logo.png"
        }
      }
    }
  };
}

export function createSoftwareApplicationStructuredData(): StructuredDataConfig {
  return {
    type: 'SoftwareApplication',
    data: {
      "name": "ProTipp V2",
      "description": "Professzionális arbitrage betting platform valós idejű odds összehasonlítással és automatikus arbitrage detektálással",
      "url": "https://protipp.hu",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "HUF",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "Organization",
        "name": "ProTipp Technologies Kft."
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "Valós idejű odds összehasonlítás",
        "Automatikus arbitrage detektálás",
        "Professzionális analytics dashboard",
        "50+ támogatott fogadóiroda",
        "Mobil-optimalizált felület",
        "24/7 ügyfélszolgálat"
      ]
    }
  };
}

export function createOrganizationStructuredData(): StructuredDataConfig {
  return {
    type: 'Organization',
    data: {
      "name": "ProTipp Technologies Kft.",
      "alternateName": "ProTipp V2",
      "url": "https://protipp.hu",
      "logo": "https://protipp.hu/images/logo.png",
      "description": "Vezető arbitrage betting platform fejlesztő Magyarországon",
      "foundingDate": "2022",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Október 6. utca 7.",
        "addressLocality": "Budapest",
        "addressRegion": "Budapest",
        "postalCode": "1051",
        "addressCountry": "HU"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+36-1-234-5678",
          "contactType": "customer service",
          "email": "support@protipp.hu",
          "availableLanguage": ["Hungarian", "English"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday", "Tuesday", "Wednesday", "Thursday", 
              "Friday", "Saturday", "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          }
        },
        {
          "@type": "ContactPoint",
          "contactType": "technical support",
          "email": "tech@protipp.hu",
          "availableLanguage": ["Hungarian", "English"]
        },
        {
          "@type": "ContactPoint",
          "contactType": "billing support",
          "email": "billing@protipp.hu",
          "availableLanguage": "Hungarian"
        }
      ],
      "sameAs": [
        "https://facebook.com/protipp",
        "https://twitter.com/protipp_hu",
        "https://linkedin.com/company/protipp",
        "https://instagram.com/protipp_official"
      ],
      "knowsAbout": [
        "Arbitrage Betting",
        "Sports Betting Analytics",
        "Odds Comparison",
        "Risk Management",
        "Financial Technology",
        "Real-time Data Processing"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Hungary"
      },
      "serviceType": "Software as a Service (SaaS)",
      "industry": "Financial Technology"
    }
  };
}

export function createArticleStructuredData(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}): StructuredDataConfig {
  return {
    type: 'Article',
    data: {
      "headline": article.title,
      "description": article.description,
      "author": {
        "@type": "Organization",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "ProTipp Technologies Kft.",
        "logo": {
          "@type": "ImageObject",
          "url": "https://protipp.hu/images/logo.png"
        }
      },
      "datePublished": article.datePublished,
      "dateModified": article.dateModified || article.datePublished,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": article.url
      },
      ...(article.image && {
        "image": {
          "@type": "ImageObject",
          "url": article.image,
          "width": 1200,
          "height": 630
        }
      })
    }
  };
}

export function createBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url?: string;
}>): StructuredDataConfig {
  return {
    type: 'BreadcrumbList',
    data: {
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        ...(crumb.url && { "item": `https://protipp.hu${crumb.url}` })
      }))
    }
  };
}

export function createFAQStructuredData(faqs: Array<{
  question: string;
  answer: string;
}>): StructuredDataConfig {
  return {
    type: 'FAQPage',
    data: {
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  };
}

export function createServiceStructuredData(): StructuredDataConfig {
  return {
    type: 'Organization', // Using Organization as base type for services
    data: {
      "name": "ProTipp V2 Arbitrage Betting Service",
      "provider": {
        "@type": "Organization",
        "name": "ProTipp Technologies Kft."
      },
      "description": "Professzionális arbitrage betting platform szolgáltatások",
      "serviceType": "Financial Technology Service",
      "areaServed": {
        "@type": "Country",
        "name": "Hungary"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "ProTipp V2 Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Basic Plan",
              "description": "Alapszintű arbitrage betting szolgáltatások"
            },
            "price": "9990",
            "priceCurrency": "HUF",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "9990",
              "priceCurrency": "HUF",
              "billingPeriod": "P1M"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Premium Plan",
              "description": "Professzionális arbitrage betting szolgáltatások"
            },
            "price": "19990",
            "priceCurrency": "HUF",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "19990",
              "priceCurrency": "HUF",
              "billingPeriod": "P1M"
            }
          }
        ]
      }
    }
  };
}

// Utility function to inject structured data into page head
export function injectStructuredData(structuredData: StructuredDataConfig[]): string {
  return structuredData
    .map(data => generateStructuredData(data))
    .join('\n');
}

// Common structured data combinations for different page types
export const commonStructuredData = {
  homepage: [
    createWebSiteStructuredData(),
    createOrganizationStructuredData(),
    createSoftwareApplicationStructuredData()
  ],
  
  about: [
    createOrganizationStructuredData()
  ],
  
  contact: [
    createOrganizationStructuredData()
  ],
  
  service: [
    createServiceStructuredData(),
    createOrganizationStructuredData()
  ]
};
