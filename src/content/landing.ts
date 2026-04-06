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
		title: 'homework helper',
		description:
			'get help the moment you get stuck. ask questions and see clear explanations instantly.',
		color: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	},
	{
		icon: Task02Icon,
		title: 'real exam practice',
		description:
			'master past nsc papers with full step-by-step solutions. know exactly where you went wrong.',
		color: 'bg-subject-math/10 text-subject-math',
	},
	{
		icon: Timer02Icon,
		title: 'progress tracking',
		description: 'watch your streak grow and earn rewards. track the progress you make every day.',
		color: 'bg-subject-life/10 text-subject-life',
	},
	{
		icon: VoiceIcon,
		title: 'audio explanations',
		description: 'hear explanations out loud. perfect for revision while you commute or do chores.',
		color: 'bg-subject-physics/10 text-subject-physics',
	},
	{
		icon: Camera01Icon,
		title: 'photo solve',
		description: 'snap a pic of any exam question. get clear step-by-step solutions in seconds.',
		color: 'bg-tiimo-teal/10 text-tiimo-teal',
	},
	{
		icon: SparklesIcon,
		title: 'essay feedback',
		description:
			'submit your essays and get specific feedback. learn exactly how to write better answers.',
		color: 'bg-tiimo-blue/10 text-tiimo-blue',
	},
	{
		icon: GroupIcon,
		title: 'study partners',
		description: 'find other grade 12 students prepping for the same exams. learn better together.',
		color: 'bg-tiimo-pink/10 text-tiimo-pink',
	},
	{
		icon: ChartIcon,
		title: 'know your weak spots',
		description: 'see which topics need more work. stop wasting time on what you already know.',
		color: 'bg-tiimo-orange/10 text-tiimo-orange',
	},
	{
		icon: Calendar01Icon,
		title: 'study plan',
		description:
			'let lumni build your revision timetable. focus on what matters most for your exams.',
		color: 'bg-tiimo-green/10 text-tiimo-green',
	},
	{
		icon: BookOpen01Icon,
		title: 'syllabus tracker',
		description: 'never miss a topic. see exactly what you have left to cover for each subject.',
		color: 'bg-tiimo-purple/10 text-tiimo-purple',
	},
	{
		icon: BrainIcon,
		title: 'targeted practice',
		description:
			'quizzes that adapt to what you need. focus your energy on the topics that will lift your marks.',
		color: 'bg-tiimo-rose/10 text-tiimo-rose',
	},
	{
		icon: Idea01Icon,
		title: 'clue first, answer later',
		description:
			'stuck? get a gentle nudge in the right direction without spoiling the full answer.',
		color: 'bg-tiimo-yellow/10 text-tiimo-yellow',
	},
];

export const LANDING_STATS = [
	{ value: '50k+', label: 'grade 12 students supported' },
	{ value: '25%', label: 'average grade improvement' },
	{ value: '10k+', label: 'past paper questions solved' },
	{ value: '4.9', label: 'student satisfaction rating' },
];

export interface LandingTestimonial {
	name: string;
	grade: string;
	quote: string;
	image: string;
	metrics?: {
		improvement?: string;
		subjects?: string[];
		achievements?: string[];
	};
	ethnicity?: string;
	location?: string;
}

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
	{
		name: 'amahle nkosi',
		grade: 'grade 12, pretoria',
		quote:
			'lumni ai helped me improve my math marks by 20% in just 3 months. the ai tutor is like having a personal teacher available 24/7.',
		image:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '20% grade improvement',
			subjects: ['mathematics', 'physical science'],
			achievements: ['top 5% in class', 'mathematics excellence badge'],
		},
		ethnicity: 'black south african',
		location: 'pretoria',
	},
	{
		name: 'liam van der merwe',
		grade: 'grade 12, cape town',
		quote:
			'the past papers with solutions are gold. i finally understand physics concepts i struggled with for years. my final exam score was 89%!',
		image:
			'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '35% improvement in physics',
			subjects: ['physics', 'chemistry'],
			achievements: ['physics distinction', 'exam ready badge'],
		},
		ethnicity: 'afrikaans',
		location: 'cape town',
	},
	{
		name: 'sarah moloto',
		grade: 'grade 12, johannesburg',
		quote:
			'study buddies feature kept me motivated throughout the year. we met daily on focus rooms and crushed our exams together! my average improved from 65% to 82%.',
		image:
			'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '17% overall average increase',
			subjects: ['english', 'history', 'geography'],
			achievements: ['study streak champion', 'community leader'],
		},
		ethnicity: 'black south african',
		location: 'johannesburg',
	},
	{
		name: 'rajesh patel',
		grade: 'grade 12, durban',
		quote:
			"as an indian south african student, i struggled with afrikaans but lumni's cultural context explanations helped me achieve 78%. the ai understood my background perfectly.",
		image:
			'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '28% in afrikaans',
			subjects: ['afrikaans', 'mathematics', 'accounting'],
			achievements: ['cultural bridge award', 'mathematics excellence'],
		},
		ethnicity: 'indian south african',
		location: 'durban',
	},
	{
		name: 'thandiwe zulu',
		grade: 'grade 12, pietermaritzburg',
		quote:
			"coming from a rural school, i had limited resources. lumni's offline mode and affordable pricing helped me excel. i achieved 85% overall and got accepted to wits university!",
		image:
			'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '32% overall improvement',
			subjects: ['biology', 'geography', 'english'],
			achievements: ['university acceptance', 'rural excellence award'],
		},
		ethnicity: 'black south african',
		location: 'pietermaritzburg',
	},
	{
		name: 'michael du plessis',
		grade: 'grade 12, bloemfontein',
		quote:
			'the peer comparison feature motivated me to push harder. seeing my progress relative to others helped me maintain focus. final result: 91% average!',
		image:
			'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
		metrics: {
			improvement: '15% improvement through competition',
			subjects: ['mathematics', 'physics', 'accounting'],
			achievements: ['top performer', 'motivation master'],
		},
		ethnicity: 'afrikaans',
		location: 'bloemfontein',
	},
];
