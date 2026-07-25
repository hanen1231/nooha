export interface CmsPageRow {
  id: string;
  slug: string;
  file_name: string;
  display_name: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsSectionRow {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  display_name: string;
  sort_order: number;
  is_visible: number;
  draft_json: string;
  published_json: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export async function listCmsPages(db: D1Database): Promise<CmsPageRow[]> {
  const result = await db
    .prepare(
      `SELECT id, slug, file_name, display_name, status, seo_title, seo_description, created_at, updated_at
       FROM cms_pages
       WHERE status <> 'archived'
       ORDER BY CASE WHEN slug = 'home' THEN 0 ELSE 1 END, display_name COLLATE NOCASE ASC`
    )
    .all<CmsPageRow>();

  return result.results ?? [];
}

export async function getCmsPageBySlug(db: D1Database, slug: string): Promise<CmsPageRow | null> {
  return db
    .prepare(
      `SELECT id, slug, file_name, display_name, status, seo_title, seo_description, created_at, updated_at
       FROM cms_pages
       WHERE slug = ? COLLATE NOCASE
       LIMIT 1`
    )
    .bind(slug)
    .first<CmsPageRow>();
}

export async function createCmsPage(
  db: D1Database,
  params: {
    id: string;
    slug: string;
    fileName: string;
    displayName: string;
    seoTitle: string | null;
    seoDescription: string | null;
    now: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO cms_pages (
        id, slug, file_name, display_name, status, seo_title, seo_description, created_at, updated_at
       ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)`
    )
    .bind(
      params.id,
      params.slug,
      params.fileName,
      params.displayName,
      params.seoTitle,
      params.seoDescription,
      params.now,
      params.now
    )
    .run();
}

export async function updateCmsPage(
  db: D1Database,
  params: {
    pageId: string;
    displayName: string;
    seoTitle: string | null;
    seoDescription: string | null;
    status: string;
    now: string;
  }
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE cms_pages
       SET display_name = ?, seo_title = ?, seo_description = ?, status = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(
      params.displayName,
      params.seoTitle,
      params.seoDescription,
      params.status,
      params.now,
      params.pageId
    )
    .run();

  return Number(result.meta.changes ?? 0) === 1;
}

export async function listCmsSectionsByPageId(db: D1Database, pageId: string): Promise<CmsSectionRow[]> {
  const result = await db
    .prepare(
      `SELECT id, page_id, section_key, section_type, display_name, sort_order, is_visible,
              draft_json, published_json, created_at, updated_at, published_at
       FROM cms_sections
       WHERE page_id = ?
       ORDER BY sort_order ASC, id ASC`
    )
    .bind(pageId)
    .all<CmsSectionRow>();

  return result.results ?? [];
}

export async function getCmsSectionById(db: D1Database, sectionId: string): Promise<CmsSectionRow | null> {
  return db
    .prepare(
      `SELECT id, page_id, section_key, section_type, display_name, sort_order, is_visible,
              draft_json, published_json, created_at, updated_at, published_at
       FROM cms_sections
       WHERE id = ?
       LIMIT 1`
    )
    .bind(sectionId)
    .first<CmsSectionRow>();
}

export async function createCmsSection(
  db: D1Database,
  params: {
    id: string;
    pageId: string;
    sectionKey: string;
    sectionType: string;
    displayName: string;
    sortOrder: number;
    contentJson: string;
    now: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO cms_sections (
        id, page_id, section_key, section_type, display_name, sort_order, is_visible,
        draft_json, published_json, created_at, updated_at, published_at
       ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, '{}', ?, ?, NULL)`
    )
    .bind(
      params.id,
      params.pageId,
      params.sectionKey,
      params.sectionType,
      params.displayName,
      params.sortOrder,
      params.contentJson,
      params.now,
      params.now
    )
    .run();
}

export async function updateCmsSectionContent(
  db: D1Database,
  params: {
    sectionId: string;
    displayName: string;
    sectionType: string;
    contentJson: string;
    now: string;
  }
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE cms_sections
       SET display_name = ?, section_type = ?, draft_json = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(params.displayName, params.sectionType, params.contentJson, params.now, params.sectionId)
    .run();

  return Number(result.meta.changes ?? 0) === 1;
}

export async function updateCmsSectionVisibility(
  db: D1Database,
  params: { sectionId: string; isVisible: boolean; updatedAt: string }
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE cms_sections SET is_visible = ?, updated_at = ? WHERE id = ?`
    )
    .bind(params.isVisible ? 1 : 0, params.updatedAt, params.sectionId)
    .run();

  return Number(result.meta.changes ?? 0) === 1;
}

export async function reorderCmsSections(
  db: D1Database,
  params: { pageId: string; sectionIds: string[]; updatedAt: string }
): Promise<void> {
  const statements = params.sectionIds.map((sectionId, index) =>
    db
      .prepare(
        `UPDATE cms_sections
         SET sort_order = ?, updated_at = ?
         WHERE id = ? AND page_id = ?`
      )
      .bind((index + 1) * 10, params.updatedAt, sectionId, params.pageId)
  );

  if (statements.length === 0) return;
  const results = await db.batch(statements);
  if (!results.every((result) => Number(result.meta.changes ?? 0) === 1)) {
    throw new Error("Unable to reorder every CMS section.");
  }
}

export async function publishCmsPage(db: D1Database, pageId: string, now: string): Promise<void> {
  const results = await db.batch([
    db
      .prepare(
        `UPDATE cms_sections
         SET published_json = draft_json, published_at = ?, updated_at = ?
         WHERE page_id = ?`
      )
      .bind(now, now, pageId),
    db
      .prepare(`UPDATE cms_pages SET status = 'published', updated_at = ? WHERE id = ?`)
      .bind(now, pageId)
  ]);

  if (Number(results[1]?.meta.changes ?? 0) !== 1) {
    throw new Error("Unable to publish CMS page.");
  }
}

export async function discardCmsPageDraft(db: D1Database, pageId: string, now: string): Promise<void> {
  const results = await db.batch([
    db
      .prepare(
        `UPDATE cms_sections
         SET draft_json = published_json, updated_at = ?
         WHERE page_id = ?`
      )
      .bind(now, pageId),
    db
      .prepare(`UPDATE cms_pages SET updated_at = ? WHERE id = ?`)
      .bind(now, pageId)
  ]);

  if (Number(results[1]?.meta.changes ?? 0) !== 1) {
    throw new Error("Unable to discard CMS draft.");
  }
}

export async function deleteCmsSection(db: D1Database, sectionId: string): Promise<boolean> {
  const result = await db.prepare(`DELETE FROM cms_sections WHERE id = ?`).bind(sectionId).run();
  return Number(result.meta.changes ?? 0) === 1;
}
