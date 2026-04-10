import {
	AiBrain01Icon,
	Atom01Icon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	ChampionIcon,
	Chat01Icon,
	ContentWritingIcon,
	File01Icon,
	GridIcon,
	Home01Icon,
	Layers01Icon,
	Medal01Icon,
	Mic01Icon,
	Mortarboard02Icon,
	Notification03Icon,
	PhysicsIcon,
	QuestionIcon,
	Settings01Icon,
	SparklesIcon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
	User as UserIcon,
} from '@hugeicons/core-free-icons';

export type IconSvg = typeof Home01Icon;

export type NavItem = {
	href: string;
	label: string;
	icon?: IconSvg;
	fluentEmoji?: string;
};

export type NavSection = {
	title: string;
	items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
	{
		title: 'home',
		items: [
			{ href: '/dashboard', label: 'dashboard', icon: Home01Icon },
			{ href: '/notifications', label: 'notifications', icon: Notification03Icon },
		],
	},
	{
		title: 'learning library',
		items: [
			{ href: '/learn', label: 'learning hub', icon: BookOpen01Icon },
			{ href: '/lessons', label: 'topic lessons', icon: BookmarkIcon },
			{ href: '/physics', label: 'physical sciences', icon: PhysicsIcon },
			{ href: '/math', label: 'mathematics', icon: CalculatorIcon },
			{ href: '/curriculum-map', label: 'curriculum map', icon: GridIcon },
			{ href: '/periodic-table', label: 'periodic table', icon: Atom01Icon },
			{ href: '/science-lab', label: 'virtual science lab', icon: SparklesIcon },
		],
	},
	{
		title: 'practice lab',
		items: [
			{ href: '/practice', label: 'practice hub', icon: File01Icon },
			{ href: '/past-papers', label: 'past papers', icon: File01Icon },
			{ href: '/quiz', label: 'interactive quiz', icon: QuestionIcon },
			{ href: '/flashcards', label: 'smart flashcards', icon: Layers01Icon },
			{ href: '/snap-and-solve', label: 'snap & solve', icon: CalculatorIcon },
		],
	},
	{
		title: 'ai workspace',
		items: [
			{ href: '/ai-lab', label: 'ai lab hub', icon: AiBrain01Icon },
			{ href: '/ai-tutor', label: 'ai study tutor', icon: SparklesIcon },
			{ href: '/essay-grader', label: 'ai essay grader', icon: ContentWritingIcon },
			{ href: '/voice-tutor', label: 'voice tutor', icon: Mic01Icon },
		],
	},
	{
		title: 'community hub',
		items: [
			{ href: '/community', label: 'community hub', icon: UserGroupIcon },
			{ href: '/channels', label: 'study channels', icon: Chat01Icon },
			{ href: '/focus-rooms', label: 'focus rooms', icon: Timer01Icon },
			{ href: '/leaderboard', label: 'leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'study buddies', icon: UserAdd01Icon },
		],
	},
	{
		title: 'growth',
		items: [
			{ href: '/profile', label: 'profile', icon: UserIcon },
			{ href: '/progress', label: 'progress tracking', icon: Timer01Icon },
			{ href: '/achievements', label: 'achievements', icon: Medal01Icon },
			{ href: '/results', label: 'nsc results', icon: Mortarboard02Icon },
		],
	},
	{
		title: 'account & tools',
		items: [
			{ href: '/settings', label: 'settings', icon: Settings01Icon },
			{ href: '/planner', label: 'study planner', icon: Calendar01Icon },
			{ href: '/aps-calculator', label: 'aps calculator', icon: CalculatorIcon },
			{ href: '/exam-timer', label: 'exam timer', icon: Timer01Icon },
			{ href: '/subscription', label: 'subscription', icon: SparklesIcon },
		],
	},
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export type MenuItem = NavItem;
export type MenuSection = NavSection;
export const sideMenuSections = NAV_SECTIONS;
export const sideMenuItems = NAV_ITEMS;
