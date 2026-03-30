import { vi } from 'vitest';

export interface MockStorageData {
	[key: string]: string | null;
}

export interface MockOfflineProgress {
	quizProgress: {
		id: string;
		quizId: string;
		subject: string;
		answers: Array<{
			questionId: string;
			selectedOption: string;
			isCorrect: boolean;
			timeSpentMs: number;
			answeredAt: string;
		}>;
		currentQuestionIndex: number;
		startedAt: string;
		lastUpdatedAt: string;
		completed: boolean;
	} | null;
	flashcardReviews: Array<{
		cardId: string;
		reviewed: boolean;
		confidence: 'easy' | 'medium' | 'hard';
		reviewedAt: string;
	}>;
	studySessionData: Record<string, unknown>;
	timestamp: number;
}

export interface MockIndexedDB {
	[key: string]: Record<string, unknown>;
}

class MockLocalStorage {
	private data: MockStorageData = {};
	private shouldThrow = false;

	constructor() {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => this.getItem(key));
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) =>
			this.setItem(key, value)
		);
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) =>
			this.removeItem(key)
		);
		vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => this.clear());
		vi.spyOn(Storage.prototype, 'key').mockImplementation((index: number) => this.key(index));
		vi.spyOn(Storage.prototype, 'get length').mockImplementation(() => this.length);
	}

	getItem(key: string): string | null {
		if (this.shouldThrow) {
			throw new Error('localStorage is not available');
		}
		return this.data[key] ?? null;
	}

	setItem(key: string, value: string): void {
		if (this.shouldThrow) {
			throw new Error('localStorage is not available');
		}
		this.data[key] = value;
	}

	removeItem(key: string): void {
		if (this.shouldThrow) {
			throw new Error('localStorage is not available');
		}
		delete this.data[key];
	}

	clear(): void {
		if (this.shouldThrow) {
			throw new Error('localStorage is not available');
		}
		this.data = {};
	}

	key(index: number): string | null {
		if (this.shouldThrow) {
			throw new Error('localStorage is not available');
		}
		const keys = Object.keys(this.data);
		return keys[index] ?? null;
	}

	get length(): number {
		return Object.keys(this.data).length;
	}

	setShouldThrow(shouldThrow: boolean): void {
		this.shouldThrow = shouldThrow;
	}

	getData(): MockStorageData {
		return { ...this.data };
	}

	setData(data: MockStorageData): void {
		this.data = { ...data };
	}

	simulateQuotaExceeded(): void {
		this.shouldThrow = true;
		this.setItem = () => {
			throw new Error('QuotaExceededError');
		};
	}
}

class MockIndexedDBStorage {
	private db: MockIndexedDB = {};
	private objectStoreNames: string[] = [];
	private shouldThrow = false;

