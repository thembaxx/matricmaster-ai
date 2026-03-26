import {
	getFlashcardsByDeck,
	getLeaderboardWithUsers,
	getPastPapersBySubject,
	getProgressBySubject,
	getQuestionsBySubject,
	getQuestionsWithOptions,
	getTopicMasteryBySubject,
	getUnreadNotifications,
	getUpcomingEvents,
	mockAchievements,
	mockBookmarks,
	mockCalendarEvents,
	mockChannels,
	mockFlashcardDecks,
	mockLeaderboardUsers,
	mockNotifications,
	mockOptions,
	mockPastPapers,
	mockSearchHistory,
	mockStudyBuddyProfiles,
	mockStudyPlans,
	mockStudySessions,
	mockSubjects,
	mockSubscriptionPlans,
	mockTopicMastery,
	mockUserAchievements,
	mockUserProgress,
	mockUserSettings,
	mockUserSubscription,
} from '@/content/mock';

export type DataSource = 'mock' | 'real';

export interface DataSourceConfig {
	source: DataSource;
	apiBaseUrl: string;
	isDemo?: boolean;
}

const getConfig = (): DataSourceConfig => {
	if (typeof window !== 'undefined') {
		return {
			source: (window as unknown as { __DATA_SOURCE__?: DataSource }).__DATA_SOURCE__ || 'mock',
			apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
			isDemo: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
		};
	}
	return {
		source: 'mock',
		apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
		isDemo: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
	};
};

export const dataConfig = getConfig();

export const isUsingMockData = () => dataConfig.source === 'mock';
export const isDemoMode = () => dataConfig.isDemo ?? false;

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
	const response = await fetch(`${dataConfig.apiBaseUrl}${endpoint}`);
	if (!response.ok) {
		throw new Error(`API Error: ${response.statusText}`);
	}
	return response.json();
}

