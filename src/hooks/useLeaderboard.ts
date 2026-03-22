import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { getLeaderboard, getSubjectLeaderboard, getUserRank } from '@/lib/db/leaderboard-actions';
import { getUserStreak } from '@/lib/db/progress-actions';

export const SUBJECTS = [
	{ id: 'mathematics', label: 'mathematics', subjectId: 2 },
	{ id: 'physics', label: 'physical sciences', subjectId: 1 },
	{ id: 'life-sciences', label: 'life sciences', subjectId: 3 },
	{ id: 'english', label: 'english', subjectId: 4 },
] as const;

export function useLeaderboard() {
	const [activeTab, setActiveTab] = useState('weekly');
	const [subjectTab, setSubjectTab] = useState<string>('mathematics');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const { data: userStreak } = useQuery({
		queryKey: ['userStreak'],
		queryFn: () => getUserStreak(),
	});

	const { data: leaderboardResult, isLoading } = useQuery({
		queryKey: ['leaderboard', activeTab],
		queryFn: async () => {
			const [data, rank] = await Promise.all([
				getLeaderboard(activeTab as 'weekly' | 'monthly' | 'all_time', 50),
				getUserRank(activeTab as 'weekly' | 'monthly' | 'all_time'),
			]);
			return { data, rank };
		},
	});

	const leaderboardData = leaderboardResult?.data ?? [];
	const userRank = leaderboardResult?.rank ?? null;

	const { data: subjectData } = useQuery({
		queryKey: ['subject-leaderboard', subjectTab],
		queryFn: () => {
			const sub = SUBJECTS.find((s) => s.id === subjectTab);
			return sub ? getSubjectLeaderboard(sub.subjectId, 10) : Promise.resolve([]);
		},
		enabled: activeTab === 'subjects' || true, // Keep enabled to allow switching
	});

	const topThree = useMemo(() => leaderboardData.filter((e) => e.rank <= 3), [leaderboardData]);
	const others = useMemo(() => leaderboardData.filter((e) => e.rank > 3), [leaderboardData]);
	const paginatedOthers = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return others.slice(start, start + itemsPerPage);
	}, [others, currentPage]);
	const totalPages = Math.ceil(others.length / itemsPerPage);

	return {
		activeTab,
		setActiveTab,
		subjectTab,
		setSubjectTab,
		currentPage,
		setCurrentPage,
		userStreak,
		leaderboardData,
		userRank,
		subjectData,
		topThree,
		others,
		paginatedOthers,
		totalPages,
		isLoading,
	};
}
