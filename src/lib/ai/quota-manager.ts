import { isQuotaError as checkQuotaError } from './quota-error';

export type AIProvider = 'google' | 'groq' | 'cohere' | 'openrouter' | 'mistral';

export interface QuotaStatus {
	provider: AIProvider;
	remaining: number;
	resetAt?: Date;
	isHealthy: boolean;
	isExhausted: boolean;
}

export interface QuotaManagerConfig {
	google?: { remaining: number; dailyLimit: number };
	groq?: { remaining: number; dailyLimit: number };
	cohere?: { remaining: number; dailyLimit: number };
	openrouter?: { remaining: number; dailyLimit: number };
	mistral?: { remaining: number; dailyLimit: number };
}

const DEFAULT_CONFIG: QuotaManagerConfig = {
	google: { remaining: 1000, dailyLimit: 1000 },
	groq: { remaining: 5000, dailyLimit: 5000 },
	cohere: { remaining: 2000, dailyLimit: 2000 },
	openrouter: { remaining: 1000, dailyLimit: 1000 },
	mistral: { remaining: 2000, dailyLimit: 2000 },
};

class AIQuotaManager {
	private quotas: Map<AIProvider, QuotaStatus> = new Map();
	private providers: AIProvider[] = ['google', 'groq', 'cohere', 'openrouter', 'mistral'];
	private fallbackOrder: AIProvider[] = ['google', 'groq', 'cohere', 'openrouter', 'mistral'];

	constructor(config?: QuotaManagerConfig) {
		const finalConfig = config ?? DEFAULT_CONFIG;
		this.initializeQuotas(finalConfig);
	}

	private initializeQuotas(config: QuotaManagerConfig) {
		this.providers.forEach((provider) => {
			const providerConfig = config[provider];
			if (providerConfig) {
				this.quotas.set(provider, {
					provider,
					remaining: providerConfig.remaining,
					isHealthy: providerConfig.remaining > 0,
					isExhausted: providerConfig.remaining <= 0,
				});
			} else {
				this.quotas.set(provider, {
					provider,
					remaining: 0,
					isHealthy: false,
					isExhausted: true,
				});
			}
		});
	}

	async getActiveProvider(): Promise<QuotaStatus> {
		for (const provider of this.fallbackOrder) {
			const status = this.quotas.get(provider);
			if (status?.isHealthy && status.remaining > 0) {
				return status;
			}
		}
		throw new Error('All AI providers exhausted');
	}

	async getAllProviderStatuses(): Promise<QuotaStatus[]> {
		return Array.from(this.quotas.values());
	}

	async decrement(provider: AIProvider, amount = 1): Promise<void> {
		const status = this.quotas.get(provider);
		if (status) {
			const newRemaining = Math.max(0, status.remaining - amount);
			this.quotas.set(provider, {
				...status,
				remaining: newRemaining,
				isHealthy: newRemaining > 0,
				isExhausted: newRemaining <= 0,
			});
		}
	}

	async markAsExhausted(provider: AIProvider): Promise<void> {
		const status = this.quotas.get(provider);
		if (status) {
			this.quotas.set(provider, {
				...status,
				remaining: 0,
				isHealthy: false,
				isExhausted: true,
			});
		}
	}

	async resetProvider(provider: AIProvider, limit: number): Promise<void> {
		const status = this.quotas.get(provider);
		if (status) {
			this.quotas.set(provider, {
				...status,
				remaining: limit,
				isHealthy: true,
				isExhausted: false,
				resetAt: new Date(),
			});
		}
	}

	async checkAndSwitchProvider(error: unknown): Promise<AIProvider | null> {
		if (checkQuotaError(error)) {
			const currentProvider = await this.getActiveProvider();
			await this.markAsExhausted(currentProvider.provider);
			const nextProvider = await this.getActiveProvider().catch(() => null);
			if (nextProvider) {
				console.log(
					`Switching from ${currentProvider.provider} to ${nextProvider.provider} due to quota`
				);
				return nextProvider.provider;
			}
		}
		return null;
	}

	async withRetry<T>(
		fn: (provider: QuotaStatus) => Promise<T>,
		onQuotaError?: (provider: AIProvider, error: Error) => Promise<AIProvider>
	): Promise<T> {
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < this.providers.length; attempt++) {
			try {
				const providerStatus = await this.getActiveProvider();
				const result = await fn(providerStatus);
				await this.decrement(providerStatus.provider);
				return result;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (checkQuotaError(error)) {
					const currentProvider = await this.getActiveProvider();
					console.warn(`Provider ${currentProvider.provider} quota exceeded, trying next...`);

					if (onQuotaError) {
						const nextProvider = await onQuotaError(currentProvider.provider, lastError);
						if (nextProvider) {
							console.log(`Fallback triggered: switching to ${nextProvider}`);
							continue;
						}
					}

					await this.markAsExhausted(currentProvider.provider);
				}
			}
		}

		throw lastError || new Error('All AI providers failed');
	}

	getProviderPriority(): AIProvider[] {
		return [...this.fallbackOrder];
	}

	setProviderPriority(providers: AIProvider[]): void {
		this.fallbackOrder = providers;
	}
}

export const aiQuotaManager = new AIQuotaManager();

export function isQuotaError(error: unknown): boolean {
	return checkQuotaError(error);
}
