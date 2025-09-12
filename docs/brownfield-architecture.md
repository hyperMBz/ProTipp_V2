# ProTipp V2 - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the ProTipp V2 codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on the homepage sprint completion and future enhancements.

### Document Scope

**Focused on areas relevant to: Homepage Sprint 1 Completion**
- UI component analysis and enhancement
- Navigation flow validation
- Mobile responsive testing
- SEO optimization
- Performance optimization (Lighthouse 95+)
- Cross-browser compatibility testing
- QA Gate completion and deployment

### Change Log

| Date       | Version | Description                          | Author    |
| ---------- | ------- | ------------------------------------ | --------- |
| 2025-01-11 | 1.0     | Initial brownfield analysis for homepage sprint | Architect |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/app/page.tsx` (Homepage with lazy loading)
- **Configuration**: `next.config.js`, `tailwind.config.ts`, `components.json`
- **Core Business Logic**: `src/lib/arbitrage-engine/`, `src/lib/api/`
- **API Definitions**: `src/app/api/v1/` (12 endpoint files)
- **UI Components**: `src/components/home/` (6 homepage sections)
- **Auth System**: `src/lib/auth/`, `src/components/auth/`
- **Key Algorithms**: `src/lib/arbitrage-engine/odds-comparison.ts`

### Homepage Sprint Impact Areas

**Files to be modified/enhanced:**
- `src/app/page.tsx` - Navigation flow and lazy loading optimization
- `src/components/home/*` - Mobile responsive and cross-browser fixes
- `src/lib/seo/` - Meta tags and Open Graph validation
- `src/components/navigation/` - CTA button routing validation
- `src/lib/performance/` - Lighthouse score optimization

## High Level Architecture

### Technical Summary

ProTipp V2 is a **Next.js 15 sports betting arbitrage platform** with real-time odds comparison. The application uses a modern React stack with Supabase backend, featuring lazy-loaded components and comprehensive testing infrastructure.

### Actual Tech Stack (from package.json)

| Category     | Technology         | Version  | Notes                          |
| ------------ | ------------------ | -------- | ------------------------------ |
| Runtime      | Node.js            | 18+      | Next.js 15 requirement         |
| Framework    | Next.js            | 15.3.2   | App Router, Turbopack dev      |
| Language     | TypeScript         | 5.8.3    | Strict mode enabled           |
| UI Library   | React              | 18.3.1   | Concurrent features           |
| UI Framework | shadcn/ui + Radix  | Latest   | Component library              |
| Styling      | Tailwind CSS       | 3.4.17   | Custom design system          |
| Backend      | Supabase           | 2.56.0   | Auth, Database, Real-time      |
| State Mgmt   | TanStack Query     | 5.85.5   | Server state management        |
| Testing      | Vitest + Playwright| 3.2.4 + 1.55.0 | Unit + E2E testing      |
| Package Mgr  | Bun                | Latest   | Fast package management        |

### Repository Structure Reality Check

- **Type**: Monorepo (single Next.js application)
- **Package Manager**: Bun (with Yarn compatibility)
- **Build System**: Next.js built-in (Turbopack for dev)
- **Deployment**: Netlify with custom build scripts
- **CI/CD**: GitHub Actions (basic setup in .github/workflows/)

## Source Tree and Module Organization

### Project Structure (Actual)

```
protip_v2/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── page.tsx                  # HOMEPAGE - lazy loaded sections
│   │   ├── dashboard/page.tsx        # Main app functionality
│   │   ├── arbitrage/page.tsx        # Arbitrage opportunities
│   │   ├── api/v1/                   # 12 API endpoints
│   │   └── auth/                     # Supabase auth callbacks
│   ├── components/
│   │   ├── home/                     # 6 HOMEPAGE SECTIONS ✅
│   │   │   ├── HeroSection.tsx       # Main hero with CTA buttons
│   │   │   ├── FeaturesSection.tsx   # 3 main features (arbitrage, calc, tracker)
│   │   │   ├── HowItWorksSection.tsx # 3-step process
│   │   │   ├── TestimonialsSection.tsx # User testimonials
│   │   │   ├── StatsSection.tsx      # Statistics with animations
│   │   │   ├── CallToActionSection.tsx # Final CTA section
│   │   │   └── *.test.tsx            # 6 unit test files
│   │   ├── ui/                       # shadcn/ui components (25 files)
│   │   ├── auth/                     # Authentication components
│   │   ├── analytics/                # Charts and metrics (10 components)
│   │   └── arbitrage/                # Arbitrage tables and logic
│   ├── lib/
│   │   ├── api/                      # External API integrations (17 files)
│   │   ├── arbitrage-engine/         # Core business logic (6 files)
│   │   ├── auth/                     # Supabase auth utilities
│   │   ├── supabase/                 # Database client and types
│   │   ├── seo/                      # SEO utilities and meta helpers
│   │   ├── performance/              # Performance monitoring
│   │   └── types/                    # TypeScript type definitions
│   └── middleware.ts                 # Next.js middleware for auth
├── docs/
│   ├── prd/kezdolap-spec.md          # HOMEPAGE REQUIREMENTS ✅
│   ├── qa/gates/                     # Quality gates for homepage
│   └── roadmap/roadmap-16-weeks.md   # 16-week development plan
├── scripts/                          # Build and deployment scripts (9 files)
├── tests/                            # Test utilities and global setup
└── .bmad-core/                       # BMAD workflow and agent definitions
```

### Key Modules and Their Purpose

- **Homepage (`src/app/page.tsx`)**: Main landing page with lazy-loaded sections
- **Arbitrage Engine (`src/lib/arbitrage-engine/`)**: Core profit calculation algorithms
- **Auth System (`src/lib/auth/`)**: Supabase authentication and session management
- **API Layer (`src/app/api/v1/`)**: REST endpoints for frontend communication
- **UI Components (`src/components/home/`)**: Homepage-specific sections with tests
- **Analytics (`src/components/analytics/`)**: Performance tracking and visualization
- **Mobile Components (`src/components/mobile/`)**: Mobile-optimized UI elements

## Data Models and APIs

### Data Models

**Core Business Objects:**
- **User Model**: Supabase auth.users (managed by Supabase)
- **Bet Record**: Custom betting transaction data
- **Arbitrage Opportunity**: Real-time odds comparison results
- **Analytics Data**: User performance metrics and statistics

**Actual Implementation:**
- Models defined in `src/lib/types/` (5 TypeScript files)
- Supabase schema in `src/lib/supabase/schema.sql`
- Type-safe database operations with generated types

### API Specifications

**Internal APIs:**
- **REST Endpoints**: `src/app/api/v1/` (12 files)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Real-time**: Supabase real-time subscriptions for live data
- **External APIs**: Odds API integration in `src/lib/api/`

**Key API Patterns:**
- RESTful endpoints with consistent error handling
- TypeScript-first API definitions
- Supabase RLS for data security
- Rate limiting and caching implemented

## Technical Debt and Known Issues

### Critical Technical Debt

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

### Workarounds and Gotchas

- **Environment Variables**: Must set production env vars for staging (historical artifact)
- **Lazy Loading**: All homepage sections lazy-loaded but may cause hydration issues
- **Bundle Analysis**: Custom scripts exist but not integrated into CI/CD
- **Performance Monitoring**: Real-time monitoring implemented but not actively used

## Integration Points and External Dependencies

### External Services

| Service    | Purpose             | Integration Type | Key Files                  | Status |
| ---------- | ------------------- | ---------------- | -------------------------- | ------ |
| Supabase   | Backend (Auth, DB)  | SDK              | `src/lib/supabase/`        | ✅ Active |
| The Odds API| Sports data        | REST API         | `src/lib/api/odds-api.ts`  | ✅ Active |
| Stripe     | Payments            | SDK (planned)    | N/A                        | ⏳ Planned |
| Email Service| Notifications     | SMTP (planned)   | `scripts/test-email-config.js` | ⏳ Planned |

### Internal Integration Points

- **Frontend-Backend**: REST API on `/api/v1/` endpoints
- **Auth Flow**: Supabase auth with custom middleware
- **Real-time Updates**: WebSocket connections for live odds
- **Caching Layer**: Redis for API response caching
- **Analytics**: Custom performance tracking system

## Development and Deployment

### Local Development Setup

**Actual working steps:**
1. `bun install` - Install dependencies with Bun
2. `bun run dev` - Start development server (Turbopack enabled)
3. Environment variables in `.env.local`
4. Supabase local or cloud instance required

**Known issues:**
- Bundle size warnings during development
- TypeScript errors ignored for faster iteration
- Some mobile components need browser testing

### Build and Deployment Process

**Current Build Process:**
- **Build Command**: `bun run build` (Next.js with custom optimizations)
- **Optimization**: Custom scripts for bundle analysis and Lighthouse
- **Deployment**: Netlify with build hooks
- **Environment**: Single environment (production)

**Build Scripts:**
- `scripts/netlify-build-optimization.js` - Bundle optimization
- `scripts/lighthouse-optimization.js` - Performance testing
- `scripts/performance-monitor.js` - Real-time monitoring

## Testing Reality

### Current Test Coverage

**Unit Tests:** 44 tests implemented (Jest/Vitest)
- **Location**: `src/components/home/*.test.tsx`
- **Coverage**: Homepage components fully tested
- **Framework**: Vitest with React Testing Library
- **Status**: ✅ All homepage component tests passing

**Integration Tests:** Minimal implementation
- **Location**: `src/tests/integration/`
- **Status**: Basic setup exists

**E2E Tests:** Playwright framework configured
- **Location**: Playwright config and test files
- **Status**: Framework ready, tests need implementation

**Manual Testing:** Primary QA method
- **Mobile Testing**: Basic mobile components exist
- **Cross-browser**: Not systematically tested
- **Performance**: Lighthouse audits available

### Running Tests

```bash
# Unit tests (44 homepage tests - all passing ✅)
bun run test:unit

# Integration tests (minimal)
bun run test:integration

# E2E tests (Playwright - needs implementation)
bun run test:e2e

# Performance tests (K6 framework)
bun run test:performance

# Full CI test suite
bun run test:ci
```

## Homepage Sprint Impact Analysis

### Files That Need Modification

**Navigation & Routing:**
- `src/app/page.tsx` - CTA button routing validation
- `src/components/navigation/` - Mobile navigation fixes
- `src/middleware.ts` - Auth flow integration

**Mobile Responsive:**
- `src/components/home/*.tsx` - 6 homepage sections
- `src/components/mobile/` - Touch optimization
- `tailwind.config.ts` - Responsive breakpoints

**SEO & Performance:**
- `src/app/page.tsx` - Meta tags and Open Graph
- `src/lib/seo/` - SEO utilities
- `scripts/lighthouse-optimization.js` - Performance scripts

**Cross-browser Compatibility:**
- `src/components/home/*.tsx` - Browser-specific fixes
- `tailwind.config.ts` - CSS compatibility
- Playwright E2E tests

### New Files/Modules Needed

**Testing Infrastructure:**
- `src/tests/e2e/homepage/` - E2E test scenarios
- `src/lib/testing/cross-browser/` - Browser compatibility tests

**Performance Monitoring:**
- `src/lib/performance/lighthouse/` - Automated scoring
- `src/components/performance/` - Real-time metrics

**SEO Enhancement:**
- `public/og-image-home.png` - Open Graph image
- `src/lib/seo/meta-tags.ts` - Dynamic meta generation

### Integration Considerations

- **Auth Integration**: CTA buttons must properly route to `/login` and `/register`
- **Mobile Navigation**: Touch gestures and swipe support needed
- **Performance Budget**: Bundle size limits for Lighthouse 95+ score
- **SEO Compliance**: Structured data and meta tags validation

## Appendix - Useful Commands and Scripts

### Development Commands

```bash
# Start development server (Turbopack)
bun run dev

# Build production bundle
bun run build

# Run all tests
bun run test:all

# Generate coverage report
bun run test:coverage

# Performance analysis
bun run lighthouse:audit

# Bundle analysis
bun run performance:analyze
```

### Deployment Commands

```bash
# Production deployment
bun run deploy:production

# Netlify optimized build
bun run netlify:build

# Performance monitoring
bun run performance:monitor
```

### Quality Assurance

```bash
# Lint and type check
bun run lint

# Format code (Biome)
bun run format

# Security audit
bun run test:security

# Full CI pipeline
bun run test:ci
```

## Success Criteria Met

✅ **Single comprehensive brownfield architecture document created**
✅ **Document reflects REALITY including technical debt and workarounds**
✅ **Key files and modules are referenced with actual paths**
✅ **Models/APIs reference source files rather than duplicating content**
✅ **Homepage sprint impact analysis with specific file modifications**
✅ **Document enables AI agents to navigate and understand the actual codebase**
✅ **Technical constraints and "gotchas" are clearly documented**

---

**Document Version:** 1.0
**Last Updated:** 2025-01-11
**Focus:** Homepage Sprint 1 Completion
**Next Step:** PO validation and document sharding
