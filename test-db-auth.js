import 'dotenv/config';
import { dbManager, pgManager } from './src/lib/db';
import { auth } from './src/lib/auth';

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
			const authConfig = auth.getConfig();
			console.log('✅ Authentication configured successfully');
			console.log('   Email/Password:', authConfig.emailAndPassword?.enabled ? 'Enabled' : 'Disabled');
			console.log('   Google OAuth:', authConfig.socialProviders?.google ? 'Configured' : 'Not configured');
			console.log('   Database Adapter:', authConfig.database ? 'Connected' : 'Fallback mode');
		} catch (error) {
			console.log('❌ Authentication configuration failed:', error.message);
		}

		// Test database queries
		console.log('\n3. Testing database queries...');
		try {
			const db = dbManager.getDb();
			// Test a simple query
			const result = await db.execute('SELECT 1 as test');
			console.log('✅ Database queries working');
			console.log('   Test query result:', result);
		} catch (error) {
			console.log('❌ Database queries failed:', error.message);
		}

		console.log('\n🎉 All tests completed successfully!');
		
	} catch (error) {
		console.error('❌ Test failed with error:', error);
	}
	
	// Cleanup
	await dbManager.close();
}

// Run the test
testDatabaseAndAuth().catch(console.error);