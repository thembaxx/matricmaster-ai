'use client';

import { useEffect, useMemo } from 'react';
import type { PastPaper } from '@/lib/db/schema';
import { useAdaptiveDifficultyStore } from '@/stores/useAdaptiveDifficultyStore';
import {
	type PastPaperRecommendation,
	usePastPaperRecommendationsStore,
	type WeakArea,
} from '@/stores/usePastPaperRecommendations';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

const NSC_TOPIC_SUBJECTS: Array<{ topic: string; subjects: string[] }> = [
	{ topic: 'Functions and Graphs', subjects: ['Mathematics'] },
	{ topic: 'Calculus', subjects: ['Mathematics'] },
	{ topic: 'Algebra', subjects: ['Mathematics'] },
	{ topic: 'Number Patterns', subjects: ['Mathematics'] },
	{ topic: 'Finance, Growth and Decay', subjects: ['Mathematics'] },
	{ topic: 'Probability', subjects: ['Mathematics'] },
	{ topic: 'Statistics', subjects: ['Mathematics'] },
	{ topic: 'Geometry', subjects: ['Mathematics'] },
	{ topic: 'Trigonometry', subjects: ['Mathematics'] },
	{ topic: 'Measurement', subjects: ['Mathematics'] },
	{ topic: 'Vectors and Matrices', subjects: ['Mathematics'] },
	{ topic: 'Newton Laws', subjects: ['Physical Sciences'] },
	{ topic: 'Chemical Reactions', subjects: ['Physical Sciences'] },
	{ topic: 'Atomic Structure', subjects: ['Physical Sciences'] },
	{ topic: 'Optics', subjects: ['Physical Sciences'] },
	{ topic: 'Electrostatics', subjects: ['Physical Sciences'] },
	{ topic: 'Electrodynamics', subjects: ['Physical Sciences'] },
	{ topic: 'Matter and Materials', subjects: ['Physical Sciences'] },
	{ topic: 'Ecology', subjects: ['Life Sciences'] },
	{ topic: 'Cell Biology', subjects: ['Life Sciences'] },
	{ topic: 'Genetics', subjects: ['Life Sciences'] },
	{ topic: 'Evolution', subjects: ['Life Sciences'] },
	{ topic: 'Human Impact', subjects: ['Life Sciences'] },
	{ topic: 'Plate Tectonics', subjects: ['Geography'] },
	{ topic: 'Geomorphology', subjects: ['Geography'] },
	{ topic: 'Climate and Weather', subjects: ['Geography'] },
	{ topic: 'Population', subjects: ['Geography'] },
	{ topic: 'Settlement Geography', subjects: ['Geography'] },
	{ topic: 'Economic Geography', subjects: ['Geography'] },
	{ topic: 'Financial Accounting', subjects: ['Accounting'] },
	{ topic: 'Managerial Accounting', subjects: ['Accounting'] },
	{ topic: 'Cash Flow', subjects: ['Accounting'] },
	{ topic: 'Financial Statements', subjects: ['Accounting'] },
	{ topic: 'Microeconomics', subjects: ['Economics'] },
	{ topic: 'Macroeconomics', subjects: ['Economics'] },
	{ topic: 'Economic Growth', subjects: ['Economics'] },
	{ topic: 'Labour Markets', subjects: ['Economics'] },
	{ topic: 'Business Venturing', subjects: ['Business Studies'] },
	{ topic: 'Business Roles', subjects: ['Business Studies'] },
	{ topic: 'Business Operations', subjects: ['Business Studies'] },
	{ topic: 'Corporate Governance', subjects: ['Business Studies'] },
	{ topic: 'Literary Analysis - English HL', subjects: ['English Home Language'] },
	{ topic: 'Poetry - English HL', subjects: ['English Home Language'] },
	{ topic: 'Novel - English HL', subjects: ['English Home Language'] },
	{ topic: 'Drama - English HL', subjects: ['English Home Language'] },
	{ topic: 'Visual Literacy', subjects: ['English Home Language'] },
	{ topic: 'Language Structures - English FAL', subjects: ['English First Additional Language'] },
	{ topic: 'Comprehension - English FAL', subjects: ['English First Additional Language'] },
	{ topic: 'Essay Writing - English FAL', subjects: ['English First Additional Language'] },
	{ topic: 'Literary Analysis - Afrikaans HL', subjects: ['Afrikaans Home Language'] },
	{ topic: 'Poetry - Afrikaans HL', subjects: ['Afrikaans Home Language'] },
	{ topic: 'Novel - Afrikaans HL', subjects: ['Afrikaans Home Language'] },
	{ topic: 'Drama - Afrikaans HL', subjects: ['Afrikaans Home Language'] },
	{
		topic: 'Language Structures - Afrikaans FAL',
		subjects: ['Afrikaans First Additional Language'],
	},
	{ topic: 'Comprehension - Afrikaans FAL', subjects: ['Afrikaans First Additional Language'] },
	{ topic: 'South African History', subjects: ['History'] },
	{ topic: 'World History', subjects: ['History'] },
	{ topic: 'Political History', subjects: ['History'] },
	{ topic: 'Economic History', subjects: ['History'] },
	{ topic: 'Structural Systems', subjects: ['Civil Technology'] },
	{ topic: 'Construction Materials', subjects: ['Civil Technology'] },
	{ topic: 'Building Services', subjects: ['Civil Technology'] },
	{ topic: 'Circuit Theory', subjects: ['Electrical Technology'] },
	{ topic: 'Power Systems', subjects: ['Electrical Technology'] },
	{ topic: 'Electronic Systems', subjects: ['Electrical Technology'] },
	{ topic: 'Mechanics - Mechanical', subjects: ['Mechanical Technology'] },
	{ topic: 'Materials - Mechanical', subjects: ['Mechanical Technology'] },
	{ topic: 'Machine Systems', subjects: ['Mechanical Technology'] },
	{ topic: 'Technical Drawing', subjects: ['Engineering Graphics and Design'] },
	{ topic: 'Design Principles', subjects: ['Engineering Graphics and Design'] },
	{ topic: 'CAD Applications', subjects: ['Engineering Graphics and Design'] },
];

