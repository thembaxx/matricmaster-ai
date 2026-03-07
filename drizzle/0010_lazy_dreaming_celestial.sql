ALTER TABLE "past_papers" ADD COLUMN "markdown_file_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_completed_onboarding" boolean DEFAULT false NOT NULL;