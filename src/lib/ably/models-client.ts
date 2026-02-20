import * as Ably from 'ably';
import { getEnv } from '../env';

export function getAblyRealtimeClient(): Ably.Realtime {
	const apiKey = getEnv('ABLY_API_KEY');
	if (!apiKey) {
		throw new Error('ABLY_API_KEY is not configured');
	}

	return new Ably.Realtime({
		key: apiKey,
	});
}

export interface ChatMessageModel {
	id: string;
	channelId: string;
	userId: string;
	content: string;
	messageType: string;
	replyToId: string | null;
	isEdited: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ChatChannelModel {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	createdBy: string;
	isPublic: boolean;
	memberCount: number;
	createdAt: string;
}

export interface UserPresenceModel {
	id: string;
	channelId: string;
	userId: string;
	status: 'online' | 'away' | 'offline';
	lastSeenAt: string;
	createdAt: string;
	updatedAt: string;
}
