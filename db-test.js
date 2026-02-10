import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({path: '.env.local'});

async function testConnection() {
  console.log('Testing database connections...\n');
  
  // Test pooled connection
  console.log('1. Testing pooled connection (DATABASE_URL):');
  try {
    const client = postgres(process.env.DATABASE_URL, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 30
    });
    const result = await client`SELECT version()`;
    console.log('✅ Pooled connection successful!');
    console.log('Version:', result[0].version);
    await client.end();
  } catch (error) {
    console.log('❌ Pooled connection failed:', error.message);
  }

  // Test unpooled connection
  console.log('\n2. Testing unpooled connection (DATABASE_URL_UNPOOLED):');
  try {
    const client = postgres(process.env.DATABASE_URL_UNPOOLED, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 30
    });
    const result = await client`SELECT version()`;
    console.log('✅ Unpooled connection successful!');
    console.log('Version:', result[0].version);
    await client.end();
  } catch (error) {
    console.log('❌ Unpooled connection failed:', error.message);
  }

  // Test with different timeout settings
  console.log('\n3. Testing with extended timeout:');
  try {
    const client = postgres(process.env.DATABASE_URL_UNPOOLED, {
      prepare: false,
      connect_timeout: 30,
      idle_timeout: 60,
      max: 1
    });
    const result = await client`SELECT version(), current_database(), current_user`;
    console.log('✅ Extended timeout connection successful!');
    console.log('Version:', result[0].version);
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    await client.end();
  } catch (error) {
    console.log('❌ Extended timeout connection failed:', error.message);
  }
}

async function testEnvVariables() {
  console.log('\nEnvironment Variables Check:');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL_UNPOOLED exists:', !!process.env.DATABASE_URL_UNPOOLED);
  console.log('POSTGRES_* variables exist:', !!process.env.POSTGRES_HOST);
  
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');
  }
}

testConnection();