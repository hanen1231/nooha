import { createSessionToken, hashIpAddress, hashSessionToken } from "./crypto";
import {
  findActiveSession,
  insertAdminSession,
  revokeSession,
  type SessionUser,
  updateSessionLastSeen
} from "./database";
import { getClientIp } from "./http";

export const SESSION_COOKIE_NAME = "__Host-nooha_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface AuthenticatedSession {
  tokenHash: string;
  user: SessionUser;
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === name) {
      return rawValue.join("=");
    }
  }

  return null;
}

export function createSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function createAdminSession(
  db: D1Database,
  params: {
    userId: string;
    request: Request;
    pepper: string;
    now: Date;
  }
): Promise<{ token: string; tokenHash: string }> {
  const token = createSessionToken();
  const tokenHash = await hashSessionToken(token, params.pepper);
  const createdAt = params.now.toISOString();
  const expiresAt = new Date(params.now.getTime() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  const userAgent = params.request.headers.get("User-Agent");
  const ipHash = await hashIpAddress(getClientIp(params.request), params.pepper);

  await insertAdminSession(db, {
    tokenHash,
    userId: params.userId,
    createdAt,
    expiresAt,
    userAgent,
    ipHash
  });

  return { token, tokenHash };
}

export async function getAuthenticatedSession(
  db: D1Database,
  request: Request,
  pepper: string,
  options: { touch?: boolean } = {}
): Promise<AuthenticatedSession | null> {
  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const tokenHash = await hashSessionToken(token, pepper);
  const now = new Date().toISOString();
  const row = await findActiveSession(db, { tokenHash, now });

  if (!row) {
    return null;
  }

  if (options.touch !== false) {
    await updateSessionLastSeen(db, { tokenHash, now });
  }

  return {
    tokenHash,
    user: {
      id: row.user_id_joined,
      email: row.email,
      role: row.role
    }
  };
}

export async function revokeAuthenticatedSession(
  db: D1Database,
  session: AuthenticatedSession,
  now: string
): Promise<void> {
  await revokeSession(db, {
    tokenHash: session.tokenHash,
    now
  });
}
