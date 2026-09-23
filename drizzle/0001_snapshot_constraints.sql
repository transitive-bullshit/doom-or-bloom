-- Deferred pointers allow the assessment and its first snapshot to be created atomically.
ALTER TABLE assessments ADD CONSTRAINT assessment_current_snapshot
  FOREIGN KEY (id, current_snapshot_id) REFERENCES assessment_snapshots(assessment_id, id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE assessments ADD CONSTRAINT assessment_final_snapshot
  FOREIGN KEY (id, final_snapshot_id) REFERENCES assessment_snapshots(assessment_id, id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE assessments ADD CONSTRAINT assessment_source_snapshot
  FOREIGN KEY (source_snapshot_id) REFERENCES assessment_snapshots(id) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE assessment_operations ADD CONSTRAINT operation_base_snapshot
  FOREIGN KEY (assessment_id, base_snapshot_id) REFERENCES assessment_snapshots(assessment_id, id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE assessment_operations ADD CONSTRAINT operation_result_snapshot
  FOREIGN KEY (assessment_id, resulting_snapshot_id) REFERENCES assessment_snapshots(assessment_id, id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE assessment_snapshots ADD CONSTRAINT snapshot_operation
  FOREIGN KEY (assessment_id, operation_id) REFERENCES assessment_operations(assessment_id, id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE personas ADD CONSTRAINT persona_selected_assessment
  FOREIGN KEY (selected_assessment_id, id) REFERENCES assessments(id, persona_id)
  DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
CREATE FUNCTION reject_snapshot_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Assessment snapshots are immutable';
END $$;
--> statement-breakpoint
CREATE TRIGGER immutable_snapshot BEFORE UPDATE ON assessment_snapshots
  FOR EACH ROW EXECUTE FUNCTION reject_snapshot_update();
--> statement-breakpoint
CREATE FUNCTION validate_assessment_pointers() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a assessments;
BEGIN
  SELECT * INTO a FROM assessments WHERE id = NEW.id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM assessment_snapshots s WHERE s.id = a.current_snapshot_id AND s.assessment_id = a.id AND s.revision = a.revision) THEN
    RAISE EXCEPTION 'Assessment head revision must match its snapshot';
  END IF;
  IF a.lifecycle = 'completed' AND a.final_snapshot_id IS DISTINCT FROM a.current_snapshot_id THEN
    RAISE EXCEPTION 'Completed assessment must freeze its head';
  END IF;
  IF a.visibility = 'public' AND NOT EXISTS (SELECT 1 FROM assessment_snapshots s WHERE s.id = a.final_snapshot_id AND s.has_result) THEN
    RAISE EXCEPTION 'Public assessment requires a result';
  END IF;
  IF EXISTS (SELECT 1 FROM personas p WHERE p.selected_assessment_id = a.id) AND (a.lifecycle <> 'completed' OR a.visibility <> 'public' OR a.origin <> 'simulation') THEN
    RAISE EXCEPTION 'Selected persona requires a completed public simulation';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER valid_assessment_pointers AFTER INSERT OR UPDATE ON assessments
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_assessment_pointers();
--> statement-breakpoint
CREATE FUNCTION validate_persona_selection() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p personas;
BEGIN
  SELECT * INTO p FROM personas WHERE id = NEW.id;
  IF p.selected_assessment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = p.selected_assessment_id AND a.persona_id = p.id
    AND a.origin = 'simulation' AND a.lifecycle = 'completed' AND a.visibility = 'public'
  ) THEN RAISE EXCEPTION 'Invalid selected persona assessment'; END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER valid_persona_selection AFTER INSERT OR UPDATE ON personas
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_persona_selection();
