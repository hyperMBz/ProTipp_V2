# 🚀 Linear Automatizálás - Teljes Útmutató

## 📋 **Áttekintés**

A ProTipp V2 projekt teljes automatizált Linear integrációval rendelkezik, amely automatikusan frissíti a story-k haladását a fejlesztési munkával párhuzamosan.

## ✅ **Működő Automatizálás**

### 1. **PR Létrehozás** → Linear Issue
- **Trigger**: Pull Request létrehozása
- **Action**: Automatikus Linear issue létrehozás
- **File**: `.github/workflows/linear-pr.yml`

### 2. **PR Merge** → Story Complete
- **Trigger**: Pull Request merge
- **Action**: Linear issue "Done" státusz
- **File**: `.github/workflows/linear-merge.yml`

### 3. **Story Progress Tracking** → Részletes Frissítések
- **Trigger**: PR events (opened, updated, closed)
- **Action**: Story progress kommentek és státusz frissítések
- **File**: `.github/workflows/linear-story-update.yml`

## 🔧 **Hogyan Működik**

### **1. Story ID Referenciálás**

#### **PR Title-ben:**
```
feat: implement bookmaker API integration CUR-16
fix: resolve odds table display issue CUR-17
```

#### **PR Body-ben:**
```markdown
## Kapcsolódó Linear Story
**Story ID**: `CUR-16`
**Story Link**: https://linear.app/cursor-z/issue/CUR-16/story-11-bookmaker-api-integration-framework
```

#### **Commit Message-ben:**
```
feat(api): implement bookmaker API integration CUR-16

- Added base bookmaker API interface
- Implemented rate limiting functionality
- Added fallback mechanism

Closes CUR-16
```

### **2. Automatikus Események**

#### **PR Opened** 🚀
```
Linear Comment: "Development Started"
PR Link: https://github.com/...
Branch: feature/story-1.1
```

#### **PR Updated** 🔄
```
Linear Comment: "Progress Update"
PR Link: https://github.com/...
Latest commit: abc123
```

#### **PR Merged** ✅
```
Linear Comment: "Story Completed"
PR Link: https://github.com/...
Merge commit: def456
Issue Status: Done
```

## 📋 **Használati Útmutató**

### **1. Story Fejlesztés Kezdése**

#### **Branch Létrehozás:**
```bash
git checkout -b feature/story-1.1-CUR-16
```

#### **Commit Message Template:**
```bash
git config commit.template .gitmessage
```

#### **Első Commit:**
```bash
git commit -m "feat(api): start bookmaker API integration CUR-16

- Create base API interface structure
- Add TypeScript types for bookmakers
- Set up project structure"
```

### **2. PR Létrehozás**

#### **PR Title:**
```
feat: implement bookmaker API integration framework CUR-16
```

#### **PR Body (Template használata):**
```markdown
## Összefoglaló
Bookmaker API integration framework implementálása 150+ fogadóiroda támogatásával.

## Változások
- [x] Funkcionális módosítás
- [ ] UI/UX változás
- [ ] Refaktor/karbantartás
- [ ] Függőség frissítés

## Tesztelés
- [x] Lokálisan kipróbálva
- [ ] CI zöld (build-and-test)
- [ ] Netlify Preview ellenőrizve

## Kapcsolódó Linear Story
**Story ID**: `CUR-16`
**Story Link**: https://linear.app/cursor-z/issue/CUR-16/story-11-bookmaker-api-integration-framework

### Story Progress Update
- [x] Acceptance Criteria 1: API Integration Framework ✅
- [x] Acceptance Criteria 2: Rate Limiting ✅
- [ ] Acceptance Criteria 3: Fallback Mechanism 🔄
- [ ] Acceptance Criteria 4: Configuration Management ❌
- [ ] Acceptance Criteria 5: Monitoring and Logging ❌

### Tasks Completed
- [x] Task 1: Create Base Bookmaker API Interface
- [x] Task 2: Implement Individual Bookmaker Integrations
- [ ] Task 3: Create Bookmaker Manager Service
- [ ] Task 4: Create React Hooks for Bookmaker Data
```

