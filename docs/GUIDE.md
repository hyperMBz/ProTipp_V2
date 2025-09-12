# Használati Útmutató (BMAD ügynökök)

## Indítás
- Mindig add meg a scope-ot (1–2 mondat) és hivatkozz a `docs/NEXT_TASK.md`-re.
- Ha story-alapú feladat: linkeld a megfelelő story-t a `docs/stories/INDEX.md`-ből.

## Kötelező hivatkozások
- `docs/INDEX.md` – belépési pont
- `docs/NEXT_TASK.md` – BMAD Task Card
- `docs/stories/1.19.story.md` – aktuális story (ha releváns)
- QA Gate: `docs/qa/gates/kezdolap-implementation.yml` (ha releváns)

## Canonical
- Architektúra, API, CI/CD: lásd `docs/INDEX.md` Canonical szekció

## Munkafolyamat
1. NEXT_TASK kitöltése → dev agent indul
2. Story feladatok pipálása → PR-k linkelése
3. QA Gate ellenőrzés → PASS után merge/deploy
4. Doku frissítése → `docs/INDEX.md`, `docs/CATALOG.md`

## Gyors hivatkozások
- `docs/CATALOG.md` – teljes áttekintő
- `docs/qa/gates/INDEX.md` – QA kapuk listája
- `docs/stories/INDEX.md` – Story lista
