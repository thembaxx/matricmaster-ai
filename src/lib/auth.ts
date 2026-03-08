import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { twoFactor } from 'better-auth/plugins';
import { Resend } from 'resend';

import { dbManager } from './db';
import * as schema from './db/schema';

// Type for the auth instance
type AuthInstance = ReturnType<typeof betterAuth>;

let authInstance: AuthInstance | null = null;

// Check if we're in a build phase where database is not expected to be available
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

export const authConfig = {
	baseURL:
		process.env.BETTER_AUTH_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		(process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000'),
	secret: process.env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: process.env.NODE_ENV === 'production',
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user',
				input: false,
			},
			isBlocked: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false,
			},
			deletedAt: {
				type: 'date',
				required: false,
				input: false,
			},
			twoFactorEnabled: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false,
			},
			hasCompletedOnboarding: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: false,
			},
		},
	},
	trustedOrigins: [
		process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
	].filter(Boolean),
	rateLimit: {
		enabled: true,
		window: 60,
		max: 10,
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === 'production',
		crossSubDomainCookies: {
			enabled: process.env.NODE_ENV === 'production',
		},
	},
	plugins: [
		twoFactor({
			issuer: 'MatricMaster AI',
			totpOptions: {
				digits: 6,
				period: 30,
			},
			backupCodeOptions: {
				amount: 10,
				length: 10,
				storeBackupCodes: 'encrypted',
			},
			twoFactorCookieMaxAge: 600,
			trustDeviceMaxAge: 30 * 24 * 60 * 60,
		}),
	],
};

// Define the User type with additional fields to match our schema
interface ExtendedUser {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
	role: string;
	isBlocked: boolean;
	deletedAt?: Date | null;
	twoFactorEnabled: boolean;
	hasCompletedOnboarding: boolean;
}

function createAuth(): AuthInstance {
	const isConnected = dbManager.isConnectedToDatabase();
	let db = null;

	if (isConnected) {
		try {
			db = dbManager.getDb();
		} catch {
			if (!isBuildTime) {
				console.warn('⚠️ Failed to get database connection - Better Auth will not persist sessions');
			}
		}
	} else if (!isBuildTime) {
		console.warn('⚠️ Database not connected - Better Auth will not persist sessions');
	}

	const twitterClientId = process.env.TWITTER_CLIENT_ID;
	const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

	if (!isBuildTime && (!twitterClientId || !twitterClientSecret)) {
		console.warn(
			'⚠️ Twitter OAuth credentials are not configured. Sign in with Twitter will not be available.'
		);
	}

	const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
		},
	};

	// Only add Twitter provider if credentials are available
	if (twitterClientId && twitterClientSecret) {
		socialProviders.twitter = {
			clientId: twitterClientId,
			clientSecret: twitterClientSecret,
		};
	}

	// Initialize Resend for transactional emails
	const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
	const fromEmail = process.env.FROM_EMAIL || 'MatricMaster AI <noreply@matricmaster.ai>';

	// Email templates using Resend
	const sendVerificationEmail = async ({
		email,
		user,
		url,
	}: {
		email: string;
		user: { id: string; name?: string; email?: string };
		url: string;
	}) => {
		if (!resend) {
			console.warn('⚠️ Resend not configured - verification email not sent');
			return;
		}

		try {
			await resend.emails.send({
				from: fromEmail,
				to: email,
				subject: 'Verify your MatricMaster AI account',
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Verify Your Email</title>
					</head>
					<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
						<div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
							<div style="text-align: center; margin-bottom: 24px;">
								<h1 style="color: #2563eb; font-size: 28px; margin: 0;">MatricMaster AI</h1>
							</div>
							<h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Verify your email address</h2>
							<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
								Hi${user.name ? ` ${user.name}` : ''}, welcome to MatricMaster AI! Please verify your email address to get started with your exam preparation.
							</p>
							<a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
								Verify Email
							</a>
							<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
								Or copy and paste this link in your browser:
							</p>
							<p style="color: #2563eb; font-size: 13px; word-break: break-all;">
								${url}
							</p>
							<div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
								<p style="color: #9ca3af; font-size: 12px; margin: 0;">
									This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
								</p>
							</div>
						</div>
					</body>
					</html>
				`,
			});
			console.log(`✅ Verification email sent for user: ${user.id}`);
		} catch (error) {
			console.error('❌ Failed to send verification email:', error);
		}
	};

	const sendPasswordResetEmail = async ({ email, url }: { email: string; url: string }) => {
		if (!resend) {
			console.warn('⚠️ Resend not configured - password reset email not sent');
			return;
		}

		try {
			await resend.emails.send({
				from: fromEmail,
				to: email,
				subject: 'Reset your MatricMaster AI password',
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Reset Password</title>
					</head>
					<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
						<div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
							<div style="text-align: center; margin-bottom: 24px;">
								<h1 style="color: #2563eb; font-size: 28px; margin: 0;">MatricMaster AI</h1>
							</div>
							<h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
							<p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
								You requested to reset your password. Click the button below to create a new password:
							</p>
							<a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
								Reset Password
							</a>
							<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
								Or copy and paste this link in your browser:
							</p>
							<p style="color: #2563eb; font-size: 13px; word-break: break-all;">
								${url}
							</p>
							<div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
								<p style="color: #9ca3af; font-size: 12px; margin: 0;">
									This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
								</p>
							</div>
						</div>
					</body>
					</html>
				`,
			});
			console.log('✅ Password reset email sent');
		} catch (error) {
			console.error('❌ Failed to send password reset email:', error);
		}
	};

	// Merge static config with dynamic runtime config
	const runtimeConfig = {
		...authConfig,
		database: db
			? drizzleAdapter(db, {
					provider: 'pg',
					schema,
				})
			: undefined,
		emailAndPassword: {
			...authConfig.emailAndPassword,
			sendVerificationEmail,
			sendPasswordResetEmail,
		},
		socialProviders,
		databaseHooks: {
			user: {
				create: {
					after: async (user: ExtendedUser) => {
						console.log(`✅ New user created: ${user.id} (${user.email})`);
					},
				},
				update: {
					before: async (user: ExtendedUser) => {
						// Check if user is blocked during any update (including sign-in)
						if (user.isBlocked) {
							throw new Error(
								'Your account has been blocked. Please contact support for assistance.'
							);
						}
						return { data: user };
					},
				},
			},
		},
		plugins: [nextCookies(), authConfig.plugins[0]],
	};

	// Use type assertion to bypass the type mismatch during build
	// biome-ignore lint/suspicious/noExplicitAny: Type mismatch between authConfig and betterAuth during build
	return betterAuth(runtimeConfig as any);
}

