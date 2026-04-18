'use client';

import { ChampionIcon, GridIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSubjectFont, SUBJECTS } from '@/content';
import { cn } from '@/lib/utils';

type TopicStatus = 'mastered' | 'in-progress' | 'needs-attention' | 'not-started';

interface TopicData {
	id: string;
	name: string;
	status: TopicStatus;
	progress: number;
}

interface SubjectData {
	id: string;
	name: string;
	topics: TopicData[];
}

const MOCK_SUBJECTS: SubjectData[] = [
	{
		id: 'mathematics',
		name: 'Mathematics',
		topics: [
			{ id: 'm1', name: 'Sequences & Series', status: 'mastered', progress: 100 },
			{ id: 'm2', name: 'Functions', status: 'mastered', progress: 95 },
			{ id: 'm3', name: 'Calculus', status: 'in-progress', progress: 65 },
			{ id: 'm4', name: 'Algebra', status: 'in-progress', progress: 45 },
			{ id: 'm5', name: 'Probability', status: 'not-started', progress: 0 },
			{ id: 'm6', name: 'Statistics', status: 'needs-attention', progress: 30 },
		],
	},
	{
		id: 'physics',
		name: 'Physics',
		topics: [
			{ id: 'p1', name: 'Mechanics', status: 'mastered', progress: 100 },
			{ id: 'p2', name: 'Waves', status: 'in-progress', progress: 70 },
			{ id: 'p3', name: 'Electricity', status: 'needs-attention', progress: 35 },
			{ id: 'p4', name: 'Optics', status: 'not-started', progress: 0 },
		],
	},
	{
		id: 'life-sciences',
		name: 'Life Sciences',
		topics: [
			{ id: 'ls1', name: 'Cells', status: 'mastered', progress: 100 },
			{ id: 'ls2', name: 'Genetics', status: 'in-progress', progress: 55 },
			{ id: 'ls3', name: 'Evolution', status: 'needs-attention', progress: 25 },
			{ id: 'ls4', name: 'Ecology', status: 'not-started', progress: 0 },
		],
	},
	{
		id: 'english',
		name: 'English',
		topics: [
			{ id: 'e1', name: 'Literature', status: 'mastered', progress: 90 },
			{ id: 'e2', name: 'Language', status: 'in-progress', progress: 60 },
			{ id: 'e3', name: 'Essay Writing', status: 'needs-attention', progress: 40 },
		],
	},
];

interface KnowledgeHeatmapProps {
	subjects?: SubjectData[];
	compact?: boolean;
}

export function KnowledgeHeatmap({
	subjects = MOCK_SUBJECTS,
	compact = false,
}: KnowledgeHeatmapProps) {
	const router = useRouter();
	const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

	const stats = useMemo(() => {
		const allTopics = subjects.flatMap((s) => s.topics);
		const mastered = allTopics.filter((t) => t.status === 'mastered').length;
		const inProgress = allTopics.filter((t) => t.status === 'in-progress').length;
		const needsAttention = allTopics.filter((t) => t.status === 'needs-attention').length;
		const notStarted = allTopics.filter((t) => t.status === 'not-started').length;
		const total = allTopics.length;
		const overallProgress = Math.round(allTopics.reduce((acc, t) => acc + t.progress, 0) / total);

		return {
			mastered,
			inProgress,
			needsAttention,
			notStarted,
			total,
			overallProgress,
			examReady: mastered + Math.floor(inProgress * 0.5),
		};
	}, [subjects]);

	const getStatusColor = (status: TopicStatus) => {
		switch (status) {
			case 'mastered':
				return 'bg-tiimo-green';
			case 'in-progress':
				return 'bg-tiimo-lavender';
			case 'needs-attention':
				return 'bg-tiimo-yellow';
			case 'not-started':
				return 'bg-muted';
			default:
				return 'bg-muted';
		}
	};

	const getStatusLabel = (status: TopicStatus) => {
		switch (status) {
			case 'mastered':
				return 'Exam Ready';
			case 'in-progress':
				return 'Learning';
			case 'needs-attention':
				return 'Needs Work';
			case 'not-started':
				return 'Not Started';
			default:
				return status;
		}
	};

	if (compact) {
		return (
			<m.div whileTap={{ scale: 0.98 }} onClick={() => router.push('/curriculum-map')}>
				<Card className="cursor-pointer hover:border-primary/30 transition-colors">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<HugeiconsIcon icon={GridIcon} className="w-4 h-4 text-primary" />
							Knowledge Heatmap
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">Overall Progress</span>
								<span className="font-bold">{stats.overallProgress}%</span>
							</div>
							<Progress value={stats.overallProgress} className="h-2" />
							<div className="flex gap-2 flex-wrap">
								<div className="flex items-center gap-1 text-[10px]">
									<div className="w-2 h-2 rounded-full bg-tiimo-green" />
									<span>{stats.mastered} Ready</span>
								</div>
								<div className="flex items-center gap-1 text-[10px]">
									<div className="w-2 h-2 rounded-full bg-tiimo-yellow" />
									<span>{stats.needsAttention} Need Work</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</m.div>
		);
	}

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={GridIcon} className="w-5 h-5 text-primary" />
						Knowledge Heatmap
					</CardTitle>
					<Button variant="ghost" size="sm" onClick={() => router.push('/curriculum-map')}>
						View Full Map
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div className="bg-tiimo-green/10 p-3 rounded-xl text-center">
						<p className="text-2xl font-black text-tiimo-green">{stats.mastered}</p>
						<p className="text-[10px]  tracking-wider text-muted-foreground">Exam Ready</p>
					</div>
					<div className="bg-tiimo-lavender/10 p-3 rounded-xl text-center">
						<p className="text-2xl font-black text-tiimo-lavender">{stats.inProgress}</p>
						<p className="text-[10px]  tracking-wider text-muted-foreground">Learning</p>
					</div>
					<div className="bg-tiimo-yellow/10 p-3 rounded-xl text-center">
						<p className="text-2xl font-black text-tiimo-yellow">{stats.needsAttention}</p>
						<p className="text-[10px]  tracking-wider text-muted-foreground">Need Work</p>
					</div>
					<div className="bg-muted/50 p-3 rounded-xl text-center">
						<p className="text-2xl font-black text-muted-foreground">{stats.notStarted}</p>
						<p className="text-[10px]  tracking-wider text-muted-foreground">Not Started</p>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span>Overall Mastery</span>
						<span className="font-bold">{stats.overallProgress}%</span>
					</div>
					<Progress value={stats.overallProgress} className="h-3" />
				</div>

				<ScrollArea className="min-h-[150px] max-h-[300px] pr-4">
					<div className="space-y-4">
						{subjects.map((subject) => {
							const subjectProgress = Math.round(
								subject.topics.reduce((acc, t) => acc + t.progress, 0) / subject.topics.length
							);
							return (
								<div key={subject.id} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="text-lg">
												{SUBJECTS[subject.id as keyof typeof SUBJECTS]?.emoji || '📚'}
											</span>
											<span
												className="font-bold text-sm"
												style={{ fontFamily: getSubjectFont(subject.id) }}
											>
												{subject.name}
											</span>
										</div>
										<span className="text-xs font-medium text-muted-foreground">
											{subjectProgress}%
										</span>
									</div>
									<div className="flex gap-1 flex-wrap">
										{subject.topics.map((topic) => (
											<m.div
												key={topic.id}
												initial={{ scale: 0.8, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												whileHover={{ scale: 1.2 }}
												whileTap={{ scale: 0.9 }}
												onHoverStart={() => setHoveredTopic(topic.id)}
												onHoverEnd={() => setHoveredTopic(null)}
												className={cn(
													'w-6 h-6 rounded-xl flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all',
													getStatusColor(topic.status),
													hoveredTopic === topic.id && 'ring-2 ring-offset-2 ring-primary'
												)}
												title={`${topic.name}: ${getStatusLabel(topic.status)} (${topic.progress}%)`}
											>
												{topic.progress === 100 ? (
													<HugeiconsIcon icon={ChampionIcon} className="w-3 h-3 text-white" />
												) : (
													topic.progress
												)}
											</m.div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>

				<div className="flex flex-wrap gap-3 pt-2 border-t">
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-3 rounded bg-tiimo-green" />
						<span>Exam Ready (80%+)</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-3 rounded bg-tiimo-lavender" />
						<span>Learning (40-79%)</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-3 rounded bg-tiimo-yellow" />
						<span>Needs Work (&lt;40%)</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-3 rounded bg-muted" />
						<span>Not Started</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
