import {
	AiBrain01Icon,
	AlertCircleIcon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	ChampionIcon,
	Chat01Icon,
	ComputerVideoCallIcon,
	ContentWritingIcon,
	File01Icon,
	GlobeIcon,
	GridIcon,
	Home01Icon,
	Key01Icon,
	Layers01Icon,
	LayoutLeftIcon,
	MapsIcon,
	Medal01Icon,
	Mic01Icon,
	Mortarboard02Icon,
	Notification03Icon,
	QuestionIcon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	SparklesIcon,
	Timer01Icon,
	UserGroupIcon,
	User as UserIcon,
} from '@hugeicons/core-free-icons';
import type { authClient } from '@/lib/auth-client';

export type AuthUser = typeof authClient.$Infer.Session.user;

export type IconSvg = typeof Home01Icon;

export type MenuItem = {
	href: string;
	label: string;
	icon?: IconSvg;
	fluentEmoji?: string;
};

export type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
	{
		title: 'Learning',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: Home01Icon },
			{ href: '/demo', label: 'Demo', icon: SparklesIcon },
			{ href: '/lessons', label: 'Lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'Physics', fluentEmoji: '⚛️' },
			{ href: '/search', label: 'Search', icon: Search01Icon },
			{ href: '/study-companion', label: 'Study Companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'Study Path', icon: MapsIcon },
			{ href: '/study-plan', label: 'Study Plan', icon: Calendar01Icon },
			{ href: '/curriculum-map', label: 'Curriculum Map', icon: GridIcon },
			{ href: '/periodic-table', label: 'Periodic Table', fluentEmoji: '⚛️' },
			{ href: '/chat', label: 'Study Buddy', icon: Chat01Icon },
			{ href: '/smart-scheduler', label: 'Smart Scheduler', icon: Calendar01Icon },
			{ href: '/tutoring', label: 'Matric Tutor', icon: ComputerVideoCallIcon },
			{ href: '/voice-tutor', label: 'Voice Tutor', icon: Mic01Icon },
			{ href: '/essay-grader', label: 'Essay Grader', icon: ContentWritingIcon },
			{ href: '/aps-calculator', label: 'APS Calculator', icon: CalculatorIcon },
			{ href: '/exam-timer', label: 'Exam Timer', icon: Timer01Icon },
		],
	},
	{
		title: 'Practice',
		items: [
			{ href: '/quiz', label: 'Quiz', icon: QuestionIcon },
			{ href: '/flashcards', label: 'Flashcards', icon: Layers01Icon },
			{ href: '/past-papers', label: 'Past Papers', icon: File01Icon },
			{ href: '/snap-and-solve', label: 'Snap & Solve', icon: CalculatorIcon },
			{ href: '/common-questions', label: 'Common Questions', icon: QuestionIcon },
			{ href: '/review', label: 'Review', icon: AiBrain01Icon },
		],
	},
	{
		title: 'Results & Planning',
		items: [
			{ href: '/results', label: 'NSC Results', icon: Mortarboard02Icon },
			{ href: '/school', label: 'University Applications', icon: BookOpen01Icon },
			{ href: '/subscription', label: 'Subscription', icon: SparklesIcon },
			{ href: '/analytics', label: 'Analytics', icon: CalculatorIcon },
		],
	},
	{
		title: 'Focus',
		items: [
			{ href: '/focus', label: 'Focus Mode', icon: Timer01Icon },
			{ href: '/focus-rooms', label: 'Focus Rooms', icon: UserGroupIcon },
			{ href: '/offline', label: 'Offline Mode', icon: File01Icon },
		],
	},
	{
		title: 'Social',
		items: [
			{ href: '/achievements', label: 'Achievements', icon: Medal01Icon },
			{ href: '/channels', label: 'Study Channels', icon: UserGroupIcon },
			{ href: '/comments', label: 'Comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'Leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'Study Buddies', icon: UserGroupIcon },
		],
	},
	{
		title: 'Account',
		items: [
			{ href: '/2fa', label: 'Two-Factor Auth', icon: Key01Icon },
			{ href: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
			{ href: '/calendar', label: 'Calendar', icon: Calendar01Icon },
			{ href: '/language', label: 'Language', icon: GlobeIcon },
			{ href: '/notifications', label: 'Notifications', icon: Notification03Icon },
			{ href: '/parent-dashboard', label: 'Parent Portal', icon: UserGroupIcon },
			{ href: '/profile', label: 'Profile', icon: UserIcon },
			{ href: '/settings', label: 'Settings', icon: Settings01Icon },
		],
	},
	{
		title: 'Admin',
		items: [
			{ href: '/admin', label: 'Admin Panel', icon: Shield01Icon },
			{ href: '/admin/moderation', label: 'Moderation', icon: AlertCircleIcon },
			{ href: '/cms', label: 'Content Management', icon: LayoutLeftIcon },
		],
	},
];

export const sideMenuItems = sideMenuSections.flatMap((section) => section.items);
