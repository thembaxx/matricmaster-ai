'use client';

import {
	AlertCircleIcon,
	ArrowLeft01Icon,
	Analytics01Icon as BarChartSquare01Icon,
	BookOpen01Icon,
	BulbIcon,
	ChampionIcon,
	ArrowDown01Icon as ChevronDown01Icon,
	Clock01Icon,
	Cancel01Icon as CloseIcon,
	FireIcon,
	FlashIcon,
	GridIcon,
	PlusSignIcon,
	Search01Icon,
	SparklesIcon,
	StarIcon,
	Tick01Icon,
	ArrowUp01Icon as TrendingUpIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	CURRICULUM_DATA,
	getTopicPrerequisites,
	type StudyRecommendation,
	type Subject,
	type Topic,
	type TopicStatus,
} from '@/data/curriculum';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'matricmaster-custom-topics';

function loadCustomTopics(): Record<string, Topic[]> {
	if (typeof window === 'undefined') return {};
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
}

function saveCustomTopics(topics: Record<string, Topic[]>) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
	} catch {
		console.error('Failed to save custom topics');
	}
}

function ProgressStats({ subjects }: { subjects: Subject[] }) {
	const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
	const masteredTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
		0
	);
	const inProgressTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
		0
	);
	const overallProgress =
		Math.round(((masteredTopics * 100 + inProgressTopics * 50) / totalTopics) * 100) / 100;
	const totalQuestions = subjects.reduce(
		(acc, s) => acc + s.topics.reduce((a, t) => a + t.questionsAttempted, 0),
		0
	);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
			{[
				{
					label: 'Overall',
					value: `${overallProgress}%`,
					icon: BarChartSquare01Icon,
					color: 'text-primary',
				},
				{
					label: 'Mastered',
					value: masteredTopics.toString(),
					icon: Tick01Icon,
					color: 'text-success',
				},
				{
					label: 'In Progress',
					value: inProgressTopics.toString(),
					icon: FireIcon,
					color: 'text-warning',
				},
				{
					label: 'Questions',
					value: totalQuestions.toString(),
					icon: GridIcon,
					color: 'text-info',
				},
			].map((stat, idx) => (
				<m.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: idx * 0.1 }}
					className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-border/30 shadow-tiimo"
				>
					<div className="flex items-center gap-2 mb-1">
						<HugeiconsIcon icon={stat.icon} className={cn('w-4 h-4', stat.color)} />
						<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
							{stat.label}
						</span>
					</div>
					<div className="text-2xl font-black text-foreground">{stat.value}</div>
				</m.div>
			))}
		</div>
	);
}

function SubjectSection({
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
}: {
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
}) {
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
				className="w-full flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-tiimo hover:shadow-tiimo-lg transition-all group"
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
						<h2 className="text-lg font-black uppercase tracking-tight">{subject.name}</h2>
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
						transition={{ duration: 0.3 }}
						className="space-y-3 pl-4"
					>
						{subject.topics.map((topic, tIdx) => (
							<m.div
								key={topic.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: tIdx * 0.05 }}
							>
								<TopicCard
									topic={topic}
									subjectColor={subject.color}
									onClick={onTopicClick ? () => onTopicClick(topic) : undefined}
								/>
							</m.div>
						))}

						{showAddTopic ? (
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
									className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
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
						) : (
							<button
								type="button"
								onClick={onAddTopicClick}
								className="w-full p-3 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
							>
								<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
								Add Custom Topic
							</button>
						)}
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
}

