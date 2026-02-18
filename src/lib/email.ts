import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'MatricMaster AI <noreply@matricmaster.ai>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendVerificationEmailParams {
	email: string;
	verificationUrl: string;
	userName?: string;
}

interface SendWelcomeEmailParams {
	email: string;
	userName: string;
}

interface SendPasswordResetParams {
	email: string;
	resetUrl: string;
}

export async function sendVerificationEmail({
	email,
	verificationUrl,
	userName,
}: SendVerificationEmailParams) {
	if (!resend) {
		console.warn('⚠️ Resend not configured - email not sent');
		return { success: false, error: 'Email service not configured' };
	}

	try {
		const data = await resend.emails.send({
			from: FROM_EMAIL,
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
              Hi${userName ? ` ${userName}` : ''}, welcome to MatricMaster AI! Please verify your email address to get started with your exam preparation.
            </p>
            <a href="${verificationUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
              Verify Email
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #2563eb; font-size: 13px; word-break: break-all;">
              ${verificationUrl}
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
		return { success: true, data };
	} catch (error) {
		console.error('❌ Failed to send verification email:', error);
		return { success: false, error };
	}
}

export async function sendWelcomeEmail({ email, userName }: SendWelcomeEmailParams) {
	if (!resend) {
		console.warn('⚠️ Resend not configured - email not sent');
		return { success: false, error: 'Email service not configured' };
	}

	try {
		const data = await resend.emails.send({
			from: FROM_EMAIL,
			to: email,
			subject: 'Welcome to MatricMaster AI! 🎉',
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #2563eb; font-size: 28px; margin: 0;">MatricMaster AI</h1>
            </div>
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Welcome${userName ? `, ${userName}` : ''}! 🎉</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Thank you for joining MatricMaster AI! You're now part of a community dedicated to helping South African students excel in their matric exams.
            </p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0;">What you can do:</h3>
              <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Access past exam papers for practice</li>
                <li>Get AI-powered explanations from our tutor</li>
                <li>Track your progress with quizzes</li>
                <li>Connect with study buddies</li>
                <li>Earn achievements as you learn</li>
              </ul>
            </div>
            <a href="${APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Need help? Reply to this email or visit our <a href="${APP_URL}/support" style="color: #2563eb;">support page</a>.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
		});

		console.log(`✅ Welcome email sent to ${email}`);
		return { success: true, data };
	} catch (error) {
		console.error('❌ Failed to send welcome email:', error);
		return { success: false, error };
	}
}

export async function sendPasswordResetEmail({ email, resetUrl }: SendPasswordResetParams) {
	if (!resend) {
		console.warn('⚠️ Resend not configured - email not sent');
		return { success: false, error: 'Email service not configured' };
	}

	try {
		const data = await resend.emails.send({
			from: FROM_EMAIL,
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
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
              Reset Password
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #2563eb; font-size: 13px; word-break: break-all;">
              ${resetUrl}
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
		return { success: true, data };
	} catch (error) {
		console.error('❌ Failed to send password reset email:', error);
		return { success: false, error };
	}
}

export function isEmailConfigured(): boolean {
	return !!resend;
}
