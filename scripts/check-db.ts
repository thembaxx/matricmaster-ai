import Database from 'better-sqlite3';

const db = new Database('data/sqlite.db');

console.log('=== Database Statistics ===\n');

const tables = [
	'users',
	'subjects',
	'questions',
	'question_attempts',
	'study_sessions',
	'flashcard_decks',
	'flashcards',
	'flashcard_reviews',
	'quiz_results',
	'topic_mastery',
	'user_progress',
	'user_achievements',
	'calendar_events',
	'notifications',
	'study_buddies',
	'ai_conversations',
	'leaderboard_entries',
];

for (const table of tables) {
	try {
		const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
		console.log(`${table}: ${count.count.toLocaleString()}`);
	} catch (e) {
		console.log(`${table}: ERROR - ${e}`);
	}
}

console.log('\n=== Sample User ===');
const user = db.prepare('SELECT * FROM users LIMIT 1').get();
console.log(user);

console.log('\n=== Sample Question Attempt ===');
const attempt = db.prepare('SELECT * FROM question_attempts LIMIT 1').get();
console.log(attempt);

db.close();
