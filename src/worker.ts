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
  createCmsPage,
  createCmsSection,
  deleteCmsSection,
  discardCmsPageDraft,
  discardCmsSiteSettingsDraft,
  getCmsPageBySlug,
  getCmsSectionById,
  getCmsSiteSettingByKey,
  listCmsPages,
  listCmsSectionsByPageId,
  listCmsSiteSettings,
  publishCmsPage,
  publishCmsSiteSettings,
  reorderCmsSections,
  updateCmsPage,
  updateCmsSectionContent,
  updateCmsSectionVisibility,
  updateCmsSiteSettingDraft,
  type CmsPageRow,
  type CmsSectionRow,
  type CmsSiteSettingRow
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
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const SITE_SETTING_KEYS = new Set(["header", "footer", "contact"]);
const SECTION_TYPES = new Set([
  "hero",
  "text",
  "text_and_image",
  "form_and_text",
  "announcement",
  "cards",
  "image_cards",
  "metrics",
  "logo_grid",
  "gallery",
  "call_to_action"
]);

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
  return typeof body[field] === "boolean" ? (body[field] as boolean) : null;
}

function getStringArrayField(body: Record<string, unknown>, field: string): string[] | null {
  const value = body[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return null;
  return value.map((item) => item.trim());
}

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseStoredJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function normalizeSectionContent(value: unknown): Record<string, unknown> {
  const input = asObject(value);
  const content: Record<string, unknown> = {};
  const stringLimits: Record<string, number> = {
    eyebrow: 160,
    title: 300,
    body: 8000,
    imageUrl: 1000,
    imageAlt: 300,
    buttonLabel: 160,
    buttonUrl: 1000
  };

  for (const [field, limit] of Object.entries(stringLimits)) {
    if (typeof input[field] === "string") content[field] = cleanString(input[field], limit);
  }

  if (Array.isArray(input.items)) {
    content.items = input.items.slice(0, 40).map((item) => {
      const itemObject = typeof item === "object" && item !== null && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : {};
      return {
        title: cleanString(itemObject.title, 240),
        text: cleanString(itemObject.text, 1500),
        imageUrl: cleanString(itemObject.imageUrl, 1000),
        imageAlt: cleanString(itemObject.imageAlt, 300),
        linkLabel: cleanString(itemObject.linkLabel, 160),
        linkUrl: cleanString(itemObject.linkUrl, 1000)
      };
    });
  }

  return content;
}


function normalizeLinkItems(value: unknown): Array<{ label: string; url: string }> {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((item) => {
    const input = typeof item === "object" && item !== null && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : {};
    return {
      label: cleanString(input.label, 160),
      url: cleanString(input.url, 1000)
    };
  }).filter((item) => item.label && item.url);
}

function normalizeSiteSetting(settingKey: string, value: unknown): Record<string, unknown> {
  const input = asObject(value);
  if (settingKey === "header") {
    return {
      siteName: cleanString(input.siteName, 180),
      siteTagline: cleanString(input.siteTagline, 240),
      logoUrl: cleanString(input.logoUrl, 1000),
      logoAlt: cleanString(input.logoAlt, 240),
      navItems: normalizeLinkItems(input.navItems)
    };
  }

  if (settingKey === "footer") {
    return {
      summary: cleanString(input.summary, 3000),
      copyright: cleanString(input.copyright, 500),
      secondaryText: cleanString(input.secondaryText, 500),
      quickLinks: normalizeLinkItems(input.quickLinks),
      kitchenLinks: normalizeLinkItems(input.kitchenLinks)
    };
  }

  if (settingKey === "contact") {
    return {
      email: cleanString(input.email, 320),
      phone: cleanString(input.phone, 80),
      phoneDisplay: cleanString(input.phoneDisplay, 80),
      whatsappNumber: cleanString(input.whatsappNumber, 80),
      address: cleanString(input.address, 500),
      workingHours: cleanString(input.workingHours, 500),
      instagramUrl: cleanString(input.instagramUrl, 1000),
      snapchatUrl: cleanString(input.snapchatUrl, 1000)
    };
  }

  throw new HttpError(400, "invalid_site_setting", "Invalid site setting key.");
}

function serializeCmsSiteSetting(setting: CmsSiteSettingRow, mode: "admin" | "public") {
  const base = {
    key: setting.setting_key,
    displayName: setting.display_name,
    updatedAt: setting.updated_at,
    publishedAt: setting.published_at
  };

  if (mode === "public") {
    return { ...base, content: parseStoredJson(setting.published_json) };
  }

  return {
    ...base,
    draftContent: parseStoredJson(setting.draft_json),
    publishedContent: parseStoredJson(setting.published_json),
    hasUnpublishedChanges: setting.draft_json !== setting.published_json
  };
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
    updatedAt: page.updated_at,
    publicUrl: page.file_name.endsWith(".html") ? `/${page.file_name}` : `/page/${page.slug}`
  };
}

