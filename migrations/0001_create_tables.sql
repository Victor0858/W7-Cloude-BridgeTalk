-- BridgeTalk MVP Schema
-- Migration: 0001_create_tables
-- All tables prefixed with "w7-" per project convention
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS

-- =========================================================
-- Core user table
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-users" (
  id          TEXT    PRIMARY KEY,
  email       TEXT    NOT NULL UNIQUE,
  username    TEXT    NOT NULL UNIQUE,
  display_name TEXT   NOT NULL,
  avatar_url  TEXT,
  country_code TEXT   NOT NULL DEFAULT 'US',
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Extended profile (one per user, created during onboarding)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-profiles" (
  id                       TEXT    PRIMARY KEY,
  user_id                  TEXT    NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  native_language          TEXT    NOT NULL,          -- e.g. 'en', 'ja'
  learning_language        TEXT    NOT NULL,
  proficiency_level        TEXT    NOT NULL DEFAULT 'A2', -- A1 A2 B1 B2 C1 C2
  bio                      TEXT,
  short_intro              TEXT,
  interests                TEXT    NOT NULL DEFAULT '[]', -- JSON array of strings
  availability             TEXT    NOT NULL DEFAULT '[]', -- JSON array of {day, time_range}
  preferred_exchange_format TEXT   NOT NULL DEFAULT 'video', -- video | audio | text | mixed
  partner_preference       TEXT    NOT NULL DEFAULT '{}',   -- JSON
  avoid_scenarios          TEXT    NOT NULL DEFAULT '[]',   -- JSON array
  reliability_score        REAL    NOT NULL DEFAULT 5.0,
  reply_rate               REAL    NOT NULL DEFAULT 1.0,
  total_sessions           INTEGER NOT NULL DEFAULT 0,
  onboarding_completed     INTEGER NOT NULL DEFAULT 0,
  created_at               TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id)
);

-- =========================================================
-- Saved matches (bookmarked profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-saved-matches" (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  saved_user_id TEXT NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, saved_user_id)
);

-- =========================================================
-- Topic packs (structured conversation guides)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-topic-packs" (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  name_jp     TEXT,
  category    TEXT    NOT NULL, -- daily_life | anime_culture | career | travel
  difficulty  TEXT    NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
  prompts     TEXT    NOT NULL DEFAULT '[]', -- JSON array of prompt strings
  is_free     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Trial invites
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-trial-invites" (
  id            TEXT PRIMARY KEY,
  from_user_id  TEXT NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  to_user_id    TEXT NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  proposed_time TEXT NOT NULL,
  topic_id      TEXT REFERENCES "w7-topic-packs"(id),
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined | expired
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Sessions (scheduled / completed exchanges)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-sessions" (
  id               TEXT    PRIMARY KEY,
  user_id_a        TEXT    NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  user_id_b        TEXT    NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  scheduled_at     TEXT    NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status           TEXT    NOT NULL DEFAULT 'scheduled', -- scheduled | in_progress | completed | cancelled
  topic_id         TEXT    REFERENCES "w7-topic-packs"(id),
  session_number   INTEGER NOT NULL DEFAULT 1, -- nth session between this pair
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Session notes (per user per session)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-session-notes" (
  id                     TEXT PRIMARY KEY,
  session_id             TEXT NOT NULL REFERENCES "w7-sessions"(id) ON DELETE CASCADE,
  user_id                TEXT NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  quick_notes            TEXT,
  correction_for_partner TEXT,
  next_topic             TEXT,
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, user_id)
);

-- =========================================================
-- Post-session feedback (vouch / reliability foundation)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-feedback" (
  id                       TEXT    PRIMARY KEY,
  session_id               TEXT    NOT NULL REFERENCES "w7-sessions"(id) ON DELETE CASCADE,
  from_user_id             TEXT    NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  to_user_id               TEXT    NOT NULL REFERENCES "w7-users"(id) ON DELETE CASCADE,
  was_helpful              INTEGER NOT NULL DEFAULT 3, -- 1-5
  want_again               INTEGER NOT NULL DEFAULT 0, -- 0 | 1
  was_punctual             INTEGER NOT NULL DEFAULT 1, -- 0 | 1
  was_polite               INTEGER NOT NULL DEFAULT 1, -- 0 | 1
  was_engaged              INTEGER NOT NULL DEFAULT 1, -- 0 | 1
  improvement_notes        TEXT,
  second_session_interest  INTEGER NOT NULL DEFAULT 0, -- event hook
  created_at               TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, from_user_id)
);

-- =========================================================
-- Waitlist signups
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-waitlist" (
  id                TEXT    PRIMARY KEY,
  email             TEXT    NOT NULL UNIQUE,
  name              TEXT,
  native_language   TEXT,
  learning_language TEXT,
  source            TEXT,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Analytics events (lightweight event log)
-- =========================================================
CREATE TABLE IF NOT EXISTS "w7-analytics-events" (
  id         TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- waitlist_submitted | onboarding_completed | match_saved | ...
  user_id    TEXT,
  metadata   TEXT DEFAULT '{}', -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- Indexes for common query patterns
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_profiles_learning_lang  ON "w7-profiles"(learning_language);
CREATE INDEX IF NOT EXISTS idx_profiles_native_lang    ON "w7-profiles"(native_language);
CREATE INDEX IF NOT EXISTS idx_profiles_level          ON "w7-profiles"(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_sessions_user_a         ON "w7-sessions"(user_id_a);
CREATE INDEX IF NOT EXISTS idx_sessions_user_b         ON "w7-sessions"(user_id_b);
CREATE INDEX IF NOT EXISTS idx_feedback_to_user        ON "w7-feedback"(to_user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type    ON "w7-analytics-events"(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user          ON "w7-analytics-events"(user_id);
