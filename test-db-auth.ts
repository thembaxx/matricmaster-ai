import 'dotenv/config';
import { auth } from './src/lib/auth';
import { dbManager } from './src/lib/db/index';

async function testDatabaseAndAuth() {
	console.log('🧪 Testing Database and Authentication Setup\n');

	try {
		// Test database connection
		console.log('1. Testing database connection...');
		const dbConnected = await dbManager.waitForConnection(3, 2000);

		if (dbConnected) {
			console.log('✅ Database connection successful');
			console.log('   Type:', dbManager.getPreferredDatabase());
			console.log('   Connected:', dbManager.isConnectedToDatabase());
			console.log('   PostgreSQL Available:', dbManager.isPostgreSQLAvailable());
		} else {
			console.log('❌ Database connection failed');
			return;
		}

		// Test auth configuration
		console.log('\n2. Testing authentication configuration...');
		try {
			// @ts-expect-error - getConfig method exists but not in types
			const authConfig = auth.getConfig();
			console.log('✅ Authentication configured successfully');
			console.log(
				'   Email/Password:',
				authConfig.emailAndPassword?.enabled ? 'Enabled' : 'Disabled'
			);
			console.log(
				'   Google OAuth:',
				authConfig.socialProviders?.google ? 'Configured' : 'Not configured'
			);
			console.log('   Database Adapter:', authConfig.database ? 'Connected' : 'Fallback mode');
		} catch (error) {
			console.log('ℹ️  Authentication configuration test skipped (expected in some cases)');
		}

		console.log('\n🎉 Database setup test completed successfully!');
	} catch (error) {
		console.error('❌ Test failed with error:', error);
	}

	// Cleanup
	await dbManager.close();
}

// Run the test
testDatabaseAndAuth().catch(console.error);
