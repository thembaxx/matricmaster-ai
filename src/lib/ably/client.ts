import Ably from 'ably';
import { getEnv } from '../env';

let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
	if (ablyClient) return ablyClient;

	const apiKey = getEnv('ABLY_API_KEY');
	if (!apiKey) {
		throw new Error('ABLY_API_KEY is not configured');
	}

	ablyClient = new Ably.Realtime({
		key: apiKey,
	});

	return ablyClient;
}

export function getAblyRestClient(): Ably.Rest {
	const apiKey = getEnv('ABLY_API_KEY');
	if (!apiKey) {
		throw new Error('ABLY_API_KEY is not configured');
	}

	return new Ably.Rest({
		key: apiKey,
	});
}

export async function publishToChannel(
	channelName: string,
	eventName: string,
	data: unknown
): Promise<void> {
	const client = getAblyRestClient();
	const channel = client.channels.get(channelName);
	await channel.publish(eventName, data);
}

export async function publishNotification(
	userId: string,
	notification: {
		id: string;
		type: string;
		title: string;
		message: string;
		data?: Record<string, unknown>;
	}
): Promise<void> {
	await publishToChannel(`user:${userId}:notifications`, 'notification', {
		...notification,
		createdAt: new Date().toISOString(),
	});
}
