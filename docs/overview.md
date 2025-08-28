# ProTipp V2 – Project Overview

Cél: Next.js 15 alapú sports arbitrage platform. UI: shadcn/ui, Supabase backend, Netlify deploy.

## Gyors linkek
- Repo: https://github.com/hyperMBz/ProTipp_V2
- Live (prod): https://protipp.netlify.app
- CI/CD: https://github.com/hyperMBz/ProTipp_V2/actions
- Design System: `DESIGN_SYSTEM.md`
- Agents: `AGENTS.md`

## Pipeline
- Push → GitHub Actions: lint + build + test
- main push → Netlify prod deploy
- Pull Request → Netlify Preview + Linear story

## Branch védelem
- PR kötelező, min. 1 approval
- Required check: `build-and-test`

## Automatika
- Dependabot (heti npm frissítések)
- PR open → Linear story (title: `PR: <cím>`, link a PR-hez)

## Roadmap (epicek)
- Platform alapok (CI/CD, Auth, Env)
- UI/Design (komponensek, Storybook)
- Integrációk (Supabase, Linear, Netlify)
- Minőség (Vitest, performance, monitoring)

## Napi rutin
- Reggel: `My Work` + `Blocked` Linear view
- PR → preview link + automata Linear story
- Hétvége: `Done last week` + `Roadmap by Epic`