	async openDB(
		name: string,
		version: number,
		upgradeCallback?: (db: IDBDatabase) => void
	): Promise<IDBDatabase> {
		if (this.shouldThrow) {
			throw new Error('IndexedDB is not available');
		}

		if (!this.db[name]) {
			this.db[name] = {};
		}

		const db = {
			name,
			version,
			objectStoreNames: this.objectStoreNames,
			createObjectStore: (storeName: string, _options?: IDBObjectStoreParameters) => {
				if (!this.objectStoreNames.includes(storeName)) {
					this.objectStoreNames.push(storeName);
				}
				if (!this.db[name]) {
					this.db[name] = {};
				}
				this.db[name][storeName] = {};
				return {
					add: vi.fn(),
					put: vi.fn(),
					get: vi.fn().mockResolvedValue(undefined),
					getAll: vi.fn().mockResolvedValue([]),
					delete: vi.fn(),
					clear: vi.fn(),
					createIndex: vi.fn(),
				};
			},
			objectStore: (storeName: string) => {
				if (!this.db[name]?.[storeName]) {
					throw new Error(`ObjectStore "${storeName}" does not exist`);
				}
				return {
					add: vi.fn().mockImplementation((key: string, value: unknown) => {
						(this.db[name] as Record<string, unknown>)[storeName] = this.db[name][storeName] || {};
						(this.db[name][storeName] as Record<string, unknown>)[key] = value;
						return Promise.resolve(key);
					}),
					put: vi.fn().mockImplementation((key: string, value: unknown) => {
						(this.db[name][storeName] as Record<string, unknown>)[key] = value;
						return Promise.resolve(key);
					}),
					get: vi.fn().mockImplementation((key: string) => {
						return Promise.resolve(
							(this.db[name][storeName] as Record<string, unknown>)[key] ?? undefined
						);
					}),
					getAll: vi.fn().mockImplementation(() => {
						return Promise.resolve(Object.values(this.db[name][storeName] || {}));
					}),
					delete: vi.fn().mockImplementation((key: string) => {
						delete (this.db[name][storeName] as Record<string, unknown>)[key];
						return Promise.resolve(undefined);
					}),
					clear: vi.fn().mockImplementation(() => {
						this.db[name][storeName] = {};
						return Promise.resolve(undefined);
					}),
					createIndex: vi.fn(),
					transaction: vi.fn(),
				};
			},
			transaction: vi
				.fn()
				.mockImplementation((_storeNames: string[], _mode: IDBTransactionMode) => {
					return {
						objectStore: (storeName: string) => {
							if (!this.db[name]?.[storeName]) {
								throw new Error(`ObjectStore "${storeName}" does not exist`);
							}
							return {
								add: vi.fn(),
								put: vi.fn(),
								get: vi.fn(),
								getAll: vi.fn(),
								delete: vi.fn(),
								clear: vi.fn(),
							};
						},
						oncomplete: null,
						onerror: null,
					};
				}),
			close: vi.fn(),
		};

		if (upgradeCallback) {
			await upgradeCallback(db as unknown as IDBDatabase);
		}

		return db as unknown as IDBDatabase;
	}

	clearDB(): void {
		this.db = {};
		this.objectStoreNames = [];
	}

	getDB(): MockIndexedDB {
		return { ...this.db };
	}

	setShouldThrow(shouldThrow: boolean): void {
		this.shouldThrow = shouldThrow;
	}
}

export const mockLocalStorage = new MockLocalStorage();
export const mockIndexedDB = new MockIndexedDBStorage();

export function createMockOfflineProgress(
	overrides: Partial<MockOfflineProgress> = {}
): MockOfflineProgress {
	return {
		quizProgress: null,
		flashcardReviews: [],
		studySessionData: {},
		timestamp: Date.now(),
		...overrides,
	};
}

export function createMockQuizProgress(
	overrides: Partial<MockOfflineProgress['quizProgress']> = {}
): NonNullable<MockOfflineProgress['quizProgress']> {
	const now = new Date().toISOString();
	return {
		id: 'quiz_123',
		quizId: 'quiz_math_001',
		subject: 'Mathematics',
		answers: [],
		currentQuestionIndex: 0,
		startedAt: now,
		lastUpdatedAt: now,
		completed: false,
		...overrides,
	};
}

export function setupStorageMocks() {
	mockLocalStorage.clear();
	mockIndexedDB.clearDB();

	global.localStorage = mockLocalStorage as unknown as Storage;
	global.sessionStorage = mockLocalStorage as unknown as Storage;

	Object.defineProperty(global, 'indexedDB', {
		value: {
			open: mockIndexedDB.openDB.bind(mockIndexedDB),
		},
		writable: true,
	});
}

export function resetStorageMocks() {
	mockLocalStorage.clear();
	mockIndexedDB.clearDB();
}

export function setLocalStorageItem(key: string, value: string): void {
	mockLocalStorage.setItem(key, value);
}

export function getLocalStorageItem(key: string): string | null {
	return mockLocalStorage.getItem(key);
}

export function removeLocalStorageItem(key: string): void {
	mockLocalStorage.removeItem(key);
}

export function clearLocalStorage(): void {
	mockLocalStorage.clear();
}

export function simulateLocalStorageUnavailable(): void {
	mockLocalStorage.simulateQuotaExceeded();
}

export function setLocalStorageData(data: MockStorageData): void {
	mockLocalStorage.setData(data);
}

export function getLocalStorageData(): MockStorageData {
	return mockLocalStorage.getData();
}
