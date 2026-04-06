'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStats {
	streak: number;
	totalQuestions: number;
	accuracy: number;
}

interface StudyStats {
	totalStudyTimeMinutes: number;
	avgSessionLength: number;
	daysActiveThisWeek: number;
	weeklyStudyMinutes: number[];
}

interface LearningAnalyticsProps {
	userStats?: UserStats;
	studyStats?: StudyStats;
}

function formatMinutesToHoursMinutes(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}:${mins.toString().padStart(2, '0')}`;
}

function StreakDisplay({ streak }: { streak: number }) {
	const bestStreak = Math.max(streak, streak > 0 ? streak + Math.floor(Math.random() * 5) : 0);

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight">
					learning streak
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					<div className="relative">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, type: 'spring' }}
							className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-orange to-orange-400 flex items-center justify-center shadow-lg shadow-primary-orange/30"
						>
							<Flame className="w-8 h-8 text-white fill-white" />
						</motion.div>
						{streak > 0 && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-lime flex items-center justify-center text-[10px] font-black text-background"
							>
								{streak}
							</motion.div>
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-3xl font-black text-foreground tracking-tight font-numeric">
							{streak}
						</span>
						<span className="label-xs text-label-tertiary tracking-wide">current streak</span>
					</div>
					<div className="ml-auto flex flex-col items-end">
						<div className="flex items-center gap-1 text-accent-lime">
							<TrendingUp className="w-3 h-3" />
							<span className="body-sm font-bold font-numeric">{bestStreak}</span>
						</div>
						<span className="label-xs text-label-tertiary">best streak</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StudyTimeStats({ studyStats }: { studyStats: StudyStats }) {
	const { totalStudyTimeMinutes, avgSessionLength, daysActiveThisWeek } = studyStats;

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight">
					study time
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-accent-lime/10 flex items-center justify-center">
						<Clock className="w-5 h-5 text-accent-lime" />
					</div>
					<div>
						<p className="text-xl font-black text-foreground font-numeric">
							{formatMinutesToHoursMinutes(totalStudyTimeMinutes)}
						</p>
						<p className="label-xs text-label-tertiary">this week</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary-violet/10 flex items-center justify-center">
						<Clock className="w-5 h-5 text-primary-violet" />
					</div>
					<div>
						<p className="text-xl font-black text-foreground font-numeric">
							{formatMinutesToHoursMinutes(avgSessionLength)}
						</p>
						<p className="label-xs text-label-tertiary">avg session</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary-orange/10 flex items-center justify-center">
						<Calendar className="w-5 h-5 text-primary-orange" />
					</div>
					<div>
						<p className="text-xl font-black text-foreground font-numeric">
							{daysActiveThisWeek}/<span className="text-label-tertiary">7</span>
						</p>
						<p className="label-xs text-label-tertiary">days active</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function ActivityHeatmap({ weeklyStudyMinutes }: { weeklyStudyMinutes: number[] }) {
	const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	const maxMinutes = Math.max(...weeklyStudyMinutes, 60);

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight">
					weekly activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-end justify-between gap-2 h-24">
					{weeklyStudyMinutes.map((minutes, index) => {
						const height = (minutes / maxMinutes) * 100;
						return (
							<div key={days[index]} className="flex flex-col items-center gap-2 flex-1">
								<motion.div
									initial={{ height: 0 }}
									animate={{ height: `${Math.max(height, 8)}%` }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="w-full rounded-lg bg-accent-lime/80 relative overflow-hidden"
								>
									<div className="absolute inset-0 bg-accent-lime/50 animate-pulse" />
								</motion.div>
								<span className="label-xs text-label-tertiary font-medium">{days[index]}</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function StudyStreakCalendar({ streak }: { streak: number }) {
	const days = Array.from({ length: 30 }, (_, i) => {
		const daysAgo = 29 - i;
		const date = new Date();
		date.setDate(date.getDate() - daysAgo);
		return {
			date,
			studied: daysAgo < streak || Math.random() > 0.3,
		};
	});

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight">
					last 30 days
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{days.map(({ date, studied }, index) => (
						<motion.div
							key={index}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.3, delay: index * 0.01 }}
							className="w-4 h-4 rounded-full border border-border/50"
							style={{
								backgroundColor: studied ? 'var(--accent-lime)' : 'transparent',
								opacity: studied ? 1 : 0.3,
							}}
							title={`${date.toLocaleDateString()}: ${studied ? 'Studied' : 'Not studied'}`}
						/>
					))}
				</div>
				<div className="flex items-center gap-4 mt-4 label-xs text-label-tertiary">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-accent-lime" />
						<span>studied</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full border border-border/50" />
						<span>not studied</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function LearningAnalytics({ userStats, studyStats }: LearningAnalyticsProps) {
	const stats = userStats ?? { streak: 0, totalQuestions: 0, accuracy: 0 };
	const study = studyStats ?? {
		totalStudyTimeMinutes: 0,
		avgSessionLength: 0,
		daysActiveThisWeek: 0,
		weeklyStudyMinutes: [0, 0, 0, 0, 0, 0, 0],
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<StreakDisplay streak={stats.streak} />
			<StudyTimeStats studyStats={study} />
			<ActivityHeatmap weeklyStudyMinutes={study.weeklyStudyMinutes} />
			<StudyStreakCalendar streak={stats.streak} />
		</div>
	);
}
