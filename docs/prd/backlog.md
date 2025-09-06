# ProTipp V2 - Product Backlog

**Verzió:** 1.0  
**Dátum:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Active  
**Kapcsolódó PRD:** `docs/prd/index.md`  

## 📋 **1. BACKLOG ÁTTEKINTÉS**

### **1.1 Backlog Cél**
A ProTipp V2 platform fejlesztési feladatainak strukturált kezelése, prioritások meghatározása és a fejlesztési csapat munkájának koordinálása.

### **1.2 Backlog Típusok**
- **Epic:** Nagy funkcionalitási egységek
- **Feature:** Konkrét funkciók
- **User Story:** Felhasználói szempontból definiált feladatok
- **Bug Fix:** Hibajavítások
- **Technical Debt:** Műszaki adósságok

### **1.3 Prioritási Rendszer**
- **MAGAS:** Kritikus funkciók, üzleti érték
- **KÖZEPES:** Fontos funkciók, felhasználói élmény
- **ALACSONY:** Kellemes funkciók, optimalizációk

## 🎯 **2. EPIC 1: KEZDŐLAP LÉTREHOZÁSA**

**Prioritás:** MAGAS  
**Időigény:** 1 hét  
**Státusz:** In Progress  
**Sprint:** Sprint 1  
**Felelős:** Frontend fejlesztő  

### **2.1 Epic Leírás**
Felhasználóbarát kezdőlap kialakítása, amely bemutatja a ProTipp V2 fő funkcióit és előnyeit, valamint biztosítja a megfelelő navigációs alapot a teljes platformhoz.

### **2.2 Üzleti Érték**
- **Felhasználói élmény javítása:** Intuitív, felhasználóbarát kezdőlap
- **Funkcionalitás bővítése:** Hiányzó oldalak és funkciók implementálása
- **Versenyképesség:** OddsJam.com hasonló felhasználói élmény
- **Magyar lokalizáció:** Helyi piac igényeinek megfelelés

### **2.3 User Stories**

#### **HOME-001: Projekt Struktúra Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 3
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] Létrehozva a `src/components/home/` könyvtár
- [ ] Minden kezdőlap komponens fájl létrehozva
- [ ] Komponensek exportálva a `src/components/home/index.ts` fájlban
- [ ] Tailwind CSS konfiguráció frissítve a kezdőlap stílusokhoz

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Architecture: `docs/architecture/kezdolap-architecture.md`

#### **HOME-002: HeroSection Komponens Fejlesztése**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] Hero section teljes képernyő magasságú
- [ ] Gradient háttér implementálva
- [ ] Fő cím, alcím és leírás megjelenik
- [ ] 3 CTA gomb (Regisztráció, Bejelentkezés, Hogyan működik)
- [ ] Animált bejelenés (fade-in, slide-up)
- [ ] Reszponzív design (mobile-first)

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Design System: `DESIGN_SYSTEM.md`

#### **HOME-003: FeaturesSection Komponens Fejlesztése**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] 3 oszlopos grid layout (mobile: 1 oszlop)
- [ ] Minden funkció kártya formában jelenik meg
- [ ] Ikonok, címek, leírások és jellemzők megjelennek
- [ ] Hover effektek implementálva
- [ ] Reszponzív breakpoint-ok működnek

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Component Templates: `COMPONENT_TEMPLATES.md`

#### **HOME-004: HowItWorksSection Komponens Fejlesztése**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] 3 lépéses timeline layout
- [ ] Minden lépéshez ikon, cím, leírás és vizuális elem
- [ ] Vízszintes layout desktop-en, függőleges mobile-en
- [ ] Lépések számozva és sorrendben
- [ ] Animált bejelenés

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Design System: `DESIGN_SYSTEM.md`

#### **HOME-005: TestimonialsSection Komponens Fejlesztése**
- **Prioritás:** KÖZEPES
- **Story Points:** 3
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] 2-3 testimonial kártya megjelenik
- [ ] Minden testimonialhoz név, pozíció, értékelés és vélemény
- [ ] Kártya layout reszponzív
- [ ] Csillagos értékelés megjelenik
- [ ] Avatar placeholder

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Component Templates: `COMPONENT_TEMPLATES.md`

