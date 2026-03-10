CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"study_reminders" boolean DEFAULT true NOT NULL,
	"achievement_alerts" boolean DEFAULT true NOT NULL,
	"profile_visibility" boolean DEFAULT true NOT NULL,
	"show_on_leaderboard" boolean DEFAULT true NOT NULL,
	"analytics_tracking" boolean DEFAULT true NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"theme" varchar(20) DEFAULT 'system' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");