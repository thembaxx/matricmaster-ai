export type TopicStatus = 'mastered' | 'in-progress' | 'not-started';

export interface Topic {
	id: string;
	name: string;
	status: TopicStatus;
	progress: number;
	lastPracticed?: string;
	questionsAttempted: number;
	questionsCorrect?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
	timeToMaster?: number;
	weaknesses?: string[];
	isCustom?: boolean;
	prerequisites?: string[];
}

export interface Subject {
	id: string;
	name: string;
	color: string;
	icon: string;
	topics: Topic[];
}

export interface StudyRecommendation {
	topicId: string;
	subjectId: string;
	subjectName: string;
	topicName: string;
	reason: string;
	priority: number;
}
