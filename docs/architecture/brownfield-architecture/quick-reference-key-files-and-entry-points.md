# Quick Reference - Key Files and Entry Points

## Critical Files for Understanding the System

- **Main Entry**: `src/app/page.tsx` (Homepage with lazy loading)
- **Configuration**: `next.config.js`, `tailwind.config.ts`, `components.json`
- **Core Business Logic**: `src/lib/arbitrage-engine/`, `src/lib/api/`
- **API Definitions**: `src/app/api/v1/` (12 endpoint files)
- **UI Components**: `src/components/home/` (6 homepage sections)
- **Auth System**: `src/lib/auth/`, `src/components/auth/`
- **Key Algorithms**: `src/lib/arbitrage-engine/odds-comparison.ts`

## Homepage Sprint Impact Areas

**Files to be modified/enhanced:**
- `src/app/page.tsx` - Navigation flow and lazy loading optimization
- `src/components/home/*` - Mobile responsive and cross-browser fixes
- `src/lib/seo/` - Meta tags and Open Graph validation
- `src/components/navigation/` - CTA button routing validation
- `src/lib/performance/` - Lighthouse score optimization