export const api = {
	subjects: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockSubjects;
			return fetchFromAPI('/subjects');
		},
		getById: async (id: number) => {
			if (dataConfig.source === 'mock') return mockSubjects.find((s) => s.id === id);
			return fetchFromAPI(`/subjects/${id}`);
		},
	},

	questions: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return getQuestionsWithOptions();
			return fetchFromAPI('/questions');
		},
		getBySubject: async (subjectId: number) => {
			if (dataConfig.source === 'mock') return getQuestionsBySubject(subjectId);
			return fetchFromAPI(`/questions?subjectId=${subjectId}`);
		},
		getRandom: async (count = 10) => {
			if (dataConfig.source === 'mock') {
				const all = getQuestionsWithOptions();
				const shuffled = [...all].sort(() => Math.random() - 0.5);
				return shuffled.slice(0, count);
			}
			return fetchFromAPI(`/questions/random?count=${count}`);
		},
	},

	options: {
		getByQuestion: async (questionId: string) => {
			if (dataConfig.source === 'mock')
				return mockOptions.filter((o) => o.questionId === questionId);
			return fetchFromAPI(`/options?questionId=${questionId}`);
		},
	},

	progress: {
		getByUser: async () => {
			if (dataConfig.source === 'mock') return mockUserProgress;
			return fetchFromAPI('/progress');
		},
		getBySubject: async (subjectId: number) => {
			if (dataConfig.source === 'mock') return getProgressBySubject(subjectId);
			return fetchFromAPI(`/progress?subjectId=${subjectId}`);
		},
	},

	achievements: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockAchievements;
			return fetchFromAPI('/achievements');
		},
		getUserAchievements: async () => {
			if (dataConfig.source === 'mock') return mockUserAchievements;
			return fetchFromAPI('/achievements/user');
		},
	},

	studySessions: {
		getRecent: async (limit = 10) => {
			if (dataConfig.source === 'mock') return mockStudySessions.slice(0, limit);
			return fetchFromAPI(`/sessions?limit=${limit}`);
		},
		getBySubject: async (subjectId: number) => {
			if (dataConfig.source === 'mock')
				return mockStudySessions.filter((s) => s.subjectId === subjectId);
			return fetchFromAPI(`/sessions?subjectId=${subjectId}`);
		},
	},

	studyPlans: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockStudyPlans;
			return fetchFromAPI('/study-plans');
		},
		getActive: async () => {
			if (dataConfig.source === 'mock') return mockStudyPlans.find((p) => p.isActive);
			return fetchFromAPI('/study-plans/active');
		},
	},

	flashcards: {
		getDecks: async () => {
			if (dataConfig.source === 'mock') return mockFlashcardDecks;
			return fetchFromAPI('/flashcards/decks');
		},
		getByDeck: async (deckId: string) => {
			if (dataConfig.source === 'mock') return getFlashcardsByDeck(deckId);
			return fetchFromAPI(`/flashcards?deckId=${deckId}`);
		},
	},

	topicMastery: {
		getBySubject: async (subjectId: number) => {
			if (dataConfig.source === 'mock') return getTopicMasteryBySubject(subjectId);
			return fetchFromAPI(`/topic-mastery?subjectId=${subjectId}`);
		},
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockTopicMastery;
			return fetchFromAPI('/topic-mastery');
		},
	},

	leaderboard: {
		getWeekly: async () => {
			if (dataConfig.source === 'mock') return getLeaderboardWithUsers();
			return fetchFromAPI('/leaderboard/weekly');
		},
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockLeaderboardUsers;
			return fetchFromAPI('/leaderboard');
		},
	},

	channels: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockChannels;
			return fetchFromAPI('/channels');
		},
		getBySubject: async (subjectId: number) => {
			if (dataConfig.source === 'mock')
				return mockChannels.filter((c) => c.subjectId === subjectId);
			return fetchFromAPI(`/channels?subjectId=${subjectId}`);
		},
	},

	notifications: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockNotifications;
			return fetchFromAPI('/notifications');
		},
		getUnread: async () => {
			if (dataConfig.source === 'mock') return getUnreadNotifications();
			return fetchFromAPI('/notifications/unread');
		},
	},

	calendar: {
		getEvents: async () => {
			if (dataConfig.source === 'mock') return mockCalendarEvents;
			return fetchFromAPI('/calendar/events');
		},
		getUpcoming: async () => {
			if (dataConfig.source === 'mock') return getUpcomingEvents();
			return fetchFromAPI('/calendar/upcoming');
		},
	},

	pastPapers: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockPastPapers;
			return fetchFromAPI('/past-papers');
		},
		getBySubject: async (subject: string) => {
			if (dataConfig.source === 'mock') return getPastPapersBySubject(subject);
			return fetchFromAPI(`/past-papers?subject=${subject}`);
		},
		getByYear: async (year: number) => {
			if (dataConfig.source === 'mock') return mockPastPapers.filter((p) => p.year === year);
			return fetchFromAPI(`/past-papers?year=${year}`);
		},
	},

	settings: {
		get: async () => {
			if (dataConfig.source === 'mock') return mockUserSettings;
			return fetchFromAPI('/settings');
		},
	},

	subscriptions: {
		getPlans: async () => {
			if (dataConfig.source === 'mock') return mockSubscriptionPlans;
			return fetchFromAPI('/subscriptions/plans');
		},
		getCurrent: async () => {
			if (dataConfig.source === 'mock') return mockUserSubscription;
			return fetchFromAPI('/subscription');
		},
	},

	studyBuddies: {
		getProfiles: async () => {
			if (dataConfig.source === 'mock') return mockStudyBuddyProfiles;
			return fetchFromAPI('/study-buddies');
		},
		getMyProfile: async () => {
			if (dataConfig.source === 'mock') return mockStudyBuddyProfiles[0];
			return fetchFromAPI('/study-buddies/me');
		},
	},

	search: {
		getHistory: async () => {
			if (dataConfig.source === 'mock') return mockSearchHistory;
			return fetchFromAPI('/search/history');
		},
	},

	bookmarks: {
		getAll: async () => {
			if (dataConfig.source === 'mock') return mockBookmarks;
			return fetchFromAPI('/bookmarks');
		},
	},
};

export default api;
