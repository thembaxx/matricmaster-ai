'use client';

import {
	AlertCircleIcon,
	Analytics01Icon as BarChartSquare01Icon,
	Clock01Icon,
	Cancel01Icon as CloseIcon,
	FireIcon,
	GridIcon,
	SparklesIcon,
	StarIcon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Subject, Topic } from '@/data/curriculum';
import { cn } from '@/lib/utils';

interface TopicDetailsModalProps {
	topic: Topic;
	subject: Subject;
	onClose: () => void;
	onStartQuiz: () => void;
}

export function TopicDetailsModal({
	topic,
	subject,
	onClose,
	onStartQuiz,
}: TopicDetailsModalProps) {
	const accuracy =
		topic.questionsAttempted > 0
			? Math.round(((topic.questionsCorrect || 0) / topic.questionsAttempted) * 100)
			: 0;

	const estimatedTimeRemaining =
		topic.status === 'mastered'
			? 0
			: Math.ceil(((100 - topic.progress) / 100) * (topic.timeToMaster || 8));

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<Button
				type="button"
				variant="ghost"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default rounded-none"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<m.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-tiimo-xl w-full max-w-md max-h-[90vh] overflow-hidden"
			>
				<div
					className={cn('h-24 relative', subject.color.replace('bg-', 'bg-gradient-to-br from-'))}
				>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30"
					>
						<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
					</Button>
					<div className="absolute bottom-4 left-6 flex items-center gap-3">
						<span className="text-3xl">{subject.icon}</span>
						<div>
							<h2 className="text-xl font-black text-white uppercase">{subject.name}</h2>
							<p className="text-xs text-white/70">CAPS Grade 12</p>
						</div>
					</div>
				</div>

				<ScrollArea className="p-6 max-h-[60vh]">
					<h3 className="text-2xl font-black mb-4">{topic.name}</h3>

					<div className="grid grid-cols-2 gap-3 mb-6">
						<div className="bg-muted/50 rounded-2xl p-4">
							<div className="flex items-center gap-2 mb-1">
								<HugeiconsIcon icon={BarChartSquare01Icon} className="w-4 h-4 text-primary" />
								<span className="text-xs font-bold text-muted-foreground">Progress</span>
							</div>
							<div className="text-2xl font-black">{topic.progress}%</div>
						</div>
						<div className="bg-muted/50 rounded-2xl p-4">
							<div className="flex items-center gap-2 mb-1">
								<HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-warning" />
								<span className="text-xs font-bold text-muted-foreground">Accuracy</span>
							</div>
							<div className="text-2xl font-black">{accuracy}%</div>
						</div>
					</div>

					<div className="space-y-4 mb-6">
						<div className="flex items-center justify-between py-2 border-b border-border/50">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={GridIcon} className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm font-medium">Questions Attempted</span>
							</div>
							<span className="font-bold">{topic.questionsAttempted}</span>
						</div>
						<div className="flex items-center justify-between py-2 border-b border-border/50">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-success" />
								<span className="text-sm font-medium">Questions Correct</span>
							</div>
							<span className="font-bold">{topic.questionsCorrect || 0}</span>
						</div>
						<div className="flex items-center justify-between py-2 border-b border-border/50">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-info" />
								<span className="text-sm font-medium">Last Practiced</span>
							</div>
							<span className="font-bold">{topic.lastPracticed || 'Not yet'}</span>
						</div>
						{topic.difficulty && (
							<div className="flex items-center justify-between py-2 border-b border-border/50">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-warning" />
									<span className="text-sm font-medium">Difficulty</span>
								</div>
								<span
									className={cn(
										'font-bold px-2 py-0.5 rounded-full text-xs',
										topic.difficulty === 'easy' && 'bg-success/20 text-success',
										topic.difficulty === 'medium' && 'bg-warning/20 text-warning',
										topic.difficulty === 'hard' && 'bg-destructive/20 text-destructive'
									)}
								>
									{topic.difficulty}
								</span>
							</div>
						)}
					</div>

					{topic.status !== 'mastered' && (
						<div className="bg-primary/5 rounded-2xl p-4 mb-4">
							<div className="flex items-center gap-2 mb-2">
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
								<span className="text-sm font-bold">AI Prediction</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Based on your learning pace, you need approximately{' '}
								<span className="font-bold text-primary">{estimatedTimeRemaining} hours</span> of
								practice to master this topic.
							</p>
						</div>
					)}

					{topic.weaknesses && topic.weaknesses.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-bold mb-2 flex items-center gap-2">
								<HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-destructive" />
								Areas to Improve
							</h4>
							<div className="flex flex-wrap gap-2">
								{topic.weaknesses.map((w) => (
									<span
										key={w}
										className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium"
									>
										{w}
									</span>
								))}
							</div>
						</div>
					)}

					{topic.isCustom && (
						<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-amber-500" />
								<span className="text-sm font-bold text-amber-700">Custom Topic</span>
							</div>
							<p className="text-xs text-amber-600 mt-1">
								You added this topic to track separately
							</p>
						</div>
					)}
				</ScrollArea>

				<div className="p-6 pt-0">
					<Button onClick={onStartQuiz} className="w-full h-12 rounded-xl font-bold">
						{topic.status === 'mastered'
							? 'Review Topic'
							: topic.status === 'in-progress'
								? 'Continue Learning'
								: 'Start Learning'}
					</Button>
				</div>
			</m.div>
		</div>
	);
}
