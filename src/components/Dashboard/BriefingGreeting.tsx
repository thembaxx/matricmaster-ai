'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import type { TimelineTask } from '@/types/timeline';
import { GoalsCard, NextActionCard, StreakCard } from './BriefingGreeting/index';

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
	timelineTasks: _timelineTasks,
	flashcardsDue = 0,
	weakTopicsCount = 0,
	recentAccuracy = 0,
	isNewUser = false,
	briefingData,
}: BriefingGreetingProps) {
	void _timelineTasks;
	void flashcardsDue;
	void weakTopicsCount;
	void recentAccuracy;
	const router = useRouter();
	const firstName = userName?.split(' ')[0] || 'scholar';

	const greeting = useMemo(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'good morning';
		if (hour < 18) return 'good afternoon';
		return 'good evening';
	}, []);

	const displayGreeting =
		briefingData?.greeting?.toLowerCase() ||
		(isNewUser ? `welcome aboard, ${firstName.toLowerCase()}!` : `hey, ${firstName.toLowerCase()}`);
	const motivationalMessage = briefingData?.motivationalMessage?.toLowerCase();
	const quickTips = briefingData?.quickTips?.map((tip) => tip.toLowerCase());

	return (
		<m.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden pt-4 pb-8"
		>
			<div className="flex flex-col gap-6">
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

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<GoalsCard
						completedCount={completedCount}
						totalCount={totalCount}
						onClick={() => router.push('/tasks')}
					/>

					<StreakCard
						streakDays={streakDays}
						isNewUser={isNewUser}
						onClick={() => router.push(isNewUser ? '/onboarding' : '/streak')}
					/>

					<NextActionCard
						suggestedSubject={suggestedSubject}
						onClick={() => router.push(`/subjects/${suggestedSubject || ''}`)}
					/>
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
								key={tipIndex}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.4 + tipIndex * 0.1 }}
								className="px-3 py-1.5 bg-secondary/50 rounded-full text-xs font-medium text-muted-foreground"
							>
								{tip}
							</m.div>
						))}
					</m.div>
				)}
			</div>
		</m.section>
	);
}
