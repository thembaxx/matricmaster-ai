export class SeededRandom {
	private state: number;

	constructor(seed: number) {
		this.state = seed;
	}

	next(): number {
		this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
		return this.state / 0x7fffffff;
	}

	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	nextFloat(min: number, max: number): number {
		return this.next() * (max - min) + min;
	}

	boolean(probability = 0.5): boolean {
		return this.next() < probability;
	}

	pick<T>(array: T[]): T {
		return array[this.nextInt(0, array.length - 1)];
	}

	pickWeighted<T>(items: T[], weights: number[]): T {
		const total = weights.reduce((a, b) => a + b, 0);
		const r = this.next() * total;
		let sum = 0;
		for (let i = 0; i < items.length; i++) {
			sum += weights[i];
			if (sum >= r) return items[i];
		}
		return items[items.length - 1];
	}

	shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i);
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	uuid(): string {
		const hex = '0123456789abcdef';
		let result = '';
		for (let i = 0; i < 36; i++) {
			if (i === 8 || i === 13 || i === 18 || i === 23) {
				result += '-';
			} else if (i === 14) {
				result += '4';
			} else if (i === 19) {
				result += hex[this.nextInt(8, 11)];
			} else {
				result += hex[this.nextInt(0, 15)];
			}
		}
		return result;
	}

	normal(mean: number, stdDev: number): number {
		const u1 = this.next();
		const u2 = this.next();
		const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
		return z * stdDev + mean;
	}

	logNormal(mean: number, stdDev: number): number {
		const normalVal = this.normal(mean, stdDev);
		return Math.exp(normalVal);
	}

	repeat<T>(count: number, generator: (index: number) => T): T[] {
		return Array.from({ length: count }, (_, i) => generator(i));
	}
}

export const createSeededRandom = (seed?: number): SeededRandom => {
	return new SeededRandom(seed ?? Math.floor(Math.random() * 999999));
};
