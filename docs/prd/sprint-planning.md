# ProTipp V2 - Sprint Planning Dokumentum

**Verzió:** 1.0  
**Dátum:** 2024. december 19.  
**Product Owner:** Sarah  
**Scrum Master:** Bob  
**Státusz:** Active  
**Kapcsolódó dokumentumok:** 
- PRD: `docs/prd/index.md`
- Backlog: `docs/prd/backlog.md`
- Kezdőlap Spec: `docs/prd/kezdolap-spec.md`

## 📋 **1. SPRINT ÁTTEKINTÉS**

### **1.1 Sprint Célok**
- **Sprint 1:** Kezdőlap létrehozása és alap funkcionalitás
- **Sprint 2:** Dashboard áthelyezés és navigáció javítása
- **Sprint 3-4:** Hiányzó oldalak fejlesztése
- **Sprint 5:** Add to Bet Tracker funkció implementálása
- **Sprint 6:** Kalkulátor ikon funkció implementálása
- **Sprint 7-8:** Profil oldalak kifejlesztése

### **1.2 Sprint Időtartam**
- **Sprint hossz:** 1 hét (5 munkanap)
- **Sprint planning:** Hétfő reggel 9:00-10:00
- **Daily standup:** Minden nap 9:00-9:15
- **Sprint review:** Péntek délután 16:00-17:00
- **Retrospective:** Péntek délután 17:00-17:30

### **1.3 Csapat Kapacitás**
- **Frontend fejlesztő:** 40 óra/hét
- **Backend fejlesztő:** 20 óra/hét (part-time)
- **Product Owner:** 10 óra/hét
- **Scrum Master:** 5 óra/hét

## 🎯 **2. SPRINT 1: KEZDŐLAP LÉTREHOZÁSA**

**Időtartam:** 2024. december 23-27. (1 hét)  
**Sprint Goal:** Felhasználóbarát kezdőlap kialakítása  
**Státusz:** In Progress  

### **2.1 Sprint Backlog**

#### **HOME-001: Projekt Struktúra Létrehozása**
- **Story Points:** 3
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] `src/components/home/` könyvtár létrehozása
- [ ] Komponens fájlok létrehozása (6 db)
- [ ] `src/components/home/index.ts` export fájl
- [ ] Tailwind CSS konfiguráció frissítése

**Definition of Done:**
- [ ] Minden komponens fájl létrehozva
- [ ] Export fájl működik
- [ ] Tailwind CSS konfiguráció frissítve
- [ ] Code review elvégezve

#### **HOME-002: HeroSection Komponens Fejlesztése**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] Hero section teljes képernyő magasságú
- [ ] Gradient háttér implementálása
- [ ] Fő cím, alcím és leírás
- [ ] 3 CTA gomb implementálása
- [ ] Animációk (fade-in, slide-up)
- [ ] Reszponzív design (mobile-first)

**Definition of Done:**
- [ ] Hero section teljes képernyő magasságú
- [ ] Gradient háttér működik
- [ ] Minden szöveg megjelenik
- [ ] CTA gombok működnek
- [ ] Animációk működnek
- [ ] Reszponzív minden képernyőméreten
- [ ] Code review elvégezve

#### **HOME-003: FeaturesSection Komponens Fejlesztése**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] 3 oszlopos grid layout
- [ ] Funkció kártyák implementálása
- [ ] Ikonok, címek, leírások
- [ ] Hover effektek
- [ ] Reszponzív breakpoint-ok

**Definition of Done:**
- [ ] 3 oszlopos grid desktop-en
- [ ] 1 oszlopos mobile-en
- [ ] Minden funkció kártya megjelenik
- [ ] Hover effektek működnek
- [ ] Reszponzív breakpoint-ok működnek
- [ ] Code review elvégezve

#### **HOME-004: HowItWorksSection Komponens Fejlesztése**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] 3 lépéses timeline layout
- [ ] Lépések implementálása
- [ ] Ikonok, címek, leírások
- [ ] Vízszintes/függőleges layout
- [ ] Animált bejelenés

**Definition of Done:**
- [ ] 3 lépéses timeline desktop-en
- [ ] Függőleges layout mobile-en
- [ ] Minden lépés megjelenik
- [ ] Animációk működnek
- [ ] Reszponzív design
- [ ] Code review elvégezve

