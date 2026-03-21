'use client';

import { Calendar01Icon, Clock01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import type { TimelineTask } from '@/types/timeline';

const DEFAULT_TIMELINE_TASKS: TimelineTask[] = [];

interface BriefingGreetingProps {
	userName?: string | null;
	completedCount: number;
	totalCount: number;
	streakDays: number;
	suggestedSubject?: string | null;
	timelineTasks?: TimelineTask[];
	flashcardsDue?: number;
	weakTopicsCount?: number;
	recentAccuracy?: number;
	isNewUser?: boolean;
	hasError?: boolean;
	onRetry?: () => void;
	briefingData?: {
		greeting: string;
		motivationalMessage?: string;
		quickTips?: string[];
		hasAiGreeting: boolean;
		apsProgress?: {
			currentAps: number;
			targetAps: number;
			universityTarget?: string;
		};
		streak?: {
			hasStudiedToday: boolean;
		};
	};
}

export function BriefingGreeting({
	userName,
	completedCount,
	totalCount,
	streakDays,
	suggestedSubject,
	timelineTasks = DEFAULT_TIMELINE_TASKS,
	flashcardsDue = 0,
	weakTopicsCount = 0,
	recentAccuracy = 0,
	isNewUser = false,
	hasError = false,
	onRetry,
	briefingData,
}: BriefingGreetingProps) {
	const router = useRouter();
	const firstName = userName?.split(' ')[0] || 'Scholar';

	const greeting = useMemo(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	}, []);

	const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	const displayGreeting =
		briefingData?.greeting || (isNewUser ? `Welcome aboard, ${firstName}!` : `Hey, ${firstName}`);
	const motivationalMessage = briefingData?.motivationalMessage;
	const quickTips = briefingData?.quickTips;

	const displayStreakDays = Math.max(0, streakDays);

	return (
		<m.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden pt-4 pb-8"
		>
			<div className="flex flex-col gap-6">
				{/* Top Row: Greeting & Time */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2 mb-1">
							<div className="w-2 h-2 rounded-full bg-tiimo-lavender animate-pulse" />
							<span className="label-sm text-tiimo-lavender">{greeting}</span>
						</div>
						<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-display text-pretty truncate max-w-[280px] sm:max-w-none">
							{displayGreeting}
						</h1>
						{motivationalMessage && (
							<m.p
								initial={{ opacity: 0, y: 5 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="text-sm text-muted-foreground mt-1 max-w-lg text-pretty"
							>
								{motivationalMessage}
							</m.p>
						)}
					</div>
					<NotificationBell />
				</div>

				{/* Briefing Cards Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Goals Card */}
					<m.div
						whileHover={{ y: -4 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => router.push('/tasks')}
						className="tiimo-card p-6 flex flex-col justify-between h-40 relative group overflow-hidden cursor-pointer"
					>
						<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl group-hover:bg-tiimo-lavender/20 transition-all" />

						<div className="flex items-center justify-between z-10">
							<div className="p-2 bg-tiimo-lavender/10 rounded-xl text-tiimo-lavender">
								<HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5" />
							</div>
							<span className="text-xs font-bold text-tiimo-gray-muted bg-secondary px-2 py-1 rounded-lg">
								Today
							</span>
						</div>
						<div className="z-10 mt-4">
							<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">Goals</p>
							<div className="flex items-baseline gap-2">
								<span className="text-3xl font-black tabular-nums">{completedCount}</span>
								<span className="text-lg font-bold text-tiimo-gray-muted">/ {totalCount}</span>
							</div>
						</div>
						<div className="w-full h-1.5 bg-secondary rounded-full mt-4 overflow-hidden z-10">
							<m.div
								initial={{ width: 0 }}
								animate={{ width: `${completionRate}%` }}
								className="h-full bg-tiimo-lavender"
							/>
						</div>
					</m.div>

					{/* Streak Card - Show welcome for new users */}
					{isNewUser ? (
						<m.div
							whileHover={{ y: -4 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => router.push('/onboarding')}
							className="tiimo-card p-6 flex flex-col justify-between relative group overflow-hidden cursor-pointer"
						>
							<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-green/10 rounded-full blur-2xl group-hover:bg-tiimo-green/20 transition-all" />

							<div className="flex items-center justify-between z-10">
								<div className="p-2 bg-tiimo-green/10 rounded-xl text-tiimo-green">
									<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
								</div>
								<span className="text-xs font-bold text-tiimo-green bg-tiimo-green/10 px-2 py-1 rounded-lg">
									Welcome!
								</span>
							</div>
							<div className="z-10 mt-4">
								<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">
									Welcome Aboard!
								</p>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-black">Start</span>
									<span className="text-lg font-bold text-tiimo-gray-muted">Journey</span>
								</div>
							</div>
							<p className="text-[10px] text-tiimo-gray-muted mt-4 z-10">
								Complete your profile to get personalized recommendations
							</p>
						</m.div>
					) : (
						<m.div
							whileHover={{ y: -4 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => router.push('/streak')}
							className="tiimo-card p-6 flex flex-col justify-between relative group overflow-hidden cursor-pointer"
						>
							<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-orange/10 rounded-full blur-2xl group-hover:bg-tiimo-orange/20 transition-all" />

							<div className="flex items-center justify-between z-10">
								<div className="p-2 bg-tiimo-orange/10 rounded-xl text-tiimo-orange">
									<TrendingUp className="w-5 h-5" />
								</div>
								<span className="text-xs font-bold text-tiimo-orange bg-tiimo-orange/10 px-2 py-1 rounded-lg">
									🔥 Fire
								</span>
							</div>
							<div className="z-10 mt-4">
								<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">Streak</p>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-black tabular-nums">{displayStreakDays}</span>
									<span className="text-lg font-bold text-tiimo-gray-muted">days</span>
								</div>
							</div>
							<p className="text-[10px] text-tiimo-gray-muted mt-4 z-10">
								Keep it up! You&apos;re on a roll.
							</p>
						</m.div>
					)}

					{/* Next Action Card */}
					<m.div
						whileHover={{ y: -4 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => router.push(`/subjects/${suggestedSubject || ''}`)}
						className="p-6 flex flex-col justify-between relative group overflow-hidden bg-tiimo-lavender rounded-[var(--radius-lg)] shadow-tiimo text-white cursor-pointer transition-all hover:brightness-110"
					>
						<div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
							<HugeiconsIcon icon={SparklesIcon} className="w-32 h-32" />
						</div>

						<div className="flex items-center justify-between z-10 py-2">
							<div className="p-2 bg-white/20 rounded-xl">
								<HugeiconsIcon icon={Clock01Icon} className="w-5 h-5" />
							</div>
							<span className="text-[10px] font-black tracking-wide bg-white/20 px-2 py-1 rounded-lg">
								Action
							</span>
						</div>
						<div className="z-10 pt-4">
							<p className="text-xs font-bold text-white/70 tracking-wide mb-1">
								Pick up where you left off
							</p>
							<h3 className="text-xl font-black leading-tight">
								{suggestedSubject || 'General Studies'}
							</h3>
						</div>
						<div className="flex items-center gap-2 mt-4 z-10">
							<span className="text-[10px] font-bold bg-white text-tiimo-lavender px-2 py-0.5 rounded-md">
								prompt
							</span>
							<span className="text-[10px] font-medium text-white/80 italic">Ready to finish?</span>
						</div>
					</m.div>
				</div>

				{quickTips && quickTips.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex flex-wrap gap-2"
					>
						{quickTips.map((tip, tipIndex) => (
							<m.div
								key={tip}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.4 + tipIndex * 0.1 }}
								className="flex items-center gap-2 px-3 py-2 bg-tiimo-lavender/10 border border-tiimo-lavender/20 rounded-full"
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-tiimo-lavender" />
								<span className="text-xs font-medium text-tiimo-lavender">{tip}</span>
							</m.div>
						))}
					</m.div>
				)}

				{timelineTasks.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-6"
					>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-tiimo-gray-muted tracking-wide flex items-center gap-2 font-display">
								<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
								Today's Timeline
							</h3>
							<span className="text-xs font-medium text-muted-foreground">
								{timelineTasks.filter((t) => t.completed).length}/{timelineTasks.length} completed
							</span>
						</div>

						<div className="relative">
							<div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary" />

							<div className="flex justify-between relative">
								{timelineTasks.map((task) => (
									<m.div
										key={task.id}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.4 }}
										whileTap={{ scale: 0.9 }}
										onClick={() => !task.completed && router.push(`/subjects/${task.subject}`)}
										className={`flex flex-col items-center cursor-pointer group ${task.completed ? '' : 'active:scale-95'}`}
									>
										<span className="text-[10px] font-bold text-muted-foreground mb-2">
											{task.startTime}
										</span>

										<div
											className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${
												task.completed
													? 'bg-tiimo-green text-white'
													: `${task.subjectColor} text-white`
											}`}
										>
											{task.completed ? (
												<CheckCircle2 className="w-5 h-5" />
											) : (
												<span className="text-lg">{task.subjectEmoji}</span>
											)}
										</div>

										<div className="mt-3 text-center max-w-[80px]">
											<p
												className={`text-xs font-semibold line-clamp-2 ${
													task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
												}`}
											>
												{task.title}
											</p>
											<p className="text-[10px] text-muted-foreground mt-0.5">
												{task.duration} min
											</p>
										</div>
									</m.div>
								))}
							</div>
						</div>

						<div className="mt-4">
							<div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
								<m.div
									initial={{ width: 0 }}
									animate={{
										width: `${
											timelineTasks.length > 0
												? (timelineTasks.filter((t) => t.completed).length / timelineTasks.length) *
													100
												: 0
										}%`,
									}}
									className="h-full bg-tiimo-green"
								/>
							</div>
						</div>
					</m.div>
				)}

				{(flashcardsDue > 0 || weakTopicsCount > 0 || recentAccuracy > 0) && (
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="mt-6"
					>
						<h3 className="text-sm font-semibold text-tiimo-gray-muted tracking-wide flex items-center gap-2 font-display mb-3">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
							Smart Nudge
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							{flashcardsDue > 0 && (
								<m.div
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => router.push('/flashcards')}
									className="p-4 rounded-2xl bg-tiimo-blue/5 border border-tiimo-blue/10 cursor-pointer transition-colors hover:bg-tiimo-blue/10"
								>
									<p className="text-[10px] font-bold text-tiimo-blue tracking-wide mb-1">
										Flashcards
									</p>
									<p className="text-lg font-black text-foreground">{flashcardsDue} due</p>
									<p className="text-[10px] text-muted-foreground mt-1">Review now</p>
								</m.div>
							)}
							{weakTopicsCount > 0 && (
								<m.div
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => router.push('/review')}
									className="p-4 rounded-2xl bg-tiimo-orange/5 border border-tiimo-orange/10 cursor-pointer transition-colors hover:bg-tiimo-orange/10"
								>
									<p className="text-[10px] font-bold text-tiimo-orange tracking-wide mb-1">
										Weak topics
									</p>
									<p className="text-lg font-black text-foreground">{weakTopicsCount}</p>
									<p className="text-[10px] text-muted-foreground mt-1">Need practice</p>
								</m.div>
							)}
							{recentAccuracy > 0 && (
								<m.div
									whileHover={{ y: -2 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => router.push('/progress')}
									className="p-4 rounded-2xl bg-tiimo-green/5 border border-tiimo-green/10 cursor-pointer transition-colors hover:bg-tiimo-green/10"
								>
									<p className="text-[10px] font-bold text-tiimo-green tracking-wide mb-1">
										Accuracy
									</p>
									<p className="text-lg font-black text-foreground">{recentAccuracy}%</p>
									<p className="text-[10px] text-muted-foreground mt-1">Recent performance</p>
								</m.div>
							)}
						</div>
					</m.div>
				)}
				{hasError && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900"
					>
						<p className="text-sm text-red-600 dark:text-red-400 mb-2">
							Failed to load your briefing
						</p>
						<Button variant="outline" size="sm" onClick={onRetry}>
							Retry
						</Button>
					</m.div>
				)}
			</div>
		</m.section>
	);
}
