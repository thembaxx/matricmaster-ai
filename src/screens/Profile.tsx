'use client';

import { Calculator, GraduationCap, Star, User } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { SafeImage } from '@/components/SafeImage';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

interface ChartDataItem {
	subject: string;
	you: number;
	average: number;
}

const defaultChartData: ChartDataItem[] = [
	{ subject: 'MATH', you: 0, average: 70 },
	{ subject: 'PHY SCI', you: 0, average: 75 },
	{ subject: 'ENG FAL', you: 0, average: 65 },
	{ subject: 'LIFE OR.', you: 0, average: 60 },
	{ subject: 'GEOG', you: 0, average: 65 },
	{ subject: 'ACC', you: 0, average: 75 },
	{ subject: 'HIST', you: 0, average: 70 },
];

const chartConfig = {
	you: {
		label: 'You',
		color: 'var(--primary)',
	},
	average: {
		label: 'Average',
		color: 'var(--muted-foreground)',
	},
} satisfies ChartConfig;

export default function Profile() {
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');
	const radarGradientId = useId();
	const glowFilterId = useId();
	const { data: session } = useSession();

	const [userStats, setUserStats] = useState<{
		totalQuestions: number;
		accuracy: number;
		streak: number;
		achievementsUnlocked: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [progress, streak, achievements] = await Promise.all([
					getUserProgressSummary(),
					getUserStreak(),
					getUserAchievements(),
				]);

				setUserStats({
					totalQuestions: progress?.totalQuestionsAttempted || 0,
					accuracy: progress?.accuracy || 0,
					streak: streak?.currentStreak || 0,
					achievementsUnlocked: achievements?.unlocked?.length || 0,
				});
			} catch (error) {
				console.error('Error fetching profile data:', error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	// Calculate chart data based on user performance
	const chartData: ChartDataItem[] = defaultChartData.map((item) => ({
		...item,
		you:
			item.subject === 'MATH'
				? userStats?.accuracy || 0
				: Math.max(0, (userStats?.accuracy || 0) - 10),
	}));

	const achievements = [
		{
			title: 'Calculus Master',
			icon: Calculator,
			variant: 'primary' as const,
		},
		{
			title: 'Physics Logic',
			icon: User,
			variant: 'secondary' as const,
		},
	];

	if (isLoading) {
		return (
			<div className="p-4 bg-background">
				<div className="flex flex-col h-full overflow-hidden rounded-[2.5rem] bg-card">
					<ScrollArea className="flex-1">
						<main className="px-6 pb-40 pt-4 max-w-2xl mx-auto w-full flex flex-col items-center">
							<div className="w-28 h-28 bg-muted rounded-full animate-pulse mb-4" />
							<div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
							<div className="h-4 w-40 bg-muted rounded animate-pulse mb-8" />
							<div className="w-full max-w-sm aspect-square bg-muted rounded-full animate-pulse" />
						</main>
					</ScrollArea>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 bg-background relative h-full">
			<BackgroundMesh variant="subtle" />
			<div className="flex flex-col h-full overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border/50 relative z-10">
				<ScrollArea className="flex-1">
					<main
						className="px-6 pb-40 pt-8 max-w-2xl mx-auto w-full flex flex-col items-center"
						style={{
							paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)',
						}}
					>
						{/* Avatar Section */}
						<div className="relative mb-8 w-full">
							<div className="absolute inset-0 bg-linear-to-b from-primary/10 to-transparent rounded-3xl blur-3xl -z-10" />
							<div className="premium-glass p-6 rounded-3xl flex flex-col items-center text-center border-none shadow-none">
								<div className="relative mb-4">
									<div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl relative ring-4 ring-background">
										<SafeImage
											src={
												session?.user?.image ||
												'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
											}
											alt={session?.user?.name || 'User'}
											width={96}
											height={96}
											className="w-full h-full object-cover"
											priority
										/>
									</div>
									<div className="absolute bottom-0 right-0 rounded-full p-1.5 bg-primary ring-4 ring-background text-primary-foreground shadow-lg">
										<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
											<title>Verified Badge</title>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>

								<h2 className="text-2xl font-black mb-1 text-foreground tracking-tight">
									{session?.user?.name || 'Student'}
								</h2>
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">
									Grade 12 Scholar
								</p>
							</div>
						</div>

						{/* Tabs - Segmented Control */}
						<nav
							className="w-full max-w-xs p-1.5 rounded-2xl flex mb-8 bg-muted/50 backdrop-blur-sm border border-border/20"
							aria-label="Statistics view"
						>
							<button
								type="button"
								onClick={() => setViewMode('my_stats')}
								aria-pressed={viewMode === 'my_stats'}
								className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
									viewMode === 'my_stats'
										? 'bg-background text-foreground shadow-sm scale-100'
										: 'text-muted-foreground scale-95 hover:text-foreground'
								}`}
							>
								My Stats
							</button>
							<button
								type="button"
								onClick={() => setViewMode('provincial')}
								aria-pressed={viewMode === 'provincial'}
								className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
									viewMode === 'provincial'
										? 'bg-background text-foreground shadow-sm scale-100'
										: 'text-muted-foreground scale-95 hover:text-foreground'
								}`}
							>
								vs. Average
							</button>
						</nav>

						{/* Radar Chart */}
						<div className="w-full max-w-sm aspect-square relative mb-6">
							<ChartContainer config={chartConfig} className="min-w-0 min-h-0 w-full h-full">
								<RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
									<defs>
										<linearGradient id={radarGradientId} x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
											<stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3} />
										</linearGradient>
										<filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
											<feGaussianBlur stdDeviation="3" result="coloredBlur" />
											<feMerge>
												<feMergeNode in="coloredBlur" />
												<feMergeNode in="SourceGraphic" />
											</feMerge>
										</filter>
									</defs>
									<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									<PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
									<PolarAngleAxis
										dataKey="subject"
										tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
										className="uppercase tracking-widest"
										tickLine={false}
									/>
									<Radar
										name="You"
										dataKey="you"
										stroke="var(--primary)"
										strokeWidth={3}
										fill={`url(#${radarGradientId})`}
										fillOpacity={0.5}
										filter={`url(#${glowFilterId})`}
										dot={{
											r: 4,
											fill: 'var(--primary)',
											fillOpacity: 1,
											stroke: 'var(--background)',
											strokeWidth: 2,
										}}
									/>
									{viewMode === 'provincial' && (
										<Radar
											name="Average"
											dataKey="average"
											stroke="var(--muted-foreground)"
											strokeWidth={2}
											fill="transparent"
											strokeDasharray="4 4"
											opacity={0.5}
										/>
									)}
								</RadarChart>
							</ChartContainer>

							{/* Highlight accuracy */}
							{userStats && userStats.accuracy > 0 && (
								<div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1.5 rounded-xl shadow-xl z-10 uppercase tracking-wider backdrop-blur-md border border-primary/20 bg-primary text-primary-foreground">
									{userStats.accuracy}% AVG
								</div>
							)}
						</div>

						{/* Legend */}
						<div className="flex justify-center gap-6 mb-8">
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
								<span className="w-2 h-2 rounded-full ring-2 ring-primary/50 bg-primary" />
								You
							</div>
							{viewMode === 'provincial' && (
								<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60">
									<span className="w-2 h-2 rounded-full border-2 border-muted-foreground" />
									Provincial
								</div>
							)}
						</div>

						{/* Achievements */}
						<div className="w-full mb-8">
							<h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground pl-1">
								Achievements ({userStats?.achievementsUnlocked || 0})
							</h3>
							<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
								{achievements.map((item) => (
									<div
										key={item.title}
										className="flex items-center gap-3 px-4 py-3 rounded-2xl shrink-0 premium-glass border-none"
									>
										<div
											className={`p-2 rounded-xl ${item.variant === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`}
										>
											<item.icon
												className={`w-4 h-4 ${item.variant === 'primary' ? 'text-primary' : 'text-secondary-foreground'}`}
											/>
										</div>
										<span className="font-bold text-xs">{item.title}</span>
									</div>
								))}
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-2 gap-4 w-full">
							<div className="p-5 rounded-3xl premium-glass border-none">
								<div className="flex flex-col gap-4">
									<div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10">
										<GraduationCap className="w-5 h-5 text-primary" />
									</div>
									<div>
										<div className="text-2xl font-black text-foreground tracking-tight">
											{userStats?.totalQuestions || 0}
										</div>
										<div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-muted-foreground opacity-70">
											Questions Answered
										</div>
									</div>
								</div>
							</div>

							<div className="p-5 rounded-3xl premium-glass border-none">
								<div className="flex flex-col gap-4">
									<div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10">
										<Star className="w-5 h-5 text-primary" />
									</div>
									<div>
										<div className="text-2xl font-black text-foreground tracking-tight">
											{userStats?.streak || 0}
										</div>
										<div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-muted-foreground opacity-70">
											Day Streak
										</div>
									</div>
								</div>
							</div>
						</div>
					</main>
				</ScrollArea>
			</div>
		</div>
	);
}
