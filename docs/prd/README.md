# ProTipp V2 - Product Requirements Documentation

**Könyvtár:** `docs/prd/`  
**Verzió:** 1.0  
**Dátum:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Active  

## 📋 **KÖNYVTÁR ÁTTEKINTÉS**

Ez a könyvtár tartalmazza a ProTipp V2 projekt teljes termékspecifikációját (PRD), beleértve a részletes funkció specifikációkat, product backlog-ot és sprint planning dokumentumokat.

## 📚 **DOKUMENTUMOK LISTÁJA**

### **1. Fő PRD Dokumentumok**

| Dokumentum | Leírás | Státusz | Kapcsolódó |
|------------|--------|---------|------------|
| [`index.md`](./index.md) | Fő termékspecifikáció (PRD) | Draft | - |
| [`kezdolap-spec.md`](./kezdolap-spec.md) | Kezdőlap részletes specifikációja | Draft | index.md |
| [`backlog.md`](./backlog.md) | Product backlog és user story-k | Active | index.md, kezdolap-spec.md |
| [`sprint-planning.md`](./sprint-planning.md) | Sprint planning és sprint backlog | Active | index.md, backlog.md |

### **2. Dokumentum Hierarchia**

```
docs/prd/
├── README.md                    # Ez a fájl
├── index.md                     # Fő PRD (Product Requirements Document)
├── kezdolap-spec.md            # Kezdőlap részletes specifikációja
├── backlog.md                   # Product backlog és user story-k
└── sprint-planning.md           # Sprint planning és sprint backlog
```

## 🎯 **DOKUMENTUM CÉLOK**

### **index.md - Fő PRD**
- **Cél:** Teljes projekt termékspecifikáció
- **Célközönség:** Stakeholders, Product Owner, Fejlesztő csapat
- **Tartalom:** Projekt áttekintés, célok, funkciók, technikai követelmények
- **Státusz:** Draft - Jóváhagyásra vár

### **kezdolap-spec.md - Kezdőlap Specifikáció**
- **Cél:** Kezdőlap részletes műszaki specifikációja
- **Célközönség:** Frontend fejlesztők, UX/UI tervezők
- **Tartalom:** Komponensek, layout, stílusok, animációk
- **Státusz:** Draft - Jóváhagyásra vár

### **backlog.md - Product Backlog**
- **Cél:** Fejlesztési feladatok strukturált kezelése
- **Célközönség:** Product Owner, Scrum Master, Fejlesztő csapat
- **Tartalom:** Epic-ek, user story-k, prioritások, időigények
- **Státusz:** Active - Folyamatos frissítés

### **sprint-planning.md - Sprint Planning**
- **Cél:** Sprint-ek tervezése és koordinálása
- **Célközönség:** Scrum Master, Fejlesztő csapat
- **Tartalom:** Sprint backlog, feladatok, elfogadási kritériumok
- **Státusz:** Active - Sprint 1 In Progress

## 📊 **DOKUMENTUM ÖSSZHANG**

### **Dokumentum Függőségek**

```
index.md (Fő PRD)
├── kezdolap-spec.md (Kezdőlap Spec)
├── backlog.md (Product Backlog)
└── sprint-planning.md (Sprint Planning)
    ├── index.md (Fő PRD)
    ├── kezdolap-spec.md (Kezdőlap Spec)
    └── backlog.md (Product Backlog)
```

### **Összhang Ellenőrzés**

**✅ Konzisztens elemek:**
- Projekt neve és verzió
- Funkció leírások
- Technikai követelmények
- Időigények és prioritások
- Státusz információk

**🔍 Ellenőrizendő elemek:**
- User story ID-k konzisztenciája
- Acceptance criteria egyezése
- Technikai specifikációk konzisztenciája
- Kapcsolódó dokumentumok hivatkozásai

## 📅 **DOKUMENTUM ÉLETCIKLUS**

### **1. Létrehozás (Creation)**
- **Product Owner:** Dokumentum létrehozása
- **Státusz:** Draft
- **Jóváhagyás:** Stakeholders, Fejlesztő csapat

### **2. Aktív Használat (Active)**
- **Státusz:** Active
- **Frissítés:** Folyamatos, változások alapján
- **Verziókövetés:** Git commit history

### **3. Felülvizsgálat (Review)**
- **Időpont:** Sprint végén, vagy változás esetén
- **Résztvevők:** Product Owner, Scrum Master, Fejlesztő csapat
- **Eredmény:** Dokumentum frissítése vagy archiválás

### **4. Archiválás (Archive)**
- **Státusz:** Archived
- **Időpont:** Funkció teljes implementálása után
- **Megőrzés:** Git history, dokumentum verzió

