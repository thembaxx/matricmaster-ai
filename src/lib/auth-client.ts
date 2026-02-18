import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL:
		process.env.NEXT_PUBLIC_APP_URL ||
		(typeof window !== 'undefined' ? window.location.origin : undefined),
	plugins: [
		twoFactorClient({
			onTwoFactorRedirect() {
				if (typeof window !== 'undefined') {
					window.location.href = '/2fa';
				}
			},
		}),
	],
});

export const { signIn, signUp, useSession, signOut } = authClient;

export type AuthClient = typeof authClient;
