// API endpoints configuration
export const API_ENDPOINTS = {
	// Authentication
	auth: '/api/auth',
	health: '/api/health',
	cspReport: '/api/csp-report',

	// User Progress
	progress: '/api/progress',
	streak: '/api/streak',
	sessions: '/api/sessions',
	userProgress: '/api/user-progress',

	// Gamification
	achievements: '/api/achievements',
	leaderboard: '/api/leaderboard',

	// Study Features
	quiz: '/api/quiz',
	interactiveQuiz: '/api/interactive-quiz',
	flashcards: '/api/flashcards',
	studyPlan: '/api/study-plan',

	// Content
	pastPapers: '/api/past-papers',
	lessons: '/api/lessons',
	search: '/api/search',

	// Social Features
	notifications: '/api/notifications',
	comments: '/api/comments',
	channels: '/api/channels',

	// Admin/Management
	admin: '/api/admin',
	cms: '/api/cms',
	users: '/api/users',
};

// API route patterns for categorization
export const API_ROUTE_PATTERNS = {
	// Routes that allow public GET requests
	publicGet: [
		API_ENDPOINTS.health,
		API_ENDPOINTS.cspReport,
		API_ENDPOINTS.pastPapers,
		API_ENDPOINTS.lessons,
		API_ENDPOINTS.search,
	],

	// Routes that require authentication for all operations
	protected: [
		API_ENDPOINTS.progress,
		API_ENDPOINTS.streak,
		API_ENDPOINTS.sessions,
		API_ENDPOINTS.userProgress,
		API_ENDPOINTS.achievements,
		API_ENDPOINTS.leaderboard,
		API_ENDPOINTS.quiz,
		API_ENDPOINTS.interactiveQuiz,
		API_ENDPOINTS.flashcards,
		API_ENDPOINTS.studyPlan,
		API_ENDPOINTS.notifications,
		API_ENDPOINTS.comments,
		API_ENDPOINTS.channels,
	],

	// Routes that require admin privileges
	admin: [API_ENDPOINTS.admin, API_ENDPOINTS.cms, API_ENDPOINTS.users],

	// Routes that allow public access but may have enhanced features for authenticated users
	publicWithAuthEnhancement: [
		API_ENDPOINTS.pastPapers,
		API_ENDPOINTS.lessons,
		API_ENDPOINTS.search,
	],
};

// Query keys for React Query caching
export const QUERY_KEYS = {
	// User data
	user: ['user'],
	progress: ['progress'],
	streak: ['streak'],
	sessions: ['sessions'],
	userProgress: ['user-progress'],

	// Gamification
	achievements: ['achievements'],
	leaderboard: ['leaderboard'],

	// Study features
	quiz: ['quiz'],
	interactiveQuiz: ['interactive-quiz'],
	flashcards: ['flashcards'],
	studyPlan: ['study-plan'],

	// Content
	pastPapers: ['past-papers'],
	lessons: ['lessons'],
	search: ['search'],

	// Social features
	notifications: ['notifications'],
	comments: ['comments'],
	channels: ['channels'],

	// Admin features
	admin: ['admin'],
	cms: ['cms'],
	users: ['users'],
};

// Mutation keys for React Query
export const MUTATION_KEYS = {
	// Progress tracking
	recordSession: ['record-session'],
	updateProgress: ['update-progress'],
	updateStreak: ['update-streak'],

	// Study actions
	startQuiz: ['start-quiz'],
	submitQuiz: ['submit-quiz'],
	updateFlashcard: ['update-flashcard'],

	// Social actions
	createComment: ['create-comment'],
	updateNotification: ['update-notification'],

	// Admin actions
	createUser: ['create-user'],
	updateUser: ['update-user'],
	deleteUser: ['delete-user'],
};
