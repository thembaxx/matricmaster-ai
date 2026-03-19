-- Curriculum Data Consolidation: Phase 1
-- Tables for subject metadata, gamification config, and achievement definitions

-- Subject Metadata Table
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
CREATE INDEX "subject_metadata_display_order_idx" ON "subject_metadata" USING btree ("display_order");
CREATE INDEX "subject_metadata_is_supported_idx" ON "subject_metadata" USING btree ("is_supported");

-- Gamification Config Table
CREATE TABLE "gamification_config" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now()
);
CREATE INDEX "gamification_config_updated_idx" ON "gamification_config" USING btree ("updated_at");

-- Achievement Definitions Table
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
CREATE INDEX "achievement_definitions_category_idx" ON "achievement_definitions" USING btree ("category");
CREATE INDEX "achievement_definitions_is_active_idx" ON "achievement_definitions" USING btree ("is_active");
CREATE INDEX "achievement_definitions_display_order_idx" ON "achievement_definitions" USING btree ("display_order");

-- Add missing fields to questions table
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "subtopic" varchar(100);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "diagram" varchar(50);
CREATE INDEX IF NOT EXISTS "questions_subtopic_idx" ON "questions" USING btree ("subtopic");
