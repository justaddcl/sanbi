CREATE TABLE IF NOT EXISTS "sanbi_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(256) NOT NULL,
	"lastName" varchar(256),
	"email" varchar(256) NOT NULL,
	CONSTRAINT "sanbi_user_email_unique" UNIQUE("email")
);
