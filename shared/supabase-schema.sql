-- ============================================================
-- ShieldApp — Schéma base de données Supabase (PostgreSQL)
-- Exécuter dans Supabase > SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('client', 'agent')) DEFAULT 'client',
  name        TEXT,
  email       TEXT,
  commune     TEXT,
  photo_url   TEXT,
  pin_hash    TEXT NOT NULL DEFAULT '',
  verified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AGENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  badge           TEXT UNIQUE NOT NULL,
  mission_type    TEXT[] DEFAULT '{}',
  experience      INTEGER DEFAULT 1,
  armed           BOOLEAN DEFAULT FALSE,
  bio             TEXT,
  competences     TEXT[] DEFAULT '{}',
  rating          NUMERIC(3,2) DEFAULT 0,
  missions_count  INTEGER DEFAULT 0,
  available       BOOLEAN DEFAULT FALSE,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  commune         TEXT,
  documents       JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  type_compte   TEXT DEFAULT 'particulier' CHECK (type_compte IN ('particulier', 'entreprise')),
  organisation  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MISSIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS missions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID REFERENCES users(id),
  agent_id            UUID REFERENCES agents(id),
  type                TEXT NOT NULL,
  title               TEXT,
  description         TEXT,
  duree_heures        INTEGER NOT NULL CHECK (duree_heures >= 3),
  date_mission        TIMESTAMPTZ NOT NULL,
  adresse             TEXT NOT NULL,
  urgence             TEXT DEFAULT 'normal' CHECK (urgence IN ('normal', 'urgent', 'immediat')),
  statut              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (statut IN ('pending','accepted','active','completed','cancelled')),
  prix_total          INTEGER NOT NULL,
  commission_platform INTEGER DEFAULT 0,
  agent_part          INTEGER DEFAULT 0,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id  UUID REFERENCES missions(id),
  amount_gnf  INTEGER NOT NULL,
  method      TEXT NOT NULL CHECK (method IN ('orange', 'mtn')),
  phone       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','escrow','released','refunded')),
  reference   TEXT UNIQUE,
  released_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id   UUID REFERENCES missions(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id   UUID REFERENCES users(id),
  content      TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── RATINGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id   UUID REFERENCES missions(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id   UUID REFERENCES users(id),
  score        INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEX ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_available ON agents(available, status);
CREATE INDEX IF NOT EXISTS idx_agents_commune   ON agents(commune);
CREATE INDEX IF NOT EXISTS idx_missions_client  ON missions(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_agent   ON missions(agent_id);
CREATE INDEX IF NOT EXISTS idx_missions_statut  ON missions(statut);
CREATE INDEX IF NOT EXISTS idx_messages_mission ON messages(mission_id);
CREATE INDEX IF NOT EXISTS idx_payments_mission ON payments(mission_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings  ENABLE ROW LEVEL SECURITY;

-- Users: chaque utilisateur voit son propre profil
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- Agents: lecture publique, écriture propre
CREATE POLICY "agents_read" ON agents FOR SELECT USING (true);
CREATE POLICY "agents_write" ON agents
  FOR ALL USING (user_id::text = auth.uid()::text);

-- Missions: client voit ses missions, agent voit les siennes
CREATE POLICY "missions_access" ON missions
  FOR ALL USING (
    client_id::text = auth.uid()::text OR
    agent_id IN (SELECT id FROM agents WHERE user_id::text = auth.uid()::text)
  );

-- Messages: participants de la mission
CREATE POLICY "messages_access" ON messages
  FOR ALL USING (
    from_user_id::text = auth.uid()::text OR
    to_user_id::text = auth.uid()::text
  );

-- ── REALTIME ────────────────────────────────────────────────
-- Activer dans Supabase Dashboard > Database > Replication
-- Tables: missions, messages, agents

-- ── TRIGGER: Mettre à jour la note agent après rating ────────
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET rating = (
    SELECT ROUND(AVG(score::numeric), 2)
    FROM ratings r
    JOIN missions m ON m.id = r.mission_id
    WHERE m.agent_id = agents.id
  )
  WHERE id = (
    SELECT agent_id FROM missions WHERE id = NEW.mission_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_rating_insert
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

-- ── TRIGGER: Incrémenter missions_count après complétion ─────
CREATE OR REPLACE FUNCTION increment_agent_missions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'completed' AND OLD.statut != 'completed' THEN
    UPDATE agents SET missions_count = missions_count + 1
    WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_mission_complete
  AFTER UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION increment_agent_missions();
