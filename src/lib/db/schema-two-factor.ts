import { jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Two Factor table (stores TOTP secrets)
export const twoFactor = pgTable('two_factor', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').notNull(),
	secret: text('secret').notNull(),
	algorithm: varchar('algorithm', { length: 10 }).notNull().default('totp'),
	digits: varchar('digits', { length: 1 }).notNull().default('6'),
	period: varchar('period', { length: 2 }).notNull().default('30'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

// Trusted Devices table
export const trustedDevices = pgTable('trusted_devices', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').notNull(),
	deviceName: text('device_name'),
	deviceId: text('device_id').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
});

// Backup Codes table
export const backupCodes = pgTable('backup_codes', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').notNull(),
	codeHash: text('code_hash').notNull(),
	usedAt: timestamp('used_at'),
	createdAt: timestamp('created_at').defaultNow(),
});

// Session Logs table (for audit logging)
export const sessionLogs = pgTable('session_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id'),
	sessionId: text('session_id'),
	action: varchar('action', { length: 50 }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').defaultNow(),
});

// Type exports
export type TwoFactor = typeof twoFactor.$inferSelect;
export type NewTwoFactor = typeof twoFactor.$inferInsert;
export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type BackupCode = typeof backupCodes.$inferSelect;
export type SessionLog = typeof sessionLogs.$inferSelect;
