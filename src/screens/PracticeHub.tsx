'use client';

import {
	ArrowRight01Icon,
	BookOpenIcon,
	Camera01Icon,
	File01Icon,
	FilterIcon,
	Layers01Icon,
	QuestionIcon,
	Search01Icon,
	StarIcon,
	TimerIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePastPapers } from '@/hooks/usePastPapers';

const PastPapersBrowser = dynamic(
	() => import('@/components/PastPapers/PastPapersList').then((mod) => mod.PastPapersBrowser),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const QuizPreview = dynamic(
	() => import('@/components/Quiz/QuizList').then((mod) => mod.default || mod),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const FlashcardsPreview = dynamic(
	() => import('@/components/Flashcards/FlashcardDeckList').then((mod) => mod.default || mod),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

type PracticeView = 'papers' | 'quizzes' | 'flashcards';

const practiceModes = [
	{
		id: 'papers',
		label: 'past papers',
		icon: File01Icon,
		description: 'real exam papers from 2020-2024',
	},
	{
		id: 'quizzes',
		label: 'quizzes',
		icon: QuestionIcon,
		description: 'topic-focused practice tests',
	},
	{
		id: 'flashcards',
		label: 'flashcards',
		icon: Layers01Icon,
		description: 'memorize key concepts',
	},
] as const;

const quickActions = [
	{
		id: 'timer',
		label: 'exam timer',
		description: 'simulate real exam conditions with timed practice',
		icon: TimerIcon,
		href: '/exam-timer',
		accent: 'bg-slate-900',
	},
	{
		id: 'snap',
		label: 'snap & solve',
		description: 'capture any question for instant solutions',
		icon: Camera01Icon,
		href: '/snap-and-solve',
		accent: 'bg-blue-600',
	},
	{
		id: 'essay',
		label: 'essay grader',
		description: 'get ai feedback on your essays',
		icon: BookOpenIcon,
		href: '/essay-grader',
		accent: 'bg-emerald-600',
	},
] as const;

export default function PracticeHub() {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();
	const [currentView, setCurrentView] = useState<PracticeView>('papers');
	const [searchQuery, setSearchQuery] = useState('');
	const [hoveredAction, setHoveredAction] = useState<string | null>(null);

	const { filterState, filterDispatch, activeFilterCount } = usePastPapers();

	const containerVariants = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: { staggerChildren: 0.08, delayChildren: 0.15 },
				},
			};

	const itemVariants: Variants | undefined = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.5,
						ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
					},
				},
			};

	return (
		<div className="flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="flex flex-col"
			>
				<motion.header variants={itemVariants} className="px-6 pt-10 pb-6 shrink-0">
					<div className="space-y-1">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight font-display text-balance leading-[1.05]">
							practice
						</h1>
						<p className="text-muted-foreground/70 font-medium text-base sm:text-lg mt-3 max-w-md">
							sharpen your skills with exam-level resources.
						</p>
					</div>

					<div className="mt-10 flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1 max-w-md">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
							/>
							<Input
								placeholder="search papers, quizzes..."
								className="pl-11 h-13 rounded-2xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/10 transition-all font-medium text-sm"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex gap-2">
							{currentView === 'papers' && (
								<Button
									variant={filterState.bookmarkedOnly ? 'default' : 'outline'}
									className={`h-13 px-5 rounded-2xl gap-2 ${
										filterState.bookmarkedOnly
											? 'bg-primary text-primary-foreground'
											: 'bg-muted/20 border-none'
									}`}
									onClick={() => filterDispatch({ type: 'TOGGLE_BOOKMARKED' })}
								>
									<HugeiconsIcon icon={StarIcon} className="w-4 h-4" />
									<span className="hidden sm:inline font-medium text-sm">saved</span>
								</Button>
							)}
							<Button
								variant="outline"
								className="h-13 px-5 rounded-2xl gap-2 bg-muted/20 border-none"
							>
								<HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
								<span className="hidden sm:inline font-medium text-sm">filters</span>
								{activeFilterCount > 0 && (
									<span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
										{activeFilterCount}
									</span>
								)}
							</Button>
						</div>
					</div>

					<motion.div
						variants={itemVariants}
						className="flex gap-1 p-1 bg-muted/15 rounded-full w-fit mt-8"
					>
						{practiceModes.map((view) => (
							<Button
								key={view.id}
								variant="ghost"
								onClick={() => setCurrentView(view.id as PracticeView)}
								className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
									currentView === view.id
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground/70 hover:text-foreground'
								}`}
							>
								<HugeiconsIcon icon={view.icon} className="w-4 h-4" />
								<span>{view.label}</span>
							</Button>
						))}
					</motion.div>
				</motion.header>

				<ScrollArea className="flex-1">
					<main className="px-6 py-4">
						<motion.div
							variants={itemVariants}
							key={currentView}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							{currentView === 'papers' && <PastPapersBrowser searchQuery={searchQuery} />}
							{currentView === 'quizzes' && <QuizPreview searchQuery={searchQuery} />}
							{currentView === 'flashcards' && <FlashcardsPreview searchQuery={searchQuery} />}
						</motion.div>

						<motion.div variants={itemVariants} className="mt-10">
							<p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-4 px-1">
								quick access
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{quickActions.map((action) => (
									<motion.div
										key={action.id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Card
											className="p-5 rounded-3xl bg-muted/15 border-none cursor-pointer group hover:bg-muted/25 transition-all duration-300"
											onClick={() => router.push(action.href)}
											onMouseEnter={() => setHoveredAction(action.id)}
											onMouseLeave={() => setHoveredAction(null)}
										>
											<div className="flex items-start justify-between">
												<div
													className={`w-11 h-11 rounded-2xl ${action.accent} flex items-center justify-center`}
												>
													<HugeiconsIcon icon={action.icon} className="w-5 h-5 text-white" />
												</div>
												<HugeiconsIcon
													icon={ArrowRight01Icon}
													className={`w-4 h-4 text-muted-foreground/40 transition-all duration-300 ${
														hoveredAction === action.id ? 'translate-x-1 text-foreground' : ''
													}`}
												/>
											</div>
											<div className="mt-4 space-y-1">
												<h3 className="text-base font-semibold tracking-tight">{action.label}</h3>
												<p className="text-xs text-muted-foreground/60 font-medium line-clamp-2">
													{action.description}
												</p>
											</div>
										</Card>
									</motion.div>
								))}
							</div>
						</motion.div>

						<div className="h-32" />
					</main>
				</ScrollArea>
			</motion.div>
		</div>
	);
}
