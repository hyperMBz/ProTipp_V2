# 🧪 MCP Szerverek Tesztelése - ProTipp V2

## 📋 Tesztelési Terv

Ez a dokumentum segít tesztelni az implementált MCP szervereket a ProTipp V2 projekthez.

## 🗄️ 1. Supabase MCP Tesztelés (Magas Prioritás)

### Tesztelési Szcenáriók

#### 1.1 Adatbázis Lekérdezés
```bash
# Teszt parancsok
"Kérdezd le az összes felhasználót a Supabase adatbázisból"
"Számítsd ki a teljes profit statisztikát az elmúlt 30 napból"
"Listázd az összes arbitrage opportunity-t 'active' státusszal"
```

#### 1.2 Adat Beszúrás
```bash
# Teszt parancsok
"Szúrj be egy új teszt felhasználót a 'test_users' táblába"
"Adj hozzá egy új arbitrage opportunity-t a 'opportunities' táblához"
"Készíts egy új betting rekordot a 'bet_history' táblában"
```

#### 1.3 Adat Frissítés
```bash
# Teszt parancsok
"Frissítsd a felhasználó email címét a megadott ID-hoz"
"Módosítsd a betting státuszt 'won'-ra a megadott rekordhoz"
"Frissítsd az arbitrage opportunity státuszt 'expired'-re"
```

### Várt Eredmények
- ✅ Adatbázis kapcsolat sikeres
- ✅ Lekérdezések helyesen futnak
- ✅ Adatok helyesen kerülnek beszúrásra/frissítésre
- ✅ Hibakezelés megfelelően működik

## 🎯 2. Linear MCP Tesztelés

### Tesztelési Szcenáriók

#### 2.1 Issue Létrehozás
```bash
# Teszt parancsok
"Készíts egy új Linear issue-t 'Test: MCP Integration' címmel"
"Hozz létre egy bug report-ot 'high' prioritással"
"Készíts egy feature request-et 'enhancement' label-lel"
```

#### 2.2 Issue Kezelés
```bash
# Teszt parancsok
"Listázd az összes nyitott issue-t"
"Frissítsd az issue státuszt 'In Progress'-ra"
"Rendeld hozzá az issue-t a megfelelő team-hez"
```

### Várt Eredmények
- ✅ Issue-k sikeresen létrejönnek
- ✅ Státusz frissítések működnek
- ✅ Szűrés és listázás helyes
- ✅ Label-ek és prioritások megfelelően beállítódnak

## 📝 3. Notion MCP Tesztelés

### Tesztelési Szcenáriók

#### 3.1 Oldal Létrehozás
```bash
# Teszt parancsok
"Készíts egy új Notion oldalt 'MCP Integration Test' címmel"
"Hozz létre egy dokumentáció oldalt a ProTipp V2 projekthez"
"Készíts egy API dokumentáció oldalt"
```

#### 3.2 Dokumentáció Kezelés
```bash
# Teszt parancsok
"Frissítsd a projekt dokumentációt az új MCP funkciókkal"
"Keresd meg a betting algoritmus dokumentációt"
"Készíts egy adatbázis séma dokumentációt"
```

### Várt Eredmények
- ✅ Oldalak sikeresen létrejönnek
- ✅ Formázás megfelelő (lásd: NOTION_FORMATTING_GUIDE.md)
- ✅ Keresés működik
- ✅ Frissítések helyesen mentődnek

## 🧪 4. Playwright MCP Tesztelés (Közepes Prioritás)

### Tesztelési Szcenáriók

#### 4.1 UI Teszt Futtatás
```bash
# Teszt parancsok
"Futtass egy UI tesztet a login oldalhoz"
"Teszteld a betting flow-ot különböző böngészőkben"
"Ellenőrizd a responsive design-t mobil eszközökön"
```

#### 4.2 Teszt Generálás
```bash
# Teszt parancsok
"Generálj egy tesztet az analytics dashboard-hoz"
"Készíts egy E2E tesztet a teljes betting folyamathoz"
"Generálj accessibility tesztet a fő komponensekhez"
```

### Várt Eredmények
- ✅ Tesztek sikeresen futnak
- ✅ Cross-browser kompatibilitás ellenőrizhető
- ✅ Teszt scriptek generálódnak
- ✅ Performance metrikák mérhetők

## 🔒 5. Semgrep MCP Tesztelés (Alacsony Prioritás)

