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

type IconSvg = typeof Home01Icon;

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
		title: 'learning',
		items: [
			{ href: '/dashboard', label: 'dashboard', icon: Home01Icon },
			{ href: '/demo', label: 'demo', icon: SparklesIcon },
			{ href: '/lessons', label: 'lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'physics', fluentEmoji: '⚛️' },
			{ href: '/search', label: 'search', icon: Search01Icon },
			{ href: '/study-companion', label: 'study companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'study path', icon: MapsIcon },
			{ href: '/study-plan', label: 'study plan', icon: Calendar01Icon },
			{ href: '/curriculum-map', label: 'curriculum map', icon: GridIcon },
			{ href: '/periodic-table', label: 'periodic table', fluentEmoji: '⚛️' },
			{ href: '/chat', label: 'study buddy', icon: Chat01Icon },
			{ href: '/smart-scheduler', label: 'study planner', icon: Calendar01Icon },
			{ href: '/tutoring', label: 'matric tutor', icon: ComputerVideoCallIcon },
			{ href: '/voice-tutor', label: 'voice tutor', icon: Mic01Icon },
			{ href: '/essay-grader', label: 'essay grader', icon: ContentWritingIcon },
			{ href: '/aps-calculator', label: 'aps calculator', icon: CalculatorIcon },
			{ href: '/exam-timer', label: 'exam timer', icon: Timer01Icon },
		],
	},
	{
		title: 'practice',
		items: [
			{ href: '/quiz', label: 'quiz', icon: QuestionIcon },
			{ href: '/flashcards', label: 'flashcards', icon: Layers01Icon },
			{ href: '/past-papers', label: 'past papers', icon: File01Icon },
			{ href: '/snap-and-solve', label: 'snap & solve', icon: CalculatorIcon },
			{ href: '/common-questions', label: 'common questions', icon: QuestionIcon },
			{ href: '/review', label: 'review', icon: AiBrain01Icon },
		],
	},
	{
		title: 'results & planning',
		items: [
			{ href: '/results', label: 'nsc results', icon: Mortarboard02Icon },
			{ href: '/school', label: 'university applications', icon: BookOpen01Icon },
			{ href: '/subscription', label: 'subscription', icon: SparklesIcon },
			{ href: '/analytics', label: 'analytics', icon: CalculatorIcon },
		],
	},
	{
		title: 'focus',
		items: [
			{ href: '/focus', label: 'focus mode', icon: Timer01Icon },
			{ href: '/focus-rooms', label: 'focus rooms', icon: UserGroupIcon },
			{ href: '/offline', label: 'offline mode', icon: File01Icon },
		],
	},
	{
		title: 'social',
		items: [
			{ href: '/achievements', label: 'achievements', icon: Medal01Icon },
			{ href: '/channels', label: 'study channels', icon: UserGroupIcon },
			{ href: '/comments', label: 'comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'study buddies', icon: UserGroupIcon },
		],
	},
	{
		title: 'account',
		items: [
			{ href: '/2fa', label: 'two-factor auth', icon: Key01Icon },
			{ href: '/bookmarks', label: 'bookmarks', icon: BookmarkIcon },
			{ href: '/calendar', label: 'calendar', icon: Calendar01Icon },
			{ href: '/language', label: 'language', icon: GlobeIcon },
			{ href: '/notifications', label: 'notifications', icon: Notification03Icon },
			{ href: '/parent-dashboard', label: 'parent portal', icon: UserGroupIcon },
			{ href: '/profile', label: 'profile', icon: UserIcon },
			{ href: '/settings', label: 'settings', icon: Settings01Icon },
		],
	},
	{
		title: 'admin',
		items: [
			{ href: '/admin', label: 'admin panel', icon: Shield01Icon },
			{ href: '/admin/moderation', label: 'moderation', icon: AlertCircleIcon },
			{ href: '/cms', label: 'content management', icon: LayoutLeftIcon },
		],
	},
];

export const sideMenuItems = sideMenuSections.flatMap((section) => section.items);
