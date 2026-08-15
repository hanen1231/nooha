import type { PasswordHash } from "./crypto";

export const INITIAL_ADMIN_EMAIL = "Noohacmp@gmail.com";

export interface AdminUserRow {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface SessionRow {
  token_hash: string;
  user_id: string;
  expires_at: string;
  revoked_at: string | null;
  user_id_joined: string;
  email: string;
  role: string;
  is_active: number;
}

interface CountRow {
  count: number;
}

function changedRows(result: D1Result): number {
  return Number(result.meta.changes ?? 0);
}

export async function countAdminUsers(db: D1Database): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM admin_users").first<CountRow>();
  return Number(row?.count ?? 0);
}

export async function getAdminUserByEmail(db: D1Database, email: string): Promise<AdminUserRow | null> {
  return db
    .prepare(
      `SELECT id, email, password_hash, password_salt, password_iterations, role, is_active,
        created_at, updated_at, last_login_at, password_changed_at
       FROM admin_users
       WHERE email = ? COLLATE NOCASE
       LIMIT 1`
    )
    .bind(email)
    .first<AdminUserRow>();
}

export async function createInitialAdminUser(
  db: D1Database,
  user: {
    id: string;
    email: string;
    password: PasswordHash;
    now: string;
  }
): Promise<boolean> {
  const result = await db
    .prepare(
      `INSERT INTO admin_users (
        id, email, password_hash, password_salt, password_iterations, role, is_active,
        created_at, updated_at, password_changed_at
      )
      SELECT ?, ?, ?, ?, ?, 'owner', 1, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_users)`
    )
    .bind(
      user.id,
      user.email,
      user.password.hash,
      user.password.salt,
      user.password.iterations,
      user.now,
      user.now,
      user.now
    )
    .run();

  return changedRows(result) === 1;
}

export async function insertAuditLog(
  db: D1Database,
  log: {
    id: string;
    adminUserId: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    metadataJson?: string | null;
    createdAt: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_audit_logs (
        id, admin_user_id, action, entity_type, entity_id, metadata_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      log.id,
      log.adminUserId,
      log.action,
      log.entityType ?? null,
      log.entityId ?? null,
      log.metadataJson ?? null,
      log.createdAt
    )
    .run();
}

export async function cleanupOldLoginAttempts(db: D1Database, beforeIso: string): Promise<void> {
  await db.prepare("DELETE FROM admin_login_attempts WHERE created_at < ?").bind(beforeIso).run();
}

export async function countRecentFailedLoginAttempts(
  db: D1Database,
  params: {
    email: string;
    ipHash: string;
    sinceIso: string;
  }
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM admin_login_attempts
       WHERE succeeded = 0
         AND created_at >= ?
         AND (
           email = ? COLLATE NOCASE
           OR ip_hash = ?
         )`
    )
    .bind(params.sinceIso, params.email, params.ipHash)
    .first<CountRow>();

  return Number(row?.count ?? 0);
}

export async function recordLoginAttempt(
  db: D1Database,
  params: {
    email: string | null;
    ipHash: string | null;
    succeeded: boolean;
    createdAt: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_login_attempts (email, ip_hash, succeeded, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(params.email, params.ipHash, params.succeeded ? 1 : 0, params.createdAt)
    .run();
}

export async function insertAdminSession(
  db: D1Database,
  params: {
    tokenHash: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    userAgent: string | null;
    ipHash: string | null;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_sessions (
        token_hash, user_id, created_at, expires_at, last_seen_at, user_agent, ip_hash
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      params.tokenHash,
      params.userId,
      params.createdAt,
      params.expiresAt,
      params.createdAt,
      params.userAgent,
      params.ipHash
    )
    .run();
}

export async function findActiveSession(
  db: D1Database,
  params: {
    tokenHash: string;
    now: string;
  }
): Promise<SessionRow | null> {
  return db
    .prepare(
      `SELECT
        s.token_hash,
        s.user_id,
        s.expires_at,
        s.revoked_at,
        u.id AS user_id_joined,
        u.email,
        u.role,
        u.is_active
       FROM admin_sessions s
       INNER JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?
         AND s.expires_at > ?
         AND s.revoked_at IS NULL
         AND u.is_active = 1
       LIMIT 1`
    )
    .bind(params.tokenHash, params.now)
    .first<SessionRow>();
}

export async function updateSessionLastSeen(
  db: D1Database,
  params: {
    tokenHash: string;
    now: string;
  }
): Promise<void> {
  await db
    .prepare("UPDATE admin_sessions SET last_seen_at = ? WHERE token_hash = ?")
    .bind(params.now, params.tokenHash)
    .run();
}

export async function revokeSession(
  db: D1Database,
  params: {
    tokenHash: string;
    now: string;
  }
): Promise<void> {
  await db
    .prepare("UPDATE admin_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
    .bind(params.now, params.tokenHash)
    .run();
}

export async function updateLastLoginAt(
  db: D1Database,
  params: {
    userId: string;
    now: string;
  }
): Promise<void> {
  await db
    .prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?")
    .bind(params.now, params.now, params.userId)
    .run();
}
