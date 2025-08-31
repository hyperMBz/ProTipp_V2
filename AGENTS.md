# AGENTS.md

## Kommunikációs Szabályok
**FONTOS**: Minden kommunikáció magyar nyelven történjen. Az Agent mindig magyarul válaszoljon és magyarul írjon kódot, kommenteket és dokumentációt.

### Nyelvi Követelmények
- **Kommunikáció**: Minden válasz magyar nyelven
- **Kód kommentek**: Magyar nyelven
- **Dokumentáció**: Magyar nyelven
- **Hibaüzenetek**: Magyar nyelven
- **Konzol üzenetek**: Magyar nyelven

## Project Overview
**ProTipp V2** - Next.js 15 sports betting arbitrage platform with real-time odds comparison.
TypeScript-first application using shadcn/ui components, Supabase backend, and dark-first design system.

## 🚀 MCP Integration Overview

A projekt támogatja a következő MCP (Model Context Protocol) szervereket:

### 🗄️ Supabase MCP (Magas Prioritás)
- **Adatbázis lekérdezések** AI asszisztenssel
- **Arbitrage opportunity detektálás** valós idejű adatokból
- **Felhasználói statisztikák** elemzése és optimalizálás
- **Betting adatok kezelés** és validáció



### 📝 Notion MCP
- **Projekt dokumentáció** kezelés
- **Automatikus formázás** és struktúra
- **Keresés és lekérdezés** a workspace-ben

### 🧪 Playwright MCP (Közepes Prioritás)
- **UI tesztelés** automatizálása
- **Cross-browser kompatibilitás** ellenőrzés
- **Design konzisztencia** validáció

### 🔒 Semgrep MCP (Alacsony Prioritás)
- **Biztonsági ellenőrzések** automatizálása
- **Kód minőség** javítása
- **Best practice** ellenőrzés

**Részletes dokumentáció**: [MCP_INTEGRATION.md](MCP_INTEGRATION.md)

## Quick Start Commands
- **Install dependencies**: `bun install`
- **Start development**: `bun run dev` (runs on all interfaces with Turbopack)
- **Build production**: `bun run build`
- **Type check & lint**: `bun run lint` (includes TypeScript compilation)
- **Format code**: `bun run format` (using Biome)

## Architecture Overview
```
src/
├── app/                    # Next.js 15 App Router pages
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── auth/              # Authentication components
│   ├── analytics/         # Charts and metrics
│   └── alerts/            # Notification system
├── lib/
│   ├── api/               # API integration layers
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   ├── supabase/          # Database client
│   └── types/             # TypeScript definitions
└── middleware.ts          # Next.js middleware
```

## Technology Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: shadcn/ui (Radix primitives), Tailwind CSS
- **Backend**: Supabase (Auth, Database, Real-time)
- **Data Fetching**: TanStack Query v5
- **Charts**: Recharts
- **Build**: Turbopack (dev), Biome (linting/formatting)
- **Package Manager**: Bun
- **Testing**: Playwright, Vitest
- **Security**: Semgrep

## Code Style & Standards

### TypeScript Configuration
- **Strict mode enabled** - all type checking rules enforced
- **Path aliases**: Use `@/` for src directory imports
- **Build errors**: Currently ignored for deployment (temporary)

### Formatting & Linting
- **Biome** for formatting and linting (configured in `biome.json`)
- **Double quotes** for strings
- **Space indentation** (2 spaces)
- **Organized imports** automatically

### Component Patterns
Follow patterns defined in `COMPONENT_TEMPLATES.md`:
- Use `"use client"` directive for client components
- Import structure: React → UI → Icons → Utils → Types
- Props interface with required props first, optional with defaults
- State management with typed useState hooks

## Design System Guidelines
**Reference**: See `DESIGN_SYSTEM.md` for complete guidelines.

### Core Principles
- **Dark-first design**: `hsl(0, 0%, 5%)` background
- **Purple accent system**: `hsl(262, 83%, 58%)` primary
- **Typography**: Inter font with gradient text for titles
- **Responsive**: Mobile-first with Tailwind breakpoints

### Component Standards
```tsx
// Standard card layout
<Card className="gradient-bg border-primary/20">
  <CardHeader>
    <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
      Title
    </CardTitle>
  </CardHeader>
</Card>

// Button hierarchy
<Button variant="default">    {/* Primary purple */}
<Button variant="outline">   {/* Secondary transparent */}
<Button variant="ghost">     {/* Hover effect only */}
```

### Status Colors
- **Profit**: `text-green-400` 
- **Loss**: `text-red-400`
- **Warning**: `text-yellow-400`
- **Info**: `text-blue-400`
- **Neutral**: `text-muted-foreground`

## Development Workflow

### File Organization
- **Components**: Use descriptive names, group by feature
- **Hooks**: Prefix with `use-`, place in `lib/hooks/`
- **Types**: Define in `lib/types/`, export interfaces
- **API**: Centralize in `lib/api/` with proper error handling

