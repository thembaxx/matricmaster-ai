export type QuestionType = 'mcq' | 'shortAnswer' | 'trueFalse' | 'matching';

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

export type AnyQuizQuestion =
	| QuizQuestion
	| ShortAnswerQuestion
	| MatchingQuestion
	| TrueFalseQuestion;

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
