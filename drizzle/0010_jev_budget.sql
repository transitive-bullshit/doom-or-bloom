CREATE TABLE "jev_provider_status" (
	"provider" text PRIMARY KEY NOT NULL,
	"out_of_credits_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jev_spend" (
	"period" text NOT NULL,
	"period_start" date NOT NULL,
	"input_tokens" bigint DEFAULT 0 NOT NULL,
	"output_tokens" bigint DEFAULT 0 NOT NULL,
	"cost_nano_usd" bigint DEFAULT 0 NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jev_spend_pk" PRIMARY KEY("period","period_start"),
	CONSTRAINT "jev_spend_period" CHECK ("jev_spend"."period" in ('day', 'month')),
	CONSTRAINT "jev_spend_nonnegative" CHECK ("jev_spend"."input_tokens" >= 0 and "jev_spend"."output_tokens" >= 0 and "jev_spend"."cost_nano_usd" >= 0 and "jev_spend"."requests" >= 0)
);