### **3. Fejlesztés Közben**

#### **Progress Commit:**
```bash
git commit -m "feat(api): add bookmaker manager service CUR-16

- Implement centralized bookmaker management
- Add health monitoring and status tracking
- Create fallback mechanism to existing API

Progress: 3/8 tasks completed"
```

#### **PR Update:**
- Push új commit-ot
- Linear automatikusan frissíti a story-t
- Progress komment hozzáadódik

### **4. Story Befejezése**

#### **Final Commit:**
```bash
git commit -m "feat(api): complete bookmaker API integration CUR-16

- All acceptance criteria met
- All tasks completed
- Integration tests passing
- Documentation updated

Closes CUR-16"
```

#### **PR Merge:**
- Merge a PR-t
- Linear automatikusan "Done" státuszra állítja a story-t
- Completion komment hozzáadódik

## 🎯 **Automatizálás Előnyei**

### **1. Automatikus Tracking**
- ✅ Nincs manuális frissítés szükség
- ✅ Valós idejű progress követés
- ✅ Git history alapú tracking

### **2. Részletes Dokumentáció**
- ✅ Minden változás dokumentálva
- ✅ Progress history megőrzése
- ✅ Linkek a kódhoz

### **3. Csapat Koordináció**
- ✅ Mindenki látja a haladást
- ✅ Automatikus értesítések
- ✅ Transzparens fejlesztés

## 🔧 **Konfiguráció**

### **Git Commit Template:**
```bash
git config commit.template .gitmessage
```

### **Environment Variables:**
```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=3a065a8f-3619-4782-94dd-ef8e24058275
```

### **GitHub Secrets:**
- `LINEAR_API_KEY`: Linear API kulcs
- `LINEAR_TEAM_ID`: Linear team ID

## 📊 **Monitoring és Metrikák**

### **Automatikus Metrikák:**
- **Story Completion Rate**: Automatikus számolás
- **Development Velocity**: Commit alapú tracking
- **Progress Tracking**: Real-time updates
- **Quality Metrics**: CI/CD integráció

### **Dashboard:**
- **Linear Project**: https://linear.app/cursor-z/project/protipp-v2-sports-betting-arbitrage-platform-6374259c10aa
- **GitHub Actions**: https://github.com/hyperMBz/ProTipp_V2/actions
- **Progress Reports**: Automatikus generálás

## 🚨 **Hibaelhárítás**

### **Gyakori Problémák:**

#### **1. Story ID nem található**
```bash
# Ellenőrizd a commit message-t
git log --oneline --grep="CUR-16"

# Ellenőrizd a PR title-t és body-t
# Használd a template-et
```

#### **2. Linear API hiba**
```bash
# Ellenőrizd a secrets-eket
# LINEAR_API_KEY és LINEAR_TEAM_ID beállítva
```

#### **3. Workflow nem fut**
```bash
# Ellenőrizd a GitHub Actions logokat
# https://github.com/hyperMBz/ProTipp_V2/actions
```

## 📈 **Best Practices**

### **1. Commit Message Konvenciók**
- Használd a template-et
- Mindig referenciáld a story ID-t
- Részletes leírást adj

### **2. PR Template Használata**
- Mindig töltsd ki a template-et
- Frissítsd a progress-t
- Linkeld a story-t

### **3. Progress Tracking**
- Rendszeres commit-ok
- Részletes leírások
- Acceptance criteria követés

## 🔗 **Hasznos Linkek**

- **Linear Dashboard**: https://linear.app/cursor-z
- **GitHub Actions**: https://github.com/hyperMBz/ProTipp_V2/actions
- **Project Overview**: https://linear.app/cursor-z/project/protipp-v2-sports-betting-arbitrage-platform-6374259c10aa
- **BMAD Stories Tracking**: https://linear.app/cursor-z/issue/CUR-15/bmad-stories-framework-complete-project-development-tracking-setup

---

**Utolsó frissítés**: 2025-08-29
**Verzió**: 1.0.0
**Státusz**: Aktív
