import { twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { SessionUser } from './auth';

export type { SessionUser };

export const authClient = createAuthClient({
	baseURL:
		process.env.BETTER_AUTH_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
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
