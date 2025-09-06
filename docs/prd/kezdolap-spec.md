# ProTipp V2 - Kezdőlap Részletes Specifikáció

**Verzió:** 1.0  
**Dátum:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Draft  
**Kapcsolódó PRD:** `docs/prd/index.md`  

## 🎯 **1. FUNKCIÓ ÁTTEKINTÉS**

### **1.1 Cél**
Felhasználóbarát kezdőlap kialakítása, amely bemutatja a ProTipp V2 fő funkcióit és előnyeit, valamint biztosítja a megfelelő navigációs alapot a teljes platformhoz.

### **1.2 Priorítás**
**MAGAS** - Ez a legfontosabb feladat, mivel jelenleg a weboldal közvetlenül a dashboard funkciókra navigál.

### **1.3 Időigény**
**1 hét (5 munkanap)** - Sprint 1 teljes időtartama

### **1.4 Felelős**
**Frontend fejlesztő** - Teljes felelősség a kezdőlap implementálásáért

## 🚀 **2. RÉSZLETES FUNKCIÓ SPECIFIKÁCIÓ**

### **2.1 Üdvözlő Szekció (Hero Section)**

**Pozíció:** Oldal teteje, teljes képernyő magasság  
**Stílus:** Dark theme, gradient háttér, központosított tartalom  

#### **Tartalom:**
- **Fő cím:** "ProTipp V2 - Professzionális Arbitrage Platform"
- **Alcím:** "Valós idejű sportszorzó arbitrage lehetőségek egy helyen"
- **Leírás:** "Fedezze fel a profitot a különböző fogadóirodák közötti odds különbségekből. Automatikus arbitrage detektálás, kalkulátor és fogadáskövető rendszer."

#### **Call-to-Action gombok:**
1. **"Ingyenes Regisztráció"** (elsődleges, lila)
   - Stílus: `bg-primary hover:bg-primary/90 text-primary-foreground`
   - Művelet: `/register` útvonalra navigálás
   - Ikon: `UserPlus` (lucide-react)

2. **"Bejelentkezés"** (másodlagos, átlátszó)
   - Stílus: `border border-border hover:bg-accent hover:text-accent-foreground`
   - Művelet: `/login` útvonalra navigálás
   - Ikon: `LogIn` (lucide-react)

3. **"Hogyan működik?"** (harmadlagos, ghost)
   - Stílus: `hover:bg-accent hover:text-accent-foreground`
   - Művelet: Hogyan működik szekcióra görgetés
   - Ikon: `HelpCircle` (lucide-react)

#### **Technikai követelmények:**
- Responsive design (mobile-first)
- Gradient háttér: `bg-gradient-to-br from-background via-background to-primary/10`
- Animált bejelenés (fade-in, slide-up)
- Parallax effekt opcionális

### **2.2 Fő Funkciók Bemutatása**

**Pozíció:** Hero section alatt, 3 oszlopos grid  
**Stílus:** Kártya alapú layout, ikonok, hover effektek  

#### **Funkciók:**

**A) Arbitrage Lehetőségek**
- **Ikon:** `TrendingUp` (lucide-react)
- **Cím:** "Arbitrage Lehetőségek"
- **Leírás:** "Valós idejű arbitrage lehetőségek automatikus detektálással"
- **Jellemzők:**
  - Real-time odds frissítések
  - Automatikus profit számítás
  - Szűrés sport és profit szerint
  - Értesítések magas profit lehetőségekről

**B) Fogadási Kalkulátor**
- **Ikon:** `Calculator` (lucide-react)
- **Cím:** "Profit Kalkulátor"
- **Leírás:** "Pontos profit számítás tét elosztással és kockázat elemzéssel"
- **Jellemzők:**
  - Tét elosztás optimalizálás
  - ROI számítás
  - Kockázat elemzés
  - Arbitrage profit kalkuláció

**C) Bet Tracker (Fogadáskövető)**
- **Ikon:** `Target` (lucide-react)
- **Cím:** "Fogadáskövető"
- **Leírás:** "Követse fogadásait és elemzze teljesítményét"
- **Jellemzők:**
  - Fogadások mentése
  - Teljesítmény statisztikák
  - Profit/veszteség követés
  - Export funkciók

#### **Layout osztályok:**
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Kártya: `bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-shadow`
- Ikon: `h-12 w-12 text-primary mb-4`

### **2.3 Hogyan Működik Szekció**

**Pozíció:** Fő funkciók alatt, 3 lépéses folyamat  
**Stílus:** Vízszintes timeline, ikonok, számozott lépések  

#### **Lépések:**

