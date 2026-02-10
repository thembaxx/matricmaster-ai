import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config({path: '.env.local'});

console.log('=== Testing SQLite Connection ===');

try {
  // Test SQLite connection
  const sqlite = new Database('./database.db');
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  
  console.log('✅ SQLite database connected successfully');
  
  // Test a simple query
  const result = sqlite.prepare('SELECT sqlite_version() as version').get();
  console.log('SQLite Version:', result.version);
  
  // Test schema creation by checking if tables exist
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Existing tables:', tables.map(t => t.name));
  
  sqlite.close();
  
} catch (error) {
  console.error('❌ SQLite connection failed:', error.message);
}

console.log('\n=== Testing Environment Variables ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('BETTER_AUTH_SECRET exists:', !!process.env.BETTER_AUTH_SECRET);

console.log('\n=== Database URLs ===');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
}
if (process.env.DATABASE_URL_UNPOOLED) {
  console.log('DATABASE_URL_UNPOOLED:', process.env.DATABASE_URL_UNPOOLED.substring(0, 50) + '...');
}