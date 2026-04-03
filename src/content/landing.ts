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
		title: 'Homework Helper',
		description:
			'Get help the moment you get stuck. Ask questions and see clear explanations instantly.',
		color: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	},
	{
		icon: Task02Icon,
		title: 'Real Exam Practice',
		description:
			'Master past NSC papers with full step-by-step solutions. Know exactly where you went wrong.',
		color: 'bg-subject-math/10 text-subject-math',
	},
	{
		icon: Timer02Icon,
		title: 'Progress Tracking',
		description: 'Watch your streak grow and earn rewards. Track the progress you make every day.',
		color: 'bg-subject-life/10 text-subject-life',
	},
	{
		icon: VoiceIcon,
		title: 'Audio Explanations',
		description: 'Hear explanations out loud. Perfect for revision while you commute or do chores.',
		color: 'bg-subject-physics/10 text-subject-physics',
	},
	{
		icon: Camera01Icon,
		title: 'Photo Solve',
		description: 'Snap a pic of any exam question. Get clear step-by-step solutions in seconds.',
		color: 'bg-tiimo-teal/10 text-tiimo-teal',
	},
	{
		icon: SparklesIcon,
		title: 'Essay Feedback',
		description:
			'Submit your essays and get specific feedback. Learn exactly how to write better answers.',
		color: 'bg-tiimo-blue/10 text-tiimo-blue',
	},
	{
		icon: GroupIcon,
		title: 'Study Partners',
		description: 'Find other Grade 12 students prepping for the same exams. Learn better together.',
		color: 'bg-tiimo-pink/10 text-tiimo-pink',
	},
	{
		icon: ChartIcon,
		title: 'Know Your Weak Spots',
		description: 'See which topics need more work. Stop wasting time on what you already know.',
		color: 'bg-tiimo-orange/10 text-tiimo-orange',
	},
	{
		icon: Calendar01Icon,
		title: 'Study Plan',
		description:
			'Let Lumni build your revision timetable. Focus on what matters most for your exams.',
		color: 'bg-tiimo-green/10 text-tiimo-green',
	},
	{
		icon: BookOpen01Icon,
		title: 'Syllabus Tracker',
		description: 'Never miss a topic. See exactly what you have left to cover for each subject.',
		color: 'bg-tiimo-purple/10 text-tiimo-purple',
	},
	{
		icon: BrainIcon,
		title: 'Targeted Practice',
		description:
			'Quizzes that adapt to what you need. Focus your energy on the topics that will lift your marks.',
		color: 'bg-tiimo-rose/10 text-tiimo-rose',
	},
	{
		icon: Idea01Icon,
		title: 'Clue First, Answer Later',
		description:
			'Stuck? Get a gentle nudge in the right direction without spoiling the full answer.',
		color: 'bg-tiimo-yellow/10 text-tiimo-yellow',
	},
];

export const LANDING_STATS = [
	{ value: '50k+', label: 'Matric Students Using Lumni' },
	{ value: '10k+', label: 'Real NSC Exam Questions' },
	{ value: '95%', label: 'Passed Matric' },
	{ value: '4.9', label: 'Stars From Peers' },
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
			'Lumni AI helped me improve my math marks by 20% in just 3 months. The AI tutor is like having a personal teacher available 24/7.',
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
