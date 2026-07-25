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
  assertSameOriginMutation,
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
  getCmsPageBySlug,
  listCmsSectionsByPageId,
  reorderCmsSections,
  updateCmsSectionVisibility,
  type CmsPageRow,
  type CmsSectionRow
} from "./cms/database";
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
const HOME_PAGE_SLUG = "home";

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

function getBooleanField(body: Record<string, unknown>, field: string): boolean | null {
  const value = body[field];
  return typeof value === "boolean" ? value : null;
}

function getStringArrayField(body: Record<string, unknown>, field: string): string[] | null {
  const value = body[field];

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }

  return value.map((item) => item.trim());
}

function serializeCmsPage(page: CmsPageRow) {
  return {
    id: page.id,
    slug: page.slug,
    fileName: page.file_name,
    displayName: page.display_name,
    status: page.status,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    createdAt: page.created_at,
    updatedAt: page.updated_at
  };
}

function serializeCmsSection(section: CmsSectionRow) {
  return {
    id: section.id,
    pageId: section.page_id,
    sectionKey: section.section_key,
    sectionType: section.section_type,
    displayName: section.display_name,
    sortOrder: section.sort_order,
    isVisible: section.is_visible === 1,
    updatedAt: section.updated_at,
    publishedAt: section.published_at
  };
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

async function getHomeCmsPage(env: Env): Promise<{ page: CmsPageRow; sections: CmsSectionRow[] }> {
  const page = await getCmsPageBySlug(env.DB, HOME_PAGE_SLUG);

  if (!page) {
    throw new HttpError(404, "cms_page_not_found", "CMS page was not found.");
  }

  const sections = await listCmsSectionsByPageId(env.DB, page.id);
  return { page, sections };
}

async function handleGetHomeCmsPage(env: Env): Promise<Response> {
  const { page, sections } = await getHomeCmsPage(env);

  return jsonResponse({
    ok: true,
    page: serializeCmsPage(page),
    sections: sections.map(serializeCmsSection)
  });
}

async function handleCmsSectionVisibility(request: Request, env: Env, sectionId: string): Promise<Response> {
  const body = asObject(await readJsonBody(request));
  const isVisible = getBooleanField(body, "isVisible");

  if (isVisible === null) {
    throw new HttpError(400, "invalid_visibility", "isVisible must be a boolean.");
  }

  const { sections } = await getHomeCmsPage(env);
  const section = sections.find((item) => item.id === sectionId);

  if (!section) {
    throw new HttpError(404, "cms_section_not_found", "CMS section was not found.");
  }

  const updatedAt = new Date().toISOString();
  const updated = await updateCmsSectionVisibility(env.DB, {
    sectionId,
    isVisible,
    updatedAt
  });

  if (!updated) {
    throw new HttpError(409, "cms_section_not_updated", "CMS section could not be updated.");
  }

  return jsonResponse({
    ok: true,
    section: {
      ...serializeCmsSection(section),
      isVisible,
      updatedAt
    }
  });
}

async function handleCmsSectionOrder(request: Request, env: Env): Promise<Response> {
  const body = asObject(await readJsonBody(request));
  const sectionIds = getStringArrayField(body, "sectionIds");

  if (!sectionIds || sectionIds.length === 0 || sectionIds.some((id) => id.length === 0)) {
    throw new HttpError(400, "invalid_section_order", "sectionIds must be a non-empty string array.");
  }

  if (new Set(sectionIds).size !== sectionIds.length) {
    throw new HttpError(400, "invalid_section_order", "sectionIds must not contain duplicates.");
  }

  const { page, sections } = await getHomeCmsPage(env);
  const currentIds = sections.map((section) => section.id);
  const expectedIds = new Set(currentIds);
  const containsEverySection =
    sectionIds.length === currentIds.length && sectionIds.every((sectionId) => expectedIds.has(sectionId));

  if (!containsEverySection) {
    throw new HttpError(400, "invalid_section_order", "sectionIds must contain every home page section exactly once.");
  }

  const updatedAt = new Date().toISOString();
  await reorderCmsSections(env.DB, {
    pageId: page.id,
    sectionIds,
    updatedAt
  });

  const reorderedSections = await listCmsSectionsByPageId(env.DB, page.id);

  return jsonResponse({
    ok: true,
    sections: reorderedSections.map(serializeCmsSection)
  });
}

async function handleCmsApi(request: Request, env: Env, pathname: string): Promise<Response> {
  await requireSession(env, request);

  if (pathname === "/api/admin/cms/pages/home") {
    return request.method === "GET" ? handleGetHomeCmsPage(env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/cms/pages/home/sections/order") {
    return request.method === "PUT" ? handleCmsSectionOrder(request, env) : methodNotAllowed();
  }

  const visibilityMatch = pathname.match(/^\/api\/admin\/cms\/sections\/([A-Za-z0-9_-]{1,100})\/visibility$/);

  if (visibilityMatch) {
    const sectionId = visibilityMatch[1] ?? "";
    return request.method === "PATCH" ? handleCmsSectionVisibility(request, env, sectionId) : methodNotAllowed();
  }

  return errorResponse(404, "not_found", "Not found.");
}

async function handleAdminApi(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/api/admin/setup-status") {
    return request.method === "GET" ? handleSetupStatus(env) : methodNotAllowed();
  }

  assertSameOriginMutation(request);

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

  if (pathname.startsWith("/api/admin/cms/")) {
    return handleCmsApi(request, env, pathname);
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
