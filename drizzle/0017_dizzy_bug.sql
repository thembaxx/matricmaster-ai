CREATE TABLE "content_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"child_age" integer,
	"allowed_levels" text DEFAULT 'grade10,grade11,grade12' NOT NULL,
	"strict_mode" boolean DEFAULT false NOT NULL,
	"show_advanced_option" boolean DEFAULT true NOT NULL,
	"override_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"device_name" varchar(100) NOT NULL,
	"device_type" varchar(20) DEFAULT 'desktop' NOT NULL,
	"last_active_at" timestamp DEFAULT now(),
	"is_current_device" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_retries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"payment_id" uuid,
	"plan_id" varchar(50) NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"old_subscription_id" uuid,
	"new_plan_id" varchar(50) NOT NULL,
	"old_plan_id" varchar(50),
	"proration_credit" integer DEFAULT 0,
	"old_plan_price" numeric(10, 2),
	"new_plan_price" numeric(10, 2),
	"remaining_days" integer DEFAULT 0,
	"change_date" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "sync_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"action" varchar(10) NOT NULL,
	"data" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "subject_metadata" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subject_metadata" CASCADE;--> statement-breakpoint
ALTER TABLE "past_paper_questions" DROP CONSTRAINT "past_paper_questions_paper_id_past_papers_id_fk";
--> statement-breakpoint
DROP INDEX "study_buddies_unique";--> statement-breakpoint
DROP INDEX "whatsapp_prefs_phone_idx";--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "topic_mastery" ALTER COLUMN "subject_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "past_paper_questions" ADD COLUMN "content_level" varchar(20) DEFAULT 'grade12' NOT NULL;--> statement-breakpoint
ALTER TABLE "past_paper_questions" ADD COLUMN "age_rating" varchar(20) DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD COLUMN "subject" varchar(50) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD COLUMN "source" varchar(20) DEFAULT 'quiz';--> statement-breakpoint
ALTER TABLE "question_attempts" ADD COLUMN "past_paper_id" uuid;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD COLUMN "confidence_level" varchar(10);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "age_rating" varchar(20) DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD COLUMN "question_results" text;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD COLUMN "source" varchar(20) DEFAULT 'quiz';--> statement-breakpoint
ALTER TABLE "quiz_results" ADD COLUMN "is_review_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "slug" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "display_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "fluent_emoji" varchar(50);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "img_src" text;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "color" varchar(50);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "bg_color" varchar(50);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "icon" varchar(50);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "font_family" varchar(100);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "gradient_primary" varchar(20);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "gradient_secondary" varchar(20);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "gradient_accent" varchar(20);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "is_supported" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" text DEFAULT 'Africa/Johannesburg' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "timezone" varchar(50) DEFAULT 'Africa/Johannesburg' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_filters" ADD CONSTRAINT "content_filters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_retries" ADD CONSTRAINT "payment_retries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_retries" ADD CONSTRAINT "payment_retries_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_retries" ADD CONSTRAINT "payment_retries_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_old_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("old_subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_new_plan_id_subscription_plans_id_fk" FOREIGN KEY ("new_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_old_plan_id_subscription_plans_id_fk" FOREIGN KEY ("old_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_filters_user_id_idx" ON "content_filters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "devices_user_id_idx" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "devices_device_id_idx" ON "devices" USING btree ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_unique_user_device" ON "devices" USING btree ("user_id","device_id");--> statement-breakpoint
CREATE INDEX "payment_retries_user_id_idx" ON "payment_retries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_retries_status_idx" ON "payment_retries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_retries_next_retry_at_idx" ON "payment_retries" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");--> statement-breakpoint
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "subscription_changes_user_id_idx" ON "subscription_changes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_changes_status_idx" ON "subscription_changes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_changes_old_sub_id_idx" ON "subscription_changes" USING btree ("old_subscription_id");--> statement-breakpoint
CREATE INDEX "sync_queue_user_id_idx" ON "sync_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_queue_entity_idx" ON "sync_queue" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "sync_queue_processed_idx" ON "sync_queue" USING btree ("processed");--> statement-breakpoint
ALTER TABLE "past_paper_questions" ADD CONSTRAINT "past_paper_questions_paper_id_past_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."past_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_past_paper_id_past_papers_id_fk" FOREIGN KEY ("past_paper_id") REFERENCES "public"."past_papers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "buddy_requests_reverse_unique" ON "buddy_requests" USING btree ("to_user_id","from_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "energy_sessions_user_date_unique" ON "energy_sessions" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "options_question_letter_unique" ON "options" USING btree ("question_id","option_letter");--> statement-breakpoint
CREATE INDEX "question_attempts_source_idx" ON "question_attempts" USING btree ("source");--> statement-breakpoint
CREATE INDEX "question_attempts_past_paper_id_idx" ON "question_attempts" USING btree ("past_paper_id");--> statement-breakpoint
CREATE INDEX "question_attempts_subject_idx" ON "question_attempts" USING btree ("subject");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_results_user_quiz_unique" ON "quiz_results" USING btree ("user_id","quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_buddies_unique_1" ON "study_buddies" USING btree ("user_id_1","user_id_2");--> statement-breakpoint
CREATE UNIQUE INDEX "study_buddies_unique_2" ON "study_buddies" USING btree ("user_id_2","user_id_1");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_mastery_user_subject_topic" ON "topic_mastery" USING btree ("user_id","subject_id","topic");--> statement-breakpoint
CREATE UNIQUE INDEX "user_progress_user_subject_topic" ON "user_progress" USING btree ("user_id","subject_id","topic");--> statement-breakpoint
CREATE UNIQUE INDEX "whatsapp_preferences_phone_unique" ON "whatsapp_preferences" USING btree ("phone_number");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_slug_unique" UNIQUE("slug");