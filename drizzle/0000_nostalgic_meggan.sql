DO $$ BEGIN
 CREATE TYPE "public"."member_permission_types" AS ENUM('admin', 'owner', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."song_keys" AS ENUM('c', 'c_sharp', 'd_flat', 'd', 'd_sharp', 'e_flat', 'e', 'f', 'f_sharp', 'g_flat', 'g', 'g_sharp', 'a_flat', 'a', 'a_sharp', 'b_flat', 'b');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_event_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" varchar NOT NULL,
	CONSTRAINT "sanbi_event_types_event_unique" UNIQUE("event")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_organization_memberships" (
	"organization_id" uuid,
	"user_id" uuid,
	"membership_permission_type" "member_permission_types" NOT NULL,
	CONSTRAINT "sanbi_organization_memberships_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar,
	CONSTRAINT "sanbi_organizations_name_unique" UNIQUE("name"),
	CONSTRAINT "sanbi_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_section_songs" (
	"set_section_id" uuid,
	"song_id" uuid,
	"position" integer NOT NULL,
	CONSTRAINT "sanbi_set_section_songs_set_section_id_song_id_pk" PRIMARY KEY("set_section_id","song_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_section_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar NOT NULL,
	CONSTRAINT "sanbi_set_section_types_section_unique" UNIQUE("section")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"section_type_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type_id" uuid NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"organization_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_song_tags" (
	"song_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "sanbi_song_tags_song_id_tag_id_pk" PRIMARY KEY("song_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"song_key" "song_keys",
	"notes" text,
	"tempo" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "sanbi_songs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag" varchar(256) NOT NULL,
	CONSTRAINT "sanbi_tags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(256) NOT NULL,
	"lastName" varchar(256),
	"email" varchar(256) NOT NULL,
	CONSTRAINT "sanbi_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_organization_memberships" ADD CONSTRAINT "sanbi_organization_memberships_organization_id_sanbi_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."sanbi_organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_organization_memberships" ADD CONSTRAINT "sanbi_organization_memberships_user_id_sanbi_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sanbi_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_set_section_songs" ADD CONSTRAINT "sanbi_set_section_songs_set_section_id_sanbi_set_sections_id_fk" FOREIGN KEY ("set_section_id") REFERENCES "public"."sanbi_set_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_set_section_songs" ADD CONSTRAINT "sanbi_set_section_songs_song_id_sanbi_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."sanbi_songs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_set_sections" ADD CONSTRAINT "sanbi_set_sections_set_id_sanbi_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sanbi_sets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_set_sections" ADD CONSTRAINT "sanbi_set_sections_section_type_id_sanbi_set_section_types_id_fk" FOREIGN KEY ("section_type_id") REFERENCES "public"."sanbi_set_section_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_sets" ADD CONSTRAINT "sanbi_sets_event_type_id_sanbi_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."sanbi_event_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_sets" ADD CONSTRAINT "sanbi_sets_organization_id_sanbi_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."sanbi_organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_song_tags" ADD CONSTRAINT "sanbi_song_tags_song_id_sanbi_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."sanbi_songs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_song_tags" ADD CONSTRAINT "sanbi_song_tags_tag_id_sanbi_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."sanbi_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_songs" ADD CONSTRAINT "sanbi_songs_user_id_sanbi_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sanbi_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_songs" ADD CONSTRAINT "sanbi_songs_organization_id_sanbi_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."sanbi_organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_name_idx" ON "sanbi_organizations" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "set_sections_set_id_idx" ON "sanbi_set_sections" ("set_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "songs_organisation_id_idx" ON "sanbi_songs" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "sanbi_users" ("email");