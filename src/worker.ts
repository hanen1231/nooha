import { hashIpAddress, hashPassword, secureCompareStrings, validatePasswordLength, verifyPassword } from "./auth/crypto";
import {
  INITIAL_ADMIN_EMAIL,
  cleanupOldLoginAttempts,
  countAdminUsers,
  countRecentFailedLoginAttempts,
  createInitialAdminUser,
  getAdminUserByEmail,
  insertAuditLog,
  recordLoginAttempt,
  updateLastLoginAt
} from "./auth/database";
import {
  HttpError,
  assertSameOriginPost,
  errorResponse,
  getClientIp,
  getStringField,
  jsonResponse,
  methodNotAllowed,
  readJsonBody,
  redirectResponse,
  withAdminSecurityHeaders
} from "./auth/http";
import {
  clearSessionCookie,
  createAdminSession,
  createSessionCookie,
  getAuthenticatedSession,
  revokeAuthenticatedSession
} from "./auth/session";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_SETUP_TOKEN: string;
  AUTH_PEPPER: string;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;

const PUBLIC_ADMIN_ASSETS = new Set([
  "/admin/admin.css",
  "/admin/login.js",
  "/admin/setup.js",
  "/admin/login.html",
  "/admin/setup.html"
]);

function ensureAuthSecrets(env: Env): void {
  if (!env.ADMIN_SETUP_TOKEN || !env.AUTH_PEPPER) {
    throw new HttpError(503, "auth_not_configured", "Authentication is not configured.");
  }
}

function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "invalid_json", "Invalid JSON body.");
  }

  return body as Record<string, unknown>;
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminPageRequest(request: Request, pathname: string): boolean {
  const accept = request.headers.get("Accept") ?? "";
  return accept.includes("text/html") || pathname === "/admin" || pathname.endsWith(".html");
}

function normalizeAdminAssetPath(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "/admin/index.html";
  }

  if (pathname === "/admin/login") {
    return "/admin/login.html";
  }

  if (pathname === "/admin/setup") {
    return "/admin/setup.html";
  }

  return pathname;
}

function isPublicAdminAsset(pathname: string): boolean {
  return PUBLIC_ADMIN_ASSETS.has(normalizeAdminAssetPath(pathname));
}

function isProtectedAdminAsset(pathname: string): boolean {
  return isAdminPath(pathname) && !isPublicAdminAsset(pathname);
}

async function fetchAsset(env: Env, request: Request, pathname: string): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";

  const assetRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers
  });

  return env.ASSETS.fetch(assetRequest);
}

async function fetchAdminAsset(env: Env, request: Request, pathname: string): Promise<Response> {
  return withAdminSecurityHeaders(await fetchAsset(env, request, normalizeAdminAssetPath(pathname)));
}

async function requireSession(env: Env, request: Request) {
  ensureAuthSecrets(env);
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);

  if (!session) {
    throw new HttpError(401, "unauthorized", "Authentication required.");
  }

  return session;
}

async function handleSetupStatus(env: Env): Promise<Response> {
  const totalAdmins = await countAdminUsers(env.DB);
  return jsonResponse({ setupRequired: totalAdmins === 0 });
}

