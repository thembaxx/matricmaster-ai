import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Better-auth core tables - these should match your existing schema
export const users = pgTable(
	'users', // Note: using 'users' instead of 'user' to avoid SQL keyword conflicts
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('emailVerified').notNull().default(false),
		image: text('image'),
		role: text('role').notNull().default('user'), // 'admin', 'moderator', 'user'
		isBlocked: boolean('is_blocked').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('createdAt').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt').notNull().defaultNow(),
	},
	(table) => ({
		emailIdx: index('users_email_idx').on(table.email),
		roleIdx: index('users_role_idx').on(table.role),
		blockedIdx: index('users_blocked_idx').on(table.isBlocked),
	})
);

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expiresAt').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('createdAt').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt').notNull().defaultNow(),
		ipAddress: text('ipAddress'),
		userAgent: text('userAgent'),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => ({
		tokenIdx: index('sessions_token_idx').on(table.token),
		userIdIdx: index('sessions_user_id_idx').on(table.userId),
	})
);

export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('accountId').notNull(),
		providerId: text('providerId').notNull(),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('accessToken'),
		refreshToken: text('refreshToken'),
		idToken: text('idToken'),
		accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
		refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('createdAt').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt').notNull().defaultNow(),
	},
	(table) => ({
		userIdIdx: index('accounts_user_id_idx').on(table.userId),
		providerIdx: index('accounts_provider_idx').on(table.providerId, table.accountId),
	})
);

export const verifications = pgTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt').defaultNow(),
	updatedAt: timestamp('updatedAt').defaultNow(),
});

// Better-auth relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

// Type exports for better-auth integration
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
