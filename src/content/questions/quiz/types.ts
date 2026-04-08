export type QuestionType =
	| 'mcq'
	| 'shortAnswer'
	| 'trueFalse'
	| 'matching'
	| 'diagramFill'
	| 'chronologicalSort';

export interface QuizOption {
	id: string;
	text: string;
}

export interface QuizQuestion {
	id: string;
	type?: QuestionType;
	question: string;
	questionImage?: string;
	options: QuizOption[];
	correctAnswer: string;
	hint: string;
	diagram?: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface ShortAnswerQuestion {
	id: string;
	type: 'shortAnswer';
	question: string;
	questionImage?: string;
	correctAnswer: string;
	acceptableAnswers?: string[];
	keywords?: string[];
	maxMarks: number;
	gradingType: 'exact' | 'keywords' | 'aiGraded';
	hint: string;
	diagram?: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface MatchingPair {
	left: string;
	right: string;
}

export interface MatchingQuestion {
	id: string;
	type: 'matching';
	question: string;
	pairs: MatchingPair[];
	shuffledRight: string[];
	maxMarks: number;
	hint: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface TrueFalseQuestion {
	id: string;
	type: 'trueFalse';
	question: string;
	correctAnswer: boolean;
	hint: string;
	diagram?: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface DiagramFillZone {
	id: string;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DiagramFillLabel {
	id: string;
	text: string;
	zoneId: string;
}

export interface DiagramFillQuestion {
	id: string;
	type: 'diagramFill';
	question: string;
	questionImage?: string;
	imageUrl?: string;
	zones: DiagramFillZone[];
	labels: DiagramFillLabel[];
	correctAnswer: Record<string, string>;
	maxMarks: number;
	hint: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChronologicalEvent {
	id: string;
	text: string;
	year?: string;
	description?: string;
}

export interface ChronologicalSortQuestion {
	id: string;
	type: 'chronologicalSort';
	question: string;
	events: ChronologicalEvent[];
	correctOrder: string[];
	maxMarks: number;
	hint: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export type AnyQuizQuestion =
	| QuizQuestion
	| ShortAnswerQuestion
	| MatchingQuestion
	| TrueFalseQuestion
	| DiagramFillQuestion
	| ChronologicalSortQuestion;

export interface QuizPaper {
	title: string;
	subject: string;
	year: number;
	session: 'May/June' | 'November';
	paper: number;
	questions: AnyQuizQuestion[];
}

export interface QuizData {
	[paperId: string]: QuizPaper;
}