**1. Lépés: Regisztráció**
- **Ikon:** `UserPlus` (lucide-react)
- **Cím:** "Regisztráció"
- **Leírás:** "Hozzon létre ingyenes fiókot 2 perc alatt"
- **Vizuális:** Regisztrációs űrlap mockup
- **Számozás:** "1" badge

**2. Lépés: Arbitrage Keresés**
- **Ikon:** `Search` (lucide-react)
- **Cím:** "Arbitrage Keresés"
- **Leírás:** "Fedezze fel a legjobb arbitrage lehetőségeket"
- **Vizuális:** Arbitrage táblázat mockup
- **Számozás:** "2" badge

**3. Lépés: Profit Realizálás**
- **Ikon:** `DollarSign` (lucide-react)
- **Cím:** "Profit Realizálás"
- **Leírás:** "Helyezze el fogadásait és realizálja a profitot"
- **Vizuális:** Profit grafikon mockup
- **Számozás:** "3" badge

#### **Layout osztályok:**
- Desktop: `flex flex-row justify-between items-start`
- Mobile: `flex flex-col space-y-8`
- Lépés: `flex-1 text-center px-4`
- Ikon: `h-16 w-16 text-primary mx-auto mb-4`

### **2.4 Felhasználói Vélemények**

**Pozíció:** Hogyan működik alatt, 2-3 testimonial  
**Stílus:** Kártya layout, avatar, értékelések  

#### **Tartalom:**
- **Testimonial 1:**
  - Név: "Kovács Péter"
  - Pozíció: "Amatőr fogadó"
  - Értékelés: ⭐⭐⭐⭐⭐
  - Vélemény: "A ProTipp V2 segítségével már 3 hónap alatt 15% profitot értem el. A platform egyszerűen használható és valós idejű adatokat szolgáltat."

- **Testimonial 2:**
  - Név: "Nagy Anna"
  - Pozíció: "Veterán fogadó"
  - Értékelés: ⭐⭐⭐⭐⭐
  - Vélemény: "A legjobb arbitrage platform, amit valaha használtam. A kalkulátor funkciók és a fogadáskövető rendszer nélkülözhetetlen."

- **Testimonial 3:**
  - Név: "Szabó Gábor"
  - Pozíció: "Profi fogadó"
  - Értékelés: ⭐⭐⭐⭐⭐
  - Vélemény: "Professzionális eszközök, amikor a legjobb odds-okat keressük. A real-time frissítések és a szűrési lehetőségek kiválóak."

#### **Layout osztályok:**
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Kártya: `bg-card border border-border/50 rounded-lg p-6`
- Avatar: `h-16 w-16 rounded-full bg-muted`

### **2.5 Statisztikák Szekció**

**Pozíció:** Vélemények alatt, 4 oszlopos grid  
**Stílus:** Nagy számok, ikonok, animált számlálók  

#### **Statisztikák:**
- **Aktív Felhasználók:** 10,000+ (felhasználó ikon)
- **Arbitrage Lehetőségek:** 50,000+ naponta (trending ikon)
- **Átlagos Profit:** 8.5% (dollar ikon)
- **Sportágak:** 25+ (trophy ikon)

#### **Layout osztályok:**
- Grid: `grid grid-cols-2 lg:grid-cols-4 gap-6`
- Stat: `text-center p-4`
- Ikon: `h-12 w-12 mx-auto mb-2`
- Érték: `text-3xl font-bold mb-1`

### **2.6 Call-to-Action Szekció**

**Pozíció:** Oldal alja, központosított  
**Stílus:** Nagy gombok, gradient háttér  

#### **Tartalom:**
- **Fő üzenet:** "Kezdje el a profit realizálását ma!"
- **Gombok:**
  - "Ingyenes Regisztráció" (elsődleges, nagy)
  - "Demo Megtekintése" (másodlagos)
  - "Kapcsolatfelvétel" (harmadlagos)

#### **Layout osztályok:**
- Szekció: `bg-gradient-to-r from-primary/10 to-purple-500/10 py-16`
- Üzenet: `text-3xl font-bold text-center mb-8`
- Gombok: `flex flex-col sm:flex-row gap-4 justify-center`

## 🔧 **3. TECHNIKAI SPECIFIKÁCIÓ**

### **3.1 Komponens Struktúra**

```tsx
// src/app/page.tsx (új kezdőlap)
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <StatsSection />
      <CallToActionSection />
    </div>
  );
}

// Komponensek:
// src/components/home/HeroSection.tsx
// src/components/home/FeaturesSection.tsx
// src/components/home/HowItWorksSection.tsx
// src/components/home/TestimonialsSection.tsx
// src/components/home/StatsSection.tsx
// src/components/home/CallToActionSection.tsx
```