## 🔄 **DOKUMENTUM FRISSÍTÉS MUNKAFOLYAMAT**

### **Frissítés Indokai**
1. **Funkció változás:** Új funkció hozzáadása
2. **Technikai változás:** Technológia stack módosítása
3. **Prioritás változás:** User story prioritás módosítása
4. **Időigény változás:** Story point vagy időigény módosítása
5. **Stakeholder visszajelzés:** Üzleti követelmények változása

### **Frissítés Folyamata**
1. **Változás azonosítása** - Product Owner vagy Scrum Master
2. **Dokumentum frissítése** - Megfelelő dokumentum módosítása
3. **Verzió növelése** - Dokumentum verzió frissítése
4. **Értesítés** - Csapat értesítése a változásról
5. **Jóváhagyás** - Változás jóváhagyása a csapat által

### **Verzió Kezelés**
- **Major verzió:** Nagy változások (1.0 → 2.0)
- **Minor verzió:** Közepes változások (1.0 → 1.1)
- **Patch verzió:** Kis javítások (1.0 → 1.0.1)

## 📝 **DOKUMENTUM SABLONOK**

### **PRD Sablon**
```markdown
# [Projekt Név] - [Dokumentum Típus]

**Verzió:** [X.Y.Z]  
**Dátum:** [YYYY-MM-DD]  
**Szerző:** [Név]  
**Státusz:** [Draft/Active/Archived]  

## 📋 **1. [SZAKASZ CÍM]**

### **1.1 [Alszakasz]**

[Szöveg...]

## 📚 **2. KAPCSOLÓDÓ DOKUMENTUMOK**

- [Dokumentum típus]: `[útvonal]`

---

**Dokumentum verzió:** [X.Y.Z]  
**Utolsó frissítés:** [YYYY-MM-DD]  
**Szerző:** [Név]  
**Státusz:** [Draft/Active/Archived]
```

### **User Story Sablon**
```markdown
#### **[STORY-ID]: [Cím]**
- **Prioritás:** [MAGAS/KÖZEPES/ALACSONY]
- **Story Points:** [X]
- **Státusz:** [Not Started/Ready for Development/In Progress/Done]
- **Felelős:** [Név]
- **Időigény:** [X nap/óra]

**Elfogadási Kritériumok:**
- [ ] [Kritérium 1]
- [ ] [Kritérium 2]
- [ ] [Kritérium 3]

**Kapcsolódó dokumentumok:**
- [Dokumentum típus]: `[útvonal]`
```

## 🚀 **GYORS KEZDÉS**

### **Új fejlesztők számára**
1. **Olvassa el:** `index.md` - Teljes projekt áttekintés
2. **Ismerje meg:** `backlog.md` - Jelenlegi feladatok
3. **Kövesse:** `sprint-planning.md` - Aktuális sprint
4. **Részleteket:** `kezdolap-spec.md` - Konkrét implementáció

### **Stakeholders számára**
1. **Áttekintés:** `index.md` - Projekt célok és funkciók
2. **Idővonal:** `sprint-planning.md` - Fejlesztési ütemezés
3. **Prioritások:** `backlog.md` - Funkció prioritások

### **Product Owner számára**
1. **Backlog kezelés:** `backlog.md` - User story-k és prioritások
2. **Sprint tervezés:** `sprint-planning.md` - Sprint koordináció
3. **Dokumentum frissítés:** Minden dokumentum folyamatos frissítése

## 📞 **KAPCSOLAT**

### **Dokumentum tulajdonosok**
- **Product Owner:** Sarah - [email]
- **Scrum Master:** Bob - [email]
- **Architect:** Winston - [email]

### **Dokumentum támogatás**
- **Technikai kérdések:** Frontend fejlesztő csapat
- **Üzleti kérdések:** Product Owner
- **Folyamat kérdések:** Scrum Master

## 📚 **TOVÁBBI FORRÁSOK**

### **Projekt dokumentáció**
- **Design System:** `DESIGN_SYSTEM.md`
- **Component Templates:** `COMPONENT_TEMPLATES.md`
- **Architecture:** `docs/architecture/`
- **API Documentation:** `docs/api/`

### **Fejlesztési dokumentáció**
- **AGENTS.md:** AI asszisztensek útmutatója
- **MCP_INTEGRATION.md:** MCP szerverek integrációja
- **FEJLESZTESI_WORKFLOW.md:** Fejlesztési munkafolyamat

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. december 19.  
**Product Owner:** Sarah  
**Státusz:** Active - Dokumentáció fejlesztés alatt
