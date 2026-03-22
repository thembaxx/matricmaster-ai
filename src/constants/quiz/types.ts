export interface QuizOption {
	id: string;
	text: string;
}

export interface QuizQuestion {
	id: string;
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

export interface QuizPaper {
	title: string;
	subject: string;
	year: number;
	session: 'May/June' | 'November';
	paper: number;
	questions: QuizQuestion[];
}

export interface QuizData {
	[paperId: string]: QuizPaper;
}
