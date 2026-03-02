export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { validateEnv } = await import('@/lib/env');
		validateEnv();

		// Pre-initialize database and auth during cold start
		try {
			const { initAuth } = await import('@/lib/auth');
			await initAuth();
			console.log('✅ Background: Database and Auth pre-initialized');
		} catch (error) {
			console.error('❌ Background: Failed to pre-initialize:', error);
		}
	}
}
