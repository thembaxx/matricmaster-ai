'use client';

import { motion, type Variants } from 'framer-motion';
import {
	ArrowRight,
	Bell,
	BookOpen,
	Check,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 20,
		},
	},
};

function Clock({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Clock Icon</title>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}

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

	return (
		<div className="flex flex-col h-full bg-background font-inter pb-24 relative overflow-hidden">
			<BackgroundMesh variant="subtle" />
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0 relative z-10"
			>
				<div className="flex items-center gap-3">
					<div className="relative">
						<Avatar className="w-12 h-12 border-2 border-background shadow-xl relative">
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
						<div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
					</div>
					<div>
						<p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">
							Welcome back,
						</p>
						<h2 className="text-xl font-black text-foreground leading-none tracking-tight">
							{session?.user?.name?.split(' ')[0] ?? 'Student'}
						</h2>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/20 shadow-sm relative hover:bg-card/80 transition-all"
				>
					<Bell className="w-6 h-6 text-foreground" />
					<span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-background rounded-full" />
				</Button>
			</motion.header>

			<ScrollArea className="flex-1 relative z-10">
				<motion.main
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="px-6 py-6 space-y-6"
				>
					{/* Bento Grid Section */}
					<div className="grid grid-cols-2 gap-4">
						{/* Streak Card - Col 1 */}
						<motion.div variants={itemVariants} className="col-span-1">
							<Card className="h-full p-5 premium-glass border-none rounded-3xl flex flex-col justify-between relative overflow-hidden group">
								<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
								<div className="space-y-1 relative z-10">
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
										Streak
									</p>
									<div className="flex items-baseline gap-1">
										<span className="text-3xl font-black text-foreground">{streak}</span>
										<span className="text-muted-foreground font-bold text-xs">DAYS</span>
									</div>
								</div>
								<div className="mt-4 relative z-10 self-start">
									<div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
										<Flame className="w-5 h-5 text-[#efb036] fill-[#efb036]" />
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Quick Stats - Col 1 */}
						<motion.div variants={itemVariants} className="col-span-1">
							<Card className="h-full p-5 premium-glass border-none rounded-3xl flex flex-col justify-between relative overflow-hidden group">
								<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
								<div className="space-y-1 relative z-10">
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
										Accuracy
									</p>
									<div className="flex items-baseline gap-1">
										<span className="text-3xl font-black text-foreground">
											{isLoadingProgress ? '-' : progressData?.accuracy || 0}
										</span>
										<span className="text-muted-foreground font-bold text-xs">%</span>
									</div>
								</div>
								<div className="mt-4 relative z-10 self-start">
									<div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
										<Trophy className="w-5 h-5 text-primary" />
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Main Daily Quest Card - Col 1 & 2 */}
						<motion.div variants={itemVariants} className="col-span-2">
							<Card className="p-6 premium-glass border-none rounded-[2.5rem] space-y-6 relative overflow-hidden group">
								{/* Subtle Shine Effect */}
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
								<div className="absolute -right-8 -top-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-2">
										<div className="inline-flex items-center px-2 py-1 bg-primary/10 rounded-lg">
											<span className="text-[10px] font-black text-primary uppercase tracking-tighter">
												Daily Quest
											</span>
										</div>
										<h3 className="text-2xl font-black text-foreground tracking-tight">
											Algebra Master
										</h3>
										<p className="text-sm text-muted-foreground font-medium">
											{isLoadingProgress
												? 'Loading progress...'
												: `${progressData?.totalQuestions || 0} questions answered`}
										</p>
									</div>
									<div className="w-14 h-14 bg-card/50 rounded-2xl flex items-center justify-center border border-border/20 shadow-sm">
										<Sparkles className="w-6 h-6 text-[#efb036]" />
									</div>
								</div>

								<div className="space-y-3 relative z-10">
									<div className="flex justify-between items-end">
										<span className="text-xs font-black text-foreground opacity-60">
											{isLoadingProgress ? '...' : `${progressData?.totalQuestions || 0} / 100`}{' '}
											QUESTIONS
										</span>
										<span className="text-xs font-black text-primary">{dailyProgress}%</span>
									</div>
									<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${dailyProgress}%` }}
											transition={{ duration: 1, ease: 'circOut' }}
											className="h-full bg-primary rounded-full"
										/>
									</div>
								</div>

								<Button
									className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-base font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10"
									onClick={handleNavigateToQuiz}
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="w-5 h-5 animate-spin" />
									) : (
										<>
											Continue Learning
											<ArrowRight className="w-5 h-5" />
										</>
									)}
								</Button>
							</Card>
						</motion.div>
					</div>

					{/* Weekly Chart Card */}
					<motion.div variants={itemVariants}>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-black text-foreground tracking-tight">Weekly Activity</h3>
						</div>
						<div className="grid grid-cols-7 gap-2 premium-glass p-5 rounded-[2.5rem]">
							{weekProgress.map((item) => (
								<div key={item.day} className="flex flex-col items-center gap-3">
									<span
										className={`text-[9px] font-black tracking-tighter ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground opacity-40'}`}
									>
										{item.day}
									</span>
									<div
										className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${
											item.status === 'complete'
												? 'bg-primary/10 text-primary'
												: item.status === 'active'
													? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
													: 'bg-muted text-muted-foreground'
										}`}
									>
										{item.status === 'complete' ? (
											<Check className="w-4 h-4 stroke-[4px]" />
										) : (
											<span className="text-xs font-black">{item.date}</span>
										)}
									</div>
								</div>
							))}
						</div>
					</motion.div>

					{/* Recommended Section */}
					<motion.div variants={itemVariants} className="space-y-4">
						<h3 className="text-lg font-black text-foreground tracking-tight">
							Deep Work Challenges
						</h3>
						<div className="space-y-3">
							{defaultChallenges.map((challenge) => (
								<button
									key={challenge.title}
									type="button"
									className="w-full text-left premium-glass p-4 rounded-[2rem] flex items-center justify-between group hover:translate-x-1 transition-all cursor-pointer border-transparent hover:border-primary/10 premium-glass-hover"
									onClick={() => router.push('/quiz')}
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-2xl flex items-center justify-center ${challenge.iconBg}`}
										>
											{challenge.icon}
										</div>
										<div className="space-y-0.5">
											<h4 className="font-black text-sm text-foreground">{challenge.title}</h4>
											<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
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
																? 'text-orange-500'
																: 'text-emerald-500'
													}`}
												>
													{challenge.difficulty}
												</div>
											</div>
										</div>
									</div>
									<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
										<Play className="w-3 h-3 fill-current ml-0.5" />
									</div>
								</button>
							))}
						</div>
					</motion.div>
				</motion.main>
			</ScrollArea>
		</div>
	);
}
