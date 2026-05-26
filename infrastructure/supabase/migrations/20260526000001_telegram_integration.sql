-- Telegram Mini App integration
-- ============================================================
-- TELEGRAM USERS
-- ============================================================
CREATE TABLE telegram_users (
  telegram_id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  is_premium BOOLEAN DEFAULT false,
  access_level VARCHAR(20) DEFAULT 'public',
  is_channel_subscriber BOOLEAN DEFAULT false,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telegram_users_access ON telegram_users(access_level);
CREATE INDEX idx_telegram_users_subscriber ON telegram_users(is_channel_subscriber);
CREATE INDEX idx_telegram_users_username ON telegram_users(username);

-- ============================================================
-- USER ACTIVITY (portrait / analytics)
-- ============================================================
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT NOT NULL REFERENCES telegram_users(telegram_id) ON DELETE CASCADE,
  page VARCHAR(100),
  item_type VARCHAR(20),
  item_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_telegram ON user_activity(telegram_id, created_at DESC);
CREATE INDEX idx_user_activity_page ON user_activity(telegram_id, page);

-- ============================================================
-- CONTENT SUBSCRIPTION GATE
-- ============================================================
ALTER TABLE tours ADD COLUMN requires_subscription BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN requires_subscription BOOLEAN DEFAULT false;
ALTER TABLE blog_articles ADD COLUMN requires_subscription BOOLEAN DEFAULT false;