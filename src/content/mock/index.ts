import mockData from './seed-data.json';

export interface Subject {
	id: number;
	name: string;
	description: string | null;
	curriculumCode: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Question {
	id: string;
	subjectId: number;
	questionText: string;
	imageUrl: string | null;
	gradeLevel: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	marks: number;
	hint: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Option {
	id: string;
	questionId: string;
	optionText: string;
	isCorrect: boolean;
	optionLetter: string;
	explanation: string | null;
	isActive: boolean;
	createdAt: string;
}

export interface QuizResult {
	id: string;
	userId: string;
	quizId: string;
	score: number;
	totalQuestions: number;
	percentage: string;
	timeTaken: number;
	completedAt: string;
}

export interface UserProgress {
	id: string;
	userId: string;
	subjectId: number | null;
	topic: string | null;
	totalQuestionsAttempted: number;
	totalCorrect: number;
	totalMarksEarned: number;
	streakDays: number;
	bestStreak: number;
	streakFreezes: number;
	lastLoginBonusAt: string | null;
	consecutiveLoginDays: number;
	totalLoginBonusesClaimed: number;
	lastActivityAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface Achievement {
	id: string;
	achievementId: string;
	title: string;
	description: string;
	icon: string;
}

export interface UserAchievement {
	id: string;
	userId: string;
	achievementId: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt: string;
}

export interface StudySession {
	id: string;
	userId: string;
	subjectId: number | null;
	sessionType: 'quiz' | 'practice' | 'flashcards';
	topic: string | null;
	durationMinutes: number | null;
	questionsAttempted: number;
	correctAnswers: number;
	marksEarned: number;
	startedAt: string;
	completedAt: string | null;
}

export interface StudyPlan {
	id: string;
	userId: string;
	title: string;
	targetExamDate: string | null;
	focusAreas: string | null;
	weeklyGoals: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface FlashcardDeck {
	id: string;
	userId: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	cardCount: number;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Flashcard {
	id: string;
	deckId: string;
	front: string;
	back: string;
	imageUrl: string | null;
	difficulty: 'easy' | 'medium' | 'hard';
	timesReviewed: number;
	timesCorrect: number;
	easeFactor: string;
	intervalDays: number;
	repetitions: number;
	nextReview: string | null;
	lastReview: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface TopicMastery {
	id: string;
	userId: string;
	subjectId: number;
	topic: string;
	masteryLevel: string;
	questionsAttempted: number;
	questionsCorrect: number;
	averageTime: number | null;
	lastPracticed: string | null;
	nextReview: string | null;
	consecutiveCorrect: number;
	createdAt: string;
	updatedAt: string;
}

export interface LeaderboardEntry {
	id: string;
	userId: string;
	periodType: string;
	periodStart: string;
	totalPoints: number;
	rank: number;
	questionsCompleted: number;
	accuracyPercentage: number;
	updatedAt: string;
}

export interface LeaderboardUser {
	id: string;
	name: string;
	avatar: string;
	points: number;
	rank: number;
}

export interface Channel {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	createdBy: string;
	isPublic: boolean;
	memberCount: number;
	createdAt: string;
}

export interface Notification {
	id: string;
	userId: string;
	type: 'achievement' | 'reminder' | 'leaderboard' | 'study_buddy';
	title: string;
	message: string;
	data: string | null;
	isRead: boolean;
	readAt: string | null;
	createdAt: string;
}

export interface CalendarEvent {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	eventType: 'exam' | 'study' | 'reminder';
	subjectId: number | null;
	startTime: string;
	endTime: string;
	isAllDay: boolean;
	location: string | null;
	reminderMinutes: string | null;
	recurrenceRule: string | null;
	examId: string | null;
	lessonId: number | null;
	studyPlanId: string | null;
	isCompleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PastPaper {
	id: string;
	paperId: string;
	originalPdfUrl: string;
	storedPdfUrl: string | null;
	markdownFileUrl: string | null;
	subject: string;
	paper: string;
	year: number;
	month: string;
	isExtracted: boolean;
	extractedQuestions: string | null;
	instructions: string | null;
	totalMarks: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface UserSettings {
	userId: string;
	emailNotifications: boolean;
	pushNotifications: boolean;
	pushSubscription: string | null;
	studyReminders: boolean;
	achievementAlerts: boolean;
	profileVisibility: boolean;
	showOnLeaderboard: boolean;
	analyticsTracking: boolean;
	language: string;
	theme: string;
	updatedAt: string;
}

export interface SubscriptionPlan {
	id: string;
	name: string;
	description: string | null;
	priceZar: string;
	billingInterval: string;
	features: string[] | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UserSubscription {
	id: string;
	userId: string;
	planId: string;
	paystackCustomerCode: string | null;
	paystackSubscriptionCode: string | null;
	paystackEmailToken: string | null;
	status: string;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	isFreeTrial: boolean;
	trialEndDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StudyBuddyProfile {
	id: string;
	userId: string;
	bio: string | null;
	studyGoals: string | null;
	preferredSubjects: string | null;
	studySchedule: string | null;
	lookingFor: string | null;
	isVisible: boolean;
	matchPreferences: string | null;
	personality: string;
	createdAt: string;
	updatedAt: string;
}

export interface SearchHistory {
	id: string;
	userId: string;
	query: string;
	createdAt: string;
}

export interface Bookmark {
	id: string;
	userId: string;
	bookmarkType: string;
	referenceId: string;
	note: string | null;
	createdAt: string;
}

export const mockSubjects = mockData.subjects as Subject[];
export const mockQuestions = mockData.questions as Question[];
export const mockOptions = mockData.options as Option[];
export const mockQuizResults = mockData.quizResults as QuizResult[];
export const mockUserProgress = mockData.userProgress as UserProgress[];
export const mockAchievements = mockData.achievements as Achievement[];
export const mockUserAchievements = mockData.userAchievements as UserAchievement[];
export const mockStudySessions = mockData.studySessions as StudySession[];
export const mockStudyPlans = mockData.studyPlans as StudyPlan[];
export const mockFlashcardDecks = mockData.flashcardDecks as FlashcardDeck[];
export const mockFlashcards = mockData.flashcards as Flashcard[];
export const mockTopicMastery = mockData.topicMastery as TopicMastery[];
export const mockLeaderboard = mockData.leaderboard as LeaderboardEntry[];
export const mockLeaderboardUsers = mockData.leaderboardUsers as LeaderboardUser[];
export const mockChannels = mockData.channels as Channel[];
export const mockNotifications = mockData.notifications as Notification[];
export const mockCalendarEvents = mockData.calendarEvents as CalendarEvent[];
export const mockPastPapers = mockData.pastPapers as PastPaper[];
export const mockUserSettings = mockData.userSettings as UserSettings;
export const mockSubscriptionPlans = mockData.subscriptionPlans as SubscriptionPlan[];
export const mockUserSubscription = mockData.userSubscription as UserSubscription;
export const mockStudyBuddyProfiles = mockData.studyBuddyProfiles as StudyBuddyProfile[];
export const mockSearchHistory = mockData.searchHistory as SearchHistory[];
export const mockBookmarks = mockData.bookmarks as Bookmark[];

export const getQuestionsWithOptions = () => {
	return mockQuestions.map((question) => ({
		...question,
		options: mockOptions.filter((opt) => opt.questionId === question.id),
	}));
};

export const getQuestionsBySubject = (subjectId: number) => {
	return mockQuestions.filter((q) => q.subjectId === subjectId);
};

export const getProgressBySubject = (subjectId: number) => {
	return mockUserProgress.find((p) => p.subjectId === subjectId);
};

export const getFlashcardsByDeck = (deckId: string) => {
	return mockFlashcards.filter((f) => f.deckId === deckId);
};

export const getTopicMasteryBySubject = (subjectId: number) => {
	return mockTopicMastery.filter((t) => t.subjectId === subjectId);
};

export const getUnreadNotifications = () => {
	return mockNotifications.filter((n) => !n.isRead);
};

export const getUpcomingEvents = () => {
	const now = new Date();
	return mockCalendarEvents
		.filter((e) => new Date(e.startTime) > now && !e.isCompleted)
		.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

export const getPastPapersBySubject = (subject: string) => {
	return mockPastPapers.filter((p) => p.subject === subject);
};

export const getLeaderboardWithUsers = () => {
	return mockLeaderboardUsers.sort((a, b) => a.rank - b.rank);
};