function serializeCmsSection(section: CmsSectionRow, mode: "admin" | "public") {
  const base = {
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

  if (mode === "public") {
    return { ...base, content: parseStoredJson(section.published_json) };
  }

  return {
    ...base,
    draftContent: parseStoredJson(section.draft_json),
    publishedContent: parseStoredJson(section.published_json),
    hasUnpublishedChanges: section.draft_json !== section.published_json
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
  if (pathname === "/admin" || pathname === "/admin/") return "/admin/index.html";
  if (pathname === "/admin/login") return "/admin/login.html";
  if (pathname === "/admin/setup") return "/admin/setup.html";
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
  return env.ASSETS.fetch(new Request(url.toString(), { method: request.method, headers: request.headers }));
}

async function fetchAdminAsset(env: Env, request: Request, pathname: string): Promise<Response> {
  return withAdminSecurityHeaders(await fetchAsset(env, request, normalizeAdminAssetPath(pathname)));
}

async function requireSession(env: Env, request: Request) {
  ensureAuthSecrets(env);
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);
  if (!session) throw new HttpError(401, "unauthorized", "Authentication required.");
  return session;
}

async function getPageBundle(env: Env, slug: string) {
  const page = await getCmsPageBySlug(env.DB, slug);
  if (!page) throw new HttpError(404, "cms_page_not_found", "CMS page was not found.");
  const sections = await listCmsSectionsByPageId(env.DB, page.id);
  return { page, sections };
}

async function handleSetupStatus(env: Env): Promise<Response> {
  return jsonResponse({ setupRequired: (await countAdminUsers(env.DB)) === 0 });
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
  if (!created) return errorResponse(409, "setup_completed", "Initial setup is already completed.");

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
    await recordLoginAttempt(env.DB, { email: email || null, ipHash, succeeded: false, createdAt: now });
    return errorResponse(429, "login_unavailable", "Login is temporarily unavailable.");
  }

  const user = email ? await getAdminUserByEmail(env.DB, email) : null;
  const passwordMatches =
    user !== null &&
    user.is_active === 1 &&
    password.length <= 128 &&
    (await verifyPassword(password, env.AUTH_PEPPER, user.password_hash, user.password_salt, user.password_iterations));

  if (!user || !passwordMatches) {
    await recordLoginAttempt(env.DB, { email: email || null, ipHash, succeeded: false, createdAt: now });
    return errorResponse(401, "invalid_credentials", "Invalid email or password.");
  }

  const session = await createAdminSession(env.DB, { userId: user.id, request, pepper: env.AUTH_PEPPER, now: nowDate });
  await updateLastLoginAt(env.DB, { userId: user.id, now });
  await recordLoginAttempt(env.DB, { email: user.email, ipHash, succeeded: true, createdAt: now });
  await insertAuditLog(env.DB, { id: crypto.randomUUID(), adminUserId: user.id, action: "admin.login", createdAt: now });

  return jsonResponse({ ok: true }, 200, { "Set-Cookie": createSessionCookie(session.token) });
}