### **3.2 Styling és Design**

**Tailwind CSS osztályok:**
- **Gradient háttér:** `bg-gradient-to-br from-background via-background to-primary/10`
- **Kártya háttér:** `bg-card border border-border/50`
- **Elsődleges gomb:** `bg-primary hover:bg-primary/90 text-primary-foreground`
- **Másodlagos gomb:** `bg-secondary hover:bg-secondary/80 text-secondary-foreground`
- **Átlátszó gomb:** `border border-border hover:bg-accent hover:text-accent-foreground`

**Animációk:**
- **Fade-in:** `animate-in fade-in duration-500`
- **Slide-up:** `animate-in slide-in-from-bottom-4 duration-500`
- **Hover effektek:** `hover:scale-105 transition-transform`

### **3.3 Responsive Design**

**Breakpoints:**
- **Mobile:** 320px - 767px (1 oszlop)
- **Tablet:** 768px - 1023px (2 oszlop)
- **Desktop:** 1024px+ (3 oszlop)

**Mobile First megközelítés:**
- Alapértelmezett: 1 oszlopos layout
- `md:` prefix: 2 oszlopos layout
- `lg:` prefix: 3 oszlopos layout

### **3.4 SEO Optimalizálás**

**Meta címkék:**
```tsx
export const metadata: Metadata = {
  title: "ProTipp V2 - Professzionális Arbitrage Platform | Ingyenes Regisztráció",
  description: "Fedezze fel a profitot a sportszorzó arbitrage lehetőségekből. Valós idejű odds összehasonlítás, kalkulátor és fogadáskövető rendszer.",
  keywords: ["arbitrage", "sports betting", "odds comparison", "profit calculator", "fogadás", "profit"],
  openGraph: {
    title: "ProTipp V2 - Professzionális Arbitrage Platform",
    description: "Valós idejű sportszorzó arbitrage lehetőségek egy helyen",
    images: ["/og-image-home.png"],
  },
};
```

## 📱 **4. FELHASZNÁLÓI ÉLMÉNY (UX) SPECIFIKÁCIÓ**

### **4.1 Navigációs Struktúra**

**Kezdőlap navigáció:**
```
/ (Kezdőlap)
├── #hero (Üdvözlő szekció)
├── #features (Fő funkciók)
├── #how-it-works (Hogyan működik)
├── #testimonials (Vélemények)
├── #stats (Statisztikák)
└── #cta (Call-to-action)
```

**Navigációs menü frissítése:**
- **Főoldal** (`/`) - Új kezdőlap
- **Dashboard** (`/dashboard`) - Jelenlegi dashboard funkciók
- **Arbitrage** (`/arbitrage`) - Arbitrage lehetőségek
- **Analytics** (`/analytics`) - Elemzések és statisztikák
- **Profil** (`/profile`) - Felhasználói profil

### **4.2 Reszponzív Design**

**Mobile First megközelítés:**
- Alapértelmezett: 1 oszlopos layout
- Touch-friendly gombok (minimum 44px)
- Swipe gestures támogatása
- Mobile-optimalizált tipográfia

**Tablet és Desktop:**
- Fokozatos oszlopok növelése
- Hover effektek
- Parallax animációk
- Nagyobb tipográfia

### **4.3 Accessibility**

**WCAG 2.1 AA megfelelés:**
- **Color contrast:** Minimum 4.5:1 arány
- **Keyboard navigation:** Teljes billentyűzet támogatás
- **Screen reader:** ARIA labels és semantic HTML
- **Focus management:** Látható focus indikátorok

## 🧪 **5. TESZTELÉSI KÖVETELMÉNYEK**

### **5.1 Unit Tesztek**

**Komponens tesztelés:**
- Renderelés minden képernyőméreten
- Props validáció
- Event handler-ek működése
- State management

**Stílus tesztelés:**
- Tailwind CSS osztályok működése
- Responsive breakpoint-ok
- Hover effektek
- Animációk

### **5.2 Integration Tesztek**

**Navigáció tesztelés:**
- Kezdőlap betöltése
- CTA gombok működése
- Smooth scrolling
- URL hash navigáció

**SEO tesztelés:**
- Meta címkék megfelelnek
- Open Graph tags
- Structured data
- Page title és description

### **5.3 E2E Tesztek**

**Felhasználói útvonalak:**
- Kezdőlap látogatás
- Regisztrációs folyamat
- Bejelentkezési folyamat
- Navigáció minden oldalra

**Cross-browser kompatibilitás:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 **6. MINŐSÉGI KÖVETELMÉNYEK**

