-- name: get-users-compact
SELECT COUNT(*) OVER() as total, users.id, users.avatar_url, users.type, users.created_at, users.updated_at, users.first_name, users.last_name, users.email, users.enabled, users.external_user_id, users.availability_status
FROM users
-- email != 'System' also drops NULL-email users (anonymous visitors); AI assistants have no email and must still be listed.
WHERE users.email != 'System' AND users.deleted_at IS NULL AND type = ANY($1)

-- name: get-agents-compact
SELECT users.id, users.avatar_url, users.type, users.created_at, users.updated_at, users.first_name, users.last_name, users.email, users.enabled, users.external_user_id, users.availability_status
FROM users
WHERE users.email != 'System' AND users.deleted_at IS NULL AND users.type = ANY($1)
    AND ($2 = '' OR CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) ILIKE $7 ESCAPE '\' OR users.email ILIKE $7 ESCAPE '\')
    AND ($3 = '' OR users.type::text = $3)
    AND (NOT $4 OR users.enabled)
ORDER BY users.first_name, users.last_name, users.id
LIMIT NULLIF($5, 0) OFFSET $6;

-- name: get-agents-compact-by-ids
SELECT users.id, users.avatar_url, users.type, users.created_at, users.updated_at, users.first_name, users.last_name, users.email, users.enabled, users.external_user_id, users.availability_status
FROM users
WHERE users.email != 'System' AND users.deleted_at IS NULL AND users.type = ANY($1) AND users.id = ANY($2)
ORDER BY users.first_name, users.last_name, users.id;

-- name: soft-delete-agent
WITH soft_delete AS (
    UPDATE users
    SET deleted_at = now(), updated_at = now()
    WHERE id = $1 AND type = 'agent'
    RETURNING id
),
-- Delete from user_roles and teams
delete_team_members AS (
    DELETE FROM team_members
    WHERE user_id IN (SELECT id FROM soft_delete)
    RETURNING 1
),
delete_user_roles AS (
    DELETE FROM user_roles
    WHERE user_id IN (SELECT id FROM soft_delete)
    RETURNING 1
)
SELECT count(*) FROM soft_delete;

-- name: get-user
SELECT
    u.id,
    u.created_at,
    u.updated_at,
    u.email,
    u.password,
    u.type,
    u.enabled,
    u.avatar_url,
    u.first_name,
    u.last_name,
    u.availability_status,
    u.last_active_at,
    u.last_login_at,
    u.phone_number_country_code,
    u.phone_number,
    u.country,
    u.api_key,
    u.api_key_last_used_at,
    u.external_user_id,
    u.api_secret,
    array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS roles,
    COALESCE(
        (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji))
         FROM team_members tm
         JOIN teams t ON tm.team_id = t.id
         WHERE tm.user_id = u.id),
        '[]'
    ) AS teams,
    array_agg(DISTINCT p ORDER BY p) FILTER (WHERE p IS NOT NULL) AS permissions
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN LATERAL unnest(r.permissions) AS p ON true
WHERE u.deleted_at IS NULL
    AND ($1 = 0 OR u.id = $1)
    AND ($2 = '' OR u.email = $2)
    AND (cardinality($3::text[]) = 0 OR u.type::text = ANY($3::text[]))
GROUP BY u.id
ORDER BY u.id ASC
LIMIT 1;

-- name: update-agent
WITH not_removed_roles AS (
 SELECT r.id FROM unnest($5::text[]) role_name
 JOIN roles r ON r.name = role_name
),
old_roles AS (
 DELETE FROM user_roles
 WHERE user_id = $1
 AND role_id NOT IN (SELECT id FROM not_removed_roles)
),
new_roles AS (
 INSERT INTO user_roles (user_id, role_id)
 SELECT $1, r.id FROM not_removed_roles r
 ON CONFLICT (user_id, role_id) DO NOTHING
)
UPDATE users
SET first_name = COALESCE($2, first_name),
 last_name = COALESCE($3, last_name),
 email = COALESCE($4, email),
 avatar_url = COALESCE($6, avatar_url),
 password = COALESCE($7, password),
 enabled = COALESCE($8, enabled),
 availability_status = COALESCE($9, availability_status),
 updated_at = now()
WHERE id = $1;

-- name: update-avatar
UPDATE users
SET avatar_url = $2, updated_at = now()
WHERE id = $1;