#### **HOME-005: TestimonialsSection Komponens Fejlesztése**
- **Story Points:** 3
- **Prioritás:** KÖZEPES
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] 2-3 testimonial kártya
- [ ] Név, pozíció, értékelés, vélemény
- [ ] Kártya layout
- [ ] Csillagos értékelés
- [ ] Avatar placeholder

**Definition of Done:**
- [ ] 2-3 testimonial megjelenik
- [ ] Minden adat megjelenik
- [ ] Kártya layout reszponzív
- [ ] Csillagos értékelés működik
- [ ] Code review elvégezve

#### **HOME-006: StatsSection Komponens Fejlesztése**
- **Story Points:** 3
- **Prioritás:** KÖZEPES
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] 4 oszlopos grid layout
- [ ] Statisztikák implementálása
- [ ] Ikonok, számok, címkék
- [ ] Animált számlálók (opcionális)
- [ ] Reszponzív breakpoint-ok

**Definition of Done:**
- [ ] 4 oszlopos grid desktop-en
- [ ] 2x2 grid mobile-en
- [ ] Minden statisztika megjelenik
- [ ] Ikonok és szövegek olvashatóak
- [ ] Code review elvégezve

#### **HOME-007: CallToActionSection Komponens Fejlesztése**
- **Story Points:** 3
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] Központosított layout
- [ ] Fő üzenet és 3 CTA gomb
- [ ] Elsődleges gomb kiemelése
- [ ] Gradient háttér
- [ ] Reszponzív design

**Definition of Done:**
- [ ] Központosított layout
- [ ] Fő üzenet megjelenik
- [ ] 3 CTA gomb működik
- [ ] Elsődleges gomb kiemelve
- [ ] Gradient háttér működik
- [ ] Code review elvégezve

#### **HOME-008: Kezdőlap Integráció és Navigáció**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] Komponensek integrálása `page.tsx`-be
- [ ] Navigációs menü frissítése
- [ ] Dashboard áthelyezése `/dashboard`-ra
- [ ] SEO meta címkék implementálása
- [ ] Reszponzív navigáció

**Definition of Done:**
- [ ] Minden komponens integrálva
- [ ] Navigációs menü frissítve
- [ ] Dashboard `/dashboard` útvonalon
- [ ] SEO meta címkék működnek
- [ ] Reszponzív navigáció működik
- [ ] Code review elvégezve

### **2.2 Sprint Burndown Chart**

**Sprint 1 Burndown:**
- **Kezdeti Story Points:** 32
- **Napi kapacitás:** 8 Story Points
- **Várható befejezés:** 4 nap

**Napi progress:**
- **Hétfő:** 8 SP (24 marad)
- **Kedd:** 8 SP (16 marad)
- **Szerda:** 8 SP (8 marad)
- **Csütörtök:** 8 SP (0 marad)
- **Péntek:** Tesztelés és dokumentáció

### **2.3 Sprint 1 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] Kezdőlap betöltődik és megjelenik
- [ ] Minden szekció megfelelően renderelődik
- [ ] CTA gombok működnek és navigálnak
- [ ] Reszponzív design minden képernyőméreten
- [ ] Animációk és effektek működnek

**Műszaki követelmények:**
- [ ] TypeScript hiba nincs
- [ ] ESLint szabályok betartva
- [ ] Lighthouse Score 95+
- [ ] Mobile Performance 90+
- [ ] SEO meta címkék megfelelnek

**Felhasználói élmény:**
- [ ] Intuitív navigáció
- [ ] Gyors betöltés (< 2s)
- [ ] Accessibility megfelelés
- [ ] Cross-browser kompatibilitás
- [ ] Mobile-optimalizált felület

## 🎯 **3. SPRINT 2: DASHBOARD ÁTHELYEZÉS**

**Időtartam:** 2024. december 30-31. (0.5 hét)  
**Sprint Goal:** Dashboard funkciók áthelyezése  
**Státusz:** Not Started  

### **3.1 Sprint Backlog**

#### **DASH-001: Dashboard Útvonal Létrehozása**
- **Story Points:** 3
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Not Started

**Feladatok:**
- [ ] `/dashboard` útvonal létrehozása
- [ ] Jelenlegi dashboard funkciók áthelyezése
- [ ] Navigáció frissítése
- [ ] Oldal tesztelése

