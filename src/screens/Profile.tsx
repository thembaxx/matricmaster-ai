'use client';

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

import {
	FireIcon,
	GraduationCap,
	Medal01Icon,
	PencilEdit01Icon,
	SaveIcon,
	SchoolReportCardIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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

import { toast } from 'sonner';
import { AvatarPicker } from '@/components/Profile/AvatarPicker';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import { Button } from '@/components/ui/button';
import { updateUserProfileAction } from '@/lib/db/actions';

interface User {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	school?: string | null;
	avatarId?: string | null;
}

export default function Profile() {
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');
	const [isEditing, setIsAdding] = useState(false);
	const radarGradientId = useId();
	const { data: session, update } = useSession() as any;

	const [editForm, setEditForm] = useState({
		name: '',
		school: '',
		avatarId: '',
	});

	useEffect(() => {
		if (session?.user) {
			const u = session.user as User;
			setEditForm({
				name: u.name || '',
				school: u.school || '',
				avatarId: u.avatarId || '',
			});
		}
	}, [session]);

	const handleSaveProfile = async () => {
		const result = await updateUserProfileAction(editForm);
		if (result.success) {
			toast.success('Profile updated successfully!');
			setIsAdding(false);
			// Refresh session to show updated data
			if (update) await update();
		} else {
			toast.error('Failed to update profile');
		}
	};

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
				const totalXp = achievements.unlocked.reduce((sum: number, a: any) => {
					return sum + (ACHIEVEMENT_POINTS_MAP.get(a.achievementId) || 0);
				}, 0);

				setUserStats({
					totalQuestions: progress?.totalQuestionsAttempted || 0,
					accuracy: progress?.accuracy || 0,
					streak: streak?.currentStreak || 0,
					achievementsUnlocked: achievements?.unlocked?.length || 0,
					totalXp,
					unlockedAchievementIds: achievements.unlocked.map((a: any) => a.achievementId),
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
		return <ProfileSkeleton />;
	}

	const u = session?.user as User;

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-6 sm:pt-8 space-y-8 sm:space-y-12 relative z-10">
				{/* Avatar Section */}
				<div className="flex flex-col sm:flex-row items-center gap-8 bg-card/30 p-8 rounded-[2.5rem] border border-border/50">
					<div className="relative">
						<div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-background bg-muted flex items-center justify-center">
							{editForm.avatarId ? (
								<AvatarPicker selectedId={editForm.avatarId} onSelect={() => {}} />
							) : (
								<SafeImage
									src={session?.user?.image || '/default-avatar.png'}
									alt={session?.user?.name || 'User'}
									className="w-full h-full object-cover"
								/>
							)}
						</div>
						{!isEditing && (
							<button
								onClick={() => setIsAdding(true)}
								className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
							>
								<HugeiconsIcon icon={PencilEdit01Icon} className="w-5 h-5" />
							</button>
						)}
					</div>

					<div className="flex-1 space-y-4 text-center sm:text-left w-full">
						{isEditing ? (
							<div className="space-y-4 max-w-md">
								<div className="space-y-2">
									<label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
										Display Name
									</label>
									<input
										type="text"
										value={editForm.name}
										onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
										className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
										Current School
									</label>
									<input
										type="text"
										value={editForm.school}
										onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
										placeholder="e.g. Pretoria Boys High"
										className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
									/>
								</div>
								<div className="pt-4">
									<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 ml-1">
										Choose Mascot
									</p>
									<AvatarPicker
										selectedId={editForm.avatarId}
										onSelect={(id) => setEditForm({ ...editForm, avatarId: id })}
									/>
								</div>
								<div className="flex gap-2 pt-6">
									<Button
										onClick={handleSaveProfile}
										className="rounded-full flex-1 gap-2 h-12 shadow-xl shadow-primary/20"
									>
										<HugeiconsIcon icon={SaveIcon} className="w-4 h-4" />
										Save Changes
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsAdding(false)}
										className="rounded-full h-12"
									>
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
									{session?.user?.name || 'Matric Scholar'}
								</h2>
								<div className="flex flex-wrap justify-center sm:justify-start gap-4">
									<div className="flex items-center gap-2 text-muted-foreground font-bold">
										<HugeiconsIcon icon={SchoolReportCardIcon} className="w-4 h-4" />
										<span className="text-sm uppercase tracking-widest">
											{u?.school || 'High School Student'}
										</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground font-bold">
										<HugeiconsIcon icon={Target01Icon} className="w-4 h-4" />
										<span className="text-sm uppercase tracking-widest">Class of 2026</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 pt-8 gap-8 lg:gap-12">
					{/* Left Column: Stats & Performance */}
					<div className="lg:col-span-7 space-y-8 lg:space-y-12">
						<div className="space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
									Performance Matrix
								</h3>
								<div className="flex justify-start p-1 bg-muted rounded-xl">
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
										<HugeiconsIcon icon={GraduationCap} className="w-10 h-10 text-primary-violet" />
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
										<HugeiconsIcon icon={Target01Icon} className="w-10 h-10 text-accent-lime" />
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
										<HugeiconsIcon
											icon={FireIcon}
											className="w-10 h-10 text-primary-orange fill-primary-orange"
										/>
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
										<HugeiconsIcon icon={Medal01Icon} className="w-10 h-10 text-primary-violet" />
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
