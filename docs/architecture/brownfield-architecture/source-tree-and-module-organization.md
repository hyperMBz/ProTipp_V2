# Source Tree and Module Organization

## Project Structure (Actual)

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

## Key Modules and Their Purpose

- **Homepage (`src/app/page.tsx`)**: Main landing page with lazy-loaded sections
- **Arbitrage Engine (`src/lib/arbitrage-engine/`)**: Core profit calculation algorithms
- **Auth System (`src/lib/auth/`)**: Supabase authentication and session management
- **API Layer (`src/app/api/v1/`)**: REST endpoints for frontend communication
- **UI Components (`src/components/home/`)**: Homepage-specific sections with tests
- **Analytics (`src/components/analytics/`)**: Performance tracking and visualization
- **Mobile Components (`src/components/mobile/`)**: Mobile-optimized UI elements
