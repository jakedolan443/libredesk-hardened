-- name: get-teams
SELECT id, created_at, updated_at, name, emoji, conversation_assignment_type, max_auto_assigned_conversations, business_hours_id, sla_policy_id, timezone from teams order by updated_at desc;

-- name: upsert-user-teams
WITH delete_old_teams AS (
    DELETE FROM team_members 
    WHERE user_id = $1 
    AND team_id NOT IN (SELECT t.id FROM teams t WHERE t.name = ANY($2))
),
insert_new_teams AS (
    INSERT INTO team_members (user_id, team_id)
    SELECT $1, t.id 
    FROM teams t 
    WHERE t.name = ANY($2)
    ON CONFLICT DO NOTHING
)
SELECT 1;
