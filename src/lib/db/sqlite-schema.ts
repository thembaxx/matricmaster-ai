import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sqliteUsers = sqliteTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	role: text('role').notNull().default('user'),
	isBlocked: integer('isBlocked', { mode: 'boolean' }).notNull().default(false),
	twoFactorEnabled: integer('twoFactorEnabled', { mode: 'boolean' }).notNull().default(false),
	hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' })
		.notNull()
		.default(false),
	school: text('school'),
	avatarId: text('avatar_id'),
	deletedAt: text('deleted_at'),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
});

export const sqliteSessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	expiresAt: text('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull(),
});

export const sqliteAccounts = sqliteTable('accounts', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull(),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: text('accessTokenExpiresAt'),
	refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: text('createdAt').notNull(),
	updatedAt: text('updatedAt').notNull(),
});

export const sqliteVerifications = sqliteTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: text('expiresAt').notNull(),
	createdAt: text('created_at'),
});

export const sqliteSyncQueue = sqliteTable('sync_queue', {
	id: text('id').primaryKey(),
	tableName: text('table_name').notNull(),
	operation: text('operation').notNull(),
	recordId: text('record_id').notNull(),
	data: text('data').notNull(),
	timestamp: integer('timestamp').notNull(),
	retryCount: integer('retry_count').notNull().default(0),
	status: text('status').notNull().default('pending'),
});
