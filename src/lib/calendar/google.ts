import { and, eq } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { calendarConnections } from '@/lib/db/schema';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI =
	process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/sync/callback';

export const CALENDAR_SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/calendar.events',
];

export interface GoogleTokens {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export interface CalendarConnectionStatus {
	connected: boolean;
	provider: string | null;
	calendarId: string | null;
	lastSyncAt: Date | null;
	syncEnabled: boolean;
	expiresAt: Date | null;
}

export function getGoogleAuthUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: GOOGLE_REDIRECT_URI,
		response_type: 'code',
		scope: CALENDAR_SCOPES.join(' '),
		access_type: 'offline',
		prompt: 'consent',
		state,
	});

	return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		console.log('Google OAuth not configured - using mock mode');
		return {
			access_token: `mock_access_token_${Date.now()}`,
			refresh_token: `mock_refresh_token_${Date.now()}`,
			token_type: 'Bearer',
			expires_in: 3600,
		};
	}

	try {
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: GOOGLE_REDIRECT_URI,
			}),
		});

		if (!response.ok) {
			console.error('Failed to exchange code for tokens:', await response.text());
			return null;
		}

		return response.json() as Promise<GoogleTokens>;
	} catch (error) {
		console.error('Error exchanging code for tokens:', error);
		return null;
	}
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens | null> {
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || refreshToken.startsWith('mock_')) {
		return {
			access_token: `mock_access_token_${Date.now()}`,
			refresh_token: refreshToken,
			token_type: 'Bearer',
			expires_in: 3600,
		};
	}

	try {
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				refresh_token: refreshToken,
				grant_type: 'refresh_token',
			}),
		});

		if (!response.ok) {
			console.error('Failed to refresh token:', await response.text());
			return null;
		}

		return response.json() as Promise<GoogleTokens>;
	} catch (error) {
		console.error('Error refreshing token:', error);
		return null;
	}
}

export async function saveCalendarConnection(
	userId: string,
	tokens: GoogleTokens,
	calendarId = 'primary'
): Promise<void> {
	const db = await dbManager.getDb();
	const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

	const existing = await db.query.calendarConnections.findFirst({
		where: and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, 'google')),
	});

	if (existing) {
		await db
			.update(calendarConnections)
			.set({
				accessTokenEncrypted: tokens.access_token,
				refreshTokenEncrypted: tokens.refresh_token,
				expiresAt,
				calendarId,
				updatedAt: new Date(),
			})
			.where(eq(calendarConnections.id, existing.id));
	} else {
		await db.insert(calendarConnections).values({
			userId,
			provider: 'google',
			accessTokenEncrypted: tokens.access_token,
			refreshTokenEncrypted: tokens.refresh_token,
			expiresAt,
			calendarId,
			syncEnabled: true,
		});
	}
}

export async function getCalendarConnectionStatus(
	userId: string
): Promise<CalendarConnectionStatus> {
	const db = await dbManager.getDb();

	const connection = await db.query.calendarConnections.findFirst({
		where: and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, 'google')),
	});

	if (!connection) {
		return {
			connected: false,
			provider: null,
			calendarId: null,
			lastSyncAt: null,
			syncEnabled: false,
			expiresAt: null,
		};
	}

	return {
		connected: true,
		provider: connection.provider,
		calendarId: connection.calendarId,
		lastSyncAt: connection.lastSyncAt,
		syncEnabled: connection.syncEnabled,
		expiresAt: connection.expiresAt,
	};
}

export async function disconnectCalendar(userId: string): Promise<void> {
	const db = await dbManager.getDb();

	const connection = await db.query.calendarConnections.findFirst({
		where: and(eq(calendarConnections.userId, userId), eq(calendarConnections.provider, 'google')),
	});

	if (connection) {
		await db
			.update(calendarConnections)
			.set({
				accessTokenEncrypted: null,
				refreshTokenEncrypted: null,
				expiresAt: null,
				calendarId: null,
				syncEnabled: false,
				updatedAt: new Date(),
			})
			.where(eq(calendarConnections.id, connection.id));
	}
}

export function isTokenExpired(expiresAt: Date | null): boolean {
	if (!expiresAt) return true;
	return new Date() >= new Date(expiresAt.getTime() - 5 * 60 * 1000);
}