const NSC_TOPIC_TO_SUBJECT_MAP: Record<string, string[]> = {};
NSC_TOPIC_SUBJECTS.forEach(({ topic, subjects }) => {
	NSC_TOPIC_TO_SUBJECT_MAP[topic] = subjects;
});

export function useQuizPastPaperIntegration(availablePapers: PastPaper[] = []) {
	const lastMistakes = useQuizResultStore((s) => s.getLastMistakes());
	const currentDifficulty = useAdaptiveDifficultyStore((s) => s.currentDifficulty);

	const {
		weakAreas,
		recommendations,
		refreshAfterQuiz,
		setRecommendations,
		toggleShowOnlyRecommended,
		showOnlyRecommended,
		getWeakAreasForSubject,
	} = usePastPaperRecommendationsStore();

	const topicToSubjects = useMemo(() => {
		const map: Record<string, string[]> = {};
		Object.entries(NSC_TOPIC_TO_SUBJECT_MAP).forEach(([topic, subjects]) => {
			subjects.forEach((subject) => {
				if (!map[subject]) {
					map[subject] = [];
				}
				if (!map[subject].includes(topic)) {
					map[subject].push(topic);
				}
			});
		});
		return map;
	}, []);

	const generateRecommendations = useMemo(() => {
		const weakAreasMap = new Map<string, WeakArea>();
		weakAreas.forEach((area) => {
			const key = `${area.subject}:${area.topic}`;
			weakAreasMap.set(key, area);
		});

		const recs: PastPaperRecommendation[] = [];

		availablePapers.forEach((paper) => {
			const paperSubjects = topicToSubjects[paper.subject] || [];
			const matchingWeakAreas: WeakArea[] = [];
			const coveredTopics: string[] = [];

			paperSubjects.forEach((topic) => {
				const key = `${paper.subject}:${topic}`;
				const weakArea = weakAreasMap.get(key);
				if (weakArea) {
					matchingWeakAreas.push(weakArea);
					coveredTopics.push(topic);
				}
			});

			if (matchingWeakAreas.length > 0) {
				const avgPriority =
					matchingWeakAreas.reduce((sum, w) => sum + w.priorityScore, 0) / matchingWeakAreas.length;

				const topicCoverage = coveredTopics.join(', ');

				recs.push({
					paperId: paper.id,
					subject: paper.subject,
					year: paper.year,
					month: paper.month,
					paper: paper.paper,
					coveredTopics,
					matchingWeakAreas,
					priorityScore: avgPriority,
					reason: `Covers: ${topicCoverage}`,
				});
			}
		});

		recs.sort((a, b) => b.priorityScore - a.priorityScore);
		return recs.slice(0, 10);
	}, [availablePapers, weakAreas, topicToSubjects]);

	useEffect(() => {
		if (generateRecommendations.length > 0) {
			setRecommendations(generateRecommendations);
		}
	}, [generateRecommendations, setRecommendations]);

	const refreshRecommendations = () => {
		const mistakes = lastMistakes.map((m) => ({
			topic: m.topic,
			subject: m.subject,
		}));
		refreshAfterQuiz(mistakes, currentDifficulty);
	};

	const getRecommendationsForPaper = (paperId: string) => {
		return recommendations.find((r) => r.paperId === paperId);
	};

	const isRecommended = (paperId: string) => {
		return recommendations.some((r) => r.paperId === paperId);
	};

	const getRecommendationsForSubject = (subject: string) => {
		return recommendations.filter((r) => r.subject === subject);
	};

	return {
		weakAreas,
		recommendations,
		showOnlyRecommended,
		toggleShowOnlyRecommended,
		refreshRecommendations,
		getRecommendationsForPaper,
		isRecommended,
		getRecommendationsForSubject,
		getWeakAreasForSubject,
		topicToSubjects,
	};
}
