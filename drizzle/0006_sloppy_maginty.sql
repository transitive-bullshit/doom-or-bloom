DROP INDEX "assessment_owner_library";--> statement-breakpoint
CREATE INDEX "operation_retry_of" ON "assessment_operations" USING btree ("retry_of");--> statement-breakpoint
CREATE INDEX "assessment_source_assessment" ON "assessments" USING btree ("source_assessment_id");--> statement-breakpoint
CREATE INDEX "assessment_source_snapshot" ON "assessments" USING btree ("source_snapshot_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "assessment_owner_library" ON "assessments" USING btree ("owner_id","created_at");