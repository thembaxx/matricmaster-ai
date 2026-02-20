/**
 * Spaced Repetition System (SM-2 Algorithm Implementation)
 *
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface SpacedRepetitionCard {
	id: string;
	interval: number;
	repetitions: number;
	easeFactor: number;
	nextReview: Date;
	lastReview?: Date;
}

export interface ReviewResult {
	interval: number;
	repetitions: number;
	easeFactor: number;
	nextReview: Date;
}

export const RATING_LABELS: Record<Rating, { label: string; description: string; color: string }> =
	{
		1: { label: 'Again', description: 'Complete blackout', color: 'bg-red-500' },
		2: { label: 'Hard', description: 'Incorrect, but remembered', color: 'bg-orange-500' },
		3: { label: 'Good', description: 'Correct with hesitation', color: 'bg-yellow-500' },
		4: { label: 'Easy', description: 'Correct without hesitation', color: 'bg-green-500' },
		5: { label: 'Perfect', description: 'Instant recall', color: 'bg-emerald-500' },
	};

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

export function calculateNextReview(
	currentInterval: number,
	currentRepetitions: number,
	currentEaseFactor: number,
	rating: Rating,
	lastReview?: Date
): ReviewResult {
	let interval: number;
	let repetitions: number;
	let easeFactor: number;

	if (rating < 3) {
		repetitions = 0;
		interval = 1;
	} else {
		if (currentRepetitions === 0) {
			interval = 1;
		} else if (currentRepetitions === 1) {
			interval = 6;
		} else {
			interval = Math.round(currentInterval * currentEaseFactor);
		}
		repetitions = currentRepetitions + 1;
	}

	easeFactor = currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
	easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

	if (rating === 1) {
		easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
	}

	const baseDate = lastReview || new Date();
	const nextReview = new Date(baseDate);
	nextReview.setDate(nextReview.getDate() + interval);

	return {
		interval,
		repetitions,
		easeFactor: Math.round(easeFactor * 100) / 100,
		nextReview,
	};
}

export function getCardsDueForReview(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
	const now = new Date();
	return cards
		.filter((card) => new Date(card.nextReview) <= now)
		.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
}

export function getCardsDueToday(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
	const now = new Date();
	const endOfDay = new Date(now);
	endOfDay.setHours(23, 59, 59, 999);

	return cards.filter((card) => {
		const nextReview = new Date(card.nextReview);
		return nextReview <= endOfDay;
	});
}

export function getCardsDueByDate(
	cards: SpacedRepetitionCard[],
	date: Date
): SpacedRepetitionCard[] {
	return cards.filter((card) => {
		const nextReview = new Date(card.nextReview);
		return nextReview.toDateString() === date.toDateString();
	});
}

export function calculateMasteryLevel(
	timesReviewed: number,
	timesCorrect: number,
	averageRating: number
): number {
	if (timesReviewed === 0) return 0;

	const accuracy = timesCorrect / timesReviewed;
	const ratingScore = (averageRating - 1) / 4;
	const recencyBonus = Math.min(timesReviewed / 10, 0.2);

	const mastery = accuracy * 0.4 + ratingScore * 0.4 + recencyBonus;
	return Math.min(Math.round(mastery * 100), 100);
}

export function getReviewForecast(cards: SpacedRepetitionCard[], days = 7): number[] {
	const forecast: number[] = new Array(days).fill(0);
	const now = new Date();

	for (const card of cards) {
		const nextReview = new Date(card.nextReview);
		const dayDiff = Math.floor((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		if (dayDiff >= 0 && dayDiff < days) {
			forecast[dayDiff]++;
		}
	}

	return forecast;
}

export function initializeCard(): Omit<SpacedRepetitionCard, 'id'> {
	return {
		interval: 0,
		repetitions: 0,
		easeFactor: DEFAULT_EASE_FACTOR,
		nextReview: new Date(),
	};
}

export function formatReviewInterval(interval: number): string {
	if (interval === 0) return 'Today';
	if (interval === 1) return 'Tomorrow';
	if (interval < 7) return `In ${interval} days`;
	if (interval < 30) {
		const weeks = Math.round(interval / 7);
		return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
	}
	if (interval < 365) {
		const months = Math.round(interval / 30);
		return `In ${months} month${months > 1 ? 's' : ''}`;
	}
	const years = Math.round(interval / 365);
	return `In ${years} year${years > 1 ? 's' : ''}`;
}
