CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  totp_secret VARCHAR(255),
  totp_enabled BOOLEAN DEFAULT false,
  recovery_codes_hash TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_admin ON refresh_tokens(admin_id);

-- ============================================================
-- TOURS
-- ============================================================
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  country JSONB NOT NULL DEFAULT '{}',
  city JSONB NOT NULL DEFAULT '{}',
  agency JSONB NOT NULL DEFAULT '{}',
  earnings VARCHAR(100),
  contacts TEXT,
  is_vip BOOLEAN DEFAULT false,
  hidden_vip BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tours_published ON tours(is_published) WHERE is_published = true;
CREATE INDEX idx_tours_vip ON tours(is_vip, hidden_vip);
CREATE INDEX idx_tours_sort ON tours(sort_order);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  price VARCHAR(100),
  contacts TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_published ON services(is_published) WHERE is_published = true;
CREATE INDEX idx_services_sort ON services(sort_order);

-- ============================================================
-- BLOG ARTICLES
-- ============================================================
CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  preview_image TEXT,
  tags TEXT[] DEFAULT '{}',
  hidden_vip BOOLEAN DEFAULT false,
  access_level VARCHAR(20) DEFAULT 'public',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_published ON blog_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_blog_access ON blog_articles(access_level);
CREATE INDEX idx_blog_sort ON blog_articles(sort_order);

-- ============================================================
-- HOMEPAGE COLLECTIONS
-- ============================================================
CREATE TABLE homepage_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  sort_order INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_section ON homepage_collections(section, sort_order);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_blog_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();