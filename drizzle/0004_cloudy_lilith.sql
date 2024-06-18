CREATE UNIQUE INDEX IF NOT EXISTS "organizations_name_idx" ON "sanbi_organizations" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "set_sections_set_id_idx" ON "sanbi_set_sections" ("set_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "songs_organisation_id_idx" ON "sanbi_songs" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "sanbi_users" ("email");