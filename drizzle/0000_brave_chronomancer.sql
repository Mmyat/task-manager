CREATE TYPE "public"."todo_priority" AS ENUM('High', 'Medium', 'Low');--> statement-breakpoint
CREATE TYPE "public"."todo_status" AS ENUM('Pending', 'InProgress', 'Completed', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'user', 'guest');--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "todo_status" DEFAULT 'Pending' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"priority" "todo_priority" DEFAULT 'Low' NOT NULL,
	"assigned_to_user_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"category" varchar(50),
	"attachment_url" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"profile_picture" varchar(2048),
	"bio" text
);
--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "todos_status_idx" ON "todos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "todos_priority_idx" ON "todos" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "todos_assigned_to_idx" ON "todos" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "todos_created_by_idx" ON "todos" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "todos_due_date_idx" ON "todos" USING btree ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique_idx" ON "users" USING btree (lower("username"));