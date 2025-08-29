# Scripts

Ez a mappa a BMAD projekt különböző automatizált script-jeit tartalmazza.

## Fejlesztési Állapot Követés

### `create-dev-status-issue.ts`

Ez a script létrehoz egy issue-t a Linear projektben, amely nyomon követi a BMAD projekt fejlesztési állapotát.

#### Használat

```bash
# NPM script használatával
npm run create-dev-status

# Vagy közvetlenül
bunx tsx scripts/create-dev-status-issue.ts
```

#### Előfeltételek

A script futtatásához szükséges környezeti változók:

```env
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_linear_team_id
```

#### Mit csinál

1. Létrehoz egy "Fejlesztési Állapot Követés" issue-t a Linear projektben
2. Részletes leírást ad a projekt aktuális állapotáról:
   - ✅ Elvégzett funkciók
   - 🔄 Folyamatban lévő fejlesztések
   - 📋 Tervezett fejlesztések
   - 🎯 Következő lépések
3. Automatikusan "BMAD" címkével és "Todo" állapottal hozza létre
4. High priority (2) szintet állít be

#### Kimenet

A script sikeres futtatásakor kiírja:
- ✅ Az issue ID-ját
- 🔗 A Linear issue URL-jét

#### Hibakezelés

Ha hiba történik, a script:
- Kiírja a hiba részleteit
- Exit code 1-gyel kilép
- Javasolja a környezeti változók ellenőrzését

### Frissítés

A script rendszeresen frissíthető, hogy tükrözze a projekt aktuális állapotát. A `issueData` objektumot módosítva új funkciókat, elvégzett feladatokat vagy terveket lehet hozzáadni.

## Issue Frissítés

### `update-dev-status-issue.ts`

Ez a script frissíti egy meglévő fejlesztési állapot issue-t.

#### Használat

```bash
# NPM script használatával (issue ID szükséges)
npm run update-dev-status <issue-id>

# Vagy közvetlenül
bunx tsx scripts/update-dev-status-issue.ts <issue-id>
```

#### Mit csinál

1. Frissíti a meglévő issue leírását az aktuális projekt állapotával
2. Hozzáadja az új funkciókat és elvégzett feladatokat
3. Frissíti a frissítési statisztikákat
4. Megőrzi az issue ID-t és URL-t

#### Példa

```bash
# Először létrehozzuk az issue-t
npm run create-dev-status

# Később frissítjük (az issue ID-t a Linear-ból kell másolni)
npm run update-dev-status ABC-123
```

## Automatizálás

A script-ek CI/CD folyamatokban is használhatók:

```yaml
# GitHub Actions példa
- name: Update Development Status
  run: |
    npm run update-dev-status ${{ secrets.LINEAR_ISSUE_ID }}
  env:
    LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
    LINEAR_TEAM_ID: ${{ secrets.LINEAR_TEAM_ID }}
```