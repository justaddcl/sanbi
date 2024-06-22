DO $$ BEGIN
 CREATE TYPE "public"."song_key" AS ENUM('c', 'c_sharp', 'd_flat', 'd', 'd_sharp', 'e_flat', 'e', 'f', 'f_sharp', 'g_flat', 'g', 'g_sharp', 'a_flat', 'a', 'a_sharp', 'b_flat', 'b');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanbi_song" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"key" "song_key",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" integer NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sanbi_song" ADD CONSTRAINT "sanbi_song_user_id_sanbi_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sanbi_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
