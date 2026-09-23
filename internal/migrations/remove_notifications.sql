-- Preserve account recovery SMTP configuration under its own namespace.
INSERT INTO settings (key, value)
SELECT replace(key, 'notification.email.', 'account_email.'), value
FROM settings WHERE key LIKE 'notification.email.%'
ON CONFLICT (key) DO NOTHING;
DELETE FROM settings WHERE key LIKE 'notification.%';
DELETE FROM templates WHERE type::text = 'email_notification';
UPDATE roles SET permissions = array_remove(permissions, 'notification_settings:manage');
DROP TABLE IF EXISTS notification_email_queue;
DROP TABLE IF EXISTS notification_push_subscriptions;
DROP TABLE IF EXISTS user_notification_preferences;
DROP TABLE IF EXISTS user_notifications;
DROP TYPE IF EXISTS notification_channel;
DROP TYPE IF EXISTS user_notification_type;