#### **HOME-006: StatsSection Komponens Fejlesztése**
- **Prioritás:** KÖZEPES
- **Story Points:** 3
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] 4 oszlopos grid layout (mobile: 2x2)
- [ ] Minden statisztikához ikon, szám és címke
- [ ] Animált számlálók (opcionális)
- [ ] Reszponzív breakpoint-ok
- [ ] Ikonok és szövegek olvashatóak

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Design System: `DESIGN_SYSTEM.md`

#### **HOME-007: CallToActionSection Komponens Fejlesztése**
- **Prioritás:** MAGAS
- **Story Points:** 3
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] Központosított layout
- [ ] Fő üzenet és 3 CTA gomb
- [ ] Elsődleges gomb kiemelve
- [ ] Gradient háttér
- [ ] Reszponzív design

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Component Templates: `COMPONENT_TEMPLATES.md`

#### **HOME-008: Kezdőlap Integráció és Navigáció**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Ready for Development
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] Kezdőlap komponensek integrálva a `src/app/page.tsx`-be
- [ ] Navigációs menü frissítve
- [ ] Dashboard áthelyezve `/dashboard` útvonalra
- [ ] SEO meta címkék implementálva
- [ ] Reszponzív navigáció működik

**Kapcsolódó dokumentumok:**
- PRD: `docs/prd/kezdolap-spec.md`
- Architecture: `docs/architecture/kezdolap-architecture.md`

### **2.4 Epic Összefoglaló**
- **Összes Story:** 8
- **Összes Story Points:** 32
- **Időigény:** 1 hét (5 munkanap)
- **Felelős:** Frontend fejlesztő
- **Státusz:** In Progress

## 🎯 **3. EPIC 2: DASHBOARD ÁTHELYEZÉS**

**Prioritás:** MAGAS  
**Időigény:** 0.5 hét  
**Státusz:** Not Started  
**Sprint:** Sprint 2  
**Felelős:** Frontend fejlesztő  

### **3.1 Epic Leírás**
A jelenlegi dashboard funkciók áthelyezése a `/dashboard` útvonalra, hogy a kezdőlap önállóan működjön és a felhasználók könnyen navigálhassanak.

### **3.2 Üzleti Érték**
- **Navigációs tisztaság:** Egyértelmű útvonalak
- **Felhasználói élmény:** Logikus oldal struktúra
- **SEO optimalizálás:** Különböző oldalak különböző célokra

### **3.3 User Stories**

#### **DASH-001: Dashboard Útvonal Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 3
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] `/dashboard` útvonal létrehozva
- [ ] Jelenlegi dashboard funkciók áthelyezve
- [ ] Navigáció frissítve
- [ ] Oldal betöltődik és működik

**Kapcsolódó dokumentumok:**
- Architecture: `docs/architecture/dashboard-architecture.md`
- Navigation: `src/components/navigation/MainNavigation.tsx`

## 🎯 **4. EPIC 3: HIÁNYZÓ OLDALAK FEJLESZTÉSE**

**Prioritás:** MAGAS  
**Időigény:** 2 hét  
**Státusz:** Not Started  
**Sprint:** Sprint 3-4  
**Felelős:** Frontend fejlesztő  

### **4.1 Epic Leírás**
A navigációban szereplő, de még nem létező oldalak létrehozása: `/arbitrage`, `/analytics`, `/settings`.

### **4.2 Üzleti Érték**
- **Teljes funkcionalitás:** Minden menüpont működik
- **Felhasználói élmény:** Nincs törött link
- **Navigációs konzisztencia:** Egységes oldal struktúra

### **4.3 User Stories**

#### **PAGE-001: Arbitrage Oldal Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] `/arbitrage` útvonal létrehozva
- [ ] ArbitrageTable komponens integrálva
- [ ] Szűrők és keresés működik
- [ ] Reszponzív design
- [ ] Navigáció frissítve

#### **PAGE-002: Analytics Oldal Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] `/analytics` útvonal létrehozva
- [ ] AnalyticsDashboard komponens integrálva
- [ ] Grafikonok és statisztikák megjelennek
- [ ] Reszponzív design
- [ ] Navigáció frissítve

