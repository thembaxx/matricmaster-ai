import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function testConnection() {
	console.log('Testing database connections...\n');

	let client = null;

	// Test pooled connection
	console.log('1. Testing pooled connection (DATABASE_URL):');
	try {
		if (!process.env.DATABASE_URL) {
			console.log('⚠️ DATABASE_URL is not set in .env.local');
		} else {
			client = postgres(process.env.DATABASE_URL, {
				prepare: false,
				connect_timeout: 10,
				idle_timeout: 30,
			});
			const result = await client`SELECT version()`;
			console.log('✅ Pooled connection successful!');
			console.log('Version:', result[0].version);
		}
	} catch (error) {
		console.log('❌ Pooled connection failed:', error.message);
	} finally {
		if (client) {
			await client.end();
			client = null;
		}
	}

	// Test unpooled connection
	console.log('\n2. Testing unpooled connection (DATABASE_URL_UNPOOLED):');
	try {
		if (!process.env.DATABASE_URL_UNPOOLED) {
			console.log('⚠️ DATABASE_URL_UNPOOLED is not set in .env.local');
		} else {
			client = postgres(process.env.DATABASE_URL_UNPOOLED, {
				prepare: false,
				connect_timeout: 10,
				idle_timeout: 30,
			});
			const result = await client`SELECT version()`;
			console.log('✅ Unpooled connection successful!');
			console.log('Version:', result[0].version);
		}
	} catch (error) {
		console.log('❌ Unpooled connection failed:', error.message);
	} finally {
		if (client) {
			await client.end();
			client = null;
		}
	}

	// Test with different timeout settings
	console.log('\n3. Testing with extended timeout:');
	try {
		if (!process.env.DATABASE_URL_UNPOOLED) {
			console.log('⚠️ DATABASE_URL_UNPOOLED is not set in .env.local');
		} else {
			client = postgres(process.env.DATABASE_URL_UNPOOLED, {
				prepare: false,
				connect_timeout: 30,
				idle_timeout: 60,
				max: 1,
			});
			const result = await client`SELECT version(), current_database(), current_user`;
			console.log('✅ Extended timeout connection successful!');
			console.log('Version:', result[0].version);
			console.log('Database:', result[0].current_database);
			console.log('User:', result[0].current_user);
		}
	} catch (error) {
		console.log('❌ Extended timeout connection failed:', error.message);
	} finally {
		if (client) {
			await client.end();
		}
	}
}

async function _testEnvVariables() {
	console.log('\nEnvironment Variables Check:');
	console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
	console.log('DATABASE_URL_UNPOOLED exists:', !!process.env.DATABASE_URL_UNPOOLED);
	console.log('POSTGRES_* variables exist:', !!process.env.POSTGRES_HOST);

	if (process.env.DATABASE_URL) {
		console.log('DATABASE_URL is set (length:', process.env.DATABASE_URL.length, ')');
		try {
			const url = new URL(process.env.DATABASE_URL);
			console.log('DATABASE_URL host:', url.host);
		} catch {
			// Invalid URL format, don't log details
			console.log('DATABASE_URL has invalid format');
		}
	} else {
		console.log('DATABASE_URL is not set');
	}
}

testConnection();
