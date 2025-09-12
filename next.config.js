/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  
  // Bundle Size Optimization - Production Build Configuration
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  // React DevTools letiltása hydration hibák elkerülésére
  env: {
    REACT_APP_DISABLE_DEVTOOLS: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
  
  // Production optimizations
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Bundle optimization - Enhanced for <1MB target
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react', 
      'recharts',
      '@tanstack/react-query',
      'date-fns'
    ],
    // Enable modern bundling features
    esmExternals: true,
  },
  
  // Server external packages (moved from experimental)
  serverExternalPackages: ['@supabase/supabase-js'],
  // turbopack: {
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js',
  //     },
  //   },
  //   // HMR hibák javítása
  //   resolveAlias: {
  //     // Error boundary modulok stabilizálása
  //     'next/dist/client/components/error-boundary': 'next/dist/client/components/error-boundary.js',
  //   },
  // },
  // Polyfills for cross-browser compatibility
  transpilePackages: ['core-js', 'regenerator-runtime'],

  // Webpack optimizations - Bundle Size Optimization
  webpack: (config, { dev, isServer }) => {
    // Add polyfills for older browsers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "core-js": require.resolve("core-js"),
        "regenerator-runtime": require.resolve("regenerator-runtime"),
      };
    }
    // Bundle analyzer (only when ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html',
        })
      );
    }

    // Production optimizations for <1MB bundle size target
    if (!dev && !isServer) {
      // Disable source maps in production
      config.devtool = false;
      
      // Enhanced tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.providedExports = true;
      
      // Advanced split chunks optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000, // 20KB minimum chunk size
        maxSize: 200000, // 200KB maximum chunk size
        cacheGroups: {
          // Vendor chunks with size limits
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 200000, // 200KB limit per vendor chunk
            enforce: true,
          },
          // Supabase specific chunk
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 15,
            maxSize: 150000, // 150KB limit for Supabase
            enforce: true,
          },
          // UI library chunks
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 12,
            maxSize: 100000, // 100KB limit for UI libraries
            enforce: true,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            maxSize: 100000, // 100KB limit for common chunks
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
      
      // Module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
      
      // Remove console logs in production
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        })
      );
    }

    return config;
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
