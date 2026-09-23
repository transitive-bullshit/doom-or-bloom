ALTER TABLE "assessments" DROP CONSTRAINT "assessment_lifecycle";--> statement-breakpoint
ALTER TABLE "assessments" DROP CONSTRAINT "assessment_visibility";--> statement-breakpoint
ALTER TABLE "assessments" DROP COLUMN "lifecycle";--> statement-breakpoint
CREATE OR REPLACE FUNCTION validate_assessment_pointers() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a assessments;
BEGIN
  SELECT * INTO a FROM assessments WHERE id = NEW.id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_snapshots s WHERE s.id = a.current_snapshot_id AND s.assessment_id = a.id AND s.revision = a.revision) THEN
    RAISE EXCEPTION 'Assessment head revision must match its snapshot';
  END IF;
  IF a.visibility = 'public' AND a.final_snapshot_id IS DISTINCT FROM a.current_snapshot_id THEN
    RAISE EXCEPTION 'Published assessment must freeze its head';
  END IF;
  IF a.visibility = 'public' AND NOT EXISTS (SELECT 1 FROM assessment_snapshots s WHERE s.id = a.final_snapshot_id AND s.has_result) THEN
    RAISE EXCEPTION 'Public assessment requires a result';
  END IF;
  IF EXISTS (SELECT 1 FROM personas p WHERE p.selected_assessment_id = a.id) AND (a.visibility <> 'public' OR a.origin <> 'simulation') THEN
    RAISE EXCEPTION 'Selected persona requires a public simulation';
  END IF;
  RETURN NULL;
END $$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION validate_persona_selection() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p personas;
BEGIN
  SELECT * INTO p FROM personas WHERE id = NEW.id;
  IF p.selected_assessment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = p.selected_assessment_id AND a.persona_id = p.id
    AND a.origin = 'simulation' AND a.visibility = 'public'
  ) THEN RAISE EXCEPTION 'Invalid selected persona assessment'; END IF;
  RETURN NULL;
END $$;

--> statement-breakpoint
UPDATE assessments SET final_snapshot_id = NULL WHERE visibility = 'private';
--> statement-breakpoint
-- Correct the result index for legacy background projections; payloads stay immutable.
ALTER TABLE assessment_snapshots DISABLE TRIGGER immutable_snapshot;
--> statement-breakpoint
UPDATE assessment_snapshots s SET has_result = false
FROM assessments a WHERE a.id = s.assessment_id AND a.origin = 'participant'
AND COALESCE(s.payload->>'status', '') NOT IN ('results', 'completed', 'capped');
--> statement-breakpoint
SET CONSTRAINTS ALL IMMEDIATE;
--> statement-breakpoint
ALTER TABLE assessment_snapshots ENABLE TRIGGER immutable_snapshot;
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessment_visibility" CHECK ("assessments"."visibility" in ('private', 'public') and (("assessments"."visibility" = 'public') = ("assessments"."final_snapshot_id" is not null)));