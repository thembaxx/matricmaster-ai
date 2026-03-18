'use client';

import { useMemo } from 'react';
import type { User } from '@/lib/db/better-auth-schema';
import type { PastPaper, Question, Subject } from '@/lib/db/schema';

export interface QuestionFilters {
	searchQuery: string;
	selectedSubject: string;
	selectedDifficulty: string;
}

export interface UserFilters {
	searchQuery: string;
	filter: 'all' | 'active' | 'blocked' | 'deleted';
}

export function useQuestionFilters(
	questions: Question[],
	_subjects: Subject[],
	filters: QuestionFilters
) {
	return useMemo(() => {
		const query = filters.searchQuery.toLowerCase();
		const subjectIdFilter =
			filters.selectedSubject !== 'all' ? Number.parseInt(filters.selectedSubject, 10) : null;

		return questions.filter((q) => {
			const matchesSearch =
				q.questionText.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
			const matchesSubject = subjectIdFilter === null || q.subjectId === subjectIdFilter;
			const matchesDifficulty =
				filters.selectedDifficulty === 'all' || q.difficulty === filters.selectedDifficulty;
			return matchesSearch && matchesSubject && matchesDifficulty;
		});
	}, [questions, filters.searchQuery, filters.selectedSubject, filters.selectedDifficulty]);
}

export function useUserFilters(users: User[], filters: UserFilters) {
	return useMemo(() => {
		const query = filters.searchQuery.toLowerCase();

		return users.filter((u) => {
			const matchesSearch =
				u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);

			if (filters.filter === 'active') return matchesSearch && !u.isBlocked && !u.deletedAt;
			if (filters.filter === 'blocked') return matchesSearch && u.isBlocked;
			if (filters.filter === 'deleted') return matchesSearch && !!u.deletedAt;

			return matchesSearch;
		});
	}, [users, filters.searchQuery, filters.filter]);
}

export function useSubjectMap(subjects: Subject[]) {
	return useMemo(() => {
		return new Map(subjects.map((s) => [s.id, s.name]));
	}, [subjects]);
}

export function usePastPaperFilters(pastPapers: PastPaper[], searchQuery: string) {
	return useMemo(() => {
		const query = searchQuery.toLowerCase();

		return pastPapers.filter((p) => {
			return (
				p.paperId.toLowerCase().includes(query) ||
				p.subject.toLowerCase().includes(query) ||
				p.year.toString().includes(query)
			);
		});
	}, [pastPapers, searchQuery]);
}
