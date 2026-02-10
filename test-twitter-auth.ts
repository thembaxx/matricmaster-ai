import 'dotenv/config';
import { auth } from './src/lib/auth';

async function testTwitterAuth() {
	console.log('🐦 Testing Twitter Authentication Configuration\n');

	try {
		// @ts-expect-error - getConfig method exists but not in types
		const authConfig = auth.getConfig();

		console.log('Authentication Providers Configuration:');
		console.log(
			'  Email/Password:',
			authConfig.emailAndPassword?.enabled ? '✅ Enabled' : '❌ Disabled'
		);
		console.log(
			'  Google OAuth:',
			authConfig.socialProviders?.google ? '✅ Configured' : '❌ Not configured'
		);
		console.log(
			'  Twitter OAuth:',
			authConfig.socialProviders?.twitter ? '✅ Configured' : '❌ Not configured'
		);

		if (authConfig.socialProviders?.twitter) {
			console.log('\nTwitter Configuration Details:');
			console.log(
				'  Client ID Present:',
				!!process.env.TWITTER_CLIENT_ID &&
					process.env.TWITTER_CLIENT_ID !== 'your_twitter_client_id_here'
			);
			console.log(
				'  Client Secret Present:',
				!!process.env.TWITTER_CLIENT_SECRET &&
					process.env.TWITTER_CLIENT_SECRET !== 'your_twitter_client_secret_here'
			);
		}

		console.log('\n📋 Next Steps:');
		console.log('1. Create a Twitter Developer App at https://developer.twitter.com/');
		console.log('2. Get your Consumer Key (API Key) and Consumer Secret (API Secret)');
		console.log('3. Update TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET in .env.local');
		console.log('4. Set callback URL to: http://localhost:3000/api/auth/callback/twitter');
		console.log('5. Test the integration!');
	} catch (error) {
		console.error('❌ Error testing Twitter auth configuration:', error);
	}
}

testTwitterAuth().catch(console.error);
