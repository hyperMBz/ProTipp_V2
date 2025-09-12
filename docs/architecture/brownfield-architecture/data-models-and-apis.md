# Data Models and APIs

## Data Models

**Core Business Objects:**
- **User Model**: Supabase auth.users (managed by Supabase)
- **Bet Record**: Custom betting transaction data
- **Arbitrage Opportunity**: Real-time odds comparison results
- **Analytics Data**: User performance metrics and statistics

**Actual Implementation:**
- Models defined in `src/lib/types/` (5 TypeScript files)
- Supabase schema in `src/lib/supabase/schema.sql`
- Type-safe database operations with generated types

## API Specifications

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
