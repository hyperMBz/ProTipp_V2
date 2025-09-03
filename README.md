# 🎯 ProTipp V2 - Sports Betting Arbitrage Platform

CI deploy test: Thu Aug 28 19:16:55 UTC 2025

## 🚀 Project Overview
Részletes áttekintés, linkek és folyamatok: [docs/overview.md](docs/overview.md)

## 🔗 MCP Integration (Official)

A projekt most már támogatja a **hivatalos MCP (Model Context Protocol)** szervereket, ami lehetővé teszi az AI asszisztensek számára, hogy közvetlenül adatbázis műveleteket, issue kezelést, dokumentációt, tesztelést és biztonsági ellenőrzéseket végezzenek.

### 🗄️ Supabase MCP (Magas Prioritás)
- ✅ **Adatbázis lekérdezések** AI asszisztenssel
- ✅ **Arbitrage opportunity detektálás** valós idejű adatokból
- ✅ **Felhasználói statisztikák** elemzése és optimalizálás
- ✅ **Betting adatok kezelés** és validáció

### 🎯 Linear MCP
- ✅ **Issue létrehozás** és kezelés
- ✅ **Projekt workflow** automatizálás
- ✅ **Team collaboration** fejlesztése

### 📝 Notion MCP
- ✅ **Projekt dokumentáció** kezelés
- ✅ **Automatikus formázás** és struktúra
- ✅ **Keresés és lekérdezés** a workspace-ben
- ✅ **📝 [Notion Formázási Szabályok](NOTION_FORMATTING_GUIDE.md)** - Profi dokumentáció készítés

### 🧪 Playwright MCP (Közepes Prioritás)
- ✅ **UI tesztelés** automatizálása
- ✅ **Cross-browser kompatibilitás** ellenőrzés
- ✅ **Design konzisztencia** validáció

### 🔒 Semgrep MCP (Alacsony Prioritás)
- ✅ **Biztonsági ellenőrzések** automatizálása
- ✅ **Kód minőség** javítása
- ✅ **Best practice** ellenőrzés

**Részletes dokumentáció**: [MCP_INTEGRATION.md](MCP_INTEGRATION.md)

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Type check & lint
bun run lint

# Format code
bun run format
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: shadcn/ui (Radix primitives), Tailwind CSS
- **Backend**: Supabase (Auth, Database, Real-time)
- **Data**: TanStack Query v5
- **Charts**: Recharts
- **Build**: Turbopack (dev), Biome (linting/formatting)
- **Package Manager**: Bun
- **Testing**: Playwright, Vitest
- **Security**: Semgrep

### Project Structure
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

## 🎨 Design System

**Reference**: See `DESIGN_SYSTEM.md` for complete guidelines.

### Core Principles
- **Dark-first design**: `hsl(0, 0%, 5%)` background
- **Purple accent system**: `hsl(262, 83%, 58%)` primary
- **Typography**: Inter font with gradient text for titles
- **Responsive**: Mobile-first with Tailwind breakpoints

## 📊 Development Phases

- **Phase A**: ✅ Basic arbitrage engine
- **Phase B**: ✅ Real-time odds monitoring
- **Phase C**: ✅ Advanced analytics
- **Phase D**: 🔄 Subscription system
- **Phase E**: 📋 Live betting features

## 🔧 MCP Integration Setup

### Cursor Configuration
Add to Cursor Settings → MCP → Add new global MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://supabase.com/docs/guides/getting-started/mcp"]
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/sse"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://github.com/microsoft/playwright-mcp"]
    },
    "semgrep": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://github.com/semgrep/mcp"]
    }
  }
}
```

### Environment Variables
```env
# Supabase (kötelező)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Linear (opcionális)
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_team_id

# Notion (opcionális)
NOTION_TOKEN=your_notion_integration_token

# Playwright (opcionális)
PLAYWRIGHT_BROWSERS_PATH=./node_modules/.cache/playwright

# Semgrep (opcionális)
SEMGREP_APP_TOKEN=your_semgrep_token
```

## 🧪 Testing

### MCP Szerverek Tesztelése
Részletes tesztelési útmutató: [test-mcp-integration.md](test-mcp-integration.md)

### Tesztelési Parancsok
```bash
# Unit tests
bun run test:unit

# Integration tests
bun run test:integration

# Component tests
bun run test:components

# All tests
bun run test:all

# UI tests (Playwright)
bun run test:e2e
```

## 📚 Documentation

- **[MCP Integration](MCP_INTEGRATION.md)** - Complete MCP setup and usage
- **[Design System](DESIGN_SYSTEM.md)** - Visual guidelines and components
- **[Component Templates](COMPONENT_TEMPLATES.md)** - Ready-to-use patterns
- **[API Documentation](API.md)** - API endpoints and integration
- **[Coding Standards](CODING_STANDARDS.md)** - Code style and best practices
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Notion Formatting](NOTION_FORMATTING_GUIDE.md)** - Professional documentation formatting

## 🚀 Usage Examples

### Supabase Database Queries
```
"Kérdezd le az összes arbitrage opportunity-t az elmúlt 24 órából"
"Számítsd ki a felhasználó profit statisztikáit az elmúlt 30 napból"
```

### Linear Issue Management
```
"Készíts egy új Linear issue-t 'Bug fix: Arbitrage calculation error' címmel"
"Frissítsd az issue státuszt 'In Progress'-ra"
```

### Notion Documentation
```
"Készíts egy új Notion oldalt 'API Integration Guide' címmel"
"Frissítsd a projekt dokumentációt az új feature-rel"
```

### Playwright Testing
```
"Futtass egy UI tesztet a betting flow-hoz"
"Generálj egy tesztet a login funkcióhoz"
```

### Semgrep Security
```
"Végezz biztonsági ellenőrzést a TypeScript kódon"
"Generálj egyedi szabályokat a projekt specifikus biztonsághoz"
```

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Reference design system for all UI components
3. Use component templates for consistent structure
4. Test on multiple screen sizes and themes
5. Run linting and type checking before commits
6. Document complex logic and API integrations
7. **Use MCP tools** for automated database queries, issue management, and testing
8. **Run security scans** with Semgrep before major releases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**ProTipp V2** - Professional sports betting arbitrage platform with AI-powered development workflow.
# ProTipp V2 - Production Ready! 🚀
