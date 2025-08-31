# 🔗 Notion & Supabase MCP Integration (Official)

## Overview

A ProTipp V2 projekt most már támogatja a **hivatalos Notion és Supabase MCP (Model Context Protocol)** szervereket, ami lehetővé teszi az AI asszisztensek számára, hogy közvetlenül Notion dokumentációt és Supabase adatbázis műveleteket végezzenek.

## 🚀 Features

### Supabase MCP Server Tools (Magas Prioritás)

1. **`query_database`** - Adatbázis lekérdezések végrehajtása
   - Közvetlen hozzáférés a betting adatokhoz
   - Automatikus arbitrage opportunity detektálás
   - Felhasználói statisztikák valós idejű elemzése

2. **`insert_data`** - Adatok beszúrása
   - Új betting rekordok hozzáadása
   - Felhasználói aktivitás követése
   - Arbitrage opportunity mentése

3. **`update_data`** - Adatok frissítése
   - Betting státusz frissítése
   - Felhasználói profil módosítása
   - Odds adatok aktualizálása

4. **`delete_data`** - Adatok törlése
   - Régi rekordok tisztítása
   - Teszt adatok eltávolítása



### Notion MCP Server Tools

1. **`create_page`** - Új Notion oldal létrehozása
   - `title` (kötelező): Oldal címe
   - `content` (opcionális): Oldal tartalma Markdown formátumban
   - `parent` (opcionális): Szülő oldal vagy adatbázis

2. **`create_database`** - Új Notion adatbázis létrehozása
   - `title` (kötelező): Adatbázis címe
   - `properties` (opcionális): Oszlop definíciók

3. **`query_database`** - Adatbázis lekérdezése

4. **`update_page`** - Meglévő oldal frissítése

5. **`search`** - Keresés a Notion workspace-ben

### Playwright MCP Server Tools (Közepes Prioritás)

1. **`run_test`** - UI teszt futtatása
   - Automatikus betting flow validáció
   - Cross-browser kompatibilitás tesztelés
   - Design konzisztencia ellenőrzés

2. **`generate_test`** - Teszt generálása
   - AI-alapú teszt script létrehozás
   - Felhasználói interakciók automatizálása

3. **`analyze_performance`** - Teljesítmény elemzés
   - Oldal betöltési idők mérése
   - UI válaszidők optimalizálás

### Semgrep MCP Server Tools (Alacsony Prioritás)

1. **`scan_code`** - Kód biztonsági ellenőrzés
   - Biztonsági sebezhetőségek detektálása
   - Kód minőség javítása
   - Best practice ellenőrzés

2. **`generate_rules`** - Egyedi szabályok generálása
   - Projekt specifikus biztonsági szabályok
   - TypeScript best practice szabályok

## 📝 Notion Formázási Szabályok

**Fontos**: Minden Notion dokumentáció létrehozásakor kövesd a **[📝 Notion Formázási Szabályok](NOTION_FORMATTING_GUIDE.md)** útmutatót a professzionális megjelenés érdekében.

