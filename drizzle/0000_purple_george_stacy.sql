CREATE TABLE "assessment_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"request_key" text NOT NULL,
	"fingerprint" text NOT NULL,
	"action" jsonb NOT NULL,
	"base_snapshot_id" uuid NOT NULL,
	"base_revision" integer NOT NULL,
	"versions" jsonb NOT NULL,
	"status" text NOT NULL,
	"resulting_snapshot_id" uuid,
	"retry_of" uuid,
	"deadline" timestamp with time zone NOT NULL,
	"physical_request_count" integer DEFAULT 0 NOT NULL,
	"diagnostics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"failure_category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operation_request_key" UNIQUE("assessment_id","request_key"),
	CONSTRAINT "operation_membership" UNIQUE("assessment_id","id"),
	CONSTRAINT "operation_status" CHECK ("assessment_operations"."status" in ('running', 'succeeded', 'failed', 'interrupted') and (("assessment_operations"."status" = 'succeeded') = ("assessment_operations"."resulting_snapshot_id" is not null)))
);
--> statement-breakpoint
CREATE TABLE "assessment_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"format" text NOT NULL,
	"payload" jsonb NOT NULL,
	"digest" text NOT NULL,
	"evidence_revision" integer,
	"operation_id" uuid,
	"has_result" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapshot_revision" UNIQUE("assessment_id","revision"),
	CONSTRAINT "snapshot_membership" UNIQUE("assessment_id","id"),
	CONSTRAINT "snapshot_revision_nonnegative" CHECK ("assessment_snapshots"."revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"title" text,
	"origin" text DEFAULT 'participant' NOT NULL,
	"persona_id" uuid,
	"lifecycle" text DEFAULT 'open' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"current_snapshot_id" uuid NOT NULL,
	"final_snapshot_id" uuid,
	"source_assessment_id" uuid,
	"source_snapshot_id" uuid,
	"is_fork" boolean DEFAULT false NOT NULL,
	"inherited_prompt_count" integer DEFAULT 0 NOT NULL,
	"prompt_ceiling" integer DEFAULT 12 NOT NULL,
	"versions" jsonb NOT NULL,
	"create_request_key" text NOT NULL,
	"create_fingerprint" text NOT NULL,
	"seed_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessments_seed_key_unique" UNIQUE("seed_key"),
	CONSTRAINT "assessment_creation_key" UNIQUE("owner_id","create_request_key"),
	CONSTRAINT "assessment_persona_membership" UNIQUE("id","persona_id"),
	CONSTRAINT "assessment_lifecycle" CHECK ("assessments"."lifecycle" in ('open', 'completed') and (("assessments"."lifecycle" = 'completed') = ("assessments"."final_snapshot_id" is not null))),
	CONSTRAINT "assessment_visibility" CHECK ("assessments"."visibility" in ('private', 'public') and ("assessments"."visibility" = 'private' or "assessments"."lifecycle" = 'completed')),
	CONSTRAINT "assessment_origin" CHECK (("assessments"."origin" = 'participant' and "assessments"."persona_id" is null) or ("assessments"."origin" = 'simulation' and "assessments"."persona_id" is not null)),
	CONSTRAINT "assessment_budget" CHECK ("assessments"."inherited_prompt_count" >= 0 and "assessments"."prompt_ceiling" between 1 and 30 and "assessments"."inherited_prompt_count" <= "assessments"."prompt_ceiling")
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"portrait" text,
	"metadata" jsonb NOT NULL,
	"source_brief" jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"selected_assessment_id" uuid,
	"selected_generation" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_operations" ADD CONSTRAINT "assessment_operations_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_operations" ADD CONSTRAINT "assessment_operations_retry_of_assessment_operations_id_fk" FOREIGN KEY ("retry_of") REFERENCES "public"."assessment_operations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_snapshots" ADD CONSTRAINT "assessment_snapshots_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_source_assessment_id_assessments_id_fk" FOREIGN KEY ("source_assessment_id") REFERENCES "public"."assessments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_running_operation" ON "assessment_operations" USING btree ("assessment_id") WHERE "assessment_operations"."status" = 'running';--> statement-breakpoint
CREATE INDEX "assessment_owner_library" ON "assessments" USING btree ("owner_id","updated_at");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");