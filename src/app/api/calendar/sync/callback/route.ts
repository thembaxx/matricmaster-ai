import { type NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, saveCalendarConnection } from '@/lib/calendar/google';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get('code');
		const state = searchParams.get('state');
		const error = searchParams.get('error');

		if (error) {
			console.error('OAuth error:', error);
			return NextResponse.redirect(
				new URL('/settings?calendar_error=oauth_failed', request.nextUrl.origin)
			);
		}

		if (!code || !state) {
			return NextResponse.redirect(
				new URL('/settings?calendar_error=missing_params', request.nextUrl.origin)
			);
		}

		// Parse state to get userId
		const [userId] = state.split(':');
		if (!userId) {
			return NextResponse.redirect(
				new URL('/settings?calendar_error=invalid_state', request.nextUrl.origin)
			);
		}

		// Exchange code for tokens
		const tokens = await exchangeCodeForTokens(code);
		if (!tokens) {
			return NextResponse.redirect(
				new URL('/settings?calendar_error=token_exchange_failed', request.nextUrl.origin)
			);
		}

		// Save connection
		await saveCalendarConnection(userId, tokens);

		// Redirect back to settings with success
		return NextResponse.redirect(
			new URL('/settings?calendar_success=connected', request.nextUrl.origin)
		);
	} catch (error) {
		console.debug('Calendar callback error:', error);
		return NextResponse.redirect(
			new URL('/settings?calendar_error=server_error', request.nextUrl.origin)
		);
	}
}
