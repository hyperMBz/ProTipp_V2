# NEXT_TASK – BMAD Task Card (egyfájlos sablon)

> BMAD indítás gyorsparancsok (másold az Orchestrator chatbe):
> 1. *agent bmad-orchestrator
> 2. *chat-mode
> 3. *workflow-guidance
> 4. Használd a “homepage-sprint1” workflow-t → `docs/bmad/manifest.yaml`

Dátum: 2025-09-11    Cím: Kezdőlap Sprint 1 Befejezése    Prioritás: P0    Időkeret: 2 nap    Tulaj: Agent

Megjegyzés: Ezt a fájlt linkeld minden új fejlesztési chat elején. A canonical hivatkozások lent.

## Behavior (elvárt viselkedés és keretek)
- Felhasználók látják a teljes funkcionalitású kezdőlapot minden eszközön
- CTA gombok megfelelően navigálnak az autentikációs folyamatokba
- Responsive design minden képernyőméreten működik
- Nem része: Mobil app funkciók, backend integrációk

## Model (jelenlegi → célállapot, függőségek)
- Jelenlegi: Kezdőlap komponensek elkészültek, de nincs teljes integráció tesztelve
- Cél: Teljes funkcionalitású kezdőlap éles használatra kész állapotban
- Függőségek: Auth provider, UI komponens könyvtár, Next.js routing

## Action (pipálható, kis lépések)
- [x] UI komponensek / képernyők (Hero, Features, HowItWorks, Stats, CTA kész)
- [x] TestimonialsSection komponens teljes implementálása
- [x] Kezdőlap teljes integráció tesztelése - lazy loading implementálva ✅
- [ ] Navigációs flow ellenőrzése és javítása
- [ ] Mobile responsive tesztelés minden komponensen
- [ ] SEO meta címkék és Open Graph tags validálása
- [ ] Performance optimalizálás (Lighthouse 95+)
- [ ] Cross-browser kompatibilitás tesztelése
- [x] Tesztek: unit / integration / E2E (Playwright) - 44 unit teszt sikeres ✅
- [ ] QA Gate teljesítése (`docs/qa/gates/kezdolap-implementation.yml`)
- [ ] Dokumentáció frissítés (ha szükséges), `docs/INDEX.md` link update
- [ ] PR megnyitása, leírás, link a change sethez
- [ ] Deploy (staging/prod) és verifikáció

## Decision (elfogadás)
- Kritériumok (Given/When/Then):
  - [ ] G: Kezdőlap betöltődik < 2s | W: Felhasználó látja a teljes tartalmat | T: Minden funkció működik
  - [ ] G: Mobile eszközön megnyitva | W: Tartalom reszponzív | T: Minden elem olvasható és használható
  - [ ] G: CTA gombokra kattintva | W: Megfelelő oldalakra navigál | T: Auth flow helyesen indul
- QA Gate: `docs/qa/gates/kezdolap-implementation.yml`
- Döntés: GO / NO-GO + megjegyzés

## Kockázat / Mitigáció
- Auth provider inicializálási problémák → Fallback UI implementálása
- Performance problémák → Code splitting és lazy loading alkalmazása
- Cross-browser inkompatibilitás → Polyfill-ek és fallback megoldások

## Telemetria / SLO
- Page load time: < 2s
- First Contentful Paint: < 1.5s
- Lighthouse Performance Score: > 95
- Mobile usability: > 95

## Rollback / Feature flag
- Feature flag: HOMEPAGE_ENABLED (alapértelmezett: true)
- Rollback: Egyszerű visszaállítás előző verzióra
- Emergency: Statikus HTML oldal megjelenítése

## Artifacts (kitölti az ügynök)
- PR link(ek): <...>
- Build/Deploy: <...>
- Jegyzetek: <...>

---

## Canonical hivatkozások (mindig érvényes)
- Fő index: `docs/INDEX.md`
- Architektúra: `docs/architecture/system-architecture-2025.md`
- API: `docs/api-spec.md`
- Branching/CI: `docs/architecture/branching-cicd-strategy.md`
- Admin (ha releváns): `docs/admin/admin-dashboard-spec.md`
- Odds/Adat: `docs/architecture/odds-data-strategy.md`, `docs/architecture/odds-providers-comparison.md`
- Infrastruktúra/OPEX: `docs/architecture/vps-comparison.md`, `docs/ops/opex-estimates.md`
- Roadmap/SLO: `docs/roadmap/roadmap-16-weeks.md`, `docs/slo/slo-metrics.md`
- Runbookok: `docs/ops/runbooks/*`
- Compliance/Security: `docs/compliance/hu-compliance-summary.md`, `docs/security/compliance-checklist.md`