### 🎯 Alapvető Formázási Szabályok
- **Fejezetek**: H1 (#), H2 (##), H3 (###)
- **Szöveg formázás**: Félkövér (**), dőlt (*), kód (`)
- **Emojik**: Konzisztens kategóriák (🎯, 🚀, 🏗️, 📊, 🔧)
- **Listák**: Strukturált felsorolások és számozott listák
- **Kód blokkok**: Nyelv specifikus formázás

## 🔧 Setup Instructions

### 1. Cursor MCP Configuration

Add to Cursor Settings → MCP → Add new global MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://supabase.com/docs/guides/getting-started/mcp"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/sse"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://github.com/microsoft/playwright-mcp"]
    },
    "semgrep": {
      "command": "semgrep",
      "args": ["scan", "--config", "auto", "--json"]
    }
  }
}
```

### 2. Environment Variables

```env
# Supabase (kötelező)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key



# Notion (opcionális - MCP szerver automatikusan kezeli)
NOTION_TOKEN=your_notion_integration_token

# Playwright (opcionális)
PLAYWRIGHT_BROWSERS_PATH=./node_modules/.cache/playwright

# Semgrep (opcionális - most már működik!)
SEMGREP_APP_TOKEN=your_semgrep_token
```

### 3. Verification

1. **Cursor újraindítása** a beállítások után
2. **MCP Tools lista ellenőrzése** - az összes szervernek meg kell jelenniük
3. **Tesztelés** - próbáld ki az adatbázis lekérdezést vagy issue létrehozást

## 🎯 Usage Examples

### Supabase Adatbázis Lekérdezés

```
"Kérdezd le az összes arbitrage opportunity-t az elmúlt 24 órából"
```



### Notion Documentation

```
"Készíts egy új Notion oldalt 'API Integration Guide' címmel a ProTipp V2 projekthez"
```

### Playwright UI Testing

```
"Futtass egy UI tesztet a betting flow-hoz különböző böngészőkben"
```

### Semgrep Security Scan

```
"Végezz biztonsági ellenőrzést a TypeScript kódon"
```

## 📚 Documentation References

- **[📝 Notion Formázási Szabályok](NOTION_FORMATTING_GUIDE.md)** - Profi dokumentáció készítés
- **[Supabase Docs](https://supabase.com/docs)** - Hivatalos Supabase dokumentáció

- **[Notion API Docs](https://developers.notion.com/)** - Hivatalos Notion dokumentáció
- **[Playwright Docs](https://playwright.dev/)** - Hivatalos Playwright dokumentáció
- **[Semgrep Docs](https://semgrep.dev/docs/)** - Hivatalos Semgrep dokumentáció
- **[MCP Protocol](https://modelcontextprotocol.io/)** - MCP protokoll specifikáció

## ✅ Benefits

### 🗄️ Supabase Integration (Magas Prioritás)
- **Közvetlen adatbázis hozzáférés** AI asszisztenssel
- **Automatikus arbitrage detektálás** valós idejű adatokból
- **Felhasználói statisztikák elemzése** és optimalizálás
- **Adatbázis teljesítmény javítás** automatikus lekérdezésekkel
- **Betting adatok kezelés** és validáció



### 📝 Notion Integration
- **Projekt dokumentáció kezelés** AI asszisztenssel
- **Automatikus formázás** és struktúra
- **Keresés és lekérdezés** a workspace-ben
- **Hivatalos Notion támogatás**

### 🧪 Playwright Integration (Közepes Prioritás)
- **Automatikus UI tesztelés** AI asszisztenssel
- **Cross-browser kompatibilitás** ellenőrzés
- **Design konzisztencia** validáció
- **Felhasználói élmény** optimalizálás
- **Betting flow** automatizált tesztelés

### 🔒 Semgrep Integration (Alacsony Prioritás)
- **Biztonsági sebezhetőségek** detektálása
- **Kód minőség** javítása
- **Best practice** ellenőrzés
- **TypeScript biztonság** növelése

## 🔄 Workflow Integration

### Development Workflow
1. **Kód írása** → AI asszisztens automatikusan issue-kat hoz létre
2. **Feature development** → Dokumentáció automatikus frissítése
3. **Bug fixes** → Issue státusz frissítése
4. **Release** → Dokumentáció végső ellenőrzése

### Data Workflow
1. **Adatbázis változások** → Automatikus lekérdezés optimalizálás
2. **Arbitrage detektálás** → Valós idejű értesítések
3. **Felhasználói aktivitás** → Statisztikák automatikus frissítése
4. **Teljesítmény monitoring** → Adatbázis optimalizálás

### Testing Workflow
1. **UI változások** → Automatikus teszt generálás
2. **Cross-browser testing** → Playwright automatikus futtatás
3. **Design konzisztencia** → Visual regression tesztelés
4. **Felhasználói élmény** → Performance monitoring

### Security Workflow
1. **Kód változások** → Automatikus biztonsági ellenőrzés
2. **Dependency updates** → Semgrep szabályok frissítése
3. **Best practice** → Kód minőség javítás
4. **Security audit** → Rendszeres biztonsági ellenőrzés

## 🚀 Advanced Features

### Supabase Advanced
- **Real-time subscriptions** - Valós idejű adatfrissítések
- **Row Level Security** - Biztonságos adathozzáférés
- **Database functions** - Komplex lekérdezések
- **Edge functions** - Serverless logika

### Linear Advanced
- **Cycle management** - Sprint és release kezelés
- **Project tracking** - Projekt szintű követés
- **Label automation** - Automatikus címkézés
- **Workflow automation** - Állapot átmenetek

### Notion Advanced
- **Database management** - Strukturált adatkezelés
- **Template creation** - Újrafelhasználható sablonok
- **Cross-page linking** - Oldalak közötti kapcsolatok
- **Version control** - Dokumentáció verziókezelés

### Playwright Advanced
- **Visual regression** - Design konzisztencia tesztelés
- **Performance testing** - Oldal betöltési idők
- **Mobile testing** - Reszponzív design ellenőrzés
- **Accessibility testing** - Hozzáférhetőség validáció

### Semgrep Advanced
- **Custom rules** - Projekt specifikus szabályok
- **CI/CD integration** - Automatikus ellenőrzés
- **Security policies** - Biztonsági irányelvek
- **Code quality** - Kód minőség metrikák

---

**ProTipp V2 MCP Integration** - Professional development workflow with AI-powered database management, issue tracking, documentation, testing, and security scanning.
