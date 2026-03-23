CREATE TABLE "accessibility_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"high_contrast" boolean DEFAULT false NOT NULL,
	"text_size" numeric(3, 2) DEFAULT '1' NOT NULL,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"color_blind_mode" varchar(20) DEFAULT 'none' NOT NULL,
	"simplified_language" boolean DEFAULT false NOT NULL,
	"tts_enabled" boolean DEFAULT false NOT NULL,
	"larger_targets" boolean DEFAULT false NOT NULL,
	"keyboard_navigation" boolean DEFAULT false NOT NULL,
	"chunked_content" boolean DEFAULT false NOT NULL,
	"progress_breadcrumbs" boolean DEFAULT true NOT NULL,
	"one_thing_at_a_time" boolean DEFAULT false NOT NULL,
	"skip_links" boolean DEFAULT true NOT NULL,
	"hold_to_click" boolean DEFAULT false NOT NULL,
	"focus_indicators" boolean DEFAULT true NOT NULL,
	"visual_sound_indicators" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "classic_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(100) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"question_pattern" text NOT NULL,
	"similarity_score" numeric(5, 2) NOT NULL,
	"appearance_years" text NOT NULL,
	"average_marks" integer DEFAULT 0 NOT NULL,
	"typical_difficulty" varchar(20) DEFAULT 'medium' NOT NULL,
	"variations" text,
	"is_caps_valid" boolean DEFAULT true NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "downloaded_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bundle_id" varchar(100) NOT NULL,
	"subject" varchar(50) NOT NULL,
	"version" varchar(20) NOT NULL,
	"bundle_type" varchar(30) DEFAULT 'questions_only' NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"size_bytes" bigint DEFAULT 0 NOT NULL,
	"topics" text[],
	"downloaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edge_case_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"edge_case_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"metadata" text,
	"context" text,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolution" text,
	"resolved_by" text,
	"action_taken" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "energy_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hour" integer NOT NULL,
	"average_energy" numeric(5, 2) NOT NULL,
	"sample_size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "energy_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"energy_level" integer NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(100) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"subtopic" varchar(200),
	"probability" numeric(5, 2) NOT NULL,
	"academic_year" integer NOT NULL,
	"frequency" numeric(5, 2) DEFAULT '0' NOT NULL,
	"recency" numeric(5, 2) DEFAULT '0' NOT NULL,
	"difficulty_alignment" numeric(5, 2) DEFAULT '0' NOT NULL,
	"marker_bias" numeric(5, 2) DEFAULT '0' NOT NULL,
	"confidence" varchar(20) DEFAULT 'medium' NOT NULL,
	"predicted_questions" text,
	"historical_appearances" integer DEFAULT 0 NOT NULL,
	"marks_weight" integer DEFAULT 0 NOT NULL,
	"is_hot_topic" boolean DEFAULT false NOT NULL,
	"curriculum_change_warning" boolean DEFAULT false NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prediction_accuracy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"subject" varchar(100) NOT NULL,
	"academic_year" integer NOT NULL,
	"predicted_topics" text NOT NULL,
	"actual_topics" text NOT NULL,
	"correct_predictions" integer DEFAULT 0 NOT NULL,
	"total_predictions" integer DEFAULT 0 NOT NULL,
	"accuracy" numeric(5, 2) DEFAULT '0' NOT NULL,
	"predicted_questions_count" integer DEFAULT 0 NOT NULL,
	"actual_questions_count" integer DEFAULT 0 NOT NULL,
	"feedback" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" varchar(50) NOT NULL,
	"details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topic_frequency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(100) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"year" integer NOT NULL,
	"appearance_count" integer DEFAULT 1 NOT NULL,
	"total_marks" integer DEFAULT 0 NOT NULL,
	"difficulty_distribution" text,
	"question_types" text,
	"question_patterns" text,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"teaching_style" text,
	"subjects" text[] DEFAULT '{}' NOT NULL,
	"hourly_rate_xp" integer DEFAULT 100 NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"availability_schedule" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tutor_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tutor_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"tutor_id" text NOT NULL,
	"student_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutoring_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" text NOT NULL,
	"student_id" text NOT NULL,
	"subject" varchar(100) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"xp_paid" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"room_url" text,
	"student_confirmed" boolean DEFAULT false NOT NULL,
	"tutor_confirmed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wellness_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mood_before" integer NOT NULL,
	"mood_after" integer,
	"session_duration" integer NOT NULL,
	"suggestions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_opted_in" boolean DEFAULT true NOT NULL,
	"verification_code" varchar(10),
	"verification_expires" timestamp,
	"notification_types" text[] DEFAULT '{}' NOT NULL,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"reminder_frequency" varchar(20) DEFAULT 'daily' NOT NULL,
	"reminder_time" varchar(5) DEFAULT '09:00' NOT NULL,
	"reminder_days" varchar(20),
	"last_message_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "source_type" varchar(20) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "source_question_id" varchar(100);--> statement-breakpoint
