# 🧪 Notion MCP Server Test

## Tesztelési lépések a Notion MCP szerver ellenőrzéséhez

### 1. Cursor beállítások ellenőrzése

1. Nyisd meg a Cursor beállításokat: `Cmd+Shift+J`
2. Válaszd ki az "MCP" menüpontot
3. Ellenőrizd, hogy a Notion MCP szerver szerepel-e a listában

### 2. MCP szerver konfiguráció

A következő konfigurációt kell hozzáadni:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/sse"]
    }
  }
}
```

### 3. Tesztelési parancsok

Miután beállítottad a Notion MCP szervert, teszteld a következő parancsokkal:

#### Alapvető tesztelés
```
"Készíts egy teszt oldalt a Notion-ban a ProTipp V2 projekthez"
```

#### Dokumentáció létrehozása
```
"Készíts egy projekt áttekintő oldalt a Notion-ban"
```

#### Keresés tesztelése
```
"Keresd meg a ProTipp V2 projekt dokumentációt a Notion workspace-ben"
```

#### Adatbázis létrehozása
```
"Készíts egy adatbázist a fejlesztési feladatok tárolásához"
```

### 4. Várt eredmények

- ✅ Notion MCP szerver megjelenik az MCP Tools listában
- ✅ Bejelentkezési képernyő jelenik meg az első használatkor
- ✅ AI asszisztens tud Notion oldalakat létrehozni
- ✅ Keresés és lekérdezés működik
- ✅ Hibaüzenetek nélküli működés

### 5. Hibaelhárítás

#### "Notion MCP server not found"
- Ellenőrizd a Cursor beállításokat
- Indítsd újra a Cursor-t
- Ellenőrizd az internetkapcsolatot

#### "Authentication failed"
- Ellenőrizd a Notion bejelentkezést
- Frissítsd a Notion integration token-t
- Ellenőrizd a workspace jogosultságokat

#### "Permission denied"
- Ellenőrizd a Notion workspace beállításokat
- Ad megfelelő jogosultságokat az integration-nek
- Ellenőrizd a page/database hozzáférési jogokat

### 6. Sikeres tesztelés után

Ha minden működik, akkor:

1. ✅ Notion MCP szerver aktív
2. ✅ Bejelentkezés sikeres
3. ✅ AI asszisztens tud Notion-t használni
4. ✅ Projekt dokumentáció kezelés elérhető

### 7. Következő lépések

Sikeres tesztelés után:

1. **Projekt dokumentáció struktúra létrehozása**
2. **Automatikus szinkronizálás beállítása**
3. **Fejlesztési napló rendszer**
4. **Kód dokumentáció integráció**

---

**Ez a tesztelési fájl segít ellenőrizni a Notion MCP szerver megfelelő működését.**
