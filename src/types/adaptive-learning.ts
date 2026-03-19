export interface WeakTopicAlert {
	topic: string;
	subject: string;
	score: number;
	threshold: number;
	suggestions: string[];
}

export interface AdaptiveTrigger {
	type: 'weak_topic_flagged' | 'review_suggested' | 'path_updated' | 'flashcard_added';
	topic: string;
	subjectId: number;
	score?: number;
	threshold: number;
	action: 'ai_tutor_flag' | 'schedule_review' | 'update_path' | 'generate_flashcards';
}

export interface AdaptiveLearningState {
	isProcessing: boolean;
	weakTopics: WeakTopicAlert[];
	triggers: AdaptiveTrigger[];
	hasProcessed: boolean;
}
