ALTER TABLE "sanbi_songs" ADD COLUMN "organization_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_songs" ADD CONSTRAINT "sanbi_songs_organization_id_sanbi_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."sanbi_organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
