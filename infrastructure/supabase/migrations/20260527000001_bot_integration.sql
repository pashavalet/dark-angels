ALTER TABLE admins ADD COLUMN telegram_id BIGINT UNIQUE REFERENCES telegram_users(telegram_id);

CREATE TABLE telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telegram_link_codes_code ON telegram_link_codes(code);
CREATE INDEX idx_telegram_link_codes_admin ON telegram_link_codes(admin_id);