CREATE TABLE "share_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"evidence_revision" integer NOT NULL,
	"card" jsonb NOT NULL,
	"comparison" jsonb NOT NULL,
	"sharer_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "share_snapshot_id" CHECK ("share_snapshots"."id" ~ '^[A-Za-z0-9_-]{16}$'),
	CONSTRAINT "share_snapshot_name" CHECK ("share_snapshots"."sharer_name" is null or char_length("share_snapshots"."sharer_name") between 1 and 40),
	CONSTRAINT "share_snapshot_revision" CHECK ("share_snapshots"."evidence_revision" >= 0)
);
--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshots_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshot_snapshot" FOREIGN KEY ("assessment_id","snapshot_id") REFERENCES "public"."assessment_snapshots"("assessment_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_snapshot_assessment" ON "share_snapshots" USING btree ("assessment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_share_snapshot" ON "share_snapshots" USING btree ("assessment_id","evidence_revision") WHERE "share_snapshots"."revoked_at" is null;