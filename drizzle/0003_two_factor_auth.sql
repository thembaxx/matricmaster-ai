-- Migration: Add Two-Factor Authentication tables
-- Tables: two-factor, trusted-devices, backup-codes
-- Created: 2026-02-17

-- ============================================================================
-- TWO-FACTOR AUTHENTICATION TABLES
-- ============================================================================

-- Two Factor table (stores TOTP secrets)
CREATE TABLE IF NOT EXISTS "two_factor" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "secret" text NOT NULL,
    "algorithm" varchar(10) NOT NULL DEFAULT 'totp',
    "digits" integer NOT NULL DEFAULT 6,
    "period" integer NOT NULL DEFAULT 30,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "two_factor_user_id_idx" ON "two_factor" USING btree ("user_id");

-- Trusted Devices table
CREATE TABLE IF NOT EXISTS "trusted_devices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "device_name" text,
    "device_id" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "trusted_devices_user_id_idx" ON "trusted_devices" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "trusted_devices_device_id_idx" ON "trusted_devices" USING btree ("device_id");

-- Backup Codes table
CREATE TABLE IF NOT EXISTS "backup_codes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "code_hash" text NOT NULL,
    "used_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "backup_codes_user_id_idx" ON "backup_codes" USING btree ("user_id");

-- ============================================================================
-- USER SESSION LOGS TABLE (for audit logging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "session_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
    "session_id" text,
    "action" varchar(50) NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_logs_user_id_idx" ON "session_logs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "session_logs_action_idx" ON "session_logs" USING btree ("action");
CREATE INDEX IF NOT EXISTS "session_logs_created_at_idx" ON "session_logs" USING btree ("created_at");