### State Management
- **Local state**: useState for component-specific data
- **Server state**: TanStack Query for API data
- **Auth state**: Supabase Auth with custom provider
- **Global state**: Context providers in `lib/providers/`

### Testing Standards
- Run `bun run lint` before committing
- Ensure TypeScript compilation passes
- Test responsive design on multiple breakpoints
- Verify dark theme compatibility
- **UI Testing**: Use Playwright for E2E tests
- **Security**: Run Semgrep scans regularly

## API Integration

### Supabase Configuration
- **Client**: Configured in `lib/supabase/client.ts`
- **Auth**: Row Level Security enabled
- **Real-time**: Subscriptions for live odds data
- **Types**: Auto-generated from database schema
- **MCP Integration**: Direct database access via AI assistants

### External APIs
- **Odds API**: Centralized in `lib/api/odds-api.ts`
- **Error handling**: Consistent error boundaries
- **Rate limiting**: Respect API quotas and implement backoff

## Performance Considerations

### Next.js Optimizations
- **Turbopack**: Enabled for faster development builds
- **Image optimization**: Configured for external domains
- **Bundle analysis**: Monitor build size and performance

### Loading States
- Implement skeleton loading patterns
- Use Suspense boundaries for async components
- Show meaningful loading indicators with `Loader2` icons

## Security Guidelines

### Authentication
- **Supabase Auth**: Secure by default with RLS
- **Middleware**: Route protection in `middleware.ts`
- **Session management**: Automatic token refresh
- **Semgrep Integration**: Automated security scanning

### Data Protection
- **Environment variables**: Use `.env.local` for secrets
- **API keys**: Never expose in client-side code
- **CORS**: Properly configured for production domains

## Deployment Notes

### Build Configuration
- **TypeScript errors**: Currently ignored (temporary)
- **ESLint errors**: Ignored during builds (fix before production)
- **Image domains**: Configured for external image sources

### Environment Setup
- **Development**: Local Supabase or cloud instance
- **Production**: Netlify deployment with environment variables
- **Preview**: Same-app.com preview domains allowed

## Phase D Development Focus

### Subscription System
- Multi-tier pricing cards with popular badges
- Stripe payment integration
- Billing history and plan management
- Usage metrics and limits display

### Live Betting Features
- Real-time WebSocket connections
- Live arbitrage opportunity alerts
- Quick bet placement interface
- Connection status indicators

### API Management
- API key generation and revocation
- Interactive documentation components
- Rate limiting visualization
- SDK download and examples

### Advanced Analytics
- Multi-bookmaker portfolio tracking
- Risk management calculators
- Automated betting bot configuration
- Performance optimization suggestions

## Common Patterns

### Error Handling
```tsx
try {
  const data = await apiCall();
  setStatus('success');
} catch (error) {
  console.error('API Error:', error);
  setStatus('error');
}
```

### Loading States
```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
) : (
  <DataComponent data={data} />
)}
```

### Responsive Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

## MCP Usage Examples

### Supabase Database Queries
```
"Kérdezd le az összes arbitrage opportunity-t az elmúlt 24 órából"
"Számítsd ki a felhasználó profit statisztikáit az elmúlt 30 napból"
"Frissítsd a betting státuszt 'won'-ra a megadott ID-hoz"
```



### Notion Documentation
```
"Készíts egy új Notion oldalt 'API Integration Guide' címmel"
"Frissítsd a projekt dokumentációt az új feature-rel"
"Keresd meg a betting algoritmus dokumentációt"
```

### Playwright Testing
```
"Futtass egy UI tesztet a betting flow-hoz"
"Generálj egy tesztet a login funkcióhoz"
"Ellenőrizd a design konzisztenciát különböző böngészőkben"
```

### Semgrep Security
```
"Végezz biztonsági ellenőrzést a TypeScript kódon"
"Generálj egyedi szabályokat a projekt specifikus biztonsághoz"
"Ellenőrizd a dependency sebezhetőségeket"
```

## Documentation References
- **Design System**: `DESIGN_SYSTEM.md` - Complete visual guidelines
- **Component Templates**: `COMPONENT_TEMPLATES.md` - Ready-to-use patterns
- **MCP Integration**: `MCP_INTEGRATION.md` - Complete MCP setup and usage
- **shadcn/ui docs**: https://ui.shadcn.com/
- **Next.js 15 docs**: https://nextjs.org/docs
- **Supabase docs**: https://supabase.com/docs

## Contributing Guidelines
1. Follow existing code patterns and conventions
2. Reference design system for all UI components
3. Use component templates for consistent structure
4. Test on multiple screen sizes and themes
5. Run linting and type checking before commits
6. Document complex logic and API integrations
7. **Use MCP tools** for automated database queries, issue management, and testing
8. **Run security scans** with Semgrep before major releases

---

**This AGENTS.md file provides AI coding assistants with comprehensive context to work effectively on the ProTipp V2 project while maintaining consistency with established patterns and standards.**
