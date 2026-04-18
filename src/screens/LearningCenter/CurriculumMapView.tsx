'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AIRecommendations } from '@/components/Curriculum/AIRecommendations';
import { CurriculumHeader } from '@/components/Curriculum/CurriculumHeader';
import { TopicDetailsModal } from '@/components/Curriculum/TopicDetailsModal';
import { TopicFilters } from '@/components/Curriculum/TopicFilters';
import { TopicTree } from '@/components/Curriculum/TopicTree';
import { Button } from '@/components/ui/button';
import type { Topic } from '@/content';
import { CURRICULUM_DATA } from '@/content/curriculum';
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
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

export default function CurriculumMapView() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<any>('all');
	const [newTopicName, setNewTopicName] = useState('');
	const [userXP] = useState(2450);
	const [userStreak] = useState(12);
	const [userLevel] = useState(8);
	const [showRecommendations, setShowRecommendations] = useState(true);

	const debouncedSearch = useDebouncedCallback((value: string) => {
		setSearchQuery(value);
	}, 300);

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

	const [customTopics, setCustomTopics] = useState<Record<string, Topic[]>>(() =>
		loadCustomTopics()
	);

	useMemo(() => {
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
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-black tracking-tight">curriculum map</h2>
				<div className="flex gap-1">
					<Button variant="ghost" size="sm" onClick={handleExpandAll} className="text-xs font-bold">
						expand
					</Button>
					<Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs font-bold">
						collapse
					</Button>
				</div>
			</div>

			<div className="space-y-4">
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

				<TopicFilters
					searchQuery={searchQuery}
					onSearchChange={debouncedSearch}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					filteredStats={hasActiveFilters ? filteredStats : undefined}
				/>

				{filteredSubjects.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-3">🔍</div>
						<h3 className="font-bold text-lg mb-1">no topics found</h3>
						<p className="text-sm text-muted-foreground">try adjusting your search or filters</p>
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
			</div>

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
