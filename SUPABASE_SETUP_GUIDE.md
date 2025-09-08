# 🚀 ProTipp V2 - Supabase Beállítási Útmutató

## ⚠️ FONTOS: A bejelentkezési rendszer újra lett írva!

A ProTipp V2 projektben teljesen új bejelentkezési rendszert implementáltunk, amely:
- ✅ Egységes auth provider
- ✅ Automatikus dashboard átirányítás
- ✅ Megfelelő navigációs sáv kezelés
- ✅ Route védelem middleware-rel

## 🔧 1. Supabase Projekt Létrehozása

### Lépések:
1. Menjen a [Supabase Dashboard](https://supabase.com/dashboard)-ra
2. Kattintson az "New Project" gombra
3. Válassza ki a szervezetét vagy hozzon létre egy újat
4. Adjon nevet a projektnek: `protip-v2`
5. Válasszon egy erős jelszót az adatbázishoz
6. Válasszon régiót: **West Europe** (ajánlott)
7. Kattintson a "Create new project" gombra

## 🔑 2. Környezeti Változók Beállítása

### Lépések:
1. A projekt létrehozása után, menjen a **Settings** > **API** menübe
2. Másolja ki a következő értékeket:
   - **Project URL** (pl. `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (pl. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (csak szerver oldalon használható)

3. Hozzon létre egy `.env.local` fájlt a projekt gyökerében:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## 🗄️ 3. Adatbázis Séma Létrehozása

### SQL Editor-ben futtassa le:

```sql
-- Profiles tábla
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
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

## 🔐 4. Authentication Beállítások

### Supabase Dashboard-ban:
1. Menjen a **Authentication** > **Settings** menübe
2. **Site URL**: `http://localhost:3000` (development)
3. **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. **Email Confirmations**: Kapcsolja be (ajánlott)
5. **Enable email confirmations**: ✅

### Google OAuth (opcionális):
1. Menjen a **Authentication** > **Providers** menübe
2. Kapcsolja be a **Google** provider-t
3. Adja meg a Google OAuth credentials-eket

## 🚀 5. Development Szerver Indítása

```bash
# Telepítse a függőségeket (ha még nem tette)
bun install

# Indítsa el a development szervert
bun run dev
```

## ✅ 6. Tesztelés

### Ellenőrizze a következőket:
1. **Főoldal**: `http://localhost:3000`
   - Bejelentkezés/Regisztráció gombok működnek
   - Dialog megnyílik

2. **Regisztráció**:
   - Új felhasználó létrehozása
   - Email megerősítés (ha be van kapcsolva)
   - Automatikus átirányítás dashboard-ra

3. **Bejelentkezés**:
   - Meglévő felhasználó bejelentkezése
   - Automatikus átirányítás dashboard-ra

4. **Dashboard**: `http://localhost:3000/dashboard`
   - Navigációs sáv megjelenik
   - Felhasználói menü működik
   - Kijelentkezés működik

5. **Route védelem**:
   - Bejelentkezés nélkül nem érhető el a dashboard
   - Automatikus átirányítás a főoldalra

## 🔧 7. Hibaelhárítás

### Ha "Failed to fetch" hibát kap:
1. **Ellenőrizze a környezeti változókat**:
   ```bash
   cat .env.local
   ```

2. **Ellenőrizze a böngésző konzolt**:
   - Nyissa meg a Developer Tools-t (F12)
   - Menjen a Console fülre
   - Keresse meg a Supabase kapcsolódási hibákat

3. **Ellenőrizze a hálózati kéréseket**:
   - A Developer Tools Network fülén
   - Keresse meg a Supabase API hívásokat

### Gyakori hibák:
- **"Invalid API key"**: Ellenőrizze az anon key helyességét
- **"Project not found"**: Ellenőrizze a projekt URL-t
- **"CORS error"**: Ellenőrizze a Supabase projekt beállításait
- **"Email not confirmed"**: Ellenőrizze az email megerősítést

## 📱 8. Új Funkciók

### Az új bejelentkezési rendszer tartalmazza:
- ✅ **Egységes Auth Provider**: `UnifiedAuthProvider`
- ✅ **Bejelentkezési Dialog**: `UnifiedLoginDialog`
- ✅ **Felhasználói Menü**: `UnifiedUserMenu`
- ✅ **Navigációs Sáv**: `UnifiedNavigation`
- ✅ **Automatikus átirányítás**: Dashboard-ra bejelentkezés után
- ✅ **Route védelem**: Middleware-rel
- ✅ **Google OAuth**: Támogatás
- ✅ **Email megerősítés**: Támogatás

## 🎯 9. Következő Lépések

1. **Supabase projekt létrehozása** a fenti lépések szerint
2. **Környezeti változók beállítása** a `.env.local` fájlban
3. **Adatbázis séma létrehozása** az SQL script-tel
4. **Development szerver indítása** és tesztelés
5. **Production deployment** (Netlify/Vercel)

## 📞 Támogatás

Ha problémába ütközik:
1. Ellenőrizze a böngésző konzolt hibákért
2. Ellenőrizze a Supabase Dashboard-ban a projekt állapotát
3. Ellenőrizze a környezeti változókat
4. Indítsa újra a development szervert

---

**🎉 Gratulálunk! A ProTipp V2 bejelentkezési rendszer most már teljesen működőképes!**
