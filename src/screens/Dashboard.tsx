'use client';

import { motion } from 'framer-motion';
import {
	ArrowRight,
	Bell,
	BookOpen,
	Check,
	Clock,
	Flame,
	FlaskConical,
	Loader2,
	Play,
	Sigma,
	Sparkles,
	Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { TopicMasteryCard } from '@/components/Dashboard/TopicMasteryCard';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { XpHeader } from '@/components/Gamification';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

interface DayProgress {
	day: string;
	date: number;
	status: 'complete' | 'active' | 'idle';
}

interface Challenge {
	title: string;
	time: string;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	icon: React.ReactNode;
	iconBg: string;
}

const defaultChallenges: Challenge[] = [
	{
		title: 'Differentiation Rules',
		time: '10m',
		difficulty: 'Medium',
		icon: <Sigma className="w-6 h-6 text-blue-500" />,
		iconBg: 'bg-blue-50 dark:bg-blue-900/20',
	},
	{
		title: "Newton's Second Law",
		time: '20m',
		difficulty: 'Hard',
		icon: <FlaskConical className="w-6 h-6 text-purple-500" />,
		iconBg: 'bg-purple-50 dark:bg-purple-900/20',
	},
	{
		title: 'Poetry Analysis',
		time: '5m',
		difficulty: 'Easy',
		icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
		iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
	},
];

export default function Dashboard() {
	const router = useRouter();
	const { data: session, isPending: isSessionLoading } = useSession();
	const [isPending, startTransition] = useTransition();
	const [isDbInitialized, setIsDbInitialized] = useState(false);
	const [streak, setStreak] = useState(0);
	const [dailyProgress, setDailyProgress] = useState(0);
	const [weekProgress, setWeekProgress] = useState<DayProgress[]>([]);
	const [progressData, setProgressData] = useState<{
		totalQuestions: number;
		accuracy: number;
		totalPoints: number;
	} | null>(null);
	const [isLoadingProgress, setIsLoadingProgress] = useState(true);

	// Fetch progress data from database
	useEffect(() => {
		async function fetchProgress() {
			try {
				const [progress, streakData] = await Promise.all([
					getUserProgressSummary(),
					getUserStreak(),
				]);

				if (progress) {
					setProgressData({
						totalQuestions: progress.totalQuestionsAttempted,
						accuracy: progress.accuracy,
						totalPoints: progress.totalMarksEarned * 10, // Convert to points
					});
				}

				if (streakData) {
					setStreak(streakData.currentStreak);
				}
			} catch (error) {
				console.error('Error fetching progress:', error);
			} finally {
				setIsLoadingProgress(false);
			}
		}

		fetchProgress();
	}, []);

	useEffect(() => {
		const initializeDatabase = async () => {
			if (isDbInitialized) return;

			try {
				const response = await fetch('/api/db/init', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				});
				const result = await response.json();
				if (result.success) {
					setIsDbInitialized(true);
				}
			} catch (err) {
				console.error('Error initializing database:', err);
			}
		};

		initializeDatabase();
	}, [isDbInitialized]);

	useEffect(() => {
		const now = new Date();
		const today = now.getDay();
		const dayOfWeek = today === 0 ? 6 : today - 1;

		const days: DayProgress[] = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(now);
			date.setDate(now.getDate() - dayOfWeek + i);

			const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
			days.push({
				day: dayNames[i],
				date: date.getDate(),
				status: i < dayOfWeek ? 'complete' : i === dayOfWeek ? 'active' : 'idle',
			});
		}
		setWeekProgress(days);

		// Default values if no progress yet
		setDailyProgress(66);
	}, []);

	const handleNavigateToQuiz = () => {
		startTransition(() => {
			router.push('/quiz');
		});
	};

	const isLoading = isSessionLoading || isPending;

	if (isLoadingProgress) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="flex flex-col h-full bg-background font-inter pb-24 lg:pb-12 relative overflow-hidden">
			<BackgroundMesh variant="subtle" />

			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: 'spring', stiffness: 260, damping: 25 }}
				className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0 relative z-10 lg:px-0 lg:pt-0 lg:mb-8"
			>
				<div className="flex items-center gap-4">
					<motion.div
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: 'spring', stiffness: 400, damping: 20 }}
						className="relative"
					>
						<Avatar className="w-14 h-14 border-2 border-background shadow-xl relative lg:w-16 lg:h-16">
							<AvatarImage
								src={
									session?.user?.image ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
								}
								alt={session?.user?.name ?? 'User'}
							/>
							<AvatarFallback>
								{session?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
							</AvatarFallback>
						</Avatar>
						<div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full lg:w-5 lg:h-5 lg:border-3" />
					</motion.div>
					<div>
						<p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-60 lg:text-xs">
							Welcome back,
						</p>
						<SmoothWords
							as="h2"
							text={session?.user?.name?.split(' ')[0] ?? 'Student'}
							className="text-2xl font-black text-foreground leading-none tracking-tighter lg:text-4xl"
						/>
					</div>
				</div>

				<div className="flex items-center gap-3 lg:hidden">
					<motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
						<Button
							variant="ghost"
							size="icon"
							className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/20 shadow-sm relative"
						>
							<Bell className="w-6 h-6 text-foreground" />
							<span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-background rounded-full" />
						</Button>
					</motion.div>
				</div>
			</motion.header>

			{/* XP Header Section */}
			<div className="px-6 pb-4 lg:px-0">
				<XpHeader variant="full" />
			</div>

			<ScrollArea className="flex-1 relative z-10 no-scrollbar">
				<motion.main
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="px-6 py-6 space-y-8 lg:px-0"
				>
					{/* Main Dashboard Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Daily Quest Card - Spans 2 columns on large screens */}
						<motion.div variants={STAGGER_ITEM} className="md:col-span-2">
							<Card className="p-8 premium-glass border-none rounded-[2.5rem] h-full space-y-8 relative overflow-hidden group">
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
								<div className="absolute -right-8 -top-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-3">
										<motion.div
											initial={{ x: -10, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full"
										>
											<span className="text-[10px] font-black text-primary uppercase tracking-wider lg:text-xs">
												Daily Quest
											</span>
										</motion.div>
										<h3 className="text-3xl font-black text-foreground tracking-tighter lg:text-5xl">
											Algebra Master
										</h3>
										<p className="text-sm text-muted-foreground font-bold lg:text-base">
											{isLoadingProgress
												? 'Loading progress...'
												: `${progressData?.totalQuestions || 0} questions answered`}
										</p>
									</div>
									<motion.div
										whileHover={{ rotate: 180, scale: 1.1 }}
										transition={{ type: 'spring', stiffness: 200 }}
										className="w-16 h-16 bg-card/50 rounded-2xl flex items-center justify-center border border-border/20 shadow-xl"
									>
										<Sparkles className="w-8 h-8 text-brand-amber" />
									</motion.div>
								</div>

								<div className="space-y-4 relative z-10">
									<div className="flex justify-between items-end">
										<span className="text-xs font-black text-foreground opacity-60 uppercase tracking-widest">
											{isLoadingProgress ? '...' : `${progressData?.totalQuestions || 0} / 100`}{' '}
											QUESTIONS
										</span>
										<span className="text-sm font-black text-primary">{dailyProgress}%</span>
									</div>
									<div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${dailyProgress}%` }}
											transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
											className="h-full bg-primary rounded-full shadow-lg"
										/>
									</div>
								</div>

								<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
									<Button
										className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 relative z-10"
										onClick={handleNavigateToQuiz}
										disabled={isLoading}
									>
										{isLoading ? (
											<Loader2 className="w-6 h-6 animate-spin" />
										) : (
											<>
												Continue Learning
												<ArrowRight className="w-6 h-6" />
											</>
										)}
									</Button>
								</motion.div>
							</Card>
						</motion.div>

						{/* Stats Column */}
						<div className="flex flex-col gap-6">
							{/* Streak Card */}
							<motion.div variants={STAGGER_ITEM} className="flex-1">
								<Card className="h-full p-6 premium-glass border-none rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
									<motion.div
										animate={{
											scale: [1, 1.2, 1],
											rotate: [0, 5, 0],
										}}
										transition={{
											duration: 10,
											repeat: Number.POSITIVE_INFINITY,
											ease: 'easeInOut',
										}}
										className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl pointer-events-none"
									/>
									<div className="space-y-1 relative z-10">
										<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
											Current Streak
										</p>
										<div className="flex items-baseline gap-2">
											<motion.span
												initial={{ scale: 0.5 }}
												animate={{ scale: 1 }}
												className="text-4xl font-black text-foreground"
											>
												{streak}
											</motion.span>
											<span className="text-muted-foreground font-black text-xs">DAYS</span>
										</div>
									</div>
									<div className="mt-6 relative z-10 self-start">
										<motion.div
											whileHover={{ scale: 1.2, rotate: 15 }}
											className="w-12 h-12 bg-brand-amber/10 rounded-2xl flex items-center justify-center border border-brand-amber/20"
										>
											<Flame className="w-6 h-6 text-brand-amber fill-brand-amber" />
										</motion.div>
									</div>
								</Card>
							</motion.div>

							{/* Accuracy Card */}
							<motion.div variants={STAGGER_ITEM} className="flex-1">
								<Card className="h-full p-6 premium-glass border-none rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
									<motion.div
										animate={{
											scale: [1.2, 1, 1.2],
											rotate: [0, -5, 0],
										}}
										transition={{
											duration: 12,
											repeat: Number.POSITIVE_INFINITY,
											ease: 'easeInOut',
										}}
										className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"
									/>
									<div className="space-y-1 relative z-10">
										<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
											Accuracy Rate
										</p>
										<div className="flex items-baseline gap-2">
											<motion.span
												initial={{ scale: 0.5 }}
												animate={{ scale: 1 }}
												className="text-4xl font-black text-foreground"
											>
												{isLoadingProgress ? '-' : progressData?.accuracy || 0}
											</motion.span>
											<span className="text-muted-foreground font-black text-xs">%</span>
										</div>
									</div>
									<div className="mt-6 relative z-10 self-start">
										<motion.div
											whileHover={{ scale: 1.2, rotate: -15 }}
											className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20"
										>
											<Trophy className="w-6 h-6 text-primary" />
										</motion.div>
									</div>
								</Card>
							</motion.div>
						</div>

						{/* Weekly Chart Card - Spans 2 columns on desktop */}
						<motion.div variants={STAGGER_ITEM} className="lg:col-span-2">
							<Card className="p-8 premium-glass border-none rounded-[2.5rem] h-full flex flex-col justify-between">
								<div className="flex justify-between items-center mb-8">
									<h3 className="text-xl font-black text-foreground tracking-tight uppercase">
										Weekly Activity
									</h3>
									<div className="flex items-center gap-2">
										<span className="w-3 h-3 rounded-full bg-primary" />
										<span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
											Today
										</span>
									</div>
								</div>
								<div className="grid grid-cols-7 gap-3 sm:gap-4 flex-1 items-end pt-4">
									{weekProgress.map((item) => (
										<motion.div
											key={item.day}
											variants={STAGGER_ITEM}
											className="flex flex-col items-center gap-4 group"
										>
											<span
												className={`text-[10px] font-black tracking-widest ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground opacity-40'}`}
											>
												{item.day}
											</span>
											<motion.div
												whileHover={{ scale: 1.05, y: -5 }}
												whileTap={{ scale: 0.95 }}
												className={`w-full aspect-square max-w-[60px] rounded-[1.5rem] flex items-center justify-center transition-all duration-300 cursor-pointer ${
													item.status === 'complete'
														? 'bg-primary/10 text-primary border border-primary/10'
														: item.status === 'active'
															? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/40'
															: 'bg-muted/50 text-muted-foreground/30'
												}`}
											>
												{item.status === 'complete' ? (
													<Check className="w-6 h-6 stroke-[4px]" />
												) : (
													<span className="text-sm font-black">{item.date}</span>
												)}
											</motion.div>
										</motion.div>
									))}
								</div>
							</Card>
						</motion.div>

						{/* Challenges Section */}
						<motion.div variants={STAGGER_ITEM} className="space-y-6">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
									Deep Work
								</h3>
								<Button
									variant="ghost"
									size="sm"
									className="font-black text-[10px] uppercase tracking-widest text-primary"
								>
									View All
								</Button>
							</div>
							<div className="space-y-4">
								{defaultChallenges.map((challenge) => (
									<motion.button
										key={challenge.title}
										variants={STAGGER_ITEM}
										whileHover={{ x: 10 }}
										whileTap={{ scale: 0.98 }}
										type="button"
										className="w-full text-left premium-glass p-5 rounded-[2rem] flex items-center justify-between group transition-all cursor-pointer border-transparent hover:border-primary/20 premium-glass-hover shadow-sm"
										onClick={() => router.push('/quiz')}
									>
										<div className="flex items-center gap-4">
											<motion.div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${challenge.iconBg}`}
											>
												{challenge.icon}
											</motion.div>
											<div className="space-y-1">
												<h4 className="font-black text-sm text-foreground">{challenge.title}</h4>
												<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
													<div className="flex items-center gap-1">
														<Clock className="w-3 h-3" />
														{challenge.time}
													</div>
													<span className="w-1 h-1 rounded-full bg-border" />
													<div
														className={`${
															challenge.difficulty === 'Hard'
																? 'text-rose-500'
																: challenge.difficulty === 'Medium'
																	? 'text-brand-amber'
																	: 'text-brand-green'
														}`}
													>
														{challenge.difficulty}
													</div>
												</div>
											</div>
										</div>
										<div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
											<Play className="w-4 h-4 fill-current ml-0.5" />
										</div>
									</motion.button>
								))}
							</div>
						</motion.div>

						{/* Topic Mastery Card - Spans all columns */}
						<motion.div variants={STAGGER_ITEM} className="md:col-span-2 lg:col-span-3">
							<TopicMasteryCard />
						</motion.div>
					</div>
				</motion.main>
			</ScrollArea>
		</div>
	);
}