ALTER TABLE "accessibility_preferences" ADD CONSTRAINT "accessibility_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloaded_bundles" ADD CONSTRAINT "downloaded_bundles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_case_events" ADD CONSTRAINT "edge_case_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_case_events" ADD CONSTRAINT "edge_case_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_patterns" ADD CONSTRAINT "energy_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_sessions" ADD CONSTRAINT "energy_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_accuracy" ADD CONSTRAINT "prediction_accuracy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_session_id_tutoring_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tutoring_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_reviews" ADD CONSTRAINT "tutor_reviews_session_id_tutoring_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tutoring_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_reviews" ADD CONSTRAINT "tutor_reviews_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_reviews" ADD CONSTRAINT "tutor_reviews_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_check_ins" ADD CONSTRAINT "wellness_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_preferences" ADD CONSTRAINT "whatsapp_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accessibility_preferences_user_id_idx" ON "accessibility_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "classic_questions_subject_topic_idx" ON "classic_questions" USING btree ("subject","topic");--> statement-breakpoint
CREATE INDEX "classic_questions_similarity_idx" ON "classic_questions" USING btree ("similarity_score");--> statement-breakpoint
CREATE INDEX "downloaded_bundles_user_id_idx" ON "downloaded_bundles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "downloaded_bundles_bundle_id_idx" ON "downloaded_bundles" USING btree ("bundle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "downloaded_bundles_unique" ON "downloaded_bundles" USING btree ("user_id","bundle_id");--> statement-breakpoint
CREATE INDEX "edge_case_events_user_id_idx" ON "edge_case_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edge_case_events_type_idx" ON "edge_case_events" USING btree ("edge_case_type");--> statement-breakpoint
CREATE INDEX "edge_case_events_severity_idx" ON "edge_case_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "edge_case_events_triggered_at_idx" ON "edge_case_events" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX "edge_case_events_user_type_idx" ON "edge_case_events" USING btree ("user_id","edge_case_type");--> statement-breakpoint
CREATE INDEX "energy_patterns_user_hour_idx" ON "energy_patterns" USING btree ("user_id","hour");--> statement-breakpoint
CREATE UNIQUE INDEX "energy_patterns_unique" ON "energy_patterns" USING btree ("user_id","hour");--> statement-breakpoint
CREATE INDEX "energy_sessions_user_id_idx" ON "energy_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "energy_sessions_date_idx" ON "energy_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "exam_predictions_subject_year_idx" ON "exam_predictions" USING btree ("subject","academic_year");--> statement-breakpoint
CREATE INDEX "exam_predictions_probability_idx" ON "exam_predictions" USING btree ("probability");--> statement-breakpoint
CREATE INDEX "exam_predictions_hot_topic_idx" ON "exam_predictions" USING btree ("is_hot_topic");--> statement-breakpoint
CREATE INDEX "prediction_accuracy_user_id_idx" ON "prediction_accuracy" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prediction_accuracy_subject_year_idx" ON "prediction_accuracy" USING btree ("subject","academic_year");--> statement-breakpoint
CREATE INDEX "session_reports_session_idx" ON "session_reports" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_reports_reporter_idx" ON "session_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "session_reports_status_idx" ON "session_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topic_frequency_subject_topic_year_idx" ON "topic_frequency" USING btree ("subject","topic","year");--> statement-breakpoint
CREATE INDEX "topic_frequency_subject_year_idx" ON "topic_frequency" USING btree ("subject","year");--> statement-breakpoint
CREATE INDEX "tutor_profiles_user_id_idx" ON "tutor_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tutor_profiles_available_idx" ON "tutor_profiles" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "tutor_profiles_rating_idx" ON "tutor_profiles" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "tutor_reviews_session_idx" ON "tutor_reviews" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "tutor_reviews_tutor_idx" ON "tutor_reviews" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_reviews_student_idx" ON "tutor_reviews" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "tutoring_sessions_tutor_idx" ON "tutoring_sessions" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutoring_sessions_student_idx" ON "tutoring_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "tutoring_sessions_scheduled_idx" ON "tutoring_sessions" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "tutoring_sessions_status_idx" ON "tutoring_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wellness_check_ins_user_id_idx" ON "wellness_check_ins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wellness_check_ins_created_at_idx" ON "wellness_check_ins" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "whatsapp_prefs_phone_idx" ON "whatsapp_preferences" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "whatsapp_prefs_verified_idx" ON "whatsapp_preferences" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "flashcards_source_type_idx" ON "flashcards" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "flashcards_source_question_id_idx" ON "flashcards" USING btree ("source_question_id");