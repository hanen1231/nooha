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

export async function getCmsPageBySlug(db: D1Database, slug: string): Promise<CmsPageRow | null> {
  return db
    .prepare(
      `SELECT
        id,
        slug,
        file_name,
        display_name,
        status,
        seo_title,
        seo_description,
        created_at,
        updated_at
       FROM cms_pages
       WHERE slug = ? COLLATE NOCASE
       LIMIT 1`
    )
    .bind(slug)
    .first<CmsPageRow>();
}

export async function listCmsSectionsByPageId(db: D1Database, pageId: string): Promise<CmsSectionRow[]> {
  const result = await db
    .prepare(
      `SELECT
        id,
        page_id,
        section_key,
        section_type,
        display_name,
        sort_order,
        is_visible,
        draft_json,
        published_json,
        created_at,
        updated_at,
        published_at
       FROM cms_sections
       WHERE page_id = ?
       ORDER BY sort_order ASC, id ASC`
    )
    .bind(pageId)
    .all<CmsSectionRow>();

  return result.results ?? [];
}

export async function updateCmsSectionVisibility(
  db: D1Database,
  params: {
    sectionId: string;
    isVisible: boolean;
    updatedAt: string;
  }
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE cms_sections
       SET is_visible = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(params.isVisible ? 1 : 0, params.updatedAt, params.sectionId)
    .run();

  return Number(result.meta.changes ?? 0) === 1;
}

export async function reorderCmsSections(
  db: D1Database,
  params: {
    pageId: string;
    sectionIds: string[];
    updatedAt: string;
  }
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

  if (statements.length === 0) {
    return;
  }

  const results = await db.batch(statements);
  const allUpdated = results.every((result) => Number(result.meta.changes ?? 0) === 1);

  if (!allUpdated) {
    throw new Error("Unable to reorder every CMS section.");
  }
}
