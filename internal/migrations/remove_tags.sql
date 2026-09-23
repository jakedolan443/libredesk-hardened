-- Strip tag predicates recursively from both legacy arrays and grouped filters.
CREATE OR REPLACE FUNCTION pg_temp.remove_tag_filters(node jsonb) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE items jsonb; item jsonb; cleaned jsonb;
BEGIN
 IF jsonb_typeof(node) = 'array' THEN
  items := '[]'::jsonb;
  FOR item IN SELECT value FROM jsonb_array_elements(node) LOOP
   cleaned := pg_temp.remove_tag_filters(item);
   IF cleaned IS NOT NULL THEN items := items || jsonb_build_array(cleaned); END IF;
  END LOOP;
  RETURN items;
 ELSIF jsonb_typeof(node) = 'object' THEN
  IF node->>'field' = 'tags' THEN RETURN NULL; END IF;
  IF jsonb_typeof(node->'rules') = 'array' THEN
   items := pg_temp.remove_tag_filters(node->'rules');
   IF jsonb_array_length(items) = 0 THEN RETURN NULL; END IF;
   RETURN jsonb_set(node, '{rules}', items);
  END IF;
 END IF;
 RETURN node;
END $$;
UPDATE views SET filters = COALESCE(pg_temp.remove_tag_filters(filters), '[]'::jsonb);
UPDATE roles SET permissions = array_remove(array_remove(permissions, 'tags:manage'), 'conversations:update_tags');
UPDATE webhooks SET events = ARRAY(SELECT e FROM unnest(events) e WHERE e::text <> 'conversation.tags_changed');
DELETE FROM conversation_messages WHERE type = 'activity' AND meta->>'activity_type' IN ('tag_added','tag_removed');
DROP TABLE IF EXISTS conversation_tags;
DROP TABLE IF EXISTS tags;
ALTER TABLE inboxes DROP COLUMN IF EXISTS prompt_tags_on_reply;
