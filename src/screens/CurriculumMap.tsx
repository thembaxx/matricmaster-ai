'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AIRecommendations } from '@/components/Curriculum/AIRecommendations';
import { CurriculumHeader } from '@/components/Curriculum/CurriculumHeader';
import { TopicDetailsModal } from '@/components/Curriculum/TopicDetailsModal';
import { type FilterType, TopicFilters } from '@/components/Curriculum/TopicFilters';
import { TopicTree } from '@/components/Curriculum/TopicTree';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CURRICULUM_DATA, type Topic } from '@/data/curriculum';
import {
	calculateFilteredStats,
	createCustomTopic,
	filterSubjects,
	loadCustomTopics,
	saveCustomTopics,
	useCurriculumData,
	useStudyRecommendations,
} from '@/hooks/use-curriculum-progress';
import { useTopicNavigation } from '@/hooks/use-topic-navigation';

export default function CurriculumMap() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<FilterType>('all');
	const [customTopics, setCustomTopics] = useState<Record<string, Topic[]>>({});
	const [newTopicName, setNewTopicName] = useState('');
	const [userXP] = useState(2450);
	const [userStreak] = useState(12);
	const [userLevel] = useState(8);
	const [showRecommendations, setShowRecommendations] = useState(true);

	const {
		expandedSubjects,
		selectedTopic,
		showAddTopic,
		toggleSubject,
		expandAll,
		collapseAll,
		setSelectedTopic,
		setShowAddTopic,
	} = useTopicNavigation(CURRICULUM_DATA.slice(0, 2).map((s) => s.id));

	useEffect(() => {
		const loaded = loadCustomTopics();
		setCustomTopics(loaded);
	}, []);

	useEffect(() => {
		saveCustomTopics(customTopics);
	}, [customTopics]);

	const allData = useCurriculumData(customTopics);
	const recommendations = useStudyRecommendations(allData);

	const filteredSubjects = useMemo(
		() => filterSubjects(allData, searchQuery, statusFilter),
		[allData, searchQuery, statusFilter]
	);

	const filteredStats = useMemo(() => calculateFilteredStats(filteredSubjects), [filteredSubjects]);

	const handleAddTopic = useCallback(
		(subjectId: string) => {
			if (!newTopicName.trim()) return;
			const newTopic = createCustomTopic(subjectId, newTopicName);
			setCustomTopics((prev) => ({
				...prev,
				[subjectId]: [...(prev[subjectId] || []), newTopic],
			}));
			setNewTopicName('');
			setShowAddTopic(null);
		},
		[newTopicName, setShowAddTopic]
	);

	const handleExpandAll = useCallback(() => {
		expandAll(filteredSubjects.map((s) => s.id));
	}, [expandAll, filteredSubjects]);

	const handleAIRecommendationSelect = useCallback(
		(subjectId: string, topicId: string) => {
			const subject = allData.find((s) => s.id === subjectId);
			const topic = subject?.topics.find((t) => t.id === topicId);
			if (subject && topic) {
				expandAll([subjectId]);
				setSelectedTopic({ topic, subject });
			}
		},
		[allData, expandAll, setSelectedTopic]
	);

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
					<Button variant="ghost" size="sm" onClick={handleExpandAll} className="text-xs font-bold">
						Expand
					</Button>
					<Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs font-bold">
						Collapse
					</Button>
				</div>
			</header>

			<div className="px-4 sm:px-6 pb-2 max-w-4xl mx-auto w-full">
				<CurriculumHeader
					subjects={hasActiveFilters ? filteredSubjects : CURRICULUM_DATA}
					userXP={userXP}
					userStreak={userStreak}
					userLevel={userLevel}
				/>

				{showRecommendations && recommendations.length > 0 && (
					<AIRecommendations
						recommendations={recommendations}
						subjects={allData}
						onDismiss={() => setShowRecommendations(false)}
						onSelect={handleAIRecommendationSelect}
					/>
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

					<TopicFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
						filteredStats={hasActiveFilters ? filteredStats : undefined}
					/>

					{filteredSubjects.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-4xl mb-3">🔍</div>
							<h3 className="font-bold text-lg mb-1">No topics found</h3>
							<p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredSubjects.map((subject, idx) => (
								<TopicTree
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