**Definition of Done:**
- [ ] `/dashboard` útvonal működik
- [ ] Dashboard funkciók áthelyezve
- [ ] Navigáció frissítve
- [ ] Oldal betöltődik és működik
- [ ] Code review elvégezve

### **3.2 Sprint 2 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] Dashboard `/dashboard` útvonalon elérhető
- [ ] Minden dashboard funkció működik
- [ ] Navigáció frissítve és működik
- [ ] Kezdőlap önállóan működik

**Műszaki követelmények:**
- [ ] Útvonal routing működik
- [ ] Komponensek áthelyezve
- [ ] Import/export hibák nincsenek
- [ ] Code review elvégezve

## 🎯 **4. SPRINT 3-4: HIÁNYZÓ OLDALAK**

**Időtartam:** 2025. január 6-17. (2 hét)  
**Sprint Goal:** Hiányzó oldalak létrehozása  
**Státusz:** Not Started  

### **4.1 Sprint Backlog**

#### **PAGE-001: Arbitrage Oldal Létrehozása**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Not Started

#### **PAGE-002: Analytics Oldal Létrehozása**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Not Started

#### **PAGE-003: Settings Oldal Létrehozása**
- **Story Points:** 3
- **Prioritás:** KÖZEPES
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Not Started

### **4.2 Sprint 3-4 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] `/arbitrage` oldal létrehozva és működik
- [ ] `/analytics` oldal létrehozva és működik
- [ ] `/settings` oldal létrehozva és működik
- [ ] Minden oldal navigálható
- [ ] Reszponzív design minden oldalon

## 🎯 **5. SPRINT 5: ADD TO BET TRACKER**

**Időtartam:** 2025. január 20-24. (1 hét)  
**Sprint Goal:** Bet Tracker funkció implementálása  
**Státusz:** Ready for Development  

### **5.1 Sprint Backlog**

#### **TRACKER-001: Bet Tracker Komponens Létrehozása**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] `BetTrackerProvider.tsx` - Context provider létrehozása
- [ ] `BetTrackerPanel.tsx` - Fő panel komponens
- [ ] `BetTrackerItem.tsx` - Egyedi elem komponens
- [ ] `use-bet-tracker.ts` - Custom hook létrehozása
- [ ] State management implementálása
- [ ] Reszponzív design implementálása

**Definition of Done:**
- [ ] BetTrackerProvider működik
- [ ] BetTrackerPanel megjelenik és működik
- [ ] BetTrackerItem komponens működik
- [ ] Custom hook működik
- [ ] State management működik
- [ ] Reszponzív design működik
- [ ] Code review elvégezve

#### **TRACKER-002: "+" Gomb Implementálása**
- **Story Points:** 3
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] `BetTrackerButton.tsx` - "+" gomb komponens
- [ ] ArbitrageTable integráció
- [ ] Vizuális visszajelzés implementálása
- [ ] Hover és click animációk
- [ ] Stílus konzisztencia biztosítása

**Definition of Done:**
- [ ] BetTrackerButton komponens működik
- [ ] ArbitrageTable integráció működik
- [ ] Vizuális visszajelzés működik
- [ ] Animációk működnek
- [ ] Stílus konzisztens
- [ ] Code review elvégezve

#### **TRACKER-003: Adatbázis Integráció**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Backend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Ready for Development

**Feladatok:**
- [ ] `bet-tracker` tábla létrehozása
- [ ] `bet-tracker-api.ts` - API endpoints
- [ ] CRUD műveletek implementálása
- [ ] Real-time subscriptions
- [ ] Error handling és retry logika
- [ ] Data validation és sanitization

**Definition of Done:**
- [ ] Adatbázis tábla létrehozva
- [ ] API endpoints működnek
- [ ] CRUD műveletek működnek
- [ ] Real-time subscriptions működnek
- [ ] Error handling működik
- [ ] Data validation működik
- [ ] Code review elvégezve

### **5.2 Sprint 5 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] "+" gomb minden mérkőzéshez
- [ ] Bet Tracker komponens működik
- [ ] Fogadások hozzáadása/törlése
- [ ] Adatbázis tárolás működik
- [ ] Real-time frissítések
- [ ] Inline szerkesztés működik
- [ ] Reszponzív design minden eszközön

**Műszaki követelmények:**
- [ ] TypeScript hiba nincs
- [ ] ESLint szabályok betartva
- [ ] Lighthouse Score 95+
- [ ] Mobile Performance 90+
- [ ] Accessibility megfelelés
- [ ] Unit test coverage > 90%
- [ ] Integration test coverage > 80%

