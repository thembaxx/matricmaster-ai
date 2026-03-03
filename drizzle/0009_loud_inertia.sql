ALTER TABLE "user_progress" ADD COLUMN "best_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "streak_freezes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_login_bonus_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "consecutive_login_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "total_login_bonuses_claimed" integer DEFAULT 0 NOT NULL;