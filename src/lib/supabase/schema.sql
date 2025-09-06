-- ProTipp V2 Database Schema
-- Bet Tracker Table

-- Bet Tracker tábla létrehozása
CREATE TABLE IF NOT EXISTS bet_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  bookmaker TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  stake DECIMAL(10,2),
  outcome TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE,
  profit DECIMAL(10,2),
  clv DECIMAL(5,2), -- Closing Line Value
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexek létrehozása
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_id ON bet_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_status ON bet_tracker(status);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_added_at ON bet_tracker(added_at);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_opportunity_id ON bet_tracker(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_sport ON bet_tracker(sport);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_bookmaker ON bet_tracker(bookmaker);

-- Composite index a gyakori lekérdezésekhez
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_status ON bet_tracker(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_added_at ON bet_tracker(user_id, added_at DESC);

-- RLS (Row Level Security) engedélyezése
ALTER TABLE bet_tracker ENABLE ROW LEVEL SECURITY;

-- RLS szabályok
-- Felhasználók csak a saját fogadásaikat láthatják/módosíthatják
CREATE POLICY "Users can view own bets" ON bet_tracker
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets" ON bet_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bets" ON bet_tracker
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bets" ON bet_tracker
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at automatikus frissítése
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger létrehozása
CREATE TRIGGER update_bet_tracker_updated_at 
  BEFORE UPDATE ON bet_tracker 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Audit logging tábla (opcionális)
CREATE TABLE IF NOT EXISTS bet_tracker_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID REFERENCES bet_tracker(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_bet_tracker_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, old_values, changed_by)
    VALUES (OLD.id, OLD.user_id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, old_values, new_values, changed_by)
    VALUES (NEW.id, NEW.user_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, new_values, changed_by)
    VALUES (NEW.id, NEW.user_id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Audit trigger létrehozása
CREATE TRIGGER bet_tracker_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bet_tracker
  FOR EACH ROW EXECUTE FUNCTION audit_bet_tracker_changes();

-- RLS az audit táblához
ALTER TABLE bet_tracker_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON bet_tracker_audit
  FOR SELECT USING (auth.uid() = user_id);

-- Statisztikai view-k
CREATE OR REPLACE VIEW bet_tracker_stats AS
SELECT 
  user_id,
  COUNT(*) as total_bets,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_bets,
  COUNT(*) FILTER (WHERE status = 'won') as won_bets,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_bets,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bets,
  COALESCE(SUM(stake), 0) as total_staked,
  COALESCE(SUM(profit), 0) as total_profit,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      (COUNT(*) FILTER (WHERE status = 'won')::DECIMAL / COUNT(*)) * 100
    ELSE 0 
  END as win_rate,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      AVG(odds)
    ELSE 0 
  END as average_odds
FROM bet_tracker
GROUP BY user_id;

-- RLS a stats view-hoz
ALTER VIEW bet_tracker_stats SET (security_invoker = true);

-- Utility functions
CREATE OR REPLACE FUNCTION get_user_bet_tracker_stats(p_user_id UUID)
RETURNS TABLE (
  total_bets BIGINT,
  pending_bets BIGINT,
  won_bets BIGINT,
  lost_bets BIGINT,
  total_staked DECIMAL,
  total_profit DECIMAL,
  win_rate DECIMAL,
  average_odds DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.total_bets,
    s.pending_bets,
    s.won_bets,
    s.lost_bets,
    s.total_staked,
    s.total_profit,
    s.win_rate,
    s.average_odds
  FROM bet_tracker_stats s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Real-time publication engedélyezése
ALTER PUBLICATION supabase_realtime ADD TABLE bet_tracker;

-- Kommentek hozzáadása
COMMENT ON TABLE bet_tracker IS 'Felhasználók tracked fogadásainak tárolása';
COMMENT ON COLUMN bet_tracker.opportunity_id IS 'Arbitrage opportunity egyedi azonosítója';
COMMENT ON COLUMN bet_tracker.clv IS 'Closing Line Value - a fogadás értéke a lezárás időpontjában';
COMMENT ON COLUMN bet_tracker.profit IS 'A fogadásból származó profit/veszteség';
COMMENT ON COLUMN bet_tracker.status IS 'A fogadás aktuális státusza: pending, won, lost, cancelled';
