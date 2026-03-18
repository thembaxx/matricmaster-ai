export interface Character {
	id: string;
	name: string;
	role: 'protagonist' | 'antagonist' | 'supporting';
	description: string;
	relationships: { characterId: string; relationship: string }[];
}

export interface Theme {
	id: string;
	name: string;
	description: string;
	examples: string[];
}

export interface Quote {
	id: string;
	text: string;
	speaker: string;
	context: string;
	pageNumber?: number;
	themeIds: string[];
}

export interface Setwork {
	id: string;
	title: string;
	author: string;
	genre: 'novel' | 'drama' | 'poetry' | 'short-story';
	year: number;
	targetLevel: 'HL' | 'FAL';
	synopsis: string;
	context: string;
	characters: Character[];
	themes: Theme[];
	quotes: Quote[];
}

export interface QuizQuestion {
	id: string;
	setworkId: string;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	difficulty: 'easy' | 'medium' | 'hard';
}