#### **PAGE-003: Settings Oldal Létrehozása**
- **Prioritás:** KÖZEPES
- **Story Points:** 3
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] `/settings` útvonal létrehozva
- [ ] Alapvető beállítások megjelennek
- [ ] Reszponzív design
- [ ] Navigáció frissítve

## 🎯 **5. EPIC 4: "ADD TO BET TRACKER" FUNKCIÓ**

**Prioritás:** MAGAS  
**Időigény:** 1 hét  
**Státusz:** ✅ **DONE** - 2025-01-26  
**Sprint:** Sprint 5  
**Felelős:** Frontend + Backend fejlesztő  

### **5.1 Epic Leírás**
"+" gomb implementálása minden mérkőzéshez, amely lehetővé teszi a felhasználók számára, hogy a kiválasztott fogadásokat hozzáadják egy "Bet Tracker" listához.

### **5.2 Üzleti Érték**
- **Felhasználói engagement:** Aktív fogadás követés
- **Platform használat:** Több idő a platformon
- **Funkcionalitás:** OddsJam.com hasonló funkció

### **5.3 User Stories**

#### **TRACKER-001: Bet Tracker Komponens Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** ✅ **DONE** - 2025-01-26
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [x] BetTracker komponens létrehozva ✅
- [x] Fogadások listázása ✅
- [x] Hozzáadás/törlés funkció ✅
- [x] Reszponzív design ✅

#### **TRACKER-002: "+" Gomb Implementálása**
- **Prioritás:** MAGAS
- **Story Points:** 3
- **Státusz:** ✅ **DONE** - 2025-01-26
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [x] "+" gomb minden mérkőzéshez ✅
- [x] Kattintható és működik ✅
- [x] Visszajelzés a felhasználónak ✅
- [x] Stílus konzisztens ✅

#### **TRACKER-003: Adatbázis Integráció**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** ✅ **DONE** - 2025-01-26
- **Felelős:** Backend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [x] Bet Tracker tábla létrehozva ✅
- [x] API endpoints működnek ✅
- [x] CRUD műveletek ✅
- [x] Real-time frissítések ✅

## 🎯 **6. EPIC 5: KALKULÁTOR IKON FUNKCIÓ**

**Prioritás:** MAGAS  
**Időigény:** 1 hét  
**Státusz:** Not Started  
**Sprint:** Sprint 6  
**Felelős:** Frontend fejlesztő  

### **6.1 Epic Leírás**
Kalkulátor ikon implementálása minden mérkőzéshez, amely felugró ablakot nyit meg a tét, kifizetés és profit számítással.

### **6.2 Üzleti Érték**
- **Felhasználói segítség:** Gyors profit számítás
- **Platform használat:** Több interakció
- **Funkcionalitás:** OddsJam.com hasonló funkció

### **6.3 User Stories**

#### **CALC-001: Kalkulátor Modal Létrehozása**
- **Prioritás:** MAGAS
- **Story Points:** 5
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] Kalkulátor modal létrehozva
- [ ] Tét beviteli mezők
- [ ] Profit számítás
- [ ] Reszponzív design

#### **CALC-002: Kalkulátor Ikon Implementálása**
- **Prioritás:** MAGAS
- **Story Points:** 3
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] Kalkulátor ikon minden mérkőzéshez
- [ ] Kattintható és modal nyit
- [ ] Stílus konzisztens
- [ ] Hover effekt

## 🎯 **7. EPIC 6: PROFIL OLDALAK KIFEJLESZTÉSE**

**Prioritás:** KÖZEPES  
**Időigény:** 2 hét  
**Státusz:** Not Started  
**Sprint:** Sprint 7-8  
**Felelős:** Frontend + Backend fejlesztő  

### **7.1 Epic Leírás**
A profil alatti hiányzó oldalak kifejlesztése: `/profile/settings`, `/profile/history`, `/profile/subscriptions`.

### **7.2 Üzleti Érték**
- **Felhasználói élmény:** Teljes profil rendszer
- **Platform használat:** Több funkció
- **Felhasználói retention:** Jobb élmény

### **7.3 User Stories**

