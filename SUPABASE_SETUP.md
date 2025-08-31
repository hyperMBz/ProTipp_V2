# Supabase Beállítás - ProTipp V2

## A hiba oka

A `TypeError: Failed to fetch` hiba azért jelentkezik, mert a Supabase környezeti változók placeholder értékeket tartalmaznak a `.env.local` fájlban.

## Javítási lépések

### 1. Supabase Projekt Létrehozása

1. Menjen a [Supabase Dashboard](https://supabase.com/dashboard)-ra
2. Kattintson az "New Project" gombra
3. Válassza ki a szervezetét vagy hozzon létre egy újat
4. Adjon nevet a projektnek (pl. "protip-v2")
5. Válasszon egy jelszót az adatbázishoz
6. Válasszon egy régiót (ajánlott: West Europe)
7. Kattintson a "Create new project" gombra

### 2. Környezeti Változók Beállítása

1. A projekt létrehozása után, menjen a "Settings" > "API" menübe
2. Másolja ki a következő értékeket:
   - **Project URL** (pl. `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (pl. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. Frissítse a `.env.local` fájlt:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Service Role Key (csak szerver oldalon használható)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# További környezeti változók
NODE_ENV=development
```

### 3. Adatbázis Séma Létrehozása

A projekt automatikusan létrehozza a szükséges táblákat, de ha manuálisan szeretné beállítani:

```sql
-- Profiles tábla
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bankroll DECIMAL DEFAULT 1000,
  timezone TEXT DEFAULT 'Europe/Budapest',
  currency TEXT DEFAULT 'HUF',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bet history tábla
CREATE TABLE bet_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  event_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  bookmaker TEXT NOT NULL,
  odds DECIMAL NOT NULL,
  stake DECIMAL NOT NULL,
  outcome TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'refunded', 'cancelled')),
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE,
  profit DECIMAL,
  clv DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings tábla
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  auto_refresh BOOLEAN DEFAULT true,
  notification_settings JSONB DEFAULT '{}',
  default_filters JSONB DEFAULT '{}',
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) beállítása
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS szabályok
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bets" ON bet_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON bet_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bets" ON bet_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Development Szerver Újraindítása

```bash
# Állítsa le a jelenlegi szervert (Ctrl+C)
# Majd indítsa újra:
bun run dev
```

### 5. Ellenőrzés

1. Nyissa meg a böngészőt és menjen a `http://localhost:3001/dashboard` oldalra
2. A "Supabase Kapcsolat" widget zöld "Kapcsolódva" állapotot kell mutasson
3. Próbáljon meg bejelentkezni a login funkcióval

## Hibaelhárítás

### Ha továbbra is "Failed to fetch" hibát kap:

1. **Ellenőrizze a környezeti változókat:**
   ```bash
   cat .env.local
   ```

2. **Ellenőrizze a böngésző konzolt:**
   - Nyissa meg a Developer Tools-t (F12)
   - Menjen a Console fülre
   - Keresse meg a Supabase kapcsolódási hibákat

3. **Ellenőrizze a hálózati kéréseket:**
   - A Developer Tools Network fülén
   - Keresse meg a Supabase API hívásokat

4. **Ellenőrizze a Supabase projekt állapotát:**
   - Menjen a Supabase Dashboard-ra
   - Ellenőrizze, hogy a projekt aktív-e
   - Ellenőrizze az API kulcsok helyességét

### Gyakori hibák:

- **"Invalid API key"**: Ellenőrizze az anon key helyességét
- **"Project not found"**: Ellenőrizze a projekt URL-t
- **"CORS error"**: Ellenőrizze a Supabase projekt beállításait

## További segítség

- [Supabase Dokumentáció](https://supabase.com/docs)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase Discord](https://discord.supabase.com/)
