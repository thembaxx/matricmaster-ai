import {
	BookOpen01Icon,
	BrainIcon,
	Calendar01Icon,
	Camera01Icon,
	ChartIcon,
	GroupIcon,
	Idea01Icon,
	MagicWand01Icon,
	SparklesIcon,
	Task02Icon,
	Timer02Icon,
	VoiceIcon,
} from '@hugeicons/core-free-icons';

export const LANDING_FEATURES = [
	{
		icon: MagicWand01Icon,
		title: 'AI Study Buddy',
		description: 'Stuck on a question? Get instant help from your personal AI tutor, anytime.',
		color: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	},
	{
		icon: Task02Icon,
		title: 'Past Papers',
		description: 'Practice with real NSC exam questions. Full solutions included.',
		color: 'bg-subject-math/10 text-subject-math',
	},
	{
		icon: Timer02Icon,
		title: 'Track Progress',
		description: "Study streaks, XP, and achievements. See how far you've come.",
		color: 'bg-subject-life/10 text-subject-life',
	},
	{
		icon: VoiceIcon,
		title: 'Voice Tutor',
		description: 'Learn hands-free with voice-powered explanations and study sessions.',
		color: 'bg-subject-physics/10 text-subject-physics',
	},
	{
		icon: Camera01Icon,
		title: 'Snap & Solve',
		description: 'Take a photo of any question and get instant step-by-step solutions.',
		color: 'bg-tiimo-teal/10 text-tiimo-teal',
	},
	{
		icon: SparklesIcon,
		title: 'Essay Grader',
		description: 'AI-powered essay analysis with detailed feedback and improvement tips.',
		color: 'bg-tiimo-blue/10 text-tiimo-blue',
	},
	{
		icon: GroupIcon,
		title: 'Study Buddies',
		description: 'Connect with fellow students, form study groups, and learn together.',
		color: 'bg-tiimo-pink/10 text-tiimo-pink',
	},
	{
		icon: ChartIcon,
		title: 'Analytics',
		description: 'Track your learning progress with detailed insights and performance metrics.',
		color: 'bg-tiimo-orange/10 text-tiimo-orange',
	},
	{
		icon: Calendar01Icon,
		title: 'Smart Scheduling',
		description: 'AI-powered study planner that adapts to your rhythm and goals.',
		color: 'bg-tiimo-green/10 text-tiimo-green',
	},
	{
		icon: BookOpen01Icon,
		title: 'Curriculum Map',
		description: 'Visual progress tracker for your entire NSC syllabus.',
		color: 'bg-tiimo-purple/10 text-tiimo-purple',
	},
	{
		icon: BrainIcon,
		title: 'Smart Quiz',
		description: 'Adaptive quizzes that focus on your weak areas.',
		color: 'bg-tiimo-rose/10 text-tiimo-rose',
	},
	{
		icon: Idea01Icon,
		title: 'Hint System',
		description: 'Get intelligent hints when you make mistakes, without giving away the answer.',
		color: 'bg-tiimo-yellow/10 text-tiimo-yellow',
	},
];

export const LANDING_STATS = [
	{ value: '50k+', label: 'Active Students' },
	{ value: '10k+', label: 'Past Papers' },
	{ value: '95%', label: 'Pass Rate' },
	{ value: '4.9', label: 'App Rating' },
];

export interface LandingTestimonial {
	name: string;
	grade: string;
	quote: string;
	image: string;
}

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
	{
		name: 'Amahle Nkosi',
		grade: 'Grade 12, Pretoria',
		quote:
			'MatricMaster AI helped me improve my math marks by 20% in just 3 months. The AI tutor is like having a personal teacher available 24/7.',
		image:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
	},
	{
		name: 'Liam van der Merwe',
		grade: 'Grade 12, Cape Town',
		quote:
			'The past papers with solutions are gold. I finally understand physics concepts I struggled with for years.',
		image:
			'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
	},
	{
		name: 'Sarah Moloto',
		grade: 'Grade 12, Johannesburg',
		quote:
			'Study buddies feature kept me motivated throughout the year. We met daily on Focus Rooms and crushed our exams together!',
		image:
			'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
	},
];
