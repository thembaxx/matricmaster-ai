import { getEnv } from '../env';

const DAILY_API_URL = 'https://api.daily.co/v1';

export interface DailyRoom {
	id: string;
	name: string;
	url: string;
	created_at: string;
	exp: number;
	config: DailyRoomConfig;
}

export interface DailyRoomConfig {
	naming_convention?: string;
	enable_screenshare?: boolean;
	enable_chat?: boolean;
	enable_knocking?: boolean;
	start_video_off?: boolean;
	start_audio_off?: boolean;
	exp?: number;
	max_participants?: number;
}

export interface CreateRoomParams {
	name?: string;
	privacy?: 'public' | 'private';
	properties?: DailyRoomConfig;
}

export type DailyRoomResult =
	| { success: true; room: DailyRoom }
	| {
			success: false;
			error: 'daily_api_unavailable' | 'daily_auth_failed' | 'daily_rate_limited' | 'daily_error';
	  };

export async function createDailyRoom(params: CreateRoomParams): Promise<DailyRoomResult> {
	const apiKey = getEnv('DAILY_API_KEY');
	const domain = getEnv('DAILY_DOMAIN');

	if (!apiKey || !domain) {
		return { success: false, error: 'daily_api_unavailable' };
	}

	try {
		const response = await fetch(`${DAILY_API_URL}/rooms`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				name: params.name || `tutoring_${Date.now()}`,
				privacy: params.privacy || 'private',
				properties: {
					enable_screenshare: true,
					enable_chat: true,
					enable_knocking: true,
					start_video_off: false,
					start_audio_off: false,
					exp: Math.floor(Date.now() / 1000) + 3600 * 2,
					max_participants: 4,
					...params.properties,
				},
			}),
		});

		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				return { success: false, error: 'daily_auth_failed' };
			}
			if (response.status === 429) {
				return { success: false, error: 'daily_rate_limited' };
			}
			throw new Error(`Failed to create room: ${response.statusText}`);
		}

		const data = await response.json();
		return { success: true, room: data };
	} catch (error) {
		console.debug('Error creating Daily.co room:', error);
		return { success: false, error: 'daily_api_unavailable' };
	}
}

export async function getDailyRoom(roomName: string): Promise<DailyRoomResult> {
	const apiKey = getEnv('DAILY_API_KEY');

	if (!apiKey) {
		return { success: false, error: 'daily_api_unavailable' };
	}

	try {
		const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				return { success: false, error: 'daily_auth_failed' };
			}
			if (response.status === 429) {
				return { success: false, error: 'daily_rate_limited' };
			}
			return { success: false, error: 'daily_error' };
		}

		const data = await response.json();
		return { success: true, room: data };
	} catch (error) {
		console.debug('Error getting Daily.co room:', error);
		return { success: false, error: 'daily_api_unavailable' };
	}
}

export async function deleteDailyRoom(roomName: string): Promise<boolean> {
	const apiKey = getEnv('DAILY_API_KEY');

	if (!apiKey) {
		return false;
	}

	try {
		const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		return response.ok;
	} catch (error) {
		console.debug('Error deleting Daily.co room:', error);
		return false;
	}
}

export async function createDailyMeetingToken(
	userId: string,
	roomName: string,
	isOwner = false
): Promise<string | null> {
	const apiKey = getEnv('DAILY_API_KEY');

	if (!apiKey) {
		return null;
	}

	try {
		const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				properties: {
					user_id: userId,
					room_name: roomName,
					is_owner: isOwner,
					enable_screenshare: true,
					exp: Math.floor(Date.now() / 1000) + 3600 * 2,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to create token: ${response.statusText}`);
		}

		const data = await response.json();
		return data.token;
	} catch (error) {
		console.debug('Error creating Daily.co token:', error);
		return null;
	}
}

export function getDailyDomain(): string | undefined {
	return getEnv('DAILY_DOMAIN');
}
