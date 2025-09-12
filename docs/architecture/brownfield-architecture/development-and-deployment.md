# Development and Deployment

## Local Development Setup

**Actual working steps:**
1. `bun install` - Install dependencies with Bun
2. `bun run dev` - Start development server (Turbopack enabled)
3. Environment variables in `.env.local`
4. Supabase local or cloud instance required

**Known issues:**
- Bundle size warnings during development
- TypeScript errors ignored for faster iteration
- Some mobile components need browser testing

## Build and Deployment Process

**Current Build Process:**
- **Build Command**: `bun run build` (Next.js with custom optimizations)
- **Optimization**: Custom scripts for bundle analysis and Lighthouse
- **Deployment**: Netlify with build hooks
- **Environment**: Single environment (production)

**Build Scripts:**
- `scripts/netlify-build-optimization.js` - Bundle optimization
- `scripts/lighthouse-optimization.js` - Performance testing
- `scripts/performance-monitor.js` - Real-time monitoring
