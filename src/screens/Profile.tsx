'use client';

import { motion } from 'framer-motion';
import { Award, Flame, GraduationCap, Target, Settings, Share2, Camera, User } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { LevelProgress } from '@/components/Gamification/LevelProgress';
import { AchievementBadges, AchievementProgress } from '@/components/Profile/AchievementBadges';
import { BadgeShowcase } from '@/components/Profile/BadgeShowcase';
import { SafeImage } from '@/components/SafeImage';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
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
		color: 'var(--primary-violet)',
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
			<div className="flex-1 flex flex-col items-center justify-center py-40 gap-4">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-violet border-t-transparent" />
				<p className="font-bold text-muted-foreground animate-pulse uppercase tracking-widest text-xs">Loading Profile...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background relative overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-7xl mx-auto w-full px-6 py-10 sm:py-16 space-y-12 pb-32 lg:px-0 relative z-10">
				{/* Modern Profile Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
					<Card variant="elevated" className="overflow-hidden border-2 border-primary-violet/10">
						<div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary-violet via-primary-cyan to-primary-orange opacity-20" />
						<div className="p-6 sm:p-10 -mt-16 sm:-mt-24">
							<div className="flex flex-col md:flex-row items-end gap-6 md:gap-10">
								<div className="relative group">
									<div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl relative bg-card">
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
									<Button
										size="icon"
										variant="secondary"
										className="absolute bottom-2 right-2 rounded-xl shadow-lg border-2 border-background h-10 w-10"
									>
										<Camera className="w-5 h-5" />
									</Button>
								</div>

								<div className="flex-1 space-y-4 pb-2">
									<div className="space-y-1 text-center md:text-left">
										<h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-foreground leading-none">
											{session?.user?.name || 'Scholar'}
										</h1>
										<div className="flex items-center justify-center md:justify-start gap-2">
											<Badge variant="violet" size="sm" className="font-bold">Grade 12</Badge>
											<span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Candidate 2026</span>
										</div>
									</div>

									<div className="flex flex-wrap justify-center md:justify-start gap-3">
										<Button variant="outline" size="sm" className="rounded-xl" leftIcon={<Settings className="w-4 h-4" />}>
											Settings
										</Button>
										<Button variant="outline" size="sm" className="rounded-xl" leftIcon={<Share2 className="w-4 h-4" />}>
											Share
										</Button>
									</div>
								</div>

								<div className="hidden lg:block w-72">
									{userStats && (
										<div className="space-y-2">
											<div className="flex justify-between text-xs font-bold text-primary-violet uppercase tracking-widest">
												<span>Level Progress</span>
												<span>{userStats.totalXp} XP</span>
											</div>
											<LevelProgress totalXp={userStats.totalXp} variant="full" />
										</div>
									)}
								</div>
							</div>
						</div>
					</Card>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
					{/* Left Column: Analysis */}
					<div className="lg:col-span-7 space-y-10">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-2xl font-heading font-black tracking-tight">Skill Matrix</h3>
								<div className="flex p-1 bg-muted rounded-2xl">
									<button
										onClick={() => setViewMode('my_stats')}
										className={cn(
											"px-4 py-2 rounded-xl text-xs font-bold transition-all",
											viewMode === 'my_stats' ? "bg-card shadow-sm text-primary-violet" : "text-muted-foreground"
										)}
									>
										Personal
									</button>
									<button
										onClick={() => setViewMode('provincial')}
										className={cn(
											"px-4 py-2 rounded-xl text-xs font-bold transition-all",
											viewMode === 'provincial' ? "bg-card shadow-sm text-primary-violet" : "text-muted-foreground"
										)}
									>
										Benchmark
									</button>
								</div>
							</div>

							<Card variant="default" className="p-6 sm:p-10 border-2">
								<ChartContainer config={chartConfig} className="h-[400px] w-full">
									<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
										<PolarGrid stroke="var(--border)" />
										<PolarAngleAxis
											dataKey="subject"
											tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
										/>
										<Radar
											name="You"
											dataKey="you"
											stroke="var(--primary-violet)"
											strokeWidth={3}
											fill="var(--primary-violet)"
											fillOpacity={0.2}
										/>
										{viewMode === 'provincial' && (
											<Radar
												name="Average"
												dataKey="average"
												stroke="var(--primary-cyan)"
												strokeWidth={2}
												fill="transparent"
												strokeDasharray="4 4"
											/>
										)}
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									</RadarChart>
								</ChartContainer>
							</Card>
						</div>
					</div>

					{/* Right Column: Stats Cards */}
					<div className="lg:col-span-5 space-y-10">
						<h3 className="text-2xl font-heading font-black tracking-tight">Quick Stats</h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
							<Card variant="interactive" className="p-6 border-2 group">
								<div className="flex items-center gap-6">
									<div className="w-16 h-16 rounded-2xl bg-primary-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<GraduationCap className="w-8 h-8 text-primary-violet" />
									</div>
									<div className="space-y-1">
										<div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Solved</div>
										<div className="text-3xl font-heading font-black">{userStats?.totalQuestions || 0}</div>
									</div>
								</div>
							</Card>

							<Card variant="interactive" className="p-6 border-2 group">
								<div className="flex items-center gap-6">
									<div className="w-16 h-16 rounded-2xl bg-primary-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<Target className="w-8 h-8 text-primary-cyan" />
									</div>
									<div className="space-y-1">
										<div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</div>
										<div className="text-3xl font-heading font-black">{userStats?.accuracy || 0}%</div>
									</div>
								</div>
							</Card>

							<Card variant="interactive" className="p-6 border-2 group">
								<div className="flex items-center gap-6">
									<div className="w-16 h-16 rounded-2xl bg-primary-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<Flame className="w-8 h-8 text-primary-orange" />
									</div>
									<div className="space-y-1">
										<div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Streak</div>
										<div className="text-3xl font-heading font-black">{userStats?.streak || 0} Days</div>
									</div>
								</div>
							</Card>

							<Card variant="interactive" className="p-6 border-2 group border-dashed bg-muted/30">
								<div className="flex items-center gap-6">
									<div className="w-16 h-16 rounded-2xl bg-primary-violet/5 flex items-center justify-center">
										<Award className="w-8 h-8 text-primary-violet opacity-50" />
									</div>
									<div className="space-y-1">
										<div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Awards</div>
										<div className="text-3xl font-heading font-black">{userStats?.achievementsUnlocked || 0}</div>
									</div>
								</div>
							</Card>
						</div>

						{userStats && userStats.unlockedAchievementIds.length > 0 && (
							<div className="space-y-6 pt-4">
								<h3 className="text-xl font-heading font-black tracking-tight">Featured Badges</h3>
								<BadgeShowcase unlockedIds={userStats.unlockedAchievementIds} maxFeatured={3} />
							</div>
						)}
					</div>
				</div>

				{/* Detailed Collection */}
				{userStats && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="space-y-8"
					>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
							<h3 className="text-2xl font-heading font-black tracking-tight">Full Collection</h3>
							<div className="w-full sm:w-80">
								<AchievementProgress unlockedIds={userStats.unlockedAchievementIds} />
							</div>
						</div>
						<Card variant="default" className="p-8 rounded-[2.5rem] border-2">
							<AchievementBadges unlockedIds={userStats.unlockedAchievementIds} />
						</Card>
					</motion.div>
				)}
			</main>
		</div>
	);
}
