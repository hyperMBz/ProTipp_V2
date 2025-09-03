# 🚀 ProTipp V2 - Fejlesztési Workflow Útmutató

## 🎯 **EGYSZERŰ MAGYARÁZAT - HOGYAN MŰKÖDIK?**

### **1. 💻 FEJLESZTÉS CURSOR-BAN**

**Mit csinálsz:**
```bash
# 1. Új feature branch létrehozása
git checkout -b cursor/uj-funkcio-neve

# 2. Fejlesztés a Cursor IDE-ben
# - Kód írása
# - Tesztelés lokálisan: bun run dev

# 3. Változások mentése
git add .
git commit -m "feat: új funkció implementálása"

# 4. Push GitHub-ra
git push -u origin cursor/uj-funkcio-neve
```

### **2. 🔄 PULL REQUEST LÉTREHOZÁSA**

**GitHub webfelületen:**
1. **Menj a GitHub-ra:** `https://github.com/hyperMBz/ProTipp_V2`
2. **"Compare & pull request"** gomb megjelenik
3. **PR cím:** `feat: új funkció implementálása`
4. **Leírás:** Mit változtattál és miért
5. **"Create pull request"** gomb

### **3. 🤖 AUTOMATIKUS ELLENŐRZÉSEK**

**GitHub Actions automatikusan elindítja:**
- ✅ **Code Quality:** Linting, type checking
- ✅ **Tests:** Unit és integration tesztek
- ✅ **Build:** Next.js production build
- ✅ **Preview:** Netlify preview deployment

### **4. 👀 CODE REVIEW (Opcionális)**

**Ha szükséges:**
- Kollégák megnézik a kódot
- Visszajelzések, javítások
- Jóváhagyás

### **5. 🔀 MERGE TO MAIN**

**Amikor minden zöld:**
1. **"Squash and merge"** gomb
2. **Automatikus deployment** indul
3. **Live platform** frissül

---

## 🔧 **RÉSZLETES TECHNIKAI WORKFLOW**

### **A) BRANCH STRATÉGIA**

```
main (protected)
├── cursor/feature-1
├── cursor/bugfix-2
├── cursor/ui-update-3
└── hotfix/critical-fix
```

**Branch naming convention:**
- `cursor/feature-name` - Új funkciók
- `cursor/bugfix-name` - Hibajavítások  
- `cursor/ui-name` - UI/UX változások
- `hotfix/issue-name` - Sürgős javítások

### **B) COMMIT MESSAGE SZABÁLYOK**

```bash
# Jó példák:
git commit -m "feat: arbitrage dashboard új szűrő funkció"
git commit -m "fix: betting form validáció javítása"
git commit -m "ui: mobile responsive design javítása"
git commit -m "docs: API dokumentáció frissítése"

# Rossz példák:
git commit -m "fixes"
git commit -m "update stuff"
git commit -m "wip"
```

**Prefix típusok:**
- `feat:` - Új funkció
- `fix:` - Hibajavítás
- `ui:` - UI/UX változás
- `refactor:` - Kód átstruktúrálás
- `docs:` - Dokumentáció
- `test:` - Tesztek
- `chore:` - Karbantartás

### **C) PULL REQUEST TEMPLATE**

**Automatikus template (.github/pull_request_template.md):**
```markdown
## 📋 Összefoglaló
Mit változtattál és miért?

## 🔧 Változások
- [ ] Új funkció
- [ ] Hibajavítás
- [ ] UI/UX változás
- [ ] Refaktor
- [ ] Dokumentáció

## 🧪 Tesztelés
- [ ] Lokálisan tesztelve
- [ ] CI pipeline zöld
- [ ] Netlify preview ellenőrizve

## 📸 Képernyőkép/Video
(Ha UI változás)
```

---

## 🚀 **CI/CD PIPELINE RÉSZLETEI**

### **1. 🔍 CODE QUALITY STAGE**

```yaml
# Automatikusan fut minden PR-nél
- Biome linting
- TypeScript type checking  
- Code formatting ellenőrzés
- Import/export validáció
```

### **2. 🧪 TESTING STAGE**

```yaml
# Tesztek futtatása
- Unit tesztek (Vitest)
- Component tesztek (React Testing Library)
- Integration tesztek
- E2E tesztek (Playwright) - opcionális
```

### **3. 🏗️ BUILD STAGE**

