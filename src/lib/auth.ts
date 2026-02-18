import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { twoFactor } from 'better-auth/plugins';
import { Resend } from 'resend';

import { dbManager } from './db';
import * as schema from './db/schema';

let authInstance: ReturnType<typeof betterAuth> | null = null;

// Check if we're in a build phase where database is not expected to be available
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

function createAuth() {
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
			console.log(`✅ Verification email sent to ${email}`);
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
			console.log(`✅ Password reset email sent to ${email}`);
		} catch (error) {
			console.error('❌ Failed to send password reset email:', error);
		}
	};

	return betterAuth({
		baseURL:
			process.env.BETTER_AUTH_URL ||
			process.env.NEXT_PUBLIC_APP_URL ||
			(process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000'),
		secret: process.env.BETTER_AUTH_SECRET,
		database: db
			? drizzleAdapter(db, {
					provider: 'pg',
					schema,
				})
			: undefined,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			sendVerificationEmail,
			sendPasswordResetEmail,
		},
		socialProviders,
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
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
			ipAddress: {
				ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
			},
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						console.log(`✅ New user created: ${user.id} (${user.email})`);
					},
				},
				update: {
					before: async (user) => {
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
		plugins: [
			nextCookies(),
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
	});
}

export async function initAuth(): Promise<ReturnType<typeof betterAuth>> {
	await dbManager.waitForConnection(5, 3000);

	if (!authInstance) {
		authInstance = createAuth();
	}

	return authInstance;
}

export function getAuth(): ReturnType<typeof betterAuth> {
	if (!authInstance) {
		authInstance = createAuth();
	}
	return authInstance;
}

try {
	if (dbManager.isConnectedToDatabase()) {
		authInstance = createAuth();
	}
} catch {
	console.warn('⚠️ Could not initialize auth at startup - will initialize on first request');
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_target, prop) {
		const currentAuth = getAuth();
		return Reflect.get(currentAuth, prop, currentAuth);
	},
});

export type Auth = ReturnType<typeof betterAuth>;
export type AuthSession = Auth['$Infer']['Session'];
export type AuthUser = Auth['$Infer']['Session']['user'];