export async function initAuth(): Promise<AuthInstance> {
	await dbManager.waitForConnection(5, 3000);

	if (!authInstance) {
		authInstance = createAuth();
	}

	return authInstance;
}

let authPromise: Promise<AuthInstance> | null = null;

export async function getAuth(): Promise<AuthInstance> {
	// If already resolved, return immediately
	if (authInstance) {
		return authInstance;
	}

	// If a promise is already in progress, await it
	if (authPromise) {
		return authPromise;
	}

	// Start the async initialization
	authPromise = (async () => {
		// Wait for database connection before creating auth instance
		// This ensures the database adapter is properly passed to better-auth
		try {
			await dbManager.initialize();
		} catch (err) {
			console.error('❌ Failed to initialize database for auth:', err);
		}

		if (!authInstance) {
			authInstance = createAuth();
		}
		return authInstance;
	})();

	return authPromise;
}

// For backward compatibility - creates auth synchronously if already initialized
// Otherwise returns undefined (callers should use getAuth())
export function getAuthSync(): AuthInstance | undefined {
	if (authInstance) {
		return authInstance;
	}
	// Try to create synchronously if DB is already connected
	if (dbManager.isConnectedToDatabase()) {
		authInstance = createAuth();
		return authInstance;
	}
	return undefined;
}

try {
	if (dbManager.isConnectedToDatabase()) {
		authInstance = createAuth();
	}
} catch {
	console.warn('⚠️ Could not initialize auth at startup - will initialize on first request');
}

export const auth = new Proxy({} as AuthInstance, {
	get(_target, prop) {
		// CLI detection - check if being accessed by better-auth CLI generate
		// The CLI runs with 'generate' command and doesn't need DB connection
		const isCLIGenerate = typeof process !== 'undefined' && process.argv?.includes('generate');

		// For CLI generate, return authConfig to satisfy the CLI
		if (isCLIGenerate) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			// biome-ignore lint/suspicious/noExplicitAny: na
			return Reflect.get(authConfig as any, prop, authConfig);
		}

		// Try sync first for backward compatibility
		const syncAuth = getAuthSync();
		if (syncAuth) {
			return Reflect.get(syncAuth, prop, syncAuth);
		}
		// If not sync available, return a lazy handler that will auto-initialize
		// This ensures backward compatibility with existing code
		return new Proxy(
			{},
			{
				get(_innerTarget) {
					// When someone accesses auth.api.method, we need to auto-initialize
					// This is a workaround for backward compatibility
					// The proper way is to use await getAuth() in your code
					console.warn('⚠️ Auth accessed without await getAuth(). Auto-initializing...');
					// Trigger async initialization but don't wait - this is fire-and-forget
					// The next call should have auth ready (or fail gracefully)
					getAuth().catch((err) => console.error('❌ Failed to auto-initialize auth:', err));
					// Return a placeholder that will throw a more helpful error
					throw new Error(
						`Auth is being initialized. Please use 'await getAuth()' instead of 'auth' directly.`
					);
				},
			}
		);
	},
});

// Default export for better-auth CLI
export default auth;

export type Auth = AuthInstance;
export type AuthSession = Auth['$Infer']['Session'];
export type AuthUser = Auth['$Infer']['Session']['user'];

export type SessionUser = AuthUser & {
	role: string;
	isBlocked: boolean;
	deletedAt: Date | null;
	twoFactorEnabled: boolean | null;
	hasCompletedOnboarding: boolean | null;
};
