import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: {
				model: schema.user,
				fields: {
					emailVerified: 'emailVerified',
					isAnonymous: 'isAnonymous',
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
				},
			},
			session: {
				model: schema.session,
				fields: {
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
					expiresAt: 'expiresAt',
					ipAddress: 'ipAddress',
					userAgent: 'userAgent',
					userId: 'userId',
				},
			},
			account: {
				model: schema.account,
				fields: {
					accountId: 'accountId',
					providerId: 'providerId',
					userId: 'userId',
					accessToken: 'accessToken',
					refreshToken: 'refreshToken',
					idToken: 'idToken',
					accessTokenExpiresAt: 'accessTokenExpiresAt',
					refreshTokenExpiresAt: 'refreshTokenExpiresAt',
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
				},
			},
			verification: {
				model: schema.verification,
				fields: {
					expiresAt: 'expiresAt',
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
				},
			},
			anonymousUsers: {
				model: schema.anonymous_users,
				fields: {
					userId: 'userId',
					createdAt: 'createdAt',
				},
			},
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [anonymous()],
});
