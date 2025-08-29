# 🎯 ProTipp V2 - Sports Betting Arbitrage Platform

CI deploy test: Thu Aug 28 19:16:55 UTC 2025

## 🚀 Project Overview
Részletes áttekintés, linkek és folyamatok: [docs/overview.md](docs/overview.md)

## 🔗 Linear MCP Integration (Official)

A projekt most már támogatja a **hivatalos Linear MCP (Model Context Protocol)** szervert, ami lehetővé teszi az AI asszisztensek számára, hogy közvetlenül Linear issue-kat hozzanak létre és kezeljenek.

### 🎯 Features
- ✅ **Automatikus issue létrehozás** AI asszisztenssel
- ✅ **Issue kezelés** (létrehozás, frissítés, listázás)
- ✅ **Team és projekt kezelés**
- ✅ **Label és prioritás kezelés**
- ✅ **Hivatalos Linear támogatás**

### 📋 Quick Setup
1. **Cursor beállítások megnyitása:** `Cmd+Shift+J`
2. **MCP kiválasztása**
3. **"Add new global MCP server"**
4. **Konfiguráció hozzáadása:**
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
       }
     }
   }
   ```

### ✅ **Előnyök a hivatalos szerverrel:**
- **Megjelenik az MCP Tools listában**: ✅
- **Hivatalos Linear támogatás**: ✅
- **Automatikus frissítések**: ✅
- **Jobb integráció**: ✅

### 📚 Documentation
- [MCP Integration Guide](MCP_INTEGRATION.md) - Részletes útmutató
- [Linear API Docs](https://developers.linear.app/docs)
- [MCP Protocol](https://modelcontextprotocol.io/)

---

**Next.js 15 sports betting arbitrage platform with real-time odds comparison, TypeScript, shadcn/ui, and Supabase backend.**
