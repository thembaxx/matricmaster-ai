export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	accessCount: number;
	lastAccessed: number;
	size: number;
}

export interface LRUCacheOptions {
	maxSize?: number;
	maxAge?: number;
	defaultSize?: number;
}

export class BrowserStorageLRU<T = unknown> {
	private cache: Map<string, CacheEntry<T>>;
	private maxSize: number;
	private maxAge: number;
	private defaultSize: number;
	private storage: Storage;

	constructor(namespace: string, options: LRUCacheOptions = {}) {
		this.maxSize = options.maxSize || 50 * 1024 * 1024;
		this.maxAge = options.maxAge || 30 * 24 * 60 * 60 * 1000;
		this.defaultSize = options.defaultSize || 1024;
		this.cache = new Map();
		this.storage = typeof window !== 'undefined' ? localStorage : ({} as Storage);

		this.loadFromStorage(namespace);
	}

	private loadFromStorage(namespace: string) {
		try {
			const stored = this.storage.getItem(`lru-cache-${namespace}`);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.cache = new Map(Object.entries(parsed));
				this.evictExpired();
			}
		} catch (error) {
			console.debug('Failed to load cache from storage:', error);
		}
	}

	private saveToStorage(namespace: string) {
		try {
			const obj = Object.fromEntries(this.cache);
			this.storage.setItem(`lru-cache-${namespace}`, JSON.stringify(obj));
		} catch (error) {
			console.debug('Failed to save cache to storage:', error);
			if (this.isQuotaExceeded(error)) {
				this.evict(5);
				this.saveToStorage(namespace);
			}
		}
	}

	private isQuotaExceeded(error: unknown): boolean {
		return (
			error instanceof DOMException &&
			(error.code === 22 ||
				error.code === 1014 ||
				error.name === 'QuotaExceededError' ||
				error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
		);
	}

	private evictExpired() {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.maxAge) {
				this.cache.delete(key);
			}
		}
	}

	private calculateSize(): number {
		let total = 0;
		for (const entry of this.cache.values()) {
			total += entry.size;
		}
		return total;
	}

	private evict(count: number) {
		const entries = Array.from(this.cache.entries())
			.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
			.slice(0, count);

		for (const [key] of entries) {
			this.cache.delete(key);
		}
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.maxAge) {
			this.cache.delete(key);
			return null;
		}

		entry.accessCount++;
		entry.lastAccessed = Date.now();

		this.cache.delete(key);
		this.cache.set(key, entry);

		return entry.data;
	}

	set(key: string, data: T, size?: number) {
		const dataSize = size || this.defaultSize;

		while (this.calculateSize() + dataSize > this.maxSize && this.cache.size > 0) {
			this.evict(1);
		}

		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			accessCount: 1,
			lastAccessed: Date.now(),
			size: dataSize,
		};

		this.cache.set(key, entry);
	}

	remove(key: string) {
		this.cache.delete(key);
	}

	clear() {
		this.cache.clear();
	}

	getStats() {
		const now = Date.now();
		let expired = 0;

		for (const entry of this.cache.values()) {
			if (now - entry.timestamp > this.maxAge) expired++;
		}

		return {
			entries: this.cache.size,
			size: this.calculateSize(),
			maxSize: this.maxSize,
			expired,
		};
	}

	namespaceSave(namespace: string) {
		this.saveToStorage(namespace);
	}
}

export const pastPaperCache = new BrowserStorageLRU<ArrayBuffer>('past-papers', {
	maxSize: 200 * 1024 * 1024,
	maxAge: 30 * 24 * 60 * 60 * 1000,
	defaultSize: 1024 * 1024,
});

export const quizCache = new BrowserStorageLRU('quizzes', {
	maxSize: 10 * 1024 * 1024,
	maxAge: 7 * 24 * 60 * 60 * 1000,
});

export function estimateFileSize(file: File): number {
	return file.size;
}
