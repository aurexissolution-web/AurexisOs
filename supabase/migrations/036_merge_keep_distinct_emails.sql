-- 036_merge_keep_distinct_emails.sql
-- Fix: merging two clients dropped a contact whenever it shared a PHONE with a
-- contact on the kept client, even if it had a different EMAIL, losing that
-- email address. A contact is now dropped only when it adds nothing new: same
-- email, or no email of its own and the same phone.
CREATE OR REPLACE FUNCTION merge_clients(keep_id UUID, drop_id UUID) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  t TEXT;
BEGIN
  IF keep_id = drop_id THEN RAISE EXCEPTION 'Cannot merge a client into itself'; END IF;
  IF NOT EXISTS (SELECT 1 FROM clients WHERE id = keep_id) OR NOT EXISTS (SELECT 1 FROM clients WHERE id = drop_id) THEN
    RAISE EXCEPTION 'Both clients must exist';
  END IF;

  UPDATE client_contacts c SET client_id = keep_id
  WHERE c.client_id = drop_id
    AND NOT EXISTS (
      SELECT 1 FROM client_contacts k
      WHERE k.client_id = keep_id
        AND ((c.email_key IS NOT NULL AND k.email_key = c.email_key)
          OR (c.email_key IS NULL AND c.phone_key IS NOT NULL AND k.phone_key = c.phone_key))
    );

  UPDATE client_activity a SET client_id = keep_id
  WHERE a.client_id = drop_id
    AND (a.ref IS NULL OR NOT EXISTS (SELECT 1 FROM client_activity b WHERE b.client_id = keep_id AND b.ref = a.ref));

  UPDATE client_files    SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE client_services SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE client_invoices SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE calendar_events SET client_id = keep_id WHERE client_id = drop_id;
  FOREACH t IN ARRAY ARRAY[
    'presence_quote_requests','flow_quote_requests','core_quote_requests',
    'connect_quote_requests','ai_readiness_audit_quote_requests','contact_messages','calculator_leads'
  ] LOOP
    EXECUTE format('UPDATE %I SET client_id = $1 WHERE client_id = $2', t) USING keep_id, drop_id;
  END LOOP;

  UPDATE clients k SET
    tags = (SELECT coalesce(array_agg(DISTINCT x), '{}') FROM unnest(k.tags || d.tags) AS x),
    notes = CASE WHEN d.notes = '' THEN k.notes
                 WHEN k.notes = '' THEN d.notes
                 ELSE k.notes || E'\n\n--- merged from ' || d.name || E' ---\n' || d.notes END,
    company = CASE WHEN k.company = '' THEN d.company ELSE k.company END,
    industry = CASE WHEN k.industry = '' THEN d.industry ELSE k.industry END,
    website = CASE WHEN k.website = '' THEN d.website ELSE k.website END,
    address = CASE WHEN k.address = '' THEN d.address ELSE k.address END,
    first_contact_at = LEAST(k.first_contact_at, d.first_contact_at),
    last_contact_at = GREATEST(k.last_contact_at, d.last_contact_at),
    next_followup_at = CASE WHEN k.next_followup_at IS NULL THEN d.next_followup_at ELSE k.next_followup_at END,
    next_followup_note = CASE WHEN k.next_followup_at IS NULL THEN d.next_followup_note ELSE k.next_followup_note END,
    status = CASE WHEN 'active' IN (k.status, d.status) THEN 'active' ELSE k.status END,
    updated_at = NOW()
  FROM clients d
  WHERE k.id = keep_id AND d.id = drop_id;

  INSERT INTO client_activity (client_id, kind, title, body)
  SELECT keep_id, 'status_change', 'Merged with another client record', 'Merged from: ' || name FROM clients WHERE id = drop_id;

  DELETE FROM clients WHERE id = drop_id;
END;
$$;
