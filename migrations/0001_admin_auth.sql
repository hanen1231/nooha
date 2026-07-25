PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  password_changed_at TEXT
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT,
  revoked_at TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  ip_hash TEXT,
  succeeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id
  ON admin_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_expires
  ON admin_sessions (user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_revoked_expires
  ON admin_sessions (revoked_at, expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_created
  ON admin_login_attempts (email, created_at);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_created
  ON admin_login_attempts (ip_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_created
  ON admin_login_attempts (created_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_created
  ON admin_audit_logs (admin_user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
  ON admin_audit_logs (action, created_at);
