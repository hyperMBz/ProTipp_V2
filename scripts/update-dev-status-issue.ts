import { BMADLinearService } from '../src/lib/linear/bmad-integration';

async function updateDevelopmentStatusIssue(issueId: string) {
    try {
        const linearService = new BMADLinearService();
        
        const updatedDescription = `
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
- ✅ **ÚJ**: Fejlesztési állapot követő script-ek

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
- ✅ **ÚJ**: Linear automatikus issue létrehozás és frissítés

## 🚧 Folyamatban Lévő Fejlesztések

### 🔄 TODO Lista Integráció
- ✅ Linear TODO workflow integráció
- ✅ Fejlesztési állapot automatikus követés
- ✅ Issue létrehozás és frissítés
- 🔄 Automatikus állapot frissítés CI/CD-ben

### 📈 Tervezett Fejlesztések
- 📋 Spreads és totals feldolgozás (TODO: odds-api.ts)
- 📋 Fejlett szűrési opciók
- 📋 Push notification rendszer
- 📋 Mobil alkalmazás
- 📋 AI-alapú duplikátum detektálás

## 🎯 Következő Lépések
1. **CI/CD integráció** - Automatikus issue frissítés minden deploy-nál
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
- **Automation**: Custom scripts for Linear integration

## 🔗 Kapcsolódó Dokumentációk
- API.md - API dokumentáció
- CODING_STANDARDS.md - Kódolási szabványok
- COMPONENT_TEMPLATES.md - Komponens sablonok
- DESIGN_SYSTEM.md - Design rendszer
- scripts/README.md - Script dokumentáció

## 📈 Frissítési Statisztikák
- **Utolsó frissítés**: ${new Date().toLocaleString('hu-HU')}
- **Frissítések száma**: Automatikus
- **Script verzió**: 1.0.0

---
*Ez az issue automatikusan frissül a fejlesztési folyamat során.*
        `;

        // Frissítjük az issue leírását
        const updatedIssue = await linearService.updateIssueDescription(issueId, updatedDescription);
        
        console.log('✅ Fejlesztési állapot issue frissítve:', issueId);
        console.log('🔗 Issue URL:', `https://linear.app/issue/${issueId}`);
        
        return updatedIssue;
    } catch (error) {
        console.error('❌ Hiba a Linear issue frissítésekor:', error);
        throw error;
    }
}

// Script futtatása
if (require.main === module) {
    const issueId = process.argv[2];
    
    if (!issueId) {
        console.error('❌ Hiányzó issue ID! Használat: bunx tsx scripts/update-dev-status-issue.ts <issue-id>');
        process.exit(1);
    }
    
    updateDevelopmentStatusIssue(issueId)
        .then(() => {
            console.log('🎉 Issue frissítés sikeres!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script hiba:', error);
            process.exit(1);
        });
}

export { updateDevelopmentStatusIssue };