function TopicCard({
	topic,
	subjectColor,
	onClick,
}: {
	topic: Topic;
	subjectColor: string;
	onClick?: () => void;
}) {
	const router = useRouter();
	const statusColors = {
		mastered: 'bg-success-soft border-success/20',
		'in-progress':
			topic.progress < 60
				? 'bg-destructive/10 border-destructive/30'
				: 'bg-warning-soft border-warning/20',
		'not-started': 'bg-muted/50 border-border/30',
	};

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
	};

	return (
		<Card
			className={cn(
				'p-4 rounded-2xl border-2 transition-all group hover:scale-[1.01] cursor-pointer',
				statusColors[topic.status]
			)}
			onClick={handleClick}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4 flex-1 min-w-0">
					<div
						className={cn(
							'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2',
							topic.status === 'mastered'
								? subjectColor
								: topic.status === 'in-progress'
									? topic.progress < 60
										? 'bg-destructive/20 border-destructive'
										: 'bg-muted border-primary'
									: 'bg-muted border-muted-foreground/30'
						)}
					>
						{topic.status === 'mastered' && (
							<HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-white" />
						)}
						{topic.status === 'in-progress' && (
							<div
								className={cn(
									'w-3 h-3 rounded-full animate-pulse',
									topic.progress < 60 ? 'bg-destructive' : 'bg-primary'
								)}
							/>
						)}
						{topic.status === 'not-started' && (
							<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-muted-foreground" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="font-bold text-sm truncate">{topic.name}</h3>
							{topic.isCustom && (
								<span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
									Custom
								</span>
							)}
							{topic.status === 'in-progress' && topic.progress < 60 && (
								<span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium flex items-center gap-1">
									<HugeiconsIcon icon={AlertCircleIcon} className="w-2.5 h-2.5" />
									Weak
								</span>
							)}
						</div>
						{topic.status !== 'not-started' && (
							<div className="flex items-center gap-2 mt-1">
								<Progress value={topic.progress} className="flex-1 h-1.5" />
								<span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
									{topic.progress}% · {topic.questionsAttempted} Qs
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					{topic.status === 'mastered' && (
						<div className="flex items-center gap-1 text-warning mr-2">
							<HugeiconsIcon icon={StarIcon} className="w-4 h-4 fill-current" />
						</div>
					)}
					{topic.status !== 'not-started' && (
						<Button
							size="sm"
							variant={topic.status === 'mastered' ? 'outline' : 'default'}
							className="rounded-full font-bold text-xs px-4 shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/quiz?topic=${topic.id}`);
							}}
						>
							{topic.status === 'mastered' ? 'Review' : 'Continue'}
						</Button>
					)}
					{topic.status === 'not-started' && (
						<Button
							size="sm"
							variant="outline"
							className="rounded-full font-bold text-xs px-4 shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								if (onClick) onClick();
							}}
						>
							Start
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}

type FilterType = TopicStatus | 'all' | 'needs-attention';

function TopicDetailsModal({
	topic,
	subject,
	onClose,
	onStartQuiz,
}: {
	topic: Topic;
	subject: Subject;
	onClose: () => void;
	onStartQuiz: () => void;
}) {
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
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<m.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				className="relative bg-white rounded-3xl shadow-tiimo-xl w-full max-w-md max-h-[90vh] overflow-hidden"
			>
				<div
					className={cn('h-24 relative', subject.color.replace('bg-', 'bg-gradient-to-br from-'))}
				>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
					>
						<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
					</button>
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
								{topic.weaknesses.map((w, i) => (
									<span
										key={i}
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

export default function CurriculumMap() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<FilterType>('all');
	const [customTopics, setCustomTopics] = useState<Record<string, Topic[]>>({});
	const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
		new Set(CURRICULUM_DATA.slice(0, 2).map((s) => s.id))
	);
	const [selectedTopic, setSelectedTopic] = useState<{ topic: Topic; subject: Subject } | null>(
		null
	);
	const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
	const [newTopicName, setNewTopicName] = useState('');
	const [userXP, _setUserXP] = useState(2450);
	const [userStreak, _setUserStreak] = useState(12);
	const [userLevel, _setUserLevel] = useState(8);
	const [showRecommendations, setShowRecommendations] = useState(true);

	useEffect(() => {
		const loaded = loadCustomTopics();
		setCustomTopics(loaded);
	}, []);

	useEffect(() => {
		saveCustomTopics(customTopics);
	}, [customTopics]);

	const allData = useMemo(() => {
		return CURRICULUM_DATA.map((subject) => ({
			...subject,
			topics: [
				...subject.topics.map((t) => ({
					...t,
					prerequisites: getTopicPrerequisites(t.id),
				})),
				...(customTopics[subject.id] || []),
			],
		}));
	}, [customTopics]);

	const getStudyRecommendations = useCallback((allSubjects: Subject[]): StudyRecommendation[] => {
		const recommendations: StudyRecommendation[] = [];

		for (const subject of allSubjects) {
			for (const topic of subject.topics) {
				if (topic.status === 'not-started') {
					const prereqs = topic.prerequisites || getTopicPrerequisites(topic.id);
					const prereqsMet = prereqs.every((prereqId) => {
						const prereqTopic = subject.topics.find((t) => t.id === prereqId);
						return prereqTopic?.status === 'mastered';
					});

					if (prereqsMet) {
						let reason = 'Ready to start';
						let priority = 50;

						if (prereqs.length > 0) {
							reason = 'Prerequisites mastered';
							priority = 80;
						}

						const weakTopics = allSubjects
							.flatMap((s) => s.topics)
							.filter((t) => t.status === 'in-progress' && t.progress < 60);

						if (weakTopics.length > 0) {
							priority = 30;
							reason = 'Focus on weak topics first';
						}

						recommendations.push({
							subjectId: subject.id,
							subjectName: subject.name,
							topicId: topic.id,
							topicName: topic.name,
							reason,
							priority,
						});
					}
				}
			}
		}

		recommendations.sort((a, b) => b.priority - a.priority);
		return recommendations.slice(0, 5);
	}, []);

	const recommendations = useMemo(
		() => getStudyRecommendations(allData),
		[allData, getStudyRecommendations]
	);

	const filteredSubjects = useMemo(() => {
		return allData
			.map((subject) => ({
				...subject,
				topics: subject.topics.filter((topic) => {
					const matchesSearch =
						subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						topic.name.toLowerCase().includes(searchQuery.toLowerCase());

					let matchesFilter = statusFilter === 'all' || topic.status === statusFilter;

					if (statusFilter === 'needs-attention') {
						matchesFilter = topic.status === 'in-progress' && topic.progress < 60;
					}

					return matchesSearch && matchesFilter;
				}),
			}))
			.filter((subject) => subject.topics.length > 0);
	}, [allData, searchQuery, statusFilter]);

	const filteredStats = useMemo(() => {
		const allTopics = filteredSubjects.flatMap((s) => s.topics);
		const total = allTopics.length;
		const mastered = allTopics.filter((t) => t.status === 'mastered').length;
		const inProgress = allTopics.filter((t) => t.status === 'in-progress').length;
		const needsAttention = allTopics.filter(
			(t) => t.status === 'in-progress' && t.progress < 60
		).length;
		const questions = allTopics.reduce((acc, t) => acc + t.questionsAttempted, 0);
		return { total, mastered, inProgress, needsAttention, questions };
	}, [filteredSubjects]);

	const toggleSubject = (id: string) => {
		setExpandedSubjects((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const expandAll = () => setExpandedSubjects(new Set(filteredSubjects.map((s) => s.id)));
	const collapseAll = () => setExpandedSubjects(new Set());

	const handleAddTopic = (subjectId: string) => {
		if (!newTopicName.trim()) return;

		const newTopic: Topic = {
			id: `${subjectId}-custom-${Date.now()}`,
			name: newTopicName.trim(),
			status: 'not-started',
			progress: 0,
			questionsAttempted: 0,
			isCustom: true,
			difficulty: 'medium',
			timeToMaster: 8,
		};

		setCustomTopics((prev) => ({
			...prev,
			[subjectId]: [...(prev[subjectId] || []), newTopic],
		}));

		setNewTopicName('');
		setShowAddTopic(null);
	};

	const hasActiveFilters = searchQuery || statusFilter !== 'all';

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full shrink-0"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
				</Button>
				<h1 className="text-lg sm:text-xl font-black tracking-tight truncate px-2">
					Curriculum Map
				</h1>
				<div className="flex gap-1 shrink-0">
					<Button variant="ghost" size="sm" onClick={expandAll} className="text-xs font-bold">
						Expand
					</Button>
					<Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs font-bold">
						Collapse
					</Button>
				</div>
			</header>

			<div className="px-4 sm:px-6 pb-2 max-w-4xl mx-auto w-full">
				<div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-warning/10 rounded-2xl p-3 mb-3">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
						<HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-orange-500" />
						<span className="text-sm font-black">{userStreak}</span>
						<span className="text-[10px] text-muted-foreground">day streak</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
						<HugeiconsIcon icon={FlashIcon} className="w-4 h-4 text-warning" />
						<span className="text-sm font-black">{userXP.toLocaleString()}</span>
						<span className="text-[10px] text-muted-foreground">XP</span>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
						<HugeiconsIcon icon={ChampionIcon} className="w-4 h-4 text-primary" />
						<span className="text-sm font-black">Level {userLevel}</span>
					</div>
				</div>

				{showRecommendations && recommendations.length > 0 && (
					<div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-4 mb-3">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={BulbIcon} className="w-5 h-5 text-warning" />
								<span className="font-bold text-sm">AI Recommendations</span>
							</div>
							<button
								type="button"
								onClick={() => setShowRecommendations(false)}
								className="text-muted-foreground hover:text-foreground"
							>
								<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
							</button>
						</div>
						<div className="space-y-2">
							{recommendations.slice(0, 3).map((rec) => {
								const subject = allData.find((s) => s.id === rec.subjectId);
								const topic = subject?.topics.find((t) => t.id === rec.topicId);
								return (
									<button
										key={rec.topicId}
										type="button"
										onClick={() => {
											setExpandedSubjects(new Set([rec.subjectId]));
											setSelectedTopic({ topic: topic!, subject: subject! });
										}}
										className="w-full flex items-center gap-3 p-3 bg-white rounded-xl text-left hover:shadow-md transition-shadow"
									>
										<span className="text-xl">{subject?.icon}</span>
										<div className="flex-1 min-w-0">
											<p className="font-bold text-sm truncate">{topic?.name}</p>
											<p className="text-[10px] text-muted-foreground">{rec.reason}</p>
										</div>
										<HugeiconsIcon icon={TrendingUpIcon} className="w-4 h-4 text-success" />
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4 pb-40 max-w-4xl mx-auto w-full">
					<div className="mb-2">
						<h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
							CAPS Grade 12
						</h2>
						<p className="text-xs text-muted-foreground/70">Track your NSC syllabus progress</p>
					</div>

					<div className="space-y-3 mb-6">
						<div className="relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Search subjects or topics..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
								</button>
							)}
						</div>

						<div className="flex gap-2 flex-wrap">
							<button
								type="button"
								onClick={() => setStatusFilter('all')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
									statusFilter === 'all'
										? 'bg-primary text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-primary/50'
								)}
							>
								All ({allData.reduce((acc, s) => acc + s.topics.length, 0)})
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('mastered')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'mastered'
										? 'bg-success text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-success/50'
								)}
							>
								<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
								Mastered (
								{allData.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
									0
								)}
								)
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('in-progress')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'in-progress'
										? 'bg-warning text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-warning/50'
								)}
							>
								<div className="w-2 h-2 rounded-full bg-current" />
								In Progress (
								{allData.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
									0
								)}
								)
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('needs-attention')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'needs-attention'
										? 'bg-destructive text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-destructive/50'
								)}
							>
								<HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3" />
								Needs Attention (
								{allData.reduce(
									(acc, s) =>
										acc +
										s.topics.filter((t) => t.status === 'in-progress' && t.progress < 60).length,
									0
								)}
								)
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('not-started')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'not-started'
										? 'bg-muted-foreground text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-muted-foreground/50'
								)}
							>
								<HugeiconsIcon icon={BookOpen01Icon} className="w-3 h-3" />
								Not Started (
								{allData.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'not-started').length,
									0
								)}
								)
							</button>
						</div>

						{hasActiveFilters && (
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									Showing {filteredStats.total} topics
									{searchQuery && ` for "${searchQuery}"`}
									{statusFilter !== 'all' && ` (${statusFilter})`}
								</span>
								<button
									type="button"
									onClick={() => {
										setSearchQuery('');
										setStatusFilter('all');
									}}
									className="text-primary hover:underline font-medium"
								>
									Clear filters
								</button>
							</div>
						)}
					</div>

					<ProgressStats subjects={hasActiveFilters ? filteredSubjects : CURRICULUM_DATA} />

					{filteredSubjects.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-4xl mb-3">🔍</div>
							<h3 className="font-bold text-lg mb-1">No topics found</h3>
							<p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredSubjects.map((subject, idx) => (
								<SubjectSection
									key={subject.id}
									subject={subject}
									index={idx}
									expanded={expandedSubjects.has(subject.id)}
									onToggle={() => toggleSubject(subject.id)}
									onTopicClick={(topic) => setSelectedTopic({ topic, subject })}
									showAddTopic={showAddTopic === subject.id}
									onAddTopicClick={() => setShowAddTopic(subject.id)}
									onCancelAddTopic={() => {
										setShowAddTopic(null);
										setNewTopicName('');
									}}
									newTopicName={newTopicName}
									onNewTopicNameChange={setNewTopicName}
									onConfirmAddTopic={() => handleAddTopic(subject.id)}
								/>
							))}
						</div>
					)}
				</main>
			</ScrollArea>

			<AnimatePresence>
				{selectedTopic && (
					<TopicDetailsModal
						topic={selectedTopic.topic}
						subject={selectedTopic.subject}
						onClose={() => setSelectedTopic(null)}
						onStartQuiz={() => {
							router.push(`/quiz?topic=${selectedTopic.topic.id}`);
							setSelectedTopic(null);
						}}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