-- name: update-availability
UPDATE users
SET availability_status = $2
WHERE id = $1;

-- name: update-last-active-at
WITH prev AS (
    SELECT availability_status AS old_status FROM users WHERE id = $1
)
UPDATE users
SET last_active_at = now(),
availability_status = CASE WHEN availability_status = 'offline' THEN 'online' ELSE availability_status END
FROM prev
WHERE users.id = $1
RETURNING (prev.old_status = 'offline')::boolean AS was_offline;

-- name: update-inactive-offline
UPDATE users
SET availability_status = 'offline'
WHERE
  type IN ('agent', 'contact', 'visitor')
  AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL '5 minutes')
  AND availability_status NOT IN ('offline', 'away_and_reassigning', 'away_manual')
RETURNING id, type;

-- name: set-reset-password-token
UPDATE users
SET reset_password_token = $2, reset_password_token_expiry = now() + interval '1 day'
WHERE id = $1 AND type = 'agent';

-- name: set-password
UPDATE users
SET password = $1, reset_password_token = NULL, reset_password_token_expiry = NULL
WHERE reset_password_token = $2 AND reset_password_token_expiry > now()
RETURNING id;

-- name: insert-agent
WITH inserted_user AS (
  INSERT INTO users (email, type, first_name, last_name, "password", avatar_url)
  VALUES ($1, 'agent', $2, $3, $4, $5)
  RETURNING id AS user_id
)
INSERT INTO user_roles (user_id, role_id)
SELECT inserted_user.user_id, r.id
FROM inserted_user, unnest($6::text[]) role_name
JOIN roles r ON r.name = role_name
RETURNING user_id;

-- name: update-last-login-at
UPDATE users
SET last_login_at = now(),
updated_at = now()
WHERE id = $1;

-- name: get-user-by-api-key
SELECT
    u.id,
    u.created_at,
    u.updated_at,
    u.email,
    u.password,
    u.type,
    u.enabled,
    u.avatar_url,
    u.first_name,
    u.last_name,
    u.availability_status,
    u.last_active_at,
    u.last_login_at,
    u.phone_number_country_code,
    u.phone_number,
    u.country,
    u.api_key,
    u.api_key_last_used_at,
    u.api_secret,
    u.external_user_id,
    array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS roles,
    COALESCE(
        (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji))
         FROM team_members tm
         JOIN teams t ON tm.team_id = t.id
         WHERE tm.user_id = u.id),
        '[]'
    ) AS teams,
    array_agg(DISTINCT p ORDER BY p) FILTER (WHERE p IS NOT NULL) AS permissions
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN LATERAL unnest(r.permissions) AS p ON true
WHERE u.api_key = $1 AND u.enabled = true AND u.deleted_at IS NULL
GROUP BY u.id;

-- name: set-api-key
UPDATE users
SET api_key = $2, api_secret = $3, api_key_last_used_at = NULL, updated_at = now()
WHERE id = $1;

-- name: revoke-api-key
UPDATE users
SET api_key = NULL, api_secret = NULL, api_key_last_used_at = NULL, updated_at = now()
WHERE id = $1;

-- name: update-api-secret-hash
UPDATE users
SET api_secret = $3, updated_at = now()
WHERE id = $1 AND api_secret = $2;

-- name: update-api-key-last-used
UPDATE users
SET api_key_last_used_at = now()
WHERE id = $1;

-- name: get-image-senders
SELECT to_json(COALESCE(p.senders, '{}'::text[])) FROM users u
LEFT JOIN user_image_permissions p ON p.user_id = u.id
WHERE u.id = $1 AND u.type = 'agent' AND u.deleted_at IS NULL;

-- name: set-image-sender
INSERT INTO user_image_permissions (user_id, senders)
SELECT id, CASE WHEN $3::boolean THEN ARRAY[$2::text] ELSE '{}'::text[] END
FROM users WHERE id = $1 AND type = 'agent' AND deleted_at IS NULL
ON CONFLICT (user_id) DO UPDATE SET senders =
CASE WHEN NOT $3::boolean THEN array_remove(user_image_permissions.senders, $2::text)
WHEN $2::text = ANY(user_image_permissions.senders) THEN user_image_permissions.senders
ELSE array_append(user_image_permissions.senders, $2::text) END
WHERE NOT $3::boolean OR $2::text = ANY(user_image_permissions.senders)
OR cardinality(user_image_permissions.senders) < 100;