async function handleSession(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);
  if (!session) return jsonResponse({ authenticated: false }, 401);
  return jsonResponse({ authenticated: true, user: session.user });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  ensureAuthSecrets(env);
  const now = new Date().toISOString();
  const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);
  if (session) {
    await revokeAuthenticatedSession(env.DB, session, now);
    await insertAuditLog(env.DB, { id: crypto.randomUUID(), adminUserId: session.user.id, action: "admin.logout", createdAt: now });
  }
  return jsonResponse({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}

async function handlePublicCmsApi(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed();

  if (pathname === "/api/cms/settings") {
    const settings = await listCmsSiteSettings(env.DB);
    const serialized = Object.fromEntries(
      settings.map((setting) => [setting.setting_key, parseStoredJson(setting.published_json)])
    );
    return jsonResponse(
      { ok: true, settings: serialized },
      200,
      { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
    );
  }

  const match = pathname.match(/^\/api\/cms\/pages\/([a-z0-9-]{1,100})$/);
  if (!match) return errorResponse(404, "not_found", "Not found.");

  const { page, sections } = await getPageBundle(env, match[1] ?? "");
  if (page.status === "archived") throw new HttpError(404, "cms_page_not_found", "CMS page was not found.");

  return jsonResponse(
    {
      ok: true,
      page: serializeCmsPage(page),
      sections: sections.filter((section) => section.is_visible === 1).map((section) => serializeCmsSection(section, "public"))
    },
    200,
    { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
  );
}

async function handleAdminListPages(env: Env): Promise<Response> {
  const pages = await listCmsPages(env.DB);
  const results = await Promise.all(
    pages.map(async (page) => {
      const sections = await listCmsSectionsByPageId(env.DB, page.id);
      return {
        ...serializeCmsPage(page),
        sectionCount: sections.length,
        visibleSectionCount: sections.filter((section) => section.is_visible === 1).length,
        pendingSectionCount: sections.filter((section) => section.draft_json !== section.published_json).length
      };
    })
  );
  return jsonResponse({ ok: true, pages: results });
}

async function handleAdminGetPage(env: Env, slug: string): Promise<Response> {
  const { page, sections } = await getPageBundle(env, slug);
  return jsonResponse({
    ok: true,
    page: serializeCmsPage(page),
    sections: sections.map((section) => serializeCmsSection(section, "admin"))
  });
}

async function handleAdminCreatePage(request: Request, env: Env): Promise<Response> {
  const body = asObject(await readJsonBody(request));
  const slug = cleanString(body.slug, 100).toLowerCase();
  const displayName = cleanString(body.displayName, 180);
  const seoTitle = cleanString(body.seoTitle, 300) || displayName;
  const seoDescription = cleanString(body.seoDescription, 600);

  if (!SLUG_PATTERN.test(slug) || !displayName) {
    throw new HttpError(400, "invalid_page", "A valid page name and slug are required.");
  }
  if (await getCmsPageBySlug(env.DB, slug)) {
    throw new HttpError(409, "page_exists", "A page with this slug already exists.");
  }

  const now = new Date().toISOString();
  const pageId = `page_${crypto.randomUUID().replaceAll("-", "")}`;
  await createCmsPage(env.DB, {
    id: pageId,
    slug,
    fileName: `page/${slug}`,
    displayName,
    seoTitle,
    seoDescription: seoDescription || null,
    now
  });
  await createCmsSection(env.DB, {
    id: `section_${crypto.randomUUID().replaceAll("-", "")}`,
    pageId,
    sectionKey: "page_intro",
    sectionType: "hero",
    displayName: "واجهة الصفحة",
    sortOrder: 10,
    contentJson: JSON.stringify({ eyebrow: "نوهة", title: displayName, body: seoDescription }),
    now
  });

  return handleAdminGetPage(env, slug);
}

async function handleAdminUpdatePage(request: Request, env: Env, slug: string): Promise<Response> {
  const { page } = await getPageBundle(env, slug);
  const body = asObject(await readJsonBody(request));
  const displayName = cleanString(body.displayName, 180);
  const seoTitle = cleanString(body.seoTitle, 300);
  const seoDescription = cleanString(body.seoDescription, 600);
  const status = cleanString(body.status, 20) || page.status;

  if (!displayName || !new Set(["draft", "published", "archived"]).has(status)) {
    throw new HttpError(400, "invalid_page", "Invalid page data.");
  }
  await updateCmsPage(env.DB, {
    pageId: page.id,
    displayName,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    status,
    now: new Date().toISOString()
  });
  return handleAdminGetPage(env, slug);
}

async function handleAdminCreateSection(request: Request, env: Env, slug: string): Promise<Response> {
  const { page, sections } = await getPageBundle(env, slug);
  const body = asObject(await readJsonBody(request));
  const sectionType = cleanString(body.sectionType, 50);
  const displayName = cleanString(body.displayName, 180);
  const content = normalizeSectionContent(body.content ?? {});

  if (!SECTION_TYPES.has(sectionType) || !displayName) {
    throw new HttpError(400, "invalid_section", "Invalid section data.");
  }

  const now = new Date().toISOString();
  await createCmsSection(env.DB, {
    id: `section_${crypto.randomUUID().replaceAll("-", "")}`,
    pageId: page.id,
    sectionKey: `custom_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
    sectionType,
    displayName,
    sortOrder: (sections.length + 1) * 10,
    contentJson: JSON.stringify(content),
    now
  });
  return handleAdminGetPage(env, slug);
}

async function handleAdminUpdateSectionContent(request: Request, env: Env, sectionId: string): Promise<Response> {
  const section = await getCmsSectionById(env.DB, sectionId);
  if (!section) throw new HttpError(404, "cms_section_not_found", "CMS section was not found.");

  const body = asObject(await readJsonBody(request));
  const displayName = cleanString(body.displayName, 180) || section.display_name;
  const sectionType = cleanString(body.sectionType, 50) || section.section_type;
  if (!SECTION_TYPES.has(sectionType)) throw new HttpError(400, "invalid_section", "Invalid section type.");
  const content = normalizeSectionContent(body.content ?? {});
  const now = new Date().toISOString();

  await updateCmsSectionContent(env.DB, {
    sectionId,
    displayName,
    sectionType,
    contentJson: JSON.stringify(content),
    now
  });
  const updated = await getCmsSectionById(env.DB, sectionId);
  return jsonResponse({ ok: true, section: updated ? serializeCmsSection(updated, "admin") : null });
}

async function handleAdminSectionVisibility(request: Request, env: Env, sectionId: string): Promise<Response> {
  const body = asObject(await readJsonBody(request));
  const isVisible = getBooleanField(body, "isVisible");
  if (isVisible === null) throw new HttpError(400, "invalid_visibility", "isVisible must be a boolean.");
  if (!(await getCmsSectionById(env.DB, sectionId))) {
    throw new HttpError(404, "cms_section_not_found", "CMS section was not found.");
  }
  await updateCmsSectionVisibility(env.DB, { sectionId, isVisible, updatedAt: new Date().toISOString() });
  const updated = await getCmsSectionById(env.DB, sectionId);
  return jsonResponse({ ok: true, section: updated ? serializeCmsSection(updated, "admin") : null });
}

async function handleAdminSectionOrder(request: Request, env: Env, slug: string): Promise<Response> {
  const body = asObject(await readJsonBody(request));
  const sectionIds = getStringArrayField(body, "sectionIds");
  if (!sectionIds || sectionIds.length === 0 || new Set(sectionIds).size !== sectionIds.length) {
    throw new HttpError(400, "invalid_section_order", "sectionIds must be a unique non-empty string array.");
  }

  const { page, sections } = await getPageBundle(env, slug);
  const expected = new Set(sections.map((section) => section.id));
  if (sectionIds.length !== expected.size || !sectionIds.every((id) => expected.has(id))) {
    throw new HttpError(400, "invalid_section_order", "sectionIds must contain every page section exactly once.");
  }

  await reorderCmsSections(env.DB, { pageId: page.id, sectionIds, updatedAt: new Date().toISOString() });
  return handleAdminGetPage(env, slug);
}

async function handleAdminPublishPage(env: Env, slug: string): Promise<Response> {
  const { page } = await getPageBundle(env, slug);
  await publishCmsPage(env.DB, page.id, new Date().toISOString());
  const published = await getPageBundle(env, slug);
  const failedSections = published.sections.filter((section) => section.draft_json !== section.published_json);
  if (published.page.status !== "published" || failedSections.length > 0) {
    throw new HttpError(500, "cms_publish_verification_failed", "CMS publish verification failed.");
  }
  return jsonResponse({
    ok: true,
    page: serializeCmsPage(published.page),
    sections: published.sections.map((section) => serializeCmsSection(section, "admin"))
  });
}

async function handleAdminDiscardPageDraft(env: Env, slug: string): Promise<Response> {
  const { page } = await getPageBundle(env, slug);
  await discardCmsPageDraft(env.DB, page.id, new Date().toISOString());
  return handleAdminGetPage(env, slug);
}

async function handleAdminDeleteSection(env: Env, sectionId: string): Promise<Response> {
  const section = await getCmsSectionById(env.DB, sectionId);
  if (!section) throw new HttpError(404, "cms_section_not_found", "CMS section was not found.");
  const pageSections = await listCmsSectionsByPageId(env.DB, section.page_id);
  if (pageSections.length <= 1) throw new HttpError(409, "last_section", "A page must keep at least one section.");
  await deleteCmsSection(env.DB, sectionId);
  return jsonResponse({ ok: true });
}


async function handleAdminListSiteSettings(env: Env): Promise<Response> {
  const settings = await listCmsSiteSettings(env.DB);
  return jsonResponse({
    ok: true,
    settings: settings.map((setting) => serializeCmsSiteSetting(setting, "admin"))
  });
}

async function handleAdminUpdateSiteSetting(
  request: Request,
  env: Env,
  settingKey: string
): Promise<Response> {
  if (!SITE_SETTING_KEYS.has(settingKey)) {
    throw new HttpError(404, "cms_site_setting_not_found", "CMS site setting was not found.");
  }
  if (!(await getCmsSiteSettingByKey(env.DB, settingKey))) {
    throw new HttpError(404, "cms_site_setting_not_found", "CMS site setting was not found.");
  }

  const body = asObject(await readJsonBody(request));
  const content = normalizeSiteSetting(settingKey, body.content ?? {});
  await updateCmsSiteSettingDraft(env.DB, {
    settingKey,
    contentJson: JSON.stringify(content),
    updatedAt: new Date().toISOString()
  });
  const setting = await getCmsSiteSettingByKey(env.DB, settingKey);
  return jsonResponse({
    ok: true,
    setting: setting ? serializeCmsSiteSetting(setting, "admin") : null
  });
}

async function handleAdminPublishSiteSettings(env: Env): Promise<Response> {
  await publishCmsSiteSettings(env.DB, new Date().toISOString());
  const settings = await listCmsSiteSettings(env.DB);
  if (settings.some((setting) => setting.draft_json !== setting.published_json)) {
    throw new HttpError(500, "cms_settings_publish_verification_failed", "CMS settings publish verification failed.");
  }
  return jsonResponse({
    ok: true,
    settings: settings.map((setting) => serializeCmsSiteSetting(setting, "admin"))
  });
}

async function handleAdminDiscardSiteSettings(env: Env): Promise<Response> {
  await discardCmsSiteSettingsDraft(env.DB, new Date().toISOString());
  return handleAdminListSiteSettings(env);
}

async function handleCmsAdminApi(request: Request, env: Env, pathname: string): Promise<Response> {
  await requireSession(env, request);

  if (pathname === "/api/admin/cms/settings") {
    return request.method === "GET" ? handleAdminListSiteSettings(env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/cms/settings/publish") {
    return request.method === "POST" ? handleAdminPublishSiteSettings(env) : methodNotAllowed();
  }

  if (pathname === "/api/admin/cms/settings/discard") {
    return request.method === "POST" ? handleAdminDiscardSiteSettings(env) : methodNotAllowed();
  }

  const settingMatch = pathname.match(/^\/api\/admin\/cms\/settings\/(header|footer|contact)$/);
  if (settingMatch) {
    return request.method === "PUT"
      ? handleAdminUpdateSiteSetting(request, env, settingMatch[1] ?? "")
      : methodNotAllowed();
  }

  if (pathname === "/api/admin/cms/pages") {
    if (request.method === "GET") return handleAdminListPages(env);
    if (request.method === "POST") return handleAdminCreatePage(request, env);
    return methodNotAllowed();
  }

  const publishMatch = pathname.match(/^\/api\/admin\/cms\/pages\/([a-z0-9-]{1,100})\/publish$/);
  if (publishMatch) return request.method === "POST" ? handleAdminPublishPage(env, publishMatch[1] ?? "") : methodNotAllowed();

  const discardMatch = pathname.match(/^\/api\/admin\/cms\/pages\/([a-z0-9-]{1,100})\/discard$/);
  if (discardMatch) return request.method === "POST" ? handleAdminDiscardPageDraft(env, discardMatch[1] ?? "") : methodNotAllowed();

  const orderMatch = pathname.match(/^\/api\/admin\/cms\/pages\/([a-z0-9-]{1,100})\/sections\/order$/);
  if (orderMatch) return request.method === "PUT" ? handleAdminSectionOrder(request, env, orderMatch[1] ?? "") : methodNotAllowed();

  const createSectionMatch = pathname.match(/^\/api\/admin\/cms\/pages\/([a-z0-9-]{1,100})\/sections$/);
  if (createSectionMatch) return request.method === "POST" ? handleAdminCreateSection(request, env, createSectionMatch[1] ?? "") : methodNotAllowed();

  const pageMatch = pathname.match(/^\/api\/admin\/cms\/pages\/([a-z0-9-]{1,100})$/);
  if (pageMatch) {
    if (request.method === "GET") return handleAdminGetPage(env, pageMatch[1] ?? "");
    if (request.method === "PUT") return handleAdminUpdatePage(request, env, pageMatch[1] ?? "");
    return methodNotAllowed();
  }

  const contentMatch = pathname.match(/^\/api\/admin\/cms\/sections\/([A-Za-z0-9_-]{1,120})\/content$/);
  if (contentMatch) return request.method === "PUT" ? handleAdminUpdateSectionContent(request, env, contentMatch[1] ?? "") : methodNotAllowed();

  const visibilityMatch = pathname.match(/^\/api\/admin\/cms\/sections\/([A-Za-z0-9_-]{1,120})\/visibility$/);
  if (visibilityMatch) return request.method === "PATCH" ? handleAdminSectionVisibility(request, env, visibilityMatch[1] ?? "") : methodNotAllowed();

  const sectionMatch = pathname.match(/^\/api\/admin\/cms\/sections\/([A-Za-z0-9_-]{1,120})$/);
  if (sectionMatch) return request.method === "DELETE" ? handleAdminDeleteSection(env, sectionMatch[1] ?? "") : methodNotAllowed();

  return errorResponse(404, "not_found", "Not found.");
}

async function handleAdminApi(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/api/admin/setup-status") {
    return request.method === "GET" ? handleSetupStatus(env) : methodNotAllowed();
  }

  assertSameOriginMutation(request);
  if (pathname === "/api/admin/setup") return request.method === "POST" ? handleSetup(request, env) : methodNotAllowed();
  if (pathname === "/api/admin/login") return request.method === "POST" ? handleLogin(request, env) : methodNotAllowed();
  if (pathname === "/api/admin/session") return request.method === "GET" ? handleSession(request, env) : methodNotAllowed();
  if (pathname === "/api/admin/logout") return request.method === "POST" ? handleLogout(request, env) : methodNotAllowed();
  if (pathname.startsWith("/api/admin/cms/")) return handleCmsAdminApi(request, env, pathname);
  await requireSession(env, request);
  return errorResponse(404, "not_found", "Not found.");
}

async function handleAdminRoute(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed();
  const normalizedPath = normalizeAdminAssetPath(pathname);

  if (normalizedPath === "/admin/login.html") {
    const existingSession = env.AUTH_PEPPER
      ? await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER, { touch: false })
      : null;
    if (existingSession) return redirectResponse("/admin");
    if ((await countAdminUsers(env.DB)) === 0) return redirectResponse("/admin/setup");
    return fetchAdminAsset(env, request, normalizedPath);
  }

  if (normalizedPath === "/admin/setup.html") {
    if ((await countAdminUsers(env.DB)) > 0) return redirectResponse("/admin/login");
    return fetchAdminAsset(env, request, normalizedPath);
  }

  if (isProtectedAdminAsset(pathname)) {
    ensureAuthSecrets(env);
    const session = await getAuthenticatedSession(env.DB, request, env.AUTH_PEPPER);
    if (!session) {
      return isAdminPageRequest(request, normalizedPath)
        ? redirectResponse("/admin/login")
        : errorResponse(401, "unauthorized", "Authentication required.");
    }
  }
  return fetchAdminAsset(env, request, normalizedPath);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({ ok: true, service: "nooha-cms-api", timestamp: new Date().toISOString() });
      }
      if (url.pathname.startsWith("/api/cms/")) return await handlePublicCmsApi(request, env, url.pathname);
      if (url.pathname.startsWith("/api/admin/")) return await handleAdminApi(request, env, url.pathname);
      if (isAdminPath(url.pathname)) return await handleAdminRoute(request, env, url.pathname);
      if (request.method === "GET" && /^\/page\/[a-z0-9-]{1,100}\/?$/.test(url.pathname)) {
        return await fetchAsset(env, request, "/cms-page.html");
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      if (error instanceof HttpError) return errorResponse(error.status, error.code, error.message);
      return errorResponse(500, "internal_error", "Internal Server Error.");
    }
  }
} satisfies ExportedHandler<Env>;
