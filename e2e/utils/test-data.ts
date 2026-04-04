export const TEST_USER_EMAIL = 'student@lumni.ai';
export const TEST_USER_PASSWORD = 'password123';

export function generateUniqueEmail(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `testuser_${timestamp}_${random}@example.com`;
}

export function generateUniqueName(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 6);
	return `Test User ${timestamp} ${random}`;
}

export function generatePassword(): string {
	const timestamp = Date.now();
	return `Pass${timestamp}!`;
}

export interface TestUser {
	email: string;
	password: string;
	name: string;
}

export function createTestUser(): TestUser {
	return {
		email: generateUniqueEmail(),
		password: generatePassword(),
		name: generateUniqueName(),
	};
}
