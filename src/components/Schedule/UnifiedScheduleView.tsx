'use client';

import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEnergyTrackingStore } from '@/stores/useEnergyTrackingStore';
import { useLoadSheddingStore } from '@/stores/useLoadSheddingStore';
import {
	type UnifiedBlock,
	useScheduleIntegrationStore,
} from '@/stores/useScheduleIntegrationStore';

const BlockCard = ({ block }: { block: UnifiedBlock }) => {
	const typeColors: Record<string, string> = {
		study: 'bg-blue-500/10 border-blue-500/30',
		review: 'bg-purple-500/10 border-purple-500/30',
		practice: 'bg-green-500/10 border-green-500/30',
		break: 'bg-orange-500/10 border-orange-500/30',
	};

	const energyColors: Record<string, string> = {
		optimal: 'bg-green-500',
		moderate: 'bg-yellow-500',
		avoid: 'bg-red-500',
	};

	const getCountdownLabel = (days: number): string => {
		if (days <= 0) return 'Exam Day!';
		if (days === 1) return 'Tomorrow';
		if (days <= 7) return `${days} days`;
		return `${days} days`;
	};

	const getCountdownColor = (days: number): string => {
		if (days <= 1) return 'bg-red-500';
		if (days <= 3) return 'bg-orange-500';
		if (days <= 7) return 'bg-yellow-500';
		return 'bg-blue-500';
	};

	return (
		<div
			className={cn(
				'p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer',
				typeColors[block.type] || 'bg-gray-500/10 border-gray-500/30',
				block.isCompleted && 'opacity-60'
			)}
		>
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm truncate">{block.subject}</h4>
					{block.topic && <p className="text-xs text-muted-foreground truncate">{block.topic}</p>}
				</div>
				<div className="flex flex-col items-end gap-1">
					<Badge variant="secondary" className="text-xs">
						{block.type}
					</Badge>
					{block.loadSheddingWarning && (
						<Badge className="bg-red-500/20 text-red-600 text-xs">Load Shedding</Badge>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
				<span>
					{block.startTime} - {block.endTime}
				</span>
				<span>•</span>
				<span>{block.duration}min</span>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{block.energyRecommendation && block.energyRecommendation !== 'moderate' && (
					<div className={cn('w-2 h-2 rounded-full', energyColors[block.energyRecommendation])} />
				)}
				{block.examCountdown !== undefined && block.examCountdown <= 14 && (
					<Badge className={cn('text-xs text-white', getCountdownColor(block.examCountdown))}>
						{getCountdownLabel(block.examCountdown)}
					</Badge>
				)}
				{block.isAISuggested && (
					<Badge variant="outline" className="text-xs">
						AI Suggested
					</Badge>
				)}
			</div>
		</div>
	);
};

const ExamCountdownCard = ({
	exam,
}: {
	exam: { id: string; subject: string; date: Date; daysRemaining: number };
}) => {
	const getUrgencyColor = (days: number): string => {
		if (days <= 3) return 'border-red-500 bg-red-500/10';
		if (days <= 7) return 'border-orange-500 bg-orange-500/10';
		if (days <= 14) return 'border-yellow-500 bg-yellow-500/10';
		return 'border-blue-500 bg-blue-500/10';
	};

	return (
		<Card className={cn('border-2', getUrgencyColor(exam.daysRemaining))}>
			<CardContent className="p-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-sm">{exam.subject}</p>
						<p className="text-xs text-muted-foreground">
							{format(new Date(exam.date), 'MMM d, yyyy')}
						</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold font-mono">{exam.daysRemaining}</p>
						<p className="text-xs text-muted-foreground">days left</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

const LoadSheddingBanner = () => {
	const { currentStage } = useLoadSheddingStore();
	const { showLoadSheddingWarnings } = useScheduleIntegrationStore();

	if (!showLoadSheddingWarnings || currentStage < 3) return null;

	const stageColors: Record<number, string> = {
		3: 'bg-yellow-500/10 border-yellow-500',
		4: 'bg-orange-500/10 border-orange-500',
		5: 'bg-red-500/10 border-red-500',
		6: 'bg-red-600/20 border-red-600',
	};

	return (
		<Card className={cn('border-2', stageColors[currentStage])}>
			<CardContent className="p-3 flex items-center gap-3">
				<div className="text-2xl">⚡</div>
				<div className="flex-1">
					<p className="font-medium text-sm">Load Shedding Stage {currentStage} Active</p>
					<p className="text-xs text-muted-foreground">
						Some study sessions may be affected. Tap to reschedule.
					</p>
				</div>
				<Button size="sm" variant="outline">
					Reschedule
				</Button>
			</CardContent>
		</Card>
	);
};

const EnergyBanner = () => {
	const { currentEnergy, trend, optimalWindows } = useEnergyTrackingStore();
	const { showEnergyRecommendations } = useScheduleIntegrationStore();

	if (!showEnergyRecommendations) return null;

	const getTrendEmoji = (t: string): string => {
		if (t === 'improving') return '📈';
		if (t === 'declining') return '📉';
		return '➡️';
	};

	const nextOptimal = optimalWindows.find((w) => {
		const now = new Date().getHours();
		return w.startHour > now;
	});

	return (
		<Card className="border-green-500/30 bg-green-500/5">
			<CardContent className="p-3 flex items-center gap-3">
				<div className="text-2xl">🔋</div>
				<div className="flex-1">
					<p className="font-medium text-sm">
						Energy: {currentEnergy}% {getTrendEmoji(trend)}
					</p>
					{nextOptimal && (
						<p className="text-xs text-muted-foreground">
							Next optimal time: {nextOptimal.startHour}:00 - {nextOptimal.endHour}:00
						</p>
					)}
					{currentEnergy < 30 && (
						<p className="text-xs text-red-500">Consider taking a break soon</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export function UnifiedScheduleView() {
	const {
		unifiedView,
		showLoadSheddingWarnings,
		showEnergyRecommendations,
		showExamCountdowns,
		syncUnifiedSchedule,
		setUnifiedView,
		getBlocksForDate,
		getUpcomingExams,
		getNextExamCountdown,
	} = useScheduleIntegrationStore();

	const [currentWeekStart, setCurrentWeekStart] = useState(
		startOfWeek(new Date(), { weekStartsOn: 1 })
	);

	const weekDays = useMemo(() => {
		return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
	}, [currentWeekStart]);

	useEffect(() => {
		syncUnifiedSchedule();
	}, [syncUnifiedSchedule]);

	const upcomingExams = getUpcomingExams();
	const nextExam = getNextExamCountdown();

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Schedule</CardTitle>
					<div className="flex items-center gap-2 flex-wrap">
						<Button
							variant={unifiedView === 'combined' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setUnifiedView('combined')}
						>
							Combined
						</Button>
						<Button
							variant={unifiedView === 'smart' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setUnifiedView('smart')}
						>
							Smart
						</Button>
						<Button
							variant={unifiedView === 'regular' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setUnifiedView('regular')}
						>
							Regular
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{showLoadSheddingWarnings && <LoadSheddingBanner />}
					{showEnergyRecommendations && <EnergyBanner />}

					{showExamCountdowns && upcomingExams.length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium">Upcoming Exams</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{upcomingExams
									.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
									.slice(0, 4)
									.map((exam) => (
										<ExamCountdownCard key={exam.id} exam={exam} />
									))}
							</div>
						</div>
					)}

					{nextExam && (
						<Card className="border-primary/30 bg-primary/5">
							<CardContent className="p-3 flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Next Exam: {nextExam.subject}</p>
									<p className="text-xs text-muted-foreground">
										{format(new Date(nextExam.date), 'MMMM d, yyyy')}
									</p>
								</div>
								<div className="text-right">
									<p className="text-3xl font-bold font-mono text-primary">
										{nextExam.daysRemaining}
									</p>
									<p className="text-xs text-muted-foreground">days</p>
								</div>
							</CardContent>
						</Card>
					)}

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">This Week</h3>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
								>
									←
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
								>
									Today
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
								>
									→
								</Button>
							</div>
						</div>

						<div className="grid grid-cols-7 gap-2">
							{weekDays.map((day) => {
								const dayBlocks = getBlocksForDate(day);
								const isToday = isSameDay(day, new Date());

								return (
									<div
										key={day.toISOString()}
										className={cn(
											'min-h-[120px] p-2 rounded-lg border transition-colors',
											isToday
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'
										)}
									>
										<p className="text-xs font-medium text-center mb-2">{format(day, 'EEE')}</p>
										<p className="text-lg font-bold text-center mb-2">{format(day, 'd')}</p>
										<div className="space-y-1">
											{dayBlocks.slice(0, 3).map((block) => (
												<BlockCard key={block.id} block={block} />
											))}
											{dayBlocks.length > 3 && (
												<p className="text-xs text-muted-foreground text-center">
													+{dayBlocks.length - 3} more
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