```yaml
# Production build
- Next.js build
- Static asset generálás
- Bundle size ellenőrzés
- Performance audit
```

### **4. 🚀 DEPLOYMENT STAGE**

```yaml
# Csak main branch esetén
- Netlify deployment
- Environment variables beállítása
- CDN cache invalidation
- Health check
```

---

## 🔒 **BIZTONSÁGI ÉS MINŐSÉGI SZABÁLYOK**

### **MAIN BRANCH PROTECTION:**
- ❌ **Közvetlen push tiltva**
- ✅ **PR kötelező**
- ✅ **CI/CD pipeline success kötelező**
- ✅ **Code review ajánlott**
- ✅ **Linear history**

### **AUTOMATED CHECKS:**
- 🔍 **Security scan** (Dependabot)
- 🧹 **Code quality** (Biome)
- 📊 **Bundle analysis**
- 🚀 **Performance monitoring**

---

## 🎯 **GYAKORLATI PÉLDA - TELJES WORKFLOW**

### **Scenario: Új arbitrage szűrő funkció**

```bash
# 1. FEJLESZTÉS KEZDÉSE
git checkout main
git pull origin main
git checkout -b cursor/arbitrage-filter-enhancement

# 2. CURSOR-BAN FEJLESZTÉS
# - src/components/filters/ArbitrageFilter.tsx szerkesztése
# - Új szűrő opciók hozzáadása
# - Tesztelés: bun run dev

# 3. COMMIT ÉS PUSH
git add .
git commit -m "feat: arbitrage szűrő - sport típus és minimum profit opciók"
git push -u origin cursor/arbitrage-filter-enhancement

# 4. PULL REQUEST
# GitHub webfelületen PR létrehozása
# Cím: "feat: Arbitrage szűrő fejlesztés - sport és profit opciók"

# 5. AUTOMATIKUS PIPELINE
# ✅ Linting pass
# ✅ Type checking pass  
# ✅ Tests pass
# ✅ Build successful
# ✅ Netlify preview ready

# 6. REVIEW ÉS MERGE
# Code review (opcionális)
# "Squash and merge" gomb

# 7. AUTOMATIC DEPLOYMENT
# ✅ Main branch updated
# ✅ Production deployment started
# ✅ https://protipp.netlify.app updated
# ✅ Users see new feature live!
```

---

## 🔧 **TROUBLESHOOTING**

### **Gyakori problémák és megoldások:**

**1. CI Pipeline hibák:**
```bash
# Linting hibák javítása
bun run lint --fix

# Type hibák ellenőrzése
bun run build --dry-run
```

**2. Merge konfliktusok:**
```bash
# Main branch frissítése
git checkout main
git pull origin main
git checkout cursor/your-branch
git rebase main
# Konfliktusok feloldása
git push --force-with-lease origin cursor/your-branch
```

**3. Build hibák:**
```bash
# Dependencies újrainstallálása
rm -rf node_modules bun.lockb
bun install

# Cache törlése
bun run build --clean
```

---

## 📚 **HASZNOS PARANCSOK**

```bash
# Fejlesztési környezet
bun run dev              # Development server
bun run build            # Production build
bun run lint             # Code linting
bun run test             # Tesztek futtatása

# Git workflow
git status               # Változások ellenőrzése
git log --oneline -10    # Utolsó 10 commit
git branch -a            # Összes branch listázása
git checkout main        # Main branch-re váltás
git pull origin main     # Legfrissebb main letöltése

# Cleanup
git branch -d branch-name    # Local branch törlése
git push origin --delete branch-name  # Remote branch törlése
```

---

## 🎉 **ÖSSZEFOGLALÓ**

### **EZ A WORKFLOW GARANTÁLJA:**
- ✅ **Minőségi kód** (automated checks)
- ✅ **Stabil production** (protected main branch)
- ✅ **Gyors deployment** (automated CI/CD)
- ✅ **Tiszta history** (squash merge)
- ✅ **Team collaboration** (PR workflow)

### **TE CSAK ENNYIT CSINÁLSZ:**
1. **Fejlesztés** Cursor-ban
2. **Commit + Push** 
3. **PR létrehozása** GitHub-on
4. **Merge gomb** (ha minden zöld)
5. **Élvezd az eredményt** 🎉

**A többi automatikus!** 🚀
