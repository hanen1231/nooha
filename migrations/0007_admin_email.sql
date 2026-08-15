UPDATE admin_users
SET
  email = 'Noohacmp@gmail.com',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE email = 'Nawafoly6@gmail.com' COLLATE NOCASE;