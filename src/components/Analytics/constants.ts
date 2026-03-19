export interface StudyStats {
	totalStudyTime: number;
	quizzesCompleted: number;
	correctAnswers: number;
	flashcardsReviewed: number;
	streakDays: number;
	level: number;
	xp: number;
	xpToNextLevel: number;
}

export interface SubjectPerformance {
	subject: string;
	averageScore: number;
	questionsAnswered: number;
	weakAreas: string[];
	strengthAreas: string[];
	trend: 'up' | 'down' | 'stable';
}

export interface DailyActivity {
	date: string;
	studyMinutes: number;
	quizzesTaken: number;
	flashcardsReviewed: number;
	xpEarned: number;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlockedAt: Date | null;
	progress: number;
}

export const MOCK_STATS: StudyStats = {
	totalStudyTime: 12480,
	quizzesCompleted: 156,
	correctAnswers: 892,
	flashcardsReviewed: 456,
	streakDays: 12,
	level: 23,
	xp: 4520,
	xpToNextLevel: 5000,
};

export const MOCK_SUBJECTS: SubjectPerformance[] = [
	{
		subject: 'Mathematics',
		averageScore: 78,
		questionsAnswered: 234,
		weakAreas: ['Calculus', 'Trigonometry'],
		strengthAreas: ['Algebra', 'Statistics'],
		trend: 'up',
	},
	{
		subject: 'Physical Sciences',
		averageScore: 72,
		questionsAnswered: 189,
		weakAreas: ['Electromagnetism'],
		strengthAreas: ['Mechanics', 'Waves'],
		trend: 'up',
	},
	{
		subject: 'Life Sciences',
		averageScore: 85,
		questionsAnswered: 167,
		weakAreas: ['Genetics'],
		strengthAreas: ['Cell Biology', 'Ecology'],
		trend: 'stable',
	},
	{
		subject: 'Geography',
		averageScore: 68,
		questionsAnswered: 145,
		weakAreas: ['Mapwork', 'Climatology'],
		strengthAreas: ['Geomorphology'],
		trend: 'down',
	},
	{
		subject: 'History',
		averageScore: 82,
		questionsAnswered: 123,
		weakAreas: ['Cold War'],
		strengthAreas: [' colonialism', 'World Wars'],
		trend: 'up',
	},
];

export const MOCK_ACTIVITY: DailyActivity[] = Array.from({ length: 7 }, (_, i) => {
	const date = new Date();
	date.setDate(date.getDate() - (6 - i));
	return {
		date: date.toLocaleDateString('en-US', { weekday: 'short' }),
		studyMinutes: Math.floor(Math.random() * 120) + 30,
		quizzesTaken: Math.floor(Math.random() * 5) + 1,
		flashcardsReviewed: Math.floor(Math.random() * 30) + 10,
		xpEarned: Math.floor(Math.random() * 500) + 100,
	};
});

export const MOCK_ACHIEVEMENTS: Achievement[] = [
	{
		id: '1',
		name: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
		unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '2',
		name: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
		unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '3',
		name: 'Perfect Score',
		description: 'Get 100% on a quiz',
		icon: '⭐',
		unlockedAt: null,
		progress: 75,
	},
	{
		id: '4',
		name: 'Memory Master',
		description: 'Review 500 flashcards',
		icon: '🧠',
		unlockedAt: null,
		progress: 91,
	},
	{
		id: '5',
		name: 'Early Bird',
		description: 'Study before 7 AM',
		icon: '🌅',
		unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
		progress: 100,
	},
	{
		id: '6',
		name: 'Night Owl',
		description: 'Study after 10 PM',
		icon: '🦉',
		unlockedAt: null,
		progress: 60,
	},
];
