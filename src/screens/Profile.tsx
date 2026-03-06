'use client';

import { m } from 'framer-motion';
import { Award, Flame, GraduationCap, Target } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { LevelProgress } from '@/components/Gamification/LevelProgress';
import { AchievementBadges, AchievementProgress } from '@/components/Profile/AchievementBadges';
import { BadgeShowcase } from '@/components/Profile/BadgeShowcase';
import { SafeImage } from '@/components/SafeImage';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
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

				// Bolt: Fix logic bug (was searching available instead of all) and optimize with O(1) Map lookup
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
		<div className="flex flex-col h-full min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				{/* Profile Header Card */}
				<m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
					<Card className="rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 relative overflow-hidden bg-primary-violet text-white border-none shadow-2xl shadow-primary-violet/20">
						<div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />

						<div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative z-10">
							<div className="relative group">
									<div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative ring-4 sm:ring-8 ring-white/10 group-hover:scale-105 transition-transform duration-500">
									<SafeImage
										src={
											session?.user?.image ||
											`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'default'}`
										}
										alt={session?.user?.name || 'User'}
										width={192}
										height={192}
										className="w-full h-full object-cover"
										priority
									/>
								</div>
								<div className="absolute bottom-2 right-2 rounded-full p-2 bg-primary ring-4 ring-zinc-900 text-white shadow-xl">
									<Target className="w-5 h-5" />
								</div>
							</div>

							<div className="flex-1 text-center md:text-left space-y-6">
								<div className="space-y-2">
									<h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-white">
										{session?.user?.name || 'Scholar'}
									</h1>
									<p className="text-[11px] font-black text-primary-cyan uppercase tracking-[0.4em]">
										Grade 12 Elite Candidate
									</p>
								</div>

								<div className="flex flex-wrap justify-center md:justify-start gap-4">
									<Badge className="bg-white/20 text-white border-none px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
										Class of 2026
									</Badge>
									<Badge className="bg-accent-lime/20 text-accent-lime border-none px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
										Academic Pro
									</Badge>
								</div>
							</div>
						</div>
					</Card>
				</m.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* Left Column: Stats & Performance */}
					<div className="lg:col-span-7 space-y-8 lg:space-y-12">
						<div className="space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
									Performance Matrix
								</h3>
								<div className="flex p-1 bg-muted rounded-xl">
									<button
										type="button"
										onClick={() => setViewMode('my_stats')}
										aria-pressed={viewMode === 'my_stats'}
										className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ios-active-scale ${viewMode === 'my_stats' ? 'bg-background shadow-sm text-foreground' : 'text-label-tertiary'}`}
									>
										Individual
									</button>
									<button
										type="button"
										onClick={() => setViewMode('provincial')}
										aria-pressed={viewMode === 'provincial'}
										className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ios-active-scale ${viewMode === 'provincial' ? 'bg-background shadow-sm text-foreground' : 'text-label-tertiary'}`}
									>
										Benchmarked
									</button>
								</div>
							</div>

							<Card className="rounded-3xl border border-border p-6 sm:p-8 bg-card/50 backdrop-blur-sm">
								<ChartContainer config={chartConfig} className="h-75 sm:h-100 w-full">
									<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
										<defs>
											<linearGradient id={radarGradientId} x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="var(--primary-violet)" stopOpacity={0.8} />
												<stop offset="100%" stopColor="var(--primary-violet)" stopOpacity={0.2} />
											</linearGradient>
										</defs>
										<PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
										<PolarAngleAxis
											dataKey="subject"
											tick={{ fill: 'var(--label-secondary)', fontSize: 10, fontWeight: 900 }}
										/>
										<Radar
											name="You"
											dataKey="you"
											stroke="var(--primary-violet)"
											strokeWidth={4}
											fill={`url(#${radarGradientId})`}
											fillOpacity={0.6}
										/>
										{viewMode === 'provincial' && (
											<Radar
												name="Average"
												dataKey="average"
												stroke="var(--label-tertiary)"
												strokeWidth={2}
												fill="transparent"
												strokeDasharray="8 8"
												opacity={0.4}
											/>
										)}
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									</RadarChart>
								</ChartContainer>
							</Card>
						</div>
					</div>

					{/* Right Column: Cards */}
					<div className="lg:col-span-5 space-y-8">
						<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
							Academic Standing
						</h3>

						{/* Level Progress Section */}
						{userStats && (
							<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm">
								<LevelProgress totalXp={userStats.totalXp} variant="full" showTitle />
							</Card>
						)}

						<div className="grid grid-cols-1 gap-6">
							{/* Questions Card */}
							<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-primary-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
										<GraduationCap className="w-10 h-10 text-primary-violet" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
											Total Knowledge
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter">
											{userStats?.totalQuestions || 0} Questions
										</h4>
									</div>
								</div>
							</Card>

							{/* Accuracy Card */}
							<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-accent-lime/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
										<Target className="w-10 h-10 text-accent-lime" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
											Precision Rate
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter">
											{userStats?.accuracy || 0}% Accuracy
										</h4>
									</div>
								</div>
							</Card>

							{/* Streak Card */}
							<Card className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-primary-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
										<Flame className="w-10 h-10 text-primary-orange fill-primary-orange" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
											Active Momentum
										</p>
										<h4 className="text-4xl font-black text-foreground tracking-tighter">
											{userStats?.streak || 0} Day Streak
										</h4>
									</div>
								</div>
							</Card>

							{/* Achievements Unlock */}
							<Card className="p-8 rounded-3xl border border-border bg-primary-violet/5 relative overflow-hidden group border-dashed">
								<div className="flex items-center gap-8 relative z-10">
									<div className="w-20 h-20 rounded-2xl bg-primary-violet/10 flex items-center justify-center">
										<Award className="w-10 h-10 text-primary-violet" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.3em]">
											Mastery Unlocked
										</p>
										<h4 className="text-2xl font-black text-foreground tracking-tighter uppercase">
											{userStats?.achievementsUnlocked || 0} Master Badges
										</h4>
									</div>
								</div>
							</Card>
						</div>

						{/* Badge Showcase Section */}
						{userStats && userStats.unlockedAchievementIds.length > 0 && (
							<div className="mt-8">
								<BadgeShowcase unlockedIds={userStats.unlockedAchievementIds} maxFeatured={3} />
							</div>
						)}
					</div>
				</div>

				{/* Achievement Badges Section */}
				{userStats && (
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-8 sm:mt-12"
					>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
							<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
								Achievement Collection
							</h3>
							<div className="w-full sm:w-72">
								<AchievementProgress unlockedIds={userStats.unlockedAchievementIds} />
							</div>
						</div>
						<Card className="p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							<AchievementBadges unlockedIds={userStats.unlockedAchievementIds} />
						</Card>
					</m.div>
				)}
			</main>
		</div>
	);
}
