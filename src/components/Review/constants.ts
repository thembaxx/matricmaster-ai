import type { DueFlashcard, ReviewStats } from '@/lib/db/review-queue-actions';

export interface StudyRecommendation {
	type: 'weak_topic' | 'review' | 'practice' | 'flashcard' | 'new_topic';
	priority: 'high' | 'medium' | 'low';
	topic: string;
	reason: string;
	action: string;
	estimatedTime: string;
}

export interface RecommendationsResponse {
	recommendations: StudyRecommendation[];
	summary: string;
	overdueReviews: number;
	totalWeakTopics: number;
}

export interface ReviewData {
	dueCards: DueFlashcard[];
	reviewStats: ReviewStats | null;
	recommendations: RecommendationsResponse | null;
}
