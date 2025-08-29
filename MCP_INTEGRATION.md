# 🔗 Linear MCP Integration (Official)

## Overview

A ProTipp V2 projekt most már támogatja a **hivatalos Linear MCP (Model Context Protocol)** szervert, ami lehetővé teszi az AI asszisztensek számára, hogy közvetlenül Linear issue-kat hozzanak létre és kezeljenek.

## 🚀 Features

### Available Tools

1. **`create_issue`** - Új Linear issue létrehozása
   - `title` (kötelező): Issue címe
   - `description` (opcionális): Részletes leírás
   - `priority` (opcionális): Prioritás (0-4)
   - `teamId` (opcionális): Team ID
   - `labels` (opcionális): Label-ek tömbje

2. **`list_teams`** - Elérhető team-ek listázása

3. **`list_issues`** - Issue-k listázása szűréssel
   - `teamId` (opcionális): Team szerinti szűrés
   - `state` (opcionális): Állapot szerinti szűrés
   - `limit` (opcionális): Maximum darabszám

4. **`update_issue`** - Meglévő issue frissítése
   - `issueId` (kötelező): Issue ID
   - `title`, `description`, `state`, `priority` (opcionális)

## 📋 Setup

### 1. Cursor beállítások konfigurálása

**Fontos:** A globális MCP konfigurációt a Cursor beállításokban kell hozzáadni, nem a `.cursorrules` fájlban!

```bash
# 1. Nyisd meg a Cursor beállításokat: Cmd+Shift+J
# 2. Válaszd ki az "MCP" menüpontot
# 3. Kattints az "Add new global MCP server" gombra
# 4. Add hozzá a következő konfigurációt:

{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
  }
}
```

### 2. Linear bejelentkezés

Az MCP szerver automatikusan megkéri a Linear bejelentkezést az első használatkor.

### 3. Tesztelés

Az MCP szerver most már megjelenik az "MCP Tools" listában a Cursor beállításokban.

## 🎯 Usage Examples

### Issue létrehozása AI asszisztenssel

```
"Készíts egy Linear issue-t egy új feature-ről"
```

Az AI asszisztens automatikusan létrehoz egy issue-t a megfelelő címével és leírásával.

### Bug report létrehozása

```
"Készíts egy bug report issue-t a login form hibájáról"
```

### Issue-k listázása

```
"Listázd ki az összes Todo állapotú issue-t"
```

## 🔧 Configuration

### Cursor MCP Settings

A Cursor-ban az MCP szerver automatikusan elérhető lesz. A konfiguráció a `.cursorrules` fájlban található:

```yaml
mcpServers:
  linear:
    command: bun
    args: ["run", "mcp:linear"]
    env:
      LINEAR_API_KEY: ${LINEAR_API_KEY}
      LINEAR_TEAM_ID: ${LINEAR_TEAM_ID}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LINEAR_API_KEY` | Linear API kulcs | ✅ |
| `LINEAR_TEAM_ID` | Linear team ID | ✅ |
| `LINEAR_WORKSPACE_ID` | Workspace ID (opcionális) | ❌ |

## 🛠️ Development

### MCP szerver fejlesztése

```bash
# Szerver indítása fejlesztési módban
bun run mcp:linear

# Új eszközök hozzáadása
# Szerkeszd a src/lib/mcp/linear-server.ts fájlt
```

### Új eszközök hozzáadása

1. Nyisd meg a `src/lib/mcp/linear-server.ts` fájlt
2. Add hozzá az új eszközt a `tools` tömbhöz
3. Implementáld a logikát a `CallToolRequestSchema` handler-ben
4. Teszteld az új eszközt

## 🔍 Troubleshooting

### Gyakori problémák

1. **"Missing LINEAR_API_KEY"**
   - Ellenőrizd, hogy a `.env.local` fájl létezik
   - Ellenőrizd, hogy a `LINEAR_API_KEY` be van állítva

2. **"No team ID provided"**
   - Ellenőrizd, hogy a `LINEAR_TEAM_ID` be van állítva
   - Vagy add meg a `teamId` paramétert az eszköz hívásakor

3. **"State not found"**
   - Ellenőrizd, hogy a state neve helyes
   - Használd a `list_teams` eszközt a helyes értékek megtalálásához

### Debug mód

```bash
# Debug üzenetekkel
DEBUG=* bun run mcp:linear
```

## 📚 Resources

- [Linear API Documentation](https://developers.linear.app/docs)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)

## 🤝 Contributing

Ha új eszközöket szeretnél hozzáadni vagy javítani a meglévőket:

1. Fork-öld a repository-t
2. Hozz létre egy feature branch-et
3. Implementáld a változtatásokat
4. Teszteld az MCP szervert
5. Küldj egy pull request-et

---

**Ez a dokumentáció segít a Linear MCP integráció használatában és fejlesztésében.**
