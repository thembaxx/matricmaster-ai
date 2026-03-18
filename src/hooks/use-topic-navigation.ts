'use client';

import { useCallback, useState } from 'react';
import type { Subject, Topic } from '@/data/curriculum';

export interface TopicSelection {
	topic: Topic;
	subject: Subject;
}

export interface UseTopicNavigationReturn {
	expandedSubjects: Set<string>;
	selectedTopic: TopicSelection | null;
	showAddTopic: string | null;
	toggleSubject: (id: string) => void;
	expandAll: (subjectIds: string[]) => void;
	collapseAll: () => void;
	setSelectedTopic: (selection: TopicSelection | null) => void;
	setShowAddTopic: (subjectId: string | null) => void;
	isExpanded: (id: string) => boolean;
}

export function useTopicNavigation(initialExpanded?: string[]): UseTopicNavigationReturn {
	const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
		new Set(initialExpanded || [])
	);
	const [selectedTopic, setSelectedTopic] = useState<TopicSelection | null>(null);
	const [showAddTopic, setShowAddTopic] = useState<string | null>(null);

	const toggleSubject = useCallback((id: string) => {
		setExpandedSubjects((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const expandAll = useCallback((subjectIds: string[]) => {
		setExpandedSubjects(new Set(subjectIds));
	}, []);

	const collapseAll = useCallback(() => {
		setExpandedSubjects(new Set());
	}, []);

	const isExpanded = useCallback((id: string) => expandedSubjects.has(id), [expandedSubjects]);

	return {
		expandedSubjects,
		selectedTopic,
		showAddTopic,
		toggleSubject,
		expandAll,
		collapseAll,
		setSelectedTopic,
		setShowAddTopic,
		isExpanded,
	};
}

export function createTopicSelection(topic: Topic, subject: Subject): TopicSelection {
	return { topic, subject };
}
