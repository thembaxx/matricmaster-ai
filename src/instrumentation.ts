import * as Sentry from '@sentry/nextjs';

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { validateEnv } = await import('@/lib/env');
		validateEnv();

		// Pre-initialize database and auth during cold start
		try {
			const { initAuth } = await import('@/lib/auth');
			await initAuth();
			console.log('✅ Background: Database and Auth pre-initialized');

			if (process.env.NEXT_RUNTIME === 'nodejs') {
				await import('../sentry.server.config');
			} else if (process.env.NEXT_RUNTIME === 'edge') {
				await import('../sentry.edge.config');
			}
		} catch (error) {
			console.debug('❌ Background: Failed to pre-initialize:', error);
		}
	}
}

export const onRequestError = Sentry.captureRequestError;
