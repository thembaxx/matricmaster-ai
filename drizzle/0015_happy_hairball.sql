CREATE TABLE "achievement_definitions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"icon_bg" varchar(20),
	"category" varchar(20) NOT NULL,
	"requirement_type" varchar(30) NOT NULL,
	"requirement_value" integer NOT NULL,
	"requirement_subject_id" bigint,
	"points" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"subject" varchar(50) DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aps_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"university_target_id" uuid,
	"title" varchar(200) NOT NULL,
	"description" text,
	"subject" varchar(50),
	"topic" varchar(100),
	"aps_potential_points" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coop_focus_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_code" varchar(20) NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"member_count" integer DEFAULT 1 NOT NULL,
	"total_minutes" integer DEFAULT 0 NOT NULL,
	"multiplier" numeric(3, 2) DEFAULT '1.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coop_session_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"minutes_studied" integer DEFAULT 0 NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"multiplier_applied" numeric(3, 2) DEFAULT '1.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"challenge_type" varchar(20) NOT NULL,
	"target" integer NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"badge_id" varchar(50),
	"expires_at" timestamp NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_claimed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_config" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "past_paper_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paper_id" uuid,
	"question_text" text NOT NULL,
	"answer_text" text,
	"year" integer NOT NULL,
	"subject" varchar(100) NOT NULL,
	"paper" varchar(20),
	"month" varchar(20),
	"topic" varchar(200),
	"marks" integer,
	"question_number" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reward_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" text NOT NULL,
	"student_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"reward" varchar(500) NOT NULL,
	"target_streak_days" integer DEFAULT 0 NOT NULL,
	"target_quiz_count" integer DEFAULT 0 NOT NULL,
	"target_quiz_percentage" integer DEFAULT 0 NOT NULL,
	"current_streak_days" integer DEFAULT 0 NOT NULL,
	"current_quiz_count" integer DEFAULT 0 NOT NULL,
	"current_quiz_percentage" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subject_metadata" (
	"subject_id" varchar(50) PRIMARY KEY NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"emoji" varchar(10),
	"color" varchar(50),
	"bg_color" varchar(50),
	"icon" varchar(50),
	"fluent_emoji" varchar(50),
	"font_family" varchar(100),
	"gradient_primary" varchar(20),
	"gradient_secondary" varchar(20),
	"gradient_accent" varchar(20),
	"is_supported" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_goal_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"contribution" integer DEFAULT 0 NOT NULL,
	"has_claimed_reward" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"goal_type" varchar(20) NOT NULL,
	"target" integer NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"xp_reward" integer DEFAULT 100 NOT NULL,
	"max_members" integer DEFAULT 10 NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"end_date" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topic_weightages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(50) NOT NULL,
	"topic" varchar(100) NOT NULL,
	"weightage_percent" integer NOT NULL,
	"exam_paper" varchar(20),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "university_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"university_name" varchar(100) NOT NULL,
	"faculty" varchar(100) NOT NULL,
	"target_aps" integer NOT NULL,
	"required_subjects" text,
	"recommended_study_path" text,
	"roadmap_generated_at" timestamp,
	"last_milestone_id" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_aps_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject" varchar(50) NOT NULL,
	"current_grade" varchar(2) NOT NULL,
	"aps_points" integer NOT NULL,
	"last_assessment_type" varchar(20),
	"last_assessment_score" integer,
	"last_updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"theme_id" varchar(50) NOT NULL,
	"theme_name" varchar(100) NOT NULL,
	"unlocked_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "whatsapp_notifications" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "curriculum" varchar(10) DEFAULT 'NSC' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "home_language" varchar(20);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "preferred_language" varchar(20) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aps_milestones" ADD CONSTRAINT "aps_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coop_session_members" ADD CONSTRAINT "coop_session_members_session_id_coop_focus_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coop_focus_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coop_session_members" ADD CONSTRAINT "coop_session_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "past_paper_questions" ADD CONSTRAINT "past_paper_questions_paper_id_past_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."past_papers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_contracts" ADD CONSTRAINT "reward_contracts_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_contracts" ADD CONSTRAINT "reward_contracts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_goal_members" ADD CONSTRAINT "team_goal_members_goal_id_team_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."team_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_goal_members" ADD CONSTRAINT "team_goal_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_goals" ADD CONSTRAINT "team_goals_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_targets" ADD CONSTRAINT "university_targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_aps_scores" ADD CONSTRAINT "user_aps_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_themes" ADD CONSTRAINT "user_themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_chat_messages_session_id_idx" ON "ai_chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_created_at_idx" ON "ai_chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_user_id_idx" ON "ai_chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_updated_at_idx" ON "ai_chat_sessions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "aps_milestones_user_id_idx" ON "aps_milestones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "aps_milestones_status_idx" ON "aps_milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coop_focus_sessions_room_code_idx" ON "coop_focus_sessions" USING btree ("room_code");--> statement-breakpoint
CREATE INDEX "coop_focus_sessions_started_at_idx" ON "coop_focus_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "coop_session_members_session_idx" ON "coop_session_members" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "coop_session_members_user_idx" ON "coop_session_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coop_session_members_unique" ON "coop_session_members" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "daily_challenges_user_id_idx" ON "daily_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_challenges_expires_at_idx" ON "daily_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "daily_challenges_user_expires_idx" ON "daily_challenges" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "past_paper_questions_topic_idx" ON "past_paper_questions" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "past_paper_questions_subject_idx" ON "past_paper_questions" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "past_paper_questions_year_idx" ON "past_paper_questions" USING btree ("year");--> statement-breakpoint
CREATE INDEX "reward_contracts_parent_idx" ON "reward_contracts" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "reward_contracts_student_idx" ON "reward_contracts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "reward_contracts_status_idx" ON "reward_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_goal_members_goal_id_idx" ON "team_goal_members" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "team_goal_members_user_id_idx" ON "team_goal_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_goal_members_unique" ON "team_goal_members" USING btree ("goal_id","user_id");--> statement-breakpoint
CREATE INDEX "team_goals_creator_id_idx" ON "team_goals" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "team_goals_is_active_idx" ON "team_goals" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "team_goals_end_date_idx" ON "team_goals" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "topic_weightages_subject_topic_idx" ON "topic_weightages" USING btree ("subject","topic");--> statement-breakpoint
CREATE INDEX "university_targets_user_id_idx" ON "university_targets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "university_targets_active_idx" ON "university_targets" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "user_aps_scores_user_id_idx" ON "user_aps_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_aps_scores_user_subject_idx" ON "user_aps_scores" USING btree ("user_id","subject");--> statement-breakpoint
CREATE INDEX "user_themes_user_idx" ON "user_themes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_themes_unique" ON "user_themes" USING btree ("user_id","theme_id");