import { create } from 'zustand';

export type NotificationType =
	| 'achievement'
	| 'streak'
	| 'reminder'
	| 'study_complete'
	| 'flashcard_due'
	| 'wellness_tip'
	| 'burnout_alert';

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
	unreadCount: 0,
	notifications: [],

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
