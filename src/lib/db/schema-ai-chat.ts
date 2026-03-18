import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './schema';

export const aiChatSessions = pgTable(
	'ai_chat_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		subject: varchar('subject', { length: 50 }).notNull().default('general'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		userIdIdx: index('ai_chat_sessions_user_id_idx').on(table.userId),
		updatedAtIdx: index('ai_chat_sessions_updated_at_idx').on(table.updatedAt),
	})
);

export const aiChatMessages = pgTable(
	'ai_chat_messages',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => aiChatSessions.id, { onDelete: 'cascade' }),
		role: varchar('role', { length: 20 }).notNull(),
		content: text('content').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		sessionIdIdx: index('ai_chat_messages_session_id_idx').on(table.sessionId),
		createdAtIdx: index('ai_chat_messages_created_at_idx').on(table.createdAt),
	})
);

export const aiChatSessionsRelations = relations(aiChatSessions, ({ many }) => ({
	messages: many(aiChatMessages),
}));

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
	session: one(aiChatSessions, {
		fields: [aiChatMessages.sessionId],
		references: [aiChatSessions.id],
	}),
}));

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type NewAiChatSession = typeof aiChatSessions.$inferInsert;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert;