### Tesztelési Szcenáriók

#### 5.1 Biztonsági Ellenőrzés
```bash
# Teszt parancsok
"Végezz biztonsági ellenőrzést a TypeScript kódon"
"Ellenőrizd a dependency sebezhetőségeket"
"Scan-neld a React komponenseket biztonsági problémákért"
```

#### 5.2 Szabály Generálás
```bash
# Teszt parancsok
"Generálj egyedi szabályokat a ProTipp V2 projekthez"
"Készíts TypeScript best practice szabályokat"
"Generálj Supabase biztonsági szabályokat"
```

### Várt Eredmények
- ✅ Biztonsági scan-ek futnak
- ✅ Sebezhetőségek detektálódnak
- ✅ Egyedi szabályok generálódnak
- ✅ Kód minőség javul

## 🔧 Tesztelési Környezet Beállítása

### 1. Environment Variables
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Linear
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_team_id

# Notion
NOTION_TOKEN=your_notion_integration_token

# Playwright
PLAYWRIGHT_BROWSERS_PATH=./node_modules/.cache/playwright

# Semgrep
SEMGREP_APP_TOKEN=your_semgrep_token
```

### 2. Cursor MCP Konfiguráció
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://supabase.com/docs/guides/getting-started/mcp"]
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
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
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://github.com/semgrep/mcp"]
    }
  }
}
```

## 📊 Tesztelési Eredmények Nyilvántartása

### Tesztelési Mátrix

| MCP Szerver | Teszt Szcenárió | Státusz | Megjegyzések |
|-------------|-----------------|---------|--------------|
| Supabase | Adatbázis lekérdezés | ⏳ | Tesztelés alatt |
| Supabase | Adat beszúrás | ⏳ | Tesztelés alatt |
| Supabase | Adat frissítés | ⏳ | Tesztelés alatt |
| Linear | Issue létrehozás | ⏳ | Tesztelés alatt |
| Linear | Issue kezelés | ⏳ | Tesztelés alatt |
| Notion | Oldal létrehozás | ⏳ | Tesztelés alatt |
| Notion | Dokumentáció kezelés | ⏳ | Tesztelés alatt |
| Playwright | UI teszt futtatás | ⏳ | Tesztelés alatt |
| Playwright | Teszt generálás | ⏳ | Tesztelés alatt |
| Semgrep | Biztonsági ellenőrzés | ⏳ | Tesztelés alatt |
| Semgrep | Szabály generálás | ⏳ | Tesztelés alatt |

### Státusz Jelmagyarázat
- ⏳ **Tesztelés alatt** - Még nem tesztelt
- ✅ **Sikeres** - Teszt sikeresen lefutott
- ❌ **Sikertelen** - Teszt hibával végződött
- ⚠️ **Részleges** - Teszt részben sikeres

## 🚀 Következő Lépések

### 1. Fázis: Alapvető Tesztelés
- [ ] Supabase MCP alapvető funkciók tesztelése
- [ ] Linear MCP issue kezelés tesztelése
- [ ] Notion MCP dokumentáció kezelés tesztelése

### 2. Fázis: Speciális Tesztelés
- [ ] Playwright MCP UI tesztelés
- [ ] Semgrep MCP biztonsági ellenőrzés
- [ ] Integrációs tesztelés

### 3. Fázis: Optimalizálás
- [ ] Teljesítmény tesztelés
- [ ] Hibakezelés tesztelése
- [ ] Dokumentáció frissítése

## 📝 Tesztelési Jelentés Sablon

### Tesztelési Jelentés Formátum

```markdown
## MCP Szerver Tesztelési Jelentés

**Dátum**: [YYYY-MM-DD]
**Tesztelő**: [Név]
**MCP Szerver**: [Supabase/Linear/Notion/Playwright/Semgrep]

### Tesztelt Funkciók
- [ ] Funkció 1
- [ ] Funkció 2
- [ ] Funkció 3

### Eredmények
- **Sikeres tesztek**: X/Y
- **Sikertelen tesztek**: X/Y
- **Átlagos válaszidő**: X ms

### Megfigyelések
- [Megfigyelések és javaslatok]

### Következő Lépések
- [Tervezett javítások és optimalizálások]
```

---

**ProTipp V2 MCP Tesztelési Dokumentum** - Comprehensive testing guide for MCP server integration.
