'use client';

import { ArrowDown01Icon as ChevronDown01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CurriculumSubject as Subject, Topic } from '@/content';
import { DURATION, EASING } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';
import { TopicCardAnimated } from './TopicCard';

interface TopicTreeProps {
	subject: Subject;
	index: number;
	expanded: boolean;
	onToggle: () => void;
	onTopicClick?: (topic: Topic) => void;
	showAddTopic?: boolean;
	onAddTopicClick?: () => void;
	onCancelAddTopic?: () => void;
	newTopicName?: string;
	onNewTopicNameChange?: (name: string) => void;
	onConfirmAddTopic?: () => void;
}

export function TopicTree({
	subject,
	index,
	expanded,
	onToggle,
	onTopicClick,
	showAddTopic,
	onAddTopicClick,
	onCancelAddTopic,
	newTopicName,
	onNewTopicNameChange,
	onConfirmAddTopic,
}: TopicTreeProps) {
	const masteredCount = subject.topics.filter((t) => t.status === 'mastered').length;
	const inProgressCount = subject.topics.filter((t) => t.status === 'in-progress').length;
	const progressValue = Math.round(
		(masteredCount * 100 + inProgressCount * 50) / subject.topics.length
	);

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className="space-y-4"
		>
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-center justify-between p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-tiimo hover:shadow-tiimo-lg transition-all group"
			>
				<div className="flex items-center gap-4">
					<div
						className={cn(
							'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg',
							subject.color
						)}
					>
						{subject.icon}
					</div>
					<div className="text-left">
						<h2 className="text-lg font-black  tracking-tight">{subject.name}</h2>
						<p className="text-xs font-semibold text-muted-foreground">
							{masteredCount} mastered · {inProgressCount} in progress ·{' '}
							{subject.topics.length - masteredCount - inProgressCount} locked
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="w-24 hidden sm:block">
						<Progress value={progressValue} className="h-2" />
						<span className="text-[10px] font-bold text-muted-foreground text-center block mt-1">
							{progressValue}%
						</span>
					</div>
					<div
						className={cn(
							'w-10 h-10 rounded-full flex items-center justify-center bg-secondary group-hover:bg-primary/10 transition-colors',
							expanded && 'rotate-180'
						)}
					>
						<HugeiconsIcon icon={ChevronDown01Icon} className="w-5 h-5 text-muted-foreground" />
					</div>
				</div>
			</button>

			<AnimatePresence>
				{expanded && (
					<m.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
						className="space-y-3 pl-4"
					>
						{subject.topics.map((topic, tIdx) => (
							<TopicCardAnimated
								key={topic.id}
								topic={topic}
								subjectColor={subject.color}
								onClick={onTopicClick ? () => onTopicClick(topic) : undefined}
								index={tIdx}
							/>
						))}

						{showAddTopic ? (
							<AddTopicForm
								newTopicName={newTopicName}
								onNewTopicNameChange={onNewTopicNameChange}
								onConfirmAddTopic={onConfirmAddTopic}
								onCancelAddTopic={onCancelAddTopic}
							/>
						) : (
							<AddTopicButton onClick={onAddTopicClick} />
						)}
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
}

function AddTopicForm({
	newTopicName,
	onNewTopicNameChange,
	onConfirmAddTopic,
	onCancelAddTopic,
}: {
	newTopicName?: string;
	onNewTopicNameChange?: (name: string) => void;
	onConfirmAddTopic?: () => void;
	onCancelAddTopic?: () => void;
}) {
	return (
		<Card className="p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
			<div className="flex items-center gap-2 mb-3">
				<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 text-primary" />
				<span className="text-sm font-bold">Add Custom Topic</span>
			</div>
			<input
				type="text"
				placeholder="Enter topic name..."
				value={newTopicName || ''}
				onChange={(e) => onNewTopicNameChange?.(e.target.value)}
				className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
				onKeyDown={(e) => {
					if (e.key === 'Enter') onConfirmAddTopic?.();
					if (e.key === 'Escape') onCancelAddTopic?.();
				}}
			/>
			<div className="flex gap-2">
				<Button
					size="sm"
					className="flex-1 rounded-full font-bold text-xs"
					onClick={onConfirmAddTopic}
					disabled={!newTopicName?.trim()}
				>
					Add Topic
				</Button>
				<Button
					size="sm"
					variant="outline"
					className="rounded-full font-bold text-xs"
					onClick={onCancelAddTopic}
				>
					Cancel
				</Button>
			</div>
		</Card>
	);
}

function AddTopicButton({ onClick }: { onClick?: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full p-3 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
		>
			<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
			Add Custom Topic
		</button>
	);
}
