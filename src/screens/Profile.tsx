'use client';

import { FireIcon as Fire, GraduationCap01Icon as GraduationCap, Medal02Icon as Medal, Target02Icon as Target, CheckmarkCircle01Icon as Verified } from 'hugeicons-react';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useId, useMemo, useState } from 'react';

const RadarChart = dynamic(() => import('recharts').then((mod) => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((mod) => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((mod) => mod.PolarAngleAxis), {
	ssr: false,
});
const Radar = dynamic(() => import('recharts').then((mod) => mod.Radar), {
	ssr: false,
});

import { LevelProgress } from '@/components/Gamification/LevelProgress';
import { AchievementBadges, AchievementProgress } from '@/components/Profile/AchievementBadges';
import { BadgeShowcase } from '@/components/Profile/BadgeShowcase';
import { SafeImage } from '@/components/SafeImage';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Card } from '@/components/ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { ACHIEVEMENT_POINTS_MAP } from '@/constants/achievements';
import { useSession } from '@/lib/auth-client';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';
import { cn } from '@/lib/utils';

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
	const { data: session } = useSession();

	const [userStats, setUserStats] = useState<{
		totalQuestions: number;
		accuracy: number;
		streak: number;
		achievementsUnlocked: number;
		totalXp: number;
		unlockedAchievementIds: string[];
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

				// Bolt: Fix logic bug (was searching available instead of all) and optimize with O(1) MapTrifold lookup
				const totalXp = achievements.unlocked.reduce((sum, a) => {
					return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
				}, 0);

				setUserStats({
					totalQuestions: progress?.totalQuestionsAttempted || 0,
					accuracy: progress?.accuracy || 0,
					streak: streak?.currentStreak || 0,
					achievementsUnlocked: achievements?.unlocked?.length || 0,
					totalXp,
					unlockedAchievementIds: achievements.unlocked.map((a) => a.achievementId),
				});
			} catch (error) {
				console.error('Error fetching profile data:', error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	// Bolt: Memoize chart data to avoid O(N) recalculation on every render
	const chartData: ChartDataItem[] = useMemo(
		() =>
			defaultChartData.map((item) => ({
				...item,
				you:
					item.subject === 'MATH'
						? userStats?.accuracy || 0
						: Math.max(0, (userStats?.accuracy || 0) - 10),
			})),
		[userStats?.accuracy]
	);

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center py-40">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 pb-40 px-6 sm:px-10 lg:px-16 overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-12 sm:pt-20 space-y-16 sm:space-y-24 relative z-10">
				{/* Header/Avatar Section */}
				<div className="flex flex-col items-center text-center space-y-8">
					<div className="relative group">
						<div className="w-40 h-40 rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white dark:border-zinc-900 group-hover:scale-105 transition-transform duration-700">
							<SafeImage
								src={session?.user?.image || '/default-avatar.png'}
								alt={session?.user?.name || 'User'}
								className="w-full h-full object-cover"
							/>
						</div>
						<div
							className="absolute -bottom-2 -right-2 rounded-2xl p-2.5 border-4 border-white dark:border-zinc-900 shadow-xl bg-tiimo-blue"
						>
							<Verified size={24} className="text-white stroke-[3px]" />
						</div>
					</div>

					<div className="space-y-2">
						<h2 className="text-5xl font-black text-foreground tracking-tighter">{session?.user?.name || 'Scholar'}</h2>
						<p className="text-lg font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">{session?.user?.email || 'Student'}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
					{/* Left Column: Stats & Performance */}
					<div className="lg:col-span-7 space-y-12 lg:space-y-16">
						<div className="space-y-8">
							<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 px-2">
								<div className="space-y-1">
									<h3 className="text-4xl font-black text-foreground tracking-tight leading-none uppercase">Aptitude</h3>
									<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Skill mapping</p>
								</div>
								<div className="flex justify-start p-1.5 bg-muted/20 rounded-2xl">
									<button
										type="button"
										onClick={() => setViewMode('my_stats')}
										aria-pressed={viewMode === 'my_stats'}
										className={cn(
											"px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ios-active-scale",
											viewMode === 'my_stats' ? 'bg-white dark:bg-zinc-900 shadow-xl text-primary' : 'text-muted-foreground/40'
										)}
									>
										Individual
									</button>
									<button
										type="button"
										onClick={() => setViewMode('provincial')}
										aria-pressed={viewMode === 'provincial'}
										className={cn(
											"px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ios-active-scale",
											viewMode === 'provincial' ? 'bg-white dark:bg-zinc-900 shadow-xl text-primary' : 'text-muted-foreground/40'
										)}
									>
										Global
									</button>
								</div>
							</div>

							<Card className="rounded-[3.5rem] border-none p-10 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
								<ChartContainer config={chartConfig} className="h-[400px] w-full">
									<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
										<defs>
											<linearGradient id={radarGradientId} x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
												<stop offset="100%" stopColor="var(--tiimo-purple)" stopOpacity={0.4} />
											</linearGradient>
										</defs>
										<PolarGrid stroke="var(--muted-foreground)" strokeOpacity={0.1} />
										<PolarAngleAxis
											dataKey="subject"
											tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }}
										/>
										<Radar
											name="You"
											dataKey="you"
											stroke="var(--primary)"
											strokeWidth={6}
											fill={`url(#${radarGradientId})`}
											fillOpacity={0.5}
										/>
										{viewMode === 'provincial' && (
											<Radar
												name="Average"
												dataKey="average"
												stroke="var(--tiimo-pink)"
												strokeWidth={3}
												fill="transparent"
												strokeDasharray="10 10"
												opacity={0.3}
											/>
										)}
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									</RadarChart>
								</ChartContainer>
							</Card>
						</div>
					</div>

					{/* Right Column: Cards */}
					<div className="lg:col-span-5 space-y-12">
						<div className="space-y-1 px-2">
							<h3 className="text-4xl font-black text-foreground tracking-tight leading-none uppercase">Standing</h3>
							<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Growth metrics</p>
						</div>

						{/* Level Progress Section */}
						{userStats && (
							<Card className="p-10 rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
								<LevelProgress totalXp={userStats.totalXp} variant="full" showTitle />
							</Card>
						)}

						<div className="grid grid-cols-1 gap-6">
							{/* Questions Card */}
							<Card className="p-8 rounded-[2.5rem] border-none bg-tiimo-blue/5 relative overflow-hidden group transition-all duration-500 hover:bg-tiimo-blue/10">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-tiimo-blue text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-tiimo-blue/20">
										<GraduationCap size={40} className="stroke-[3px]" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-tiimo-blue uppercase tracking-[0.3em]">
											Knowledge
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
											{userStats?.totalQuestions || 0}
										</h4>
									</div>
								</div>
							</Card>

							{/* Accuracy Card */}
							<Card className="p-8 rounded-[2.5rem] border-none bg-tiimo-green/5 relative overflow-hidden group transition-all duration-500 hover:bg-tiimo-green/10">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-tiimo-green text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-tiimo-green/20">
										<Target size={40} className="stroke-[3px]" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-tiimo-green uppercase tracking-[0.3em]">
											Precision
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
											{userStats?.accuracy || 0}%
										</h4>
									</div>
								</div>
							</Card>

							{/* Streak Card */}
							<Card className="p-8 rounded-[2.5rem] border-none bg-tiimo-orange/5 relative overflow-hidden group transition-all duration-500 hover:bg-tiimo-orange/10">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-tiimo-orange text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-tiimo-orange/20">
										<Fire size={40} className="stroke-[3px] fill-white/20" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-tiimo-orange uppercase tracking-[0.3em]">
											Momentum
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
											{userStats?.streak || 0} Days
										</h4>
									</div>
								</div>
							</Card>
						</div>

						{/* Badge Showcase Section */}
						{userStats && userStats.unlockedAchievementIds.length > 0 && (
							<div className="pt-4">
								<BadgeShowcase unlockedIds={userStats.unlockedAchievementIds} featuredIds={userStats.unlockedAchievementIds.slice(0, 3)} maxFeatured={3} />
							</div>
						)}
					</div>
				</div>

				{/* Achievement Badges Section */}
				{userStats && (
					<m.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="pt-12 sm:pt-20 space-y-12"
					>
						<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 px-2">
							<div className="space-y-1">
								<h3 className="text-5xl font-black text-foreground tracking-tight leading-none uppercase">Collection</h3>
								<p className="text-lg font-bold text-muted-foreground/40 uppercase tracking-widest">All milestones</p>
							</div>
							<div className="w-full sm:w-96">
								<AchievementProgress unlockedIds={userStats.unlockedAchievementIds} />
							</div>
						</div>
						<Card className="p-8 sm:p-12 rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
							<AchievementBadges unlockedIds={userStats.unlockedAchievementIds} />
						</Card>
					</m.div>
				)}
			</main>
		</div>
	);
}
