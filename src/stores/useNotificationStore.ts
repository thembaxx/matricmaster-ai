import { create } from 'zustand';

export type NotificationType =
	| 'achievement'
	| 'streak'
	| 'reminder'
	| 'study_complete'
	| 'flashcard_due'
	| 'wellness_tip'
	| 'burnout_alert'
	| 'leaderboard_update'
	| 'study_buddy_request'
	| 'exam_reminder'
	| 'practice_result'
	| 'revision_session';

interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: Date;
	read: boolean;
}

interface NotificationState {
	unreadCount: number;
	notifications: Notification[];
	incrementUnread: () => void;
	resetUnread: () => void;
	setUnreadCount: (count: number) => void;
	addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
	markAsRead: (id: string) => void;
	clearAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const createDate = (daysAgo: number, hoursAgo = 0): Date => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	date.setHours(date.getHours() - hoursAgo);
	return date;
};

const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: generateId(),
		type: 'achievement',
		title: 'Quiz Master',
		message: 'You scored 90% in your Mathematics Algebra quiz! Keep up the excellent work.',
		timestamp: createDate(0, 1),
		read: false,
	},
	{
		id: generateId(),
		type: 'leaderboard_update',
		title: 'You moved up!',
		message: "You're now #47 on the Mathematics leaderboard. Only 3 spots away from the top 50!",
		timestamp: createDate(0, 3),
		read: false,
	},
	{
		id: generateId(),
		type: 'reminder',
		title: 'Physics Revision Due',
		message: "Your scheduled revision session on Newton's Laws starts in 30 minutes.",
		timestamp: createDate(0, 5),
		read: false,
	},
	{
		id: generateId(),
		type: 'study_buddy_request',
		title: 'Study Buddy Request',
		message: 'A fellow learner from Pretoria wants to study together for Life Sciences. Accept?',
		timestamp: createDate(0, 8),
		read: false,
	},
	{
		id: generateId(),
		type: 'wellness_tip',
		title: 'Wellness Tip',
		message:
			'Taking breaks actually helps you learn better. Your brain needs rest to consolidate information.',
		timestamp: createDate(0, 12),
		read: true,
	},
	{
		id: generateId(),
		type: 'practice_result',
		title: 'Practice Test Results',
		message: 'Your Geography practice test is ready. You scored 78% - above average!',
		timestamp: createDate(1, 2),
		read: true,
	},
	{
		id: generateId(),
		type: 'achievement',
		title: '7-Day Streak!',
		message: "Amazing! You've studied every day this week. Your dedication is inspiring.",
		timestamp: createDate(1, 6),
		read: true,
	},
	{
		id: generateId(),
		type: 'flashcard_due',
		title: 'Flashcards Ready',
		message: "You have 15 Chemistry flashcards due for review. Don't lose your progress!",
		timestamp: createDate(1, 10),
		read: true,
	},
	{
		id: generateId(),
		type: 'exam_reminder',
		title: 'Exam Countdown',
		message: 'Your Mathematics Paper 1 exam is in 3 weeks. Time to intensify your preparation!',
		timestamp: createDate(2, 4),
		read: true,
	},
	{
		id: generateId(),
		type: 'leaderboard_update',
		title: 'Weekly Ranking',
		message: "You finished #32 in this week's study leaderboard. Top 30 is within reach!",
		timestamp: createDate(2, 8),
		read: true,
	},
	{
		id: generateId(),
		type: 'revision_session',
		title: 'Revision Complete',
		message: 'You completed your scheduled revision on Accounting. Great job staying consistent!',
		timestamp: createDate(3, 1),
		read: true,
	},
	{
		id: generateId(),
		type: 'burnout_alert',
		title: 'Time for a Break',
		message: "You've been working hard for 2 hours straight. Consider taking a 10-minute break.",
		timestamp: createDate(3, 5),
		read: true,
	},
	{
		id: generateId(),
		type: 'study_complete',
		title: 'Session Complete',
		message: 'You completed your 45-minute English study session. Well done!',
		timestamp: createDate(4, 2),
		read: true,
	},
	{
		id: generateId(),
		type: 'achievement',
		title: 'First Perfect Score!',
		message: 'Congratulations! You got 100% on your Physical Sciences quiz on Waves.',
		timestamp: createDate(4, 8),
		read: true,
	},
	{
		id: generateId(),
		type: 'wellness_tip',
		title: 'Wellness Tip',
		message: 'Deep breathing helps reduce stress. Try 4 seconds in, 4 seconds out.',
		timestamp: createDate(5, 3),
		read: true,
	},
	{
		id: generateId(),
		type: 'reminder',
		title: 'Study Plan Reminder',
		message: 'You planned to review Life Sciences Cell Division today. Ready to start?',
		timestamp: createDate(5, 7),
		read: true,
	},
	{
		id: generateId(),
		type: 'study_buddy_request',
		title: 'Study Buddy Match',
		message: 'You matched with Thando from Johannesburg for weekly study sessions!',
		timestamp: createDate(6, 4),
		read: true,
	},
	{
		id: generateId(),
		type: 'flashcard_due',
		title: 'Review Time',
		message: '25 Mathematics flashcards are ready for review. Your future self will thank you!',
		timestamp: createDate(7, 2),
		read: true,
	},
	{
		id: generateId(),
		type: 'leaderboard_update',
		title: 'New Achievement',
		message: "You've earned the 'Early Bird' badge for studying before 7am 5 times this month!",
		timestamp: createDate(8, 6),
		read: true,
	},
	{
		id: generateId(),
		type: 'exam_reminder',
		title: 'Important Date',
		message: 'Final exams start in 6 weeks. Your study plan is looking good - keep it up!',
		timestamp: createDate(9, 10),
		read: true,
	},
];

const WELLNESS_TIPS = [
	'Take a 5-minute break every 25 minutes to stay fresh and focused.',
	'Remember to stretch! Stand up and move around to keep your energy up.',
	'Deep breathing helps reduce stress. Try 4 seconds in, 4 seconds out.',
	'Taking breaks actually helps you learn better. Your brain needs rest to consolidate information.',
	'Stay hydrated! Keep a water bottle nearby while studying.',
	'If you feel stuck on a topic, switch to another one and come back later.',
	'Celebrate small wins - every question you get right is progress!',
];

export const useNotificationStore = create<NotificationState>((set) => ({
	unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
	notifications: MOCK_NOTIFICATIONS,

	incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

	resetUnread: () => set({ unreadCount: 0 }),

	setUnreadCount: (count: number) => set({ unreadCount: count }),

	addNotification: (notification) =>
		set((state) => {
			const newNotification: Notification = {
				...notification,
				id: generateId(),
				timestamp: new Date(),
				read: false,
			};
			return {
				notifications: [newNotification, ...state.notifications],
				unreadCount: state.unreadCount + 1,
			};
		}),

	markAsRead: (id) =>
		set((state) => {
			const notifications = state.notifications.map((n) =>
				n.id === id ? { ...n, read: true } : n
			);
			const unreadCount = notifications.filter((n) => !n.read).length;
			return { notifications, unreadCount };
		}),

	clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

export function addWellnessTip() {
	const randomTip = WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)];
	useNotificationStore.getState().addNotification({
		type: 'wellness_tip',
		title: 'Wellness Tip',
		message: randomTip,
	});
}

export function addBurnoutAlert() {
	useNotificationStore.getState().addNotification({
		type: 'burnout_alert',
		title: 'Time for a Break',
		message: "You've been working hard. Consider taking a short break to recharge.",
	});
}