**Felhasználói élmény:**
- [ ] Intuitív gomb működés
- [ ] Gyors válaszidő (< 300ms)
- [ ] Vizuális visszajelzés
- [ ] Smooth animációk
- [ ] Cross-browser kompatibilitás
- [ ] Mobile-optimalizált felület

### **5.3 Sprint 5 Technikai Specifikáció**

**Kapcsolódó dokumentumok:**
- **Story:** `docs/stories/1.15.story.md`
- **Specifikáció:** `docs/prd/bet-tracker-spec.md`
- **Architektúra:** `docs/architecture/bet-tracker-architecture.md`
- **Tesztelés:** `docs/qa/bet-tracker-testing-strategy.md`

**Új fájlok:**
- `src/components/bet-tracker/BetTrackerButton.tsx`
- `src/components/bet-tracker/BetTrackerPanel.tsx`
- `src/components/bet-tracker/BetTrackerProvider.tsx`
- `src/components/bet-tracker/BetTrackerItem.tsx`
- `src/lib/hooks/use-bet-tracker.ts`
- `src/lib/api/bet-tracker-api.ts`
- `src/lib/types/bet-tracker.ts`

**Módosított fájlok:**
- `src/components/ArbitrageTable.tsx`
- `src/components/dashboard/DashboardContent.tsx`
- `src/lib/supabase/schema.sql`

## 🎯 **6. SPRINT 6: KALKULÁTOR IKON**

**Időtartam:** 2025. január 27-31. (1 hét)  
**Sprint Goal:** Kalkulátor funkció implementálása  
**Státusz:** Not Started  

### **6.1 Sprint Backlog**

#### **CALC-001: Kalkulátor Modal Létrehozása**
- **Story Points:** 5
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Not Started

#### **CALC-002: Kalkulátor Ikon Implementálása**
- **Story Points:** 3
- **Prioritás:** MAGAS
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Not Started

### **6.2 Sprint 6 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] Kalkulátor ikon minden mérkőzéshez
- [ ] Modal felugró ablak működik
- [ ] Tét beviteli mezők működnek
- [ ] Profit számítás működik
- [ ] Reszponzív design

## 🎯 **7. SPRINT 7-8: PROFIL OLDALAK**

**Időtartam:** 2025. február 3-14. (2 hét)  
**Sprint Goal:** Profil oldalak kifejlesztése  
**Státusz:** Not Started  

### **7.1 Sprint Backlog**

#### **PROFILE-001: Settings Oldal Fejlesztése**
- **Story Points:** 5
- **Prioritás:** KÖZEPES
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Not Started

#### **PROFILE-002: History Oldal Fejlesztése**
- **Story Points:** 5
- **Prioritás:** KÖZEPES
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap (8 óra)
- **Státusz:** Not Started

#### **PROFILE-003: Subscriptions Oldal Fejlesztése**
- **Story Points:** 3
- **Prioritás:** ALACSONY
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap (4 óra)
- **Státusz:** Not Started

### **7.2 Sprint 7-8 Elfogadási Kritériumok**

**Funkcionális követelmények:**
- [ ] `/profile/settings` oldal működik
- [ ] `/profile/history` oldal működik
- [ ] `/profile/subscriptions` oldal működik
- [ ] Minden oldal navigálható
- [ ] Reszponzív design

## 📊 **8. SPRINT METRIKÁK**

### **8.1 Velocity Tracking**

| Sprint | Story Points | Időigény | Teljesítmény |
|--------|--------------|----------|--------------|
| Sprint 1 | 32 | 1 hét | 100% |
| Sprint 2 | 3 | 0.5 hét | 100% |
| Sprint 3-4 | 13 | 2 hét | 100% |
| Sprint 5 | 13 | 1 hét | 100% |
| Sprint 6 | 8 | 1 hét | 100% |
| Sprint 7-8 | 13 | 2 hét | 100% |

### **8.2 Sprint Burndown Trend**

**Átlagos velocity:** 32 Story Points/hét  
**Átlagos teljesítmény:** 100%  
**Átlagos időigény:** 1 hét/sprint  

### **8.3 Quality Metrics**

**Code Review Coverage:** 100%  
**Test Coverage:** 80%+  
**Bug Rate:** < 5%  
**Technical Debt:** < 10%  

