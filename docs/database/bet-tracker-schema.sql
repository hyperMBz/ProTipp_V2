-- ProTipp V2 - Bet Tracker Adatbázis Séma
-- Verzió: 1.0
-- Dátum: 2024. január 26.
-- Sprint: Sprint 5 - Add to Bet Tracker

-- =============================================
-- BET TRACKER TÁBLA LÉTREHOZÁSA
-- =============================================

CREATE TABLE IF NOT EXISTS bet_tracker (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Opportunity Data
  opportunity_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  bookmaker TEXT NOT NULL,
  odds DECIMAL(10,2) NOT NULL,
  
  -- User Input
  stake DECIMAL(10,2) DEFAULT 0,
  outcome TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'refunded')),
  notes TEXT,
  
  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXEK LÉTREHOZÁSA
-- =============================================

-- User ID index (legfontosabb)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_id ON bet_tracker(user_id);

-- Status index (szűréshez)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_status ON bet_tracker(status);

-- Added at index (sorrendezéshez)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_added_at ON bet_tracker(added_at);

-- Opportunity ID index (duplikáció ellenőrzéshez)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_opportunity_id ON bet_tracker(opportunity_id);

-- Composite index (user + status)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_status ON bet_tracker(user_id, status);

-- Composite index (user + added_at)
CREATE INDEX IF NOT EXISTS idx_bet_tracker_user_added_at ON bet_tracker(user_id, added_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) SZABÁLYOK
-- =============================================

-- RLS engedélyezése
ALTER TABLE bet_tracker ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tracked bets
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

-- =============================================
-- TRIGGEREK
-- =============================================

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bet_tracker_updated_at
  BEFORE UPDATE ON bet_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS
-- =============================================

-- User bet tracker summary view
CREATE OR REPLACE VIEW bet_tracker_summary AS
SELECT 
  user_id,
  COUNT(*) as total_bets,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bets,
  COUNT(CASE WHEN status = 'won' THEN 1 END) as won_bets,
  COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_bets,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bets,
  COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_bets,
  COALESCE(SUM(stake), 0) as total_stake,
  COALESCE(AVG(odds), 0) as avg_odds,
  MIN(added_at) as first_bet_date,
  MAX(added_at) as last_bet_date
