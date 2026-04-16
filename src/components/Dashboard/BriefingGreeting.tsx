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
			className="relative overflow-hidden pt-6 pb-10"
		>
			<div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

			<div className="relative flex flex-col gap-8">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							<span className="text-xs font-medium text-primary tracking-wide">{greeting}</span>
						</div>
						<h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-xl">
							{displayGreeting}
						</h1>
						{motivationalMessage && (
							<m.p
								initial={{ opacity: 0, y: 5 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="text-base text-muted-foreground mt-3 max-w-lg"
							>
								{motivationalMessage}
							</m.p>
						)}
					</div>
					<div className="hidden sm:block">
						<NotificationBell />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
						className="flex flex-wrap gap-3"
					>
						{quickTips.map((tip, tipIndex) => (
							<m.div
								key={tipIndex}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.4 + tipIndex * 0.1 }}
								className="px-4 py-2 bg-secondary/40 rounded-full text-sm font-medium text-muted-foreground hover:bg-secondary/60 transition-colors cursor-default"
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
