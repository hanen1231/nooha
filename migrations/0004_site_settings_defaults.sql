PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO cms_site_settings (setting_key, display_name, draft_json, published_json, updated_at, published_at)
VALUES
  ('header', 'القائمة العلوية', '{}', '{}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), NULL),
  ('footer', 'تذييل الموقع', '{}', '{}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), NULL),
  ('contact', 'بيانات التواصل', '{}', '{}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), NULL);

UPDATE cms_site_settings
SET draft_json = CASE WHEN draft_json = '{}' THEN '{"siteName":"نوهة للإعاشة","siteTagline":"حلول الغذاء والتوريد","logoUrl":"/public/logo.png","logoAlt":"نوهة للإعاشة","navItems":[{"label":"الرئيسية","url":"/index.html"},{"label":"عن نوهة","url":"/about.html"},{"label":"الخدمات","url":"/services.html"},{"label":"مطابخنا المركزية","url":"/central-kitchen-madinah.html"},{"label":"المعرض","url":"/Gallery.html"},{"label":"المدونات","url":"/certificates.html"},{"label":"التوظيف","url":"/careers.html"},{"label":"تواصل معنا","url":"/contact.html"},{"label":"الملف التعريفي","url":"/company-profile.html"}]}' ELSE draft_json END,
    published_json = CASE WHEN published_json = '{}' THEN '{"siteName":"نوهة للإعاشة","siteTagline":"حلول الغذاء والتوريد","logoUrl":"/public/logo.png","logoAlt":"نوهة للإعاشة","navItems":[{"label":"الرئيسية","url":"/index.html"},{"label":"عن نوهة","url":"/about.html"},{"label":"الخدمات","url":"/services.html"},{"label":"مطابخنا المركزية","url":"/central-kitchen-madinah.html"},{"label":"المعرض","url":"/Gallery.html"},{"label":"المدونات","url":"/certificates.html"},{"label":"التوظيف","url":"/careers.html"},{"label":"تواصل معنا","url":"/contact.html"},{"label":"الملف التعريفي","url":"/company-profile.html"}]}' ELSE published_json END,
    published_at = COALESCE(published_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE setting_key = 'header';

UPDATE cms_site_settings
SET draft_json = CASE WHEN draft_json = '{}' THEN '{"summary":"من مطابخنا المركزية ننطلق يوميًا لإعداد آلاف الوجبات إلى مواقع العمل في مختلف مناطق المملكة، بسرعة تنفيذ وضبط صحي ومعايير جودة وسلامة عالية وثابتة.","copyright":"© 2026 نوهة للإعاشة. جميع الحقوق محفوظة.","secondaryText":"تصميم وتطوير قابل للتحديث من لوحة الإدارة.","quickLinks":[{"label":"الرئيسية","url":"/index.html"},{"label":"من نحن","url":"/about.html"},{"label":"خدماتنا","url":"/services.html"},{"label":"أعمالنا","url":"/Gallery.html"},{"label":"الشهادات","url":"/certificates.html"},{"label":"التوظيف","url":"/careers.html"}],"kitchenLinks":[{"label":"المطبخ المركزي في المدينة المنورة","url":"/central-kitchen-madinah.html"},{"label":"فرع مكة","url":"/makkah-branch.html"},{"label":"فرع الاستيراد والتصدير في المدينة المنورة","url":"/riyadh-import-export.html"}]}' ELSE draft_json END,
    published_json = CASE WHEN published_json = '{}' THEN '{"summary":"من مطابخنا المركزية ننطلق يوميًا لإعداد آلاف الوجبات إلى مواقع العمل في مختلف مناطق المملكة، بسرعة تنفيذ وضبط صحي ومعايير جودة وسلامة عالية وثابتة.","copyright":"© 2026 نوهة للإعاشة. جميع الحقوق محفوظة.","secondaryText":"تصميم وتطوير قابل للتحديث من لوحة الإدارة.","quickLinks":[{"label":"الرئيسية","url":"/index.html"},{"label":"من نحن","url":"/about.html"},{"label":"خدماتنا","url":"/services.html"},{"label":"أعمالنا","url":"/Gallery.html"},{"label":"الشهادات","url":"/certificates.html"},{"label":"التوظيف","url":"/careers.html"}],"kitchenLinks":[{"label":"المطبخ المركزي في المدينة المنورة","url":"/central-kitchen-madinah.html"},{"label":"فرع مكة","url":"/makkah-branch.html"},{"label":"فرع الاستيراد والتصدير في المدينة المنورة","url":"/riyadh-import-export.html"}]}' ELSE published_json END,
    published_at = COALESCE(published_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE setting_key = 'footer';

UPDATE cms_site_settings
SET draft_json = CASE WHEN draft_json = '{}' THEN '{"email":"nooha2040@gmail.com","phone":"+966537158296","phoneDisplay":"+966 53 715 8296","whatsappNumber":"966537158296","address":"المدينة المنورة، المملكة العربية السعودية","workingHours":"الأحد - الخميس، 9 صباحًا - 5 مساءً","instagramUrl":"https://www.instagram.com/nooha_2040/?hl=ar","snapchatUrl":"https://snapchat.com/t/LTT4ri5s"}' ELSE draft_json END,
    published_json = CASE WHEN published_json = '{}' THEN '{"email":"nooha2040@gmail.com","phone":"+966537158296","phoneDisplay":"+966 53 715 8296","whatsappNumber":"966537158296","address":"المدينة المنورة، المملكة العربية السعودية","workingHours":"الأحد - الخميس، 9 صباحًا - 5 مساءً","instagramUrl":"https://www.instagram.com/nooha_2040/?hl=ar","snapchatUrl":"https://snapchat.com/t/LTT4ri5s"}' ELSE published_json END,
    published_at = COALESCE(published_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE setting_key = 'contact';