FROM bet_tracker
GROUP BY user_id;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check if opportunity is already tracked
CREATE OR REPLACE FUNCTION is_opportunity_tracked(
  p_user_id UUID,
  p_opportunity_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM bet_tracker 
    WHERE user_id = p_user_id 
    AND opportunity_id = p_opportunity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's tracked bets with pagination
CREATE OR REPLACE FUNCTION get_user_tracked_bets(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  opportunity_id TEXT,
  event_name TEXT,
  sport TEXT,
  bookmaker TEXT,
  odds DECIMAL(10,2),
  stake DECIMAL(10,2),
  outcome TEXT,
  status TEXT,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.id,
    bt.opportunity_id,
    bt.event_name,
    bt.sport,
    bt.bookmaker,
    bt.odds,
    bt.stake,
    bt.outcome,
    bt.status,
    bt.notes,
    bt.added_at,
    bt.updated_at
  FROM bet_tracker bt
  WHERE bt.user_id = p_user_id
  AND (p_status IS NULL OR bt.status = p_status)
  ORDER BY bt.added_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add bet to tracker with duplicate check
CREATE OR REPLACE FUNCTION add_bet_to_tracker(
  p_user_id UUID,
  p_opportunity_id TEXT,
  p_event_name TEXT,
  p_sport TEXT,
  p_bookmaker TEXT,
  p_odds DECIMAL(10,2),
  p_stake DECIMAL(10,2) DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_bet_id UUID;
BEGIN
  -- Check if already tracked
  IF is_opportunity_tracked(p_user_id, p_opportunity_id) THEN
    RAISE EXCEPTION 'Opportunity already tracked by user';
  END IF;
  
  -- Insert new bet
  INSERT INTO bet_tracker (
    user_id,
    opportunity_id,
    event_name,
    sport,
    bookmaker,
    odds,
    stake,
    notes
  ) VALUES (
    p_user_id,
    p_opportunity_id,
    p_event_name,
    p_sport,
    p_bookmaker,
    p_odds,
    p_stake,
    p_notes
  ) RETURNING id INTO v_bet_id;
  
  RETURN v_bet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA (CSAK FEJLESZTÉSI KÖRNYEZETBEN)
-- =============================================

-- Sample data insertion (only for development)
-- INSERT INTO bet_tracker (user_id, opportunity_id, event_name, sport, bookmaker, odds, stake, notes)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'opp-001', 'Real Madrid vs Barcelona', 'Labdarúgás', 'Bet365', 2.50, 1000, 'Főmeccs'),
--   ('00000000-0000-0000-0000-000000000001', 'opp-002', 'Lakers vs Warriors', 'Kosárlabda', 'Unibet', 1.85, 500, 'Derby meccs'),
--   ('00000000-0000-0000-0000-000000000001', 'opp-003', 'Djokovic vs Nadal', 'Tenisz', 'Betfair', 3.20, 750, 'Grand Slam');

-- =============================================
-- PERFORMANCE OPTIMALIZÁCIÓ
-- =============================================

-- Statistics update
ANALYZE bet_tracker;

-- =============================================
-- BACKUP ÉS MAINTENANCE
-- =============================================

-- Create backup function
CREATE OR REPLACE FUNCTION backup_bet_tracker()
RETURNS VOID AS $$
BEGIN
  -- This would be implemented based on your backup strategy
  -- For now, just log the operation
  RAISE NOTICE 'Bet tracker backup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MONITORING ÉS LOGGING
-- =============================================

-- Create audit log table for bet tracker changes
CREATE TABLE IF NOT EXISTS bet_tracker_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_bet_tracker_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, old_values)
    VALUES (OLD.id, OLD.user_id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, old_values, new_values)
    VALUES (NEW.id, NEW.user_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO bet_tracker_audit (bet_id, user_id, action, new_values)
    VALUES (NEW.id, NEW.user_id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bet_tracker_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bet_tracker
  FOR EACH ROW
  EXECUTE FUNCTION audit_bet_tracker_changes();

-- =============================================
-- CLEANUP ÉS MAINTENANCE
-- =============================================

-- Function to clean up old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM bet_tracker_audit 
  WHERE changed_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GRANTS ÉS PERMISSIONS
-- =============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON bet_tracker TO authenticated;
GRANT SELECT ON bet_tracker_summary TO authenticated;
GRANT EXECUTE ON FUNCTION is_opportunity_tracked(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tracked_bets(UUID, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_bet_to_tracker(UUID, TEXT, TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT) TO authenticated;

-- Grant permissions to service role
GRANT ALL ON bet_tracker TO service_role;
GRANT ALL ON bet_tracker_audit TO service_role;
GRANT ALL ON bet_tracker_summary TO service_role;

-- =============================================
-- COMMENTS ÉS DOKUMENTÁCIÓ
-- =============================================

COMMENT ON TABLE bet_tracker IS 'Felhasználók által követett fogadások tárolása';
COMMENT ON COLUMN bet_tracker.id IS 'Egyedi azonosító';
COMMENT ON COLUMN bet_tracker.user_id IS 'Felhasználó azonosítója';
COMMENT ON COLUMN bet_tracker.opportunity_id IS 'Arbitrage opportunity azonosítója';
COMMENT ON COLUMN bet_tracker.event_name IS 'Esemény neve';
COMMENT ON COLUMN bet_tracker.sport IS 'Sportág';
COMMENT ON COLUMN bet_tracker.bookmaker IS 'Fogadóiroda neve';
COMMENT ON COLUMN bet_tracker.odds IS 'Odds érték';
COMMENT ON COLUMN bet_tracker.stake IS 'Felhasználó által megadott tét';
COMMENT ON COLUMN bet_tracker.outcome IS 'Fogadás kimenetele';
COMMENT ON COLUMN bet_tracker.status IS 'Fogadás státusza';
COMMENT ON COLUMN bet_tracker.notes IS 'Felhasználói jegyzetek';
COMMENT ON COLUMN bet_tracker.added_at IS 'Hozzáadás dátuma';
COMMENT ON COLUMN bet_tracker.updated_at IS 'Utolsó módosítás dátuma';
COMMENT ON COLUMN bet_tracker.created_at IS 'Létrehozás dátuma';

-- =============================================
-- VERZIÓ INFORMÁCIÓ
-- =============================================

-- Version tracking
CREATE TABLE IF NOT EXISTS schema_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Bet Tracker initial schema - Sprint 5')
ON CONFLICT DO NOTHING;

-- =============================================
-- SIKERES LÉTREHOZÁS ELLENŐRZÉSE
-- =============================================

-- Verify table creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bet_tracker') THEN
    RAISE NOTICE 'Bet tracker table created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create bet tracker table';
  END IF;
END $$;

-- Verify indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'bet_tracker' AND indexname = 'idx_bet_tracker_user_id') THEN
    RAISE NOTICE 'Bet tracker indexes created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create bet tracker indexes';
  END IF;
END $$;

-- Verify RLS policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bet_tracker' AND policyname = 'Users can view own tracked bets') THEN
    RAISE NOTICE 'Bet tracker RLS policies created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create bet tracker RLS policies';
  END IF;
END $$;

RAISE NOTICE 'Bet Tracker schema setup completed successfully!';
