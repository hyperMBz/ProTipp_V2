import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#8b5cf6",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "ProTipp V2 - Professional Arbitrage Platform",
  description: "Professzionális sportszorzó arbitrage platform valós idejű odds összehasonlítással",
  keywords: ["arbitrage", "sports betting", "odds comparison", "profit calculator"],
  authors: [{ name: "ProTipp Team" }],
  creator: "ProTipp V2",
  publisher: "ProTipp V2",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://protip-v2.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProTipp V2 - Professional Arbitrage Platform",
    description: "Professzionális sportszorzó arbitrage platform valós idejű odds összehasonlítással",
    url: "/",
    siteName: "ProTipp V2",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProTipp V2 - Professional Arbitrage Platform",
      },
    ],
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTipp V2 - Professional Arbitrage Platform",
    description: "Professzionális sportszorzó arbitrage platform valós idejű odds összehasonlítással",
    images: ["/og-image.png"],
    creator: "@protip_v2",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  // PWA Meta Tags
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProTipp V2",
    startupImage: [
      {
        url: "/icons/apple-touch-startup-image-768x1004.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
      {
        url: "/icons/apple-touch-startup-image-1536x2008.png",
        media: "(device-width: 1536px) and (device-height: 2008px)",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ProTipp V2",
    "application-name": "ProTipp V2",
    "msapplication-TileColor": "#8b5cf6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className="dark" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#8b5cf6" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Mobile-specific meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProTipp V2" />
        
        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Performance optimizations */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* React DevTools letiltása hydration hibák elkerülésére */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // React DevTools letiltása development módban is
                if (process.env.NODE_ENV === 'development') {
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                    isDisabled: true,
                    supportsFiber: true,
                    inject: function() {},
                    onCommitFiberRoot: function() {},
                    onCommitFiberUnmount: function() {},
                  };
                }
                
                // data-react-source attribútumok eltávolítása
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-react-source') {
                      mutation.target.removeAttribute('data-react-source');
                    }
                  });
                });
                
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['data-react-source'],
                  subtree: true
                });
              }
            `,
          }}
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ProTipp V2",
              "description": "Professzionális sportszorzó arbitrage platform",
              "url": process.env.NEXT_PUBLIC_APP_URL || "https://protip-v2.vercel.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "HUF"
              },
              "author": {
                "@type": "Organization",
                "name": "ProTipp Team"
              }
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-background text-foreground flex">
              {/* Sidebar Navigation - csak bejelentkezett felhasználóknak */}
              <UnifiedNavigation className="hidden md:flex w-64 flex-shrink-0" />
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {children}
              </div>
            </div>
          </Providers>
        </ErrorBoundary>
        
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* PWA Install Prompt */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                // Custom event for PWA install prompt
                window.dispatchEvent(new CustomEvent('pwa:installPromptAvailable', { detail: { prompt: e } }));
              });
              
              window.addEventListener('appinstalled', () => {
                deferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa:appInstalled'));
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
