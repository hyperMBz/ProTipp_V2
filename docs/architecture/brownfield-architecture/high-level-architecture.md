# High Level Architecture

## Technical Summary

ProTipp V2 is a **Next.js 15 sports betting arbitrage platform** with real-time odds comparison. The application uses a modern React stack with Supabase backend, featuring lazy-loaded components and comprehensive testing infrastructure.

## Actual Tech Stack (from package.json)

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

## Repository Structure Reality Check

- **Type**: Monorepo (single Next.js application)
- **Package Manager**: Bun (with Yarn compatibility)
- **Build System**: Next.js built-in (Turbopack for dev)
- **Deployment**: Netlify with custom build scripts
- **CI/CD**: GitHub Actions (basic setup in .github/workflows/)
