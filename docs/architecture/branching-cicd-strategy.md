# Branching és CI/CD Stratégia

## Branching modell
- Trunk-based: `main` (production), `develop` (staging), feature branch-ek: `feat/*`, `fix/*`
- PR szabályok: kötelező review, zöld CI, coverage nem csökken
- Release tagek: `vX.Y.Z` (semver), CHANGELOG kötelező

## CI (GitHub Actions)
- Lint + Typecheck (Biome + tsc)
- Unit/Integration (Vitest)
- E2E (Playwright)
- Semgrep (SAST) – blokkoló high findings esetén

## CD
- `develop` → Netlify Staging (auto)
- `main` → Netlify Production (manual approve vagy szabály alapú)
- Supabase migrációk: staging verifikáció után prod apply

## Rollback
- Netlify: előző build gyors visszaállítása
- DB: Supabase migration downgrade vagy branch reset
- Feature flags: azonnali degradáció

## Titokkezelés
- GitHub Secrets/Netlify Vars; kulcsrotáció 60–90 nap

## Minőségkapuk
- p95 API latency határérték, error rate threshold, e2e smoke pass kötelező