### **6.1 Teljesítmény**

**Lighthouse Score:**
- **Overall:** 95+
- **Performance:** 95+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 95+

**Core Web Vitals:**
- **First Contentful Paint:** < 1.2s
- **Largest Contentful Paint:** < 2.0s
- **Cumulative Layout Shift:** < 0.05
- **First Input Delay:** < 100ms

### **6.2 Kód Minőség**

**TypeScript:**
- Strict mode enabled
- No type errors
- Proper interface definitions
- Type safety

**ESLint:**
- All rules passing
- Consistent code style
- Best practices followed
- No warnings

### **6.3 Felhasználói Élmény**

**Usability:**
- Intuitív navigáció
- Gyors betöltés
- Reszponzív design
- Accessibility megfelelés

**Performance:**
- Smooth animációk
- Gyors interakciók
- Optimalizált képek
- Efficient rendering

## 🚧 **7. KOCKÁZATOK ÉS MITIGÁCIÓ**

### **7.1 Technikai Kockázatok**

**Kockázat:** Next.js 15 kompatibilitási problémák
- **Mitigáció:** Staging környezetben tesztelés, fallback terv Next.js 14-re

**Kockázat:** Tailwind CSS osztályok konfliktusok
- **Mitigáció:** CSS-in-JS megoldás, custom CSS osztályok

**Kockázat:** Bundle size túl nagy
- **Mitigáció:** Code splitting, tree shaking, bundle analyzer

### **7.2 UX Kockázatok**

**Kockázat:** Felhasználók nem találják a dashboard-ot
- **Mitigáció:** Egyértelmű navigáció, breadcrumb, sitemap

**Kockázat:** Túl sok információ a kezdőlapon
- **Mitigáció:** Progressive disclosure, fokozatos információ megjelenítés

**Kockázat:** Mobile felhasználói élmény rossz
- **Mitigáció:** Mobile-first design, touch-friendly elemek

## 📅 **8. FEJLESZTÉSI TERV**

### **8.1 Sprint 1 (1. hét)**

**Hétfő:**
- [ ] Projekt struktúra létrehozása
- [ ] Komponens fájlok létrehozása
- [ ] Alap Tailwind CSS osztályok

**Kedd:**
- [ ] HeroSection komponens fejlesztése
- [ ] FeaturesSection komponens fejlesztése
- [ ] Reszponzív design implementálása

**Szerda:**
- [ ] HowItWorksSection komponens fejlesztése
- [ ] TestimonialsSection komponens fejlesztése
- [ ] Animációk implementálása

**Csütörtök:**
- [ ] StatsSection komponens fejlesztése
- [ ] CallToActionSection komponens fejlesztése
- [ ] SEO optimalizálás

**Péntek:**
- [ ] Tesztelés és hibajavítás
- [ ] Dokumentáció frissítése
- [ ] Code review

### **8.2 Tesztelési Terv**

**Unit Tesztek:**
- Komponens renderelés
- Props validáció
- Event handler-ek

**Integration Tesztek:**
- Navigáció működése
- Responsive design
- SEO meta címkék

**E2E Tesztek:**
- Regisztrációs folyamat
- Bejelentkezési folyamat
- Navigáció minden oldalra

## ✅ **9. ELFOGADÁSI KRITÉRIUMOK**

### **9.1 Funkcionális Követelmények**

- [ ] Kezdőlap betöltődik és megjelenik
- [ ] Minden szekció megfelelően renderelődik
- [ ] CTA gombok működnek és navigálnak
- [ ] Reszponzív design minden képernyőméreten
- [ ] Animációk és effektek működnek

### **9.2 Műszaki Követelmények**

- [ ] TypeScript hiba nincs
- [ ] ESLint szabályok betartva
- [ ] Lighthouse Score 95+
- [ ] Mobile Performance 90+
- [ ] SEO meta címkék megfelelnek

### **9.3 Felhasználói Élmény**

- [ ] Intuitív navigáció
- [ ] Gyors betöltés (< 2s)
- [ ] Accessibility megfelelés
- [ ] Cross-browser kompatibilitás
- [ ] Mobile-optimalizált felület

## 📚 **10. KAPCSOLÓDÓ DOKUMENTUMOK**

- **Fő PRD:** `docs/prd/index.md`
- **Architecture:** `docs/architecture/kezdolap-architecture.md`
- **Design System:** `DESIGN_SYSTEM.md`
- **Component Templates:** `COMPONENT_TEMPLATES.md`
- **User Stories:** `docs/stories/kezdolap/`

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Draft - Jóváhagyásra vár