async function handleSetup(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);

  if ((await countAdminUsers(env.DB)) > 0) {
    return errorResponse(409, "setup_completed", "Initial setup is already completed.");
  }

  const body = asObject(await readJsonBody(request));
  const email = getStringField(body, "email")?.trim() ?? "";
  const password = getStringField(body, "password") ?? "";
  const setupToken = getStringField(body, "setupToken") ?? getStringField(body, "token") ?? "";

  if (email.toLowerCase() !== INITIAL_ADMIN_EMAIL.toLowerCase()) {
    return errorResponse(400, "invalid_setup", "Unable to complete setup.");
  }

  if (!validatePasswordLength(password)) {
    return errorResponse(400, "invalid_password", "Password must be between 12 and 128 characters.");
  }

  if (!(await secureCompareStrings(setupToken, env.ADMIN_SETUP_TOKEN))) {
    return errorResponse(403, "invalid_setup", "Unable to complete setup.");
  }

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password, env.AUTH_PEPPER);
  const created = await createInitialAdminUser(env.DB, {
    id: userId,
    email: INITIAL_ADMIN_EMAIL,
    password: passwordHash,
    now
  });

  if (!created) {
    return errorResponse(409, "setup_completed", "Initial setup is already completed.");
  }

  await insertAuditLog(env.DB, {
    id: crypto.randomUUID(),
    adminUserId: userId,
    action: "admin.initial_setup",
    entityType: "admin_user",
    entityId: userId,
    metadataJson: JSON.stringify({ email: INITIAL_ADMIN_EMAIL }),
    createdAt: now
  });

  return jsonResponse({ ok: true });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);

  const body = asObject(await readJsonBody(request));
  const email = getStringField(body, "email")?.trim() ?? "";
  const password = getStringField(body, "password") ?? "";
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const ipHash = await hashIpAddress(getClientIp(request), env.AUTH_PEPPER);

  await cleanupOldLoginAttempts(env.DB, new Date(nowDate.getTime() - LOGIN_ATTEMPT_RETENTION_MS).toISOString());

  const recentFailures = await countRecentFailedLoginAttempts(env.DB, {
    email,
    ipHash,
    sinceIso: new Date(nowDate.getTime() - LOGIN_WINDOW_MS).toISOString()
  });

  if (recentFailures >= MAX_FAILED_LOGIN_ATTEMPTS) {
    await recordLoginAttempt(env.DB, {
      email: email || null,
      ipHash,
      succeeded: false,
      createdAt: now
    });

    return errorResponse(429, "login_unavailable", "Login is temporarily unavailable.");
  }

  const user = email ? await getAdminUserByEmail(env.DB, email) : null;
  const passwordMatches =
    user !== null &&
    user.is_active === 1 &&
    password.length <= 128 &&
    (await verifyPassword(password, env.AUTH_PEPPER, user.password_hash, user.password_salt, user.password_iterations));

  if (!user || !passwordMatches) {
    await recordLoginAttempt(env.DB, {
      email: email || null,
      ipHash,
      succeeded: false,
      createdAt: now
    });

    return errorResponse(401, "invalid_credentials", "Invalid email or password.");
  }

  const session = await createAdminSession(env.DB, {
    userId: user.id,
    request,
    pepper: env.AUTH_PEPPER,
    now: nowDate
  });

  await updateLastLoginAt(env.DB, { userId: user.id, now });
  await recordLoginAttempt(env.DB, {
    email: user.email,
    ipHash,
    succeeded: true,
    createdAt: now
  });
  await insertAuditLog(env.DB, {
    id: crypto.randomUUID(),
    adminUserId: user.id,
    action: "admin.login",
    createdAt: now
  });

  return jsonResponse(
    {
      ok: true
    },
    200,
    {
      "Set-Cookie": createSessionCookie(session.token)
    }
  );
}

async function handleSession(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);

  if (!session) {
    return jsonResponse(
      {
        authenticated: false
      },
      401
    );
  }

  return jsonResponse({
    authenticated: true,
    user: session.user
  });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);
  const now = new Date().toISOString();
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);

  if (session) {
    await revokeAuthenticatedSession(env.DB, session, now);
    await insertAuditLog(env.DB, {
      id: crypto.randomUUID(),
      adminUserId: session.user.id,
      action: "admin.logout",
      createdAt: now
    });
  }

  return jsonResponse(
    {
      ok: true
    },
    200,
    {
      "Set-Cookie": clearSessionCookie()
    }
  );
}

async function handleAdminApi(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/api/admin/setup-status") {
    return request.method === "GET" ? handleSetupStatus(env) : methodNotAllowed();
  }

  if (request.method === "POST") {
    assertSameOriginPost(request);
  }

  if (pathname === "/api/admin/setup") {
    return request.method === "POST" ? handleSetup(request, env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/login") {
    return request.method === "POST" ? handleLogin(request, env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/session") {
    return request.method === "GET" ? handleSession(request, env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/logout") {
    return request.method === "POST" ? handleLogout(request, env) : methodNotAllowed();
  }

  await requireSession(env, request);
  return errorResponse(404, "not_found", "Not found.");
}

async function handleAdminRoute(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed();
  }

  const normalizedPath = normalizeAdminAssetPath(pathname);

  if (normalizedPath === "/admin/login.html") {
    const existingSession = env.AUTH_PEPPER
      ? await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER, { touch: false })
      : null;

    if (existingSession) {
      return redirectResponse("/admin");
    }

    if ((await countAdminUsers(env.DB)) === 0) {
      return redirectResponse("/admin/setup");
    }

    return fetchAdminAsset(env, request, normalizedPath);
  }

  if (normalizedPath === "/admin/setup.html") {
    if ((await countAdminUsers(env.DB)) > 0) {
      return redirectResponse("/admin/login");
    }

    return fetchAdminAsset(env, request, normalizedPath);
  }

  if (isProtectedAdminAsset(pathname)) {
    ensureAuthSecrets(env);
    const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);

    if (!session) {
      if (isAdminPageRequest(request, normalizedPath)) {
        return redirectResponse("/admin/login");
      }

      return errorResponse(401, "unauthorized", "Authentication required.");
    }
  }

  return fetchAdminAsset(env, request, normalizedPath);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({
          ok: true,
          service: "nooha-cms-api",
          timestamp: new Date().toISOString()
        });
      }

      if (url.pathname.startsWith("/api/admin/")) {
        return await handleAdminApi(request, env, url.pathname);
      }

      if (isAdminPath(url.pathname)) {
        return await handleAdminRoute(request, env, url.pathname);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, error.code, error.message);
      }

      return errorResponse(500, "internal_error", "Internal Server Error.");
    }
  }
} satisfies ExportedHandler<Env>;
