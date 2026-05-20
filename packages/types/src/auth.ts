export type AccessLevel = 'public' | 'vip' | 'premium' | 'invite';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  totp_secret: string | null;
  totp_enabled: boolean;
  recovery_codes_hash: string[] | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
}

export interface RefreshToken {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
}

export interface UserAccess {
  level: AccessLevel;
  expires_at: string | null;
  subscription_id: string | null;
}