## 🚧 **9. KOCKÁZATOK ÉS MITIGÁCIÓ**

### **9.1 Sprint 1 Kockázatok**

**Kockázat:** Next.js 15 kompatibilitási problémák
- **Mitigáció:** Staging környezetben tesztelés
- **Fallback:** Next.js 14 használata

**Kockázat:** Tailwind CSS osztályok konfliktusok
- **Mitigáció:** CSS-in-JS megoldás
- **Fallback:** Custom CSS osztályok

**Kockázat:** Bundle size túl nagy
- **Mitigáció:** Code splitting, tree shaking
- **Fallback:** Bundle analyzer használata

### **9.2 Általános Kockázatok**

**Kockázat:** Fejlesztői kapacitás hiány
- **Mitigáció:** Priorítások felülvizsgálata
- **Fallback:** Story-k áthelyezése következő sprint-be

**Kockázat:** Technikai nehézségek
- **Mitigáció:** Korai prototípus készítése
- **Fallback:** Egyszerűbb megoldások

**Kockázat:** Stakeholder visszajelzés késése
- **Mitigáció:** Folyamatos kommunikáció
- **Fallback:** Demo készítése

## 📅 **10. SPRINT CEREMONIÁK**

### **10.1 Sprint Planning**

**Időpont:** Minden sprint kezdete (hétfő 9:00-10:00)  
**Résztvevők:** Product Owner, Scrum Master, Fejlesztő csapat  
**Agenda:**
- Sprint goal meghatározása
- Story-k kiválasztása
- Feladatok felbontása
- Kapacitás tervezése

### **10.2 Daily Standup**

**Időpont:** Minden munkanap 9:00-9:15  
**Résztvevők:** Fejlesztő csapat, Scrum Master  
**Agenda:**
- Mit csináltam tegnap?
- Mit fogok ma csinálni?
- Van-e akadályom?

### **10.3 Sprint Review**

**Időpont:** Minden sprint végén (péntek 16:00-17:00)  
**Résztvevők:** Product Owner, Scrum Master, Fejlesztő csapat, Stakeholders  
**Agenda:**
- Sprint eredmények bemutatása
- Demo a fejlesztett funkciókból
- Stakeholder visszajelzés
- Következő sprint terve

### **10.4 Sprint Retrospective**

**Időpont:** Minden sprint végén (péntek 17:00-17:30)  
**Résztvevők:** Product Owner, Scrum Master, Fejlesztő csapat  
**Agenda:**
- Mi ment jól?
- Mi ment rosszul?
- Mit javítunk?
- Action items meghatározása

## ✅ **11. SPRINT SUCCESS CRITERIA**

### **11.1 Sprint 1 Success Criteria**

**Funkcionális:**
- [ ] Kezdőlap betöltődik és megjelenik
- [ ] Minden szekció megfelelően renderelődik
- [ ] CTA gombok működnek és navigálnak
- [ ] Reszponzív design minden képernyőméreten
- [ ] Animációk és effektek működnek

**Műszaki:**
- [ ] TypeScript hiba nincs
- [ ] ESLint szabályok betartva
- [ ] Lighthouse Score 95+
- [ ] Mobile Performance 90+
- [ ] SEO meta címkék megfelelnek

**Felhasználói élmény:**
- [ ] Intuitív navigáció
- [ ] Gyors betöltés (< 2s)
- [ ] Accessibility megfelelés
- [ ] Cross-browser kompatibilitás
- [ ] Mobile-optimalizált felület

### **11.2 Általános Success Criteria**

**Minden sprint:**
- [ ] Sprint goal elérve
- [ ] Minden story "Done" státuszban
- [ ] Code review elvégezve
- [ ] Tesztek sikeresen lefutnak
- [ ] Dokumentáció frissítve

## 📚 **12. KAPCSOLÓDÓ DOKUMENTUMOK**

- **PRD:** `docs/prd/index.md`
- **Backlog:** `docs/prd/backlog.md`
- **Kezdőlap Spec:** `docs/prd/kezdolap-spec.md`
- **Architecture:** `docs/architecture/`
- **Design System:** `DESIGN_SYSTEM.md`
- **Component Templates:** `COMPONENT_TEMPLATES.md`

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. december 19.  
**Product Owner:** Sarah  
**Scrum Master:** Bob  
**Státusz:** Active - Sprint 1 In Progress
