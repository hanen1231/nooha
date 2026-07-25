PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cms_pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  file_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1
    CHECK (is_visible IN (0, 1)),
  draft_json TEXT NOT NULL DEFAULT '{}',
  published_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (page_id)
    REFERENCES cms_pages(id)
    ON DELETE CASCADE,
  UNIQUE (page_id, section_key)
);

CREATE TABLE IF NOT EXISTS cms_site_settings (
  setting_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  draft_json TEXT NOT NULL DEFAULT '{}',
  published_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_status
  ON cms_pages(status);

CREATE INDEX IF NOT EXISTS idx_cms_sections_page_order
  ON cms_sections(page_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_sections_page_visible
  ON cms_sections(page_id, is_visible, sort_order);

INSERT OR IGNORE INTO cms_pages (
  id,
  slug,
  file_name,
  display_name,
  status,
  seo_title,
  seo_description,
  created_at,
  updated_at
)
VALUES (
  'page_home',
  'home',
  'index.html',
  'الصفحة الرئيسية',
  'published',
  'شركة نوهة للإعاشة والتوريد الغذائي',
  'حلول الإعاشة والتموين وتشغيل المطابخ المركزية وتوريد المواد الغذائية.',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO cms_sections (
  id,
  page_id,
  section_key,
  section_type,
  display_name,
  sort_order,
  is_visible,
  created_at,
  updated_at
)
VALUES
(
  'home_video_hero',
  'page_home',
  'video_hero',
  'video_hero',
  'واجهة الفيديو',
  10,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_flags_feature',
  'page_home',
  'flags_feature',
  'image',
  'صورة الشراكات الدولية',
  20,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_main_hero',
  'page_home',
  'main_hero',
  'hero',
  'الواجهة الرئيسية',
  30,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_profile',
  'page_home',
  'profile',
  'form_and_text',
  'من نحن وطلب عرض السعر',
  40,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_announcement',
  'page_home',
  'announcement',
  'announcement',
  'شريط الإعلان',
  50,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_services',
  'page_home',
  'services',
  'cards',
  'الخدمات',
  60,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_metrics',
  'page_home',
  'metrics',
  'metrics',
  'الإحصائيات',
  70,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_partners',
  'page_home',
  'partners',
  'logo_grid',
  'شركاء النجاح',
  80,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_kitchens',
  'page_home',
  'kitchens',
  'image_cards',
  'المطابخ المركزية',
  90,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_sectors',
  'page_home',
  'sectors',
  'icon_grid',
  'القطاعات المستهدفة',
  100,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_team',
  'page_home',
  'team',
  'text_and_image',
  'خبرات فريق العمل',
  110,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'home_cta',
  'page_home',
  'cta',
  'call_to_action',
  'طلب الخدمة والتواصل',
  120,
  1,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT OR IGNORE INTO cms_site_settings (
  setting_key,
  display_name,
  draft_json,
  published_json,
  updated_at
)
VALUES
(
  'header',
  'القائمة العلوية',
  '{}',
  '{}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'footer',
  'تذييل الموقع',
  '{}',
  '{}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
),
(
  'contact',
  'بيانات التواصل',
  '{}',
  '{}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
