# ProTipp V2 - Bet Tracker Funkció Specifikáció

**Verzió:** 1.0  
**Dátum:** 2024. január 26.  
**Product Owner:** Sarah  
**Státusz:** Ready for Development  
**Kapcsolódó Story:** 1.15 - Sprint 5  

## 📋 **1. FUNKCIÓ ÁTTEKINTÉS**

### **1.1 Cél**
A Bet Tracker funkció lehetővé teszi a felhasználók számára, hogy kiválasztott fogadásokat hozzáadják egy személyes listához, ahol követhetik azokat, módosíthatják a téteket és jegyzeteket adhatnak hozzá.

### **1.2 Üzleti Érték**
- **Felhasználói engagement:** Aktív fogadás követés
- **Platform használat:** Több idő a platformon
- **Funkcionalitás:** OddsJam.com hasonló funkció
- **Felhasználói retention:** Jobb élmény és használhatóság

### **1.3 Felhasználói Szerepkörök**
- **Regisztrált felhasználó:** Teljes Bet Tracker funkcionalitás
- **Vendég felhasználó:** Csak megtekintés, nincs mentés

## 🎯 **2. FUNKCIONÁLIS KÖVETELMÉNYEK**

### **2.1 "+" Gomb Implementálása**

#### **2.1.1 Gomb Elhelyezése**
- **Hely:** Minden mérkőzés sorában az ArbitrageTable-ban
- **Pozíció:** Jobb oldalon, az odds oszlop után
- **Stílus:** Kerek, lila színű gomb "+" ikonnal
- **Méret:** 32x32px, reszponzív

#### **2.1.2 Gomb Viselkedése**
- **Alapállapot:** Lila háttér, fehér "+" ikon
- **Hover állapot:** Sötétebb lila, scale(1.1) animáció
- **Kattintás:** Animáció + visszajelzés
- **Hozzáadva állapot:** Zöld háttér, "✓" ikon
- **Disabled állapot:** Szürke, ha már hozzáadva

#### **2.1.3 Visszajelzés**
- **Tooltip:** "Hozzáadás a Bet Tracker-hez"
- **Toast notification:** "Fogadás hozzáadva a Bet Tracker-hez"
- **Gomb animáció:** 200ms scale + color transition
- **Panel frissítés:** Bet Tracker panel automatikus frissítése

### **2.2 Bet Tracker Panel**

#### **2.2.1 Panel Elhelyezése**
- **Hely:** Dashboard oldal jobb oldalán
- **Méret:** 320px széles, teljes magasság
- **Sticky:** Rögzített pozíció, scroll-nál is látható
- **Reszponzív:** Mobile-on teljes szélesség, alul

#### **2.2.2 Panel Tartalma**
- **Header:** "Bet Tracker" cím + elemek száma
- **Lista:** Hozzáadott fogadások listája
- **Footer:** "Törlés mind" gomb + export opciók

#### **2.2.3 Fogadás Elemek**
- **Esemény neve:** Truncated, hover-en teljes név
- **Sport:** Badge formátumban
- **Fogadóiroda:** Badge formátumban
- **Odds:** Monospace font, real-time frissítés
- **Tét:** Input mező, szerkeszthető
- **Jegyzet:** Input mező, opcionális
- **Műveletek:** Törlés gomb, szerkesztés ikon

### **2.3 Adatbázis Integráció**

#### **2.3.1 Tábla Struktúra**
```sql
CREATE TABLE bet_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  bookmaker TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2) DEFAULT 0,
  outcome TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2.3.2 Indexek**
```sql
CREATE INDEX idx_bet_tracker_user_id ON bet_tracker(user_id);
CREATE INDEX idx_bet_tracker_status ON bet_tracker(status);
CREATE INDEX idx_bet_tracker_added_at ON bet_tracker(added_at);
CREATE INDEX idx_bet_tracker_opportunity_id ON bet_tracker(opportunity_id);
```

#### **2.3.3 RLS Szabályok**
```sql
-- Users can only see their own tracked bets
CREATE POLICY "Users can view own tracked bets" ON bet_tracker
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tracked bets
CREATE POLICY "Users can insert own tracked bets" ON bet_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracked bets
CREATE POLICY "Users can update own tracked bets" ON bet_tracker
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tracked bets
CREATE POLICY "Users can delete own tracked bets" ON bet_tracker
  FOR DELETE USING (auth.uid() = user_id);
