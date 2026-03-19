import {
	BookOpen01Icon,
	Calendar02Icon,
	FireIcon,
	Medal01Icon,
	Message01Icon,
	SparklesIcon,
	Timer02Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';

export interface NotificationAction {
	label: string;
	href?: string;
	onClick?: () => void;
	variant?: 'default' | 'outline' | 'ghost';
}

export type NotificationIcon =
	| 'trophy'
	| 'fire'
	| 'calendar'
	| 'user'
	| 'chart'
	| 'rank'
	| 'timer'
	| 'book'
	| 'sparkles'
	| 'message';

export interface Notification {
	id: string;
	type:
		| 'achievement'
		| 'streak'
		| 'exam'
		| 'buddy'
		| 'progress'
		| 'leaderboard'
		| 'study_reminder'
		| 'past_paper'
		| 'weekly_summary';
	title: string;
	message: string;
	detail?: string;
	icon: NotificationIcon;
	iconColor: string;
	iconBg: string;
	actions?: NotificationAction[];
	isRead: boolean;
	createdAt: Date;
}

export const iconMap = {
	trophy: Medal01Icon,
	fire: FireIcon,
	calendar: Calendar02Icon,
	user: UserIcon,
	chart: SparklesIcon,
	rank: Medal01Icon,
	timer: Timer02Icon,
	book: BookOpen01Icon,
	sparkles: SparklesIcon,
	message: Message01Icon,
};
