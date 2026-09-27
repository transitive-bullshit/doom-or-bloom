CREATE TABLE "assessment_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"evidence_revision" integer NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"algorithm_version" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_kind_revision" UNIQUE("assessment_id","kind","evidence_revision"),
	CONSTRAINT "feedback_kind" CHECK ("assessment_feedback"."kind" in ('self_placement', 'agreement')),
	CONSTRAINT "feedback_revision_nonnegative" CHECK ("assessment_feedback"."evidence_revision" >= 0)
);
--> statement-breakpoint
ALTER TABLE "assessment_feedback" ADD CONSTRAINT "assessment_feedback_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_feedback" ADD CONSTRAINT "feedback_snapshot" FOREIGN KEY ("assessment_id","snapshot_id") REFERENCES "public"."assessment_snapshots"("assessment_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_created_at" ON "assessment_feedback" USING btree ("created_at");