import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from './schema';

export const chatMessages = pgTable(
	'chat_messages',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		channelId: uuid('channel_id').notNull(),
		userId: text('user_id').notNull(),
		content: text('content').notNull(),
		messageType: varchar('message_type', { length: 20 }).default('text'),
		replyToId: uuid('reply_to_id'),
		isEdited: boolean('is_edited').default(false),
		isDeleted: boolean('is_deleted').default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		channelIdIdx: index('chat_messages_channel_id_idx').on(table.channelId),
		createdAtIdx: index('chat_messages_created_at_idx').on(table.createdAt),
		userIdIdx: index('chat_messages_user_id_idx').on(table.userId),
	})
);

export const outbox = pgTable(
	'outbox',
	{
		id: serial('id').primaryKey(),
		mutationId: varchar('mutation_id', { length: 100 }).notNull(),
		channel: varchar('channel', { length: 200 }).notNull(),
		name: varchar('name', { length: 20 }).notNull(),
		data: text('data'),
		rejected: boolean('rejected').default(false),
		createdAt: timestamp('created_at').defaultNow(),
	},
	(table) => ({
		channelIdx: index('outbox_channel_idx').on(table.channel),
		mutationIdIdx: index('outbox_mutation_id_idx').on(table.mutationId),
	})
);

export const userPresence = pgTable(
	'user_presence',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		channelId: uuid('channel_id').notNull(),
		userId: text('user_id').notNull(),
		status: varchar('status', { length: 20 }).default('online'),
		lastSeenAt: timestamp('last_seen_at').defaultNow(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => ({
		channelUserIdx: uniqueIndex('user_presence_channel_user_idx').on(table.channelId, table.userId),
		channelIdIdx: index('user_presence_channel_id_idx').on(table.channelId),
		userIdIdx: index('user_presence_user_id_idx').on(table.userId),
	})
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id],
	}),
}));

export const userPresenceRelations = relations(userPresence, ({ one }) => ({
	user: one(users, {
		fields: [userPresence.userId],
		references: [users.id],
	}),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Outbox = typeof outbox.$inferSelect;
export type NewOutbox = typeof outbox.$inferInsert;
export type UserPresence = typeof userPresence.$inferSelect;
export type NewUserPresence = typeof userPresence.$inferInsert;
