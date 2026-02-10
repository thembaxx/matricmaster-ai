import { auth } from './src/lib/auth';
import { dbManager } from './src/lib/db';
import { sqliteManager } from './src/lib/db/sqlite';

async function testSystem() {
  console.log('=== System Health Check ===\n');

  // Test database connections
  console.log('1. Database Status:');
  console.log('   PostgreSQL Connected:', dbManager.isConnectedToDatabase());
  console.log('   PostgreSQL Available:', dbManager.isPostgreSQLAvailable());
  console.log('   SQLite Connected:', sqliteManager.isConnectedToDatabase());
  console.log('   Preferred Database:', dbManager.getPreferredDatabase());
  console.log('');

  // Test auth initialization
  console.log('2. Authentication Status:');
  try {
    // This will trigger auth initialization
    const authConfig = auth.getConfig();
    console.log('   ✅ Authentication initialized successfully');
    console.log('   Database Type:', authConfig.database ? 'Connected' : 'Fallback/None');
    console.log('   Email/Password:', authConfig.emailAndPassword?.enabled ? 'Enabled' : 'Disabled');
    console.log('   Google OAuth:', authConfig.socialProviders?.google ? 'Configured' : 'Not configured');
  } catch (error) {
    console.log('   ❌ Authentication initialization failed:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

testSystem().catch(console.error);