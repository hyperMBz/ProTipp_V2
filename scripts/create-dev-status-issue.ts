import { BMADLinearService } from '../src/lib/linear/bmad-integration';

async function createDevelopmentStatusIssue() {
    try {
        const linearService = new BMADLinearService();
        
        const issueData = {
            title: "📊 Fejlesztési Állapot Követés - BMAD Projekt",
            description: `
## 🎯 Projekt Áttekintés
BMAD (Betting Market Arbitrage Detection) - Sportfogadási Arbitrázs Detektáló Rendszer

## ✅ Elvégzett Funkciók

### 🏗️ Alapvető Infrastruktúra
- ✅ Next.js 14 projekt setup
- ✅ TypeScript konfiguráció
- ✅ Tailwind CSS + shadcn/ui komponensek
- ✅ Linear integráció (BMADLinearService)
- ✅ Supabase integráció
- ✅ Storybook setup

### 🎲 Fő Funkciók
- ✅ Arbitrázs detektálás és táblázat
- ✅ Odds követés és táblázat
- ✅ Profit kalkulátor
- ✅ Fogadási előzmények követése
- ✅ EV (Expected Value) fogadás kereső
- ✅ Analitikai dashboard
- ✅ Élő riasztási rendszer

### 🔧 Technikai Funkciók
- ✅ API integráció (odds-api.ts)
- ✅ Valós idejű adatok frissítése
- ✅ Szűrési és keresési funkciók
- ✅ Responsive design
- ✅ Komponens dokumentáció (Storybook)

## 🚧 Folyamatban Lévő Fejlesztések

### 🔄 TODO Lista Integráció
- 🔄 Linear TODO workflow integráció
- 🔄 Fejlesztési állapot automatikus követés
- 🔄 Issue létrehozás és frissítés

### 📈 Tervezett Fejlesztések
- 📋 Spreads és totals feldolgozás (TODO: odds-api.ts)
- 📋 Fejlett szűrési opciók
- 📋 Push notification rendszer
- 📋 Mobil alkalmazás
- 📋 AI-alapú duplikátum detektálás

## 🎯 Következő Lépések
1. **TODO lista teljes integráció** - Linear workflow automatikus követés
2. **API fejlesztések** - Spreads és totals támogatás
3. **Felhasználói élmény** - Push notifications, mobil optimalizáció
4. **AI integráció** - Duplikátum detektálás és intelligens javaslatok

## 📊 Technikai Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase
- **Project Management**: Linear
- **Documentation**: Storybook
- **Testing**: Vitest

## 🔗 Kapcsolódó Dokumentációk
- API.md - API dokumentáció
- CODING_STANDARDS.md - Kódolási szabványok
- COMPONENT_TEMPLATES.md - Komponens sablonok
- DESIGN_SYSTEM.md - Design rendszer

---
*Ez az issue automatikusan frissül a fejlesztési folyamat során.*
            `,
            priority: 2 // High priority
        };

        const issue = await linearService.createStory(issueData);
        console.log('✅ Fejlesztési állapot issue létrehozva:', issue.id);
        console.log('🔗 Issue URL:', `https://linear.app/issue/${issue.id}`);
        
        return issue;
    } catch (error) {
        console.error('❌ Hiba a Linear issue létrehozásakor:', error);
        throw error;
    }
}

// Script futtatása
if (require.main === module) {
    createDevelopmentStatusIssue()
        .then(() => {
            console.log('🎉 Script sikeresen lefutott!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script hiba:', error);
            process.exit(1);
        });
}

export { createDevelopmentStatusIssue };