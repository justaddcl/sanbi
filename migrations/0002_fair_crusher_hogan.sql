DO $$ BEGIN
 CREATE TYPE "public"."member_permission_types" AS ENUM('admin', 'owner', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_event_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" varchar NOT NULL,
	CONSTRAINT "sanbi_event_types_event_unique" UNIQUE("event")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_organization_memberships" (
	"organization_id" integer,
	"user_id" integer,
	"membership_permission_type" "member_permission_types" NOT NULL,
	CONSTRAINT "sanbi_organization_memberships_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar,
	CONSTRAINT "sanbi_organizations_name_unique" UNIQUE("name"),
	CONSTRAINT "sanbi_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_section_songs" (
	"set_section_id" integer,
	"song_id" integer,
	"position" integer NOT NULL,
	CONSTRAINT "sanbi_set_section_songs_set_section_id_song_id_pk" PRIMARY KEY("set_section_id","song_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_section_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" varchar NOT NULL,
	CONSTRAINT "sanbi_set_section_types_section_unique" UNIQUE("section")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_set_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"set_id" integer NOT NULL,
	"position" integer NOT NULL,
	"section_type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type_id" integer,
	"date" date NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_song_tags" (
	"song_id" integer,
	"tag_id" integer,
	CONSTRAINT "sanbi_song_tags_song_id_tag_id_pk" PRIMARY KEY("song_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(256) NOT NULL,
	CONSTRAINT "sanbi_tags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
ALTER TABLE "sanbi_song" RENAME TO "sanbi_songs";--> statement-breakpoint
ALTER TABLE "sanbi_user" RENAME TO "sanbi_users";--> statement-breakpoint
ALTER TABLE "sanbi_songs" RENAME COLUMN "key" TO "song_key";--> statement-breakpoint
ALTER TABLE "sanbi_users" DROP CONSTRAINT "sanbi_user_email_unique";--> statement-breakpoint
ALTER TABLE "sanbi_songs" DROP CONSTRAINT "sanbi_song_user_id_sanbi_user_id_fk";
--> statement-breakpoint
ALTER TABLE "sanbi_songs" ADD COLUMN "tempo" varchar(256);--> statement-breakpoint
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
ALTER TABLE "sanbi_songs" ADD CONSTRAINT "sanbi_songs_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "sanbi_users" ADD CONSTRAINT "sanbi_users_email_unique" UNIQUE("email");