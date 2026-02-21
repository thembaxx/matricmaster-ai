import { twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { SessionUser } from './auth';

export type { SessionUser };

const getBaseURL = () => {
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
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