```

### **2.4 Real-time Frissítések**

#### **2.4.1 Supabase Realtime**
- **Channel:** `bet-tracker-changes`
- **Event:** `postgres_changes`
- **Filter:** `user_id=eq.${userId}`
- **Operations:** INSERT, UPDATE, DELETE

#### **2.4.2 Frissítési Logika**
- **Odds változás:** Automatikus frissítés a panelben
- **Státusz változás:** Vizuális visszajelzés
- **Új elem hozzáadása:** Panel automatikus frissítése
- **Elem törlése:** Panel automatikus frissítése

## 🎨 **3. UI/UX SPECIFIKÁCIÓ**

### **3.1 Design Rendszer**

#### **3.1.1 Színek**
- **Primary:** `hsl(262, 83%, 58%)` (lila)
- **Success:** `hsl(142, 76%, 36%)` (zöld)
- **Warning:** `hsl(38, 92%, 50%)` (sárga)
- **Error:** `hsl(0, 84%, 60%)` (piros)
- **Background:** `hsl(0, 0%, 5%)` (sötét)

#### **3.1.2 Tipográfia**
- **Font:** Inter
- **Headings:** 600 weight
- **Body:** 400 weight
- **Monospace:** JetBrains Mono (odds számokhoz)

#### **3.1.3 Spacing**
- **Padding:** 16px (panel), 8px (elemek)
- **Margin:** 8px (elemek között)
- **Border radius:** 8px (panel), 4px (gombok)

### **3.2 Komponens Specifikációk**

#### **3.2.1 BetTrackerButton**
```tsx
interface BetTrackerButtonProps {
  opportunity: ArbitrageOpportunity;
  onAdd: (opportunity: ArbitrageOpportunity) => void;
  isAdded: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

#### **3.2.2 BetTrackerPanel**
```tsx
interface BetTrackerPanelProps {
  opportunities: ArbitrageOpportunity[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BetTrackerItem>) => void;
  onClear: () => void;
  className?: string;
}
```

#### **3.2.3 BetTrackerItem**
```tsx
interface BetTrackerItemProps {
  item: BetTrackerItem;
  onUpdate: (updates: Partial<BetTrackerItem>) => void;
  onRemove: () => void;
  isEditing?: boolean;
}
```

### **3.3 Animációk**

#### **3.3.1 Gomb Animációk**
- **Hover:** `transform: scale(1.1)`, `transition: 200ms ease`
- **Click:** `transform: scale(0.95)`, `transition: 100ms ease`
- **Success:** `background-color` változás, `transition: 300ms ease`

#### **3.3.2 Panel Animációk**
- **Slide in:** `transform: translateX(100%)` → `translateX(0)`
- **Fade in:** `opacity: 0` → `opacity: 1`
- **Item add:** `transform: scale(0.8)` → `scale(1)`

## 🔧 **4. MŰSZAKI SPECIFIKÁCIÓ**

### **4.1 API Endpoints**

#### **4.1.1 GET /api/bet-tracker**
```typescript
interface GetTrackedBetsResponse {
  bets: BetTrackerItem[];
  total: number;
  hasMore: boolean;
}

// Query parameters
interface GetTrackedBetsParams {
  limit?: number;
  offset?: number;
  status?: string;
  sport?: string;
}
```

#### **4.1.2 POST /api/bet-tracker**
```typescript
interface AddBetRequest {
  opportunity_id: string;
  event_name: string;
  sport: string;
  bookmaker: string;
  odds: number;
  stake?: number;
  notes?: string;
}

interface AddBetResponse {
  success: boolean;
  data: BetTrackerItem;
  message: string;
}
```

#### **4.1.3 PUT /api/bet-tracker/:id**
```typescript
interface UpdateBetRequest {
  stake?: number;
  notes?: string;
  status?: 'pending' | 'won' | 'lost' | 'cancelled';
}

interface UpdateBetResponse {
  success: boolean;
  data: BetTrackerItem;
  message: string;
}
```

#### **4.1.4 DELETE /api/bet-tracker/:id**
```typescript
interface RemoveBetResponse {
  success: boolean;
  message: string;
}
```

### **4.2 Custom Hooks**

#### **4.2.1 useBetTracker**
```typescript
interface UseBetTrackerReturn {
  trackedBets: BetTrackerItem[];
  isLoading: boolean;
  error: Error | null;
  addToTracker: (opportunity: ArbitrageOpportunity) => Promise<void>;
  removeFromTracker: (id: string) => Promise<void>;
  updateBet: (id: string, updates: Partial<BetTrackerItem>) => Promise<void>;
  clearTracker: () => Promise<void>;
  isAdded: (opportunityId: string) => boolean;
}
```

#### **4.2.2 useBetTrackerStats**
```typescript
interface UseBetTrackerStatsReturn {
  stats: {
    totalBets: number;
    totalStake: number;
    avgOdds: number;
    pendingBets: number;
  };
  isLoading: boolean;
  error: Error | null;
}
```

### **4.3 Context Provider**

#### **4.3.1 BetTrackerProvider**
```tsx
interface BetTrackerContextType {
  trackedBets: BetTrackerItem[];
  addToTracker: (opportunity: ArbitrageOpportunity) => void;
  removeFromTracker: (id: string) => void;
  updateBet: (id: string, updates: Partial<BetTrackerItem>) => void;
  clearTracker: () => void;
  isAdded: (opportunityId: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}
```

## 📱 **5. RESZPONZÍV DESIGN**

### **5.1 Breakpoint-ok**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### **5.2 Mobile Optimalizáció**
- **Panel pozíció:** Alul, teljes szélesség
- **Gomb méret:** 40x40px (touch-friendly)
- **Lista elemek:** Nagyobb padding, könnyebb kattintás
- **Input mezők:** Nagyobb méret, jobb accessibility

### **5.3 Tablet Optimalizáció**
- **Panel méret:** 280px szélesség
- **Gomb méret:** 36x36px
- **Lista elemek:** Közepes padding

## 🧪 **6. TESZTELÉSI STRATÉGIA**

### **6.1 Unit Tesztek**
- **Komponens renderelés:** Minden komponens megfelelően renderelődik
- **Props kezelés:** Helyes props átadás és kezelés
- **State management:** Context és hook működése
- **API hívások:** Mock API válaszok kezelése

### **6.2 Integration Tesztek**
- **Adatbázis műveletek:** CRUD műveletek tesztelése
- **Real-time frissítések:** Supabase Realtime működése
- **Komponens integráció:** ArbitrageTable + Bet Tracker
- **Error handling:** Hiba esetek kezelése

### **6.3 E2E Tesztek**
- **Felhasználói workflow:** Teljes Bet Tracker használat
- **Cross-browser:** Chrome, Firefox, Safari
- **Mobile tesztelés:** iOS, Android
- **Performance:** Betöltési idő, animációk

### **6.4 Accessibility Tesztek**
- **Keyboard navigation:** Tab, Enter, Escape
- **Screen reader:** ARIA labels, roles
- **Color contrast:** WCAG 2.1 AA megfelelés
- **Focus management:** Látható focus indicators

## 📊 **7. PERFORMANCE KÖVETELMÉNYEK**

### **7.1 Betöltési Idők**
- **Initial load:** < 500ms
- **Panel open:** < 200ms
- **Add/remove bet:** < 300ms
- **Real-time update:** < 100ms

### **7.2 Memória Használat**
- **Max tracked bets:** 100 elem
- **Memory usage:** < 10MB
- **Bundle size increase:** < 50KB

### **7.3 Network Optimalizáció**
- **API calls:** Debounced, batched
- **Real-time:** Efficient subscriptions
- **Caching:** React Query cache
- **Offline support:** Local storage fallback

## 🔒 **8. BIZTONSÁGI KÖVETELMÉNYEK**

### **8.1 Adatvédelem**
- **User isolation:** RLS szabályok
- **Data validation:** Input sanitization
- **Rate limiting:** API hívások korlátozása
- **Audit log:** Műveletek naplózása

### **8.2 Authentication**
- **User verification:** Supabase Auth
- **Session management:** Token refresh
- **Permission checks:** Role-based access
- **CSRF protection:** API endpoints

## 📈 **9. ANALYTICS ÉS METRIKÁK**

### **9.1 Felhasználói Metrikák**
- **Bet Tracker usage:** Hány felhasználó használja
- **Add/remove rate:** Műveletek gyakorisága
- **Session duration:** Mennyi időt töltenek a panelben
- **Conversion rate:** Bet Tracker → actual betting

### **9.2 Technikai Metrikák**
- **API response time:** Átlagos válaszidő
- **Error rate:** Hiba arány
- **Real-time latency:** Frissítési késés
- **Memory usage:** Memória használat

## 🚀 **10. DEPLOYMENT ÉS MONITORING**

### **10.1 Deployment**
- **Staging:** Feature branch deployment
- **Production:** Main branch deployment
- **Database migration:** Supabase migration
- **Environment variables:** API keys, URLs

### **10.2 Monitoring**
- **Error tracking:** Sentry integration
- **Performance monitoring:** Web Vitals
- **Real-time monitoring:** Supabase dashboard
- **User feedback:** In-app feedback system

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. január 26.  
**Product Owner:** Sarah  
**Státusz:** Ready for Development - Sprint 5
