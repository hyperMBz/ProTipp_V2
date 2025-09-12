# Technical Debt and Known Issues

## Critical Technical Debt

1. **Bundle Size Optimization**: Large bundle size affecting Lighthouse scores
   - **Location**: `src/app/page.tsx` (lazy loading partially implemented)
   - **Impact**: Performance scores below target 95+
   - **Workaround**: Lazy loading implemented but needs optimization

2. **TypeScript Strict Mode**: Currently ignored in build process
   - **Location**: `next.config.js`, `tsconfig.json`
   - **Impact**: Type safety issues may exist
   - **Status**: Temporary for deployment, needs fixing

3. **SEO Meta Tags**: Open Graph image missing
   - **Location**: `src/app/page.tsx` metadata
   - **Impact**: Social media sharing suboptimal
   - **Workaround**: Basic meta tags implemented

4. **Mobile Navigation**: Touch interactions need optimization
   - **Location**: `src/components/mobile/`
   - **Impact**: Mobile UX issues
   - **Status**: Partial implementation exists

## Workarounds and Gotchas

- **Environment Variables**: Must set production env vars for staging (historical artifact)
- **Lazy Loading**: All homepage sections lazy-loaded but may cause hydration issues
- **Bundle Analysis**: Custom scripts exist but not integrated into CI/CD
- **Performance Monitoring**: Real-time monitoring implemented but not actively used
