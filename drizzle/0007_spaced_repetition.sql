-- Migration: Add Spaced Repetition & Adaptive Learning Features
-- Tables: flashcard_reviews, topic_mastery
-- Columns: Add SM-2 algorithm fields to flashcards
-- Created: 2026-02-21

-- ============================================================================
-- ADD SM-2 ALGORITHM COLUMNS TO FLASHCARDS
-- ============================================================================

ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "repetitions" integer NOT NULL DEFAULT 0;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "last_review" timestamp;

-- ============================================================================
-- FLASHCARD REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "flashcard_reviews" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "flashcard_id" uuid NOT NULL REFERENCES "flashcards"("id") ON DELETE CASCADE,
    "rating" integer NOT NULL,
    "interval_before" integer,
    "interval_after" integer NOT NULL,
    "ease_factor_before" numeric(3, 2),
    "ease_factor_after" numeric(3, 2) NOT NULL,
    "reviewed_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "flashcard_reviews_user_id_idx" ON "flashcard_reviews" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "flashcard_reviews_flashcard_id_idx" ON "flashcard_reviews" USING btree ("flashcard_id");
CREATE INDEX IF NOT EXISTS "flashcard_reviews_reviewed_at_idx" ON "flashcard_reviews" USING btree ("reviewed_at");

-- ============================================================================
-- TOPIC MASTERY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "topic_mastery" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "subject_id" bigint NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
    "topic" varchar(100) NOT NULL,
    "mastery_level" numeric(5, 2) NOT NULL DEFAULT 0,
    "questions_attempted" integer NOT NULL DEFAULT 0,
    "questions_correct" integer NOT NULL DEFAULT 0,
    "average_time_seconds" integer,
    "last_practiced" timestamp,
    "next_review" timestamp,
    "consecutive_correct" integer NOT NULL DEFAULT 0,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "topic_mastery_user_subject_topic_unique" UNIQUE ("user_id", "subject_id", "topic")
);

CREATE INDEX IF NOT EXISTS "topic_mastery_user_id_idx" ON "topic_mastery" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "topic_mastery_subject_id_idx" ON "topic_mastery" USING btree ("subject_id");
CREATE INDEX IF NOT EXISTS "topic_mastery_next_review_idx" ON "topic_mastery" USING btree ("next_review");