#### **PROFILE-001: Settings Oldal Fejlesztése**
- **Prioritás:** KÖZEPES
- **Story Points:** 5
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] `/profile/settings` útvonal létrehozva
- [ ] Felhasználói beállítások
- [ ] Jelszó módosítás
- [ ] Reszponzív design

#### **PROFILE-002: History Oldal Fejlesztése**
- **Prioritás:** KÖZEPES
- **Story Points:** 5
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 1 nap

**Elfogadási Kritériumok:**
- [ ] `/profile/history` útvonal létrehozva
- [ ] Fogadási előzmények
- [ ] Statisztikák és grafikonok
- [ ] Reszponzív design

#### **PROFILE-003: Subscriptions Oldal Fejlesztése**
- **Prioritás:** ALACSONY
- **Story Points:** 3
- **Státusz:** Not Started
- **Felelős:** Frontend fejlesztő
- **Időigény:** 0.5 nap

**Elfogadási Kritériumok:**
- [ ] `/profile/subscriptions` útvonal létrehozva
- [ ] Előfizetési információk
- [ ] Fizetési adatok
- [ ] Reszponzív design

## 📊 **8. BACKLOG ÖSSZESÍTÉS**

### **8.1 Sprint Összesítés**

| Sprint | Epic | Story-k | Story Points | Időigény |
|--------|------|---------|--------------|----------|
| Sprint 1 | Kezdőlap Létrehozása | 8 | 32 | 1 hét |
| Sprint 2 | Dashboard Áthelyezés | 1 | 3 | 0.5 hét |
| Sprint 3-4 | Hiányzó Oldalak | 3 | 13 | 2 hét |
| Sprint 5 | Add to Bet Tracker | 3 | 13 | 1 hét | ✅ **DONE** |
| Sprint 6 | Kalkulátor Ikon | 2 | 8 | 1 hét |
| Sprint 7-8 | Profil Oldalak | 3 | 13 | 2 hét |

### **8.2 Teljes Backlog**

| Epic | Story-k | Story Points | Időigény | Priorítás |
|------|---------|--------------|----------|-----------|
| Kezdőlap Létrehozása | 8 | 32 | 1 hét | MAGAS |
| Dashboard Áthelyezés | 1 | 3 | 0.5 hét | MAGAS |
| Hiányzó Oldalak | 3 | 13 | 2 hét | MAGAS |
| Add to Bet Tracker | 3 | 13 | 1 hét | MAGAS | ✅ **DONE** |
| Kalkulátor Ikon | 2 | 8 | 1 hét | MAGAS |
| Profil Oldalak | 3 | 13 | 2 hét | KÖZEPES |

**Összesen:**
- **Story-k:** 20
- **Story Points:** 82
- **Időigény:** 7.5 hét
- **Prioritás:** 83% MAGAS, 17% KÖZEPES

## 📅 **9. FEJLESZTÉSI TERV**

### **9.1 Rövid Távú (1-2 hónap)**
- **Sprint 1-2:** Kezdőlap és Dashboard
- **Sprint 3-4:** Hiányzó oldalak
- **Sprint 5:** Add to Bet Tracker

### **9.2 Középtávú (2-3 hónap)**
- **Sprint 6:** Kalkulátor ikon
- **Sprint 7-8:** Profil oldalak

### **9.3 Hosszú Távú (3+ hónap)**
- Analytics dashboard fejlesztése
- Mobile app optimalizáció
- AI-powered funkciók
- International expansion

## ✅ **10. BACKLOG KÉZELÉS**

### **10.1 Backlog Refinement**
- **Hetente:** Story-k finomhangolása
- **Sprint előtt:** Acceptance criteria ellenőrzése
- **Sprint után:** Retrospective és tanulságok

### **10.2 Prioritás Kezelés**
- **Üzleti érték:** Magas prioritás
- **Technikai függőség:** Logikai sorrend
- **Felhasználói visszajelzés:** Folyamatos értékelés

### **10.3 Kapacitás Tervezés**
- **Frontend fejlesztő:** 40 óra/hét
- **Backend fejlesztő:** 20 óra/hét (part-time)
- **Story Point kapacitás:** 32-40 SP/sprint

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Active - Folyamatos frissítés
