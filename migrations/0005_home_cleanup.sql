-- Remove the international flags feature from the public home page.
UPDATE cms_sections
SET
  is_visible = 0,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE page_id = 'page_home'
  AND section_key = 'flags_feature';

-- Keep only the five approved home metrics.
UPDATE cms_sections
SET
  draft_json = '{"items":[{"title":"+100"},{"title":"+500"},{"title":"+10"},{"title":"+30,000"},{"title":"+6"}]}',
  published_json = '{"items":[{"title":"+100"},{"title":"+500"},{"title":"+10"},{"title":"+30,000"},{"title":"+6"}]}',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  published_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE page_id = 'page_home'
  AND section_key = 'metrics';
