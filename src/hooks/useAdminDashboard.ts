import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
	getAdminStatsAction,
	getSubjectPerformanceAction,
	getUsersAction,
	toggleUserBlockAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';

export interface SubjectPerformance {
	subjectId: number;
	subjectName: string;
	questionsAttempted: number;
	averageScore: number;
}

export interface AdminStats {
	totalUsers: number;
	activeUsers: number;
	questionsAttempted: number;
	averageScore: number;
	questionsCount: number;
	subjectsCount: number;
}

export function useAdminDashboard() {
	const [activeTab, setActiveTab] = useState('overview');
	const [users, setUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [userFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');
	const [isPending, startTransition] = useTransition();

	const { data: statsData, isLoading: isLoadingStats } = useQuery({
		queryKey: ['admin-stats'],
		queryFn: async () => {
			const [statsData, performanceData] = await Promise.all([
				getAdminStatsAction(),
				getSubjectPerformanceAction(),
			]);
			return { stats: statsData, performance: performanceData };
		},
	});

	const stats: AdminStats = statsData?.stats ?? {
		totalUsers: 0,
		activeUsers: 0,
		questionsAttempted: 0,
		averageScore: 0,
		questionsCount: 0,
		subjectsCount: 0,
	};

	const subjectPerformance: SubjectPerformance[] = statsData?.performance ?? [];

	const { data: usersData, isLoading: isLoadingUsers } = useQuery({
		queryKey: ['admin-users', searchQuery, userFilter],
		queryFn: () => getUsersAction({ search: searchQuery, filter: userFilter }),
		enabled: activeTab === 'users',
	});

	useEffect(() => {
		if (usersData) {
			setUsers(usersData);
		}
	}, [usersData]);

	const handleSearch = useCallback(() => {
		// useQuery handles the search since searchQuery is in queryKey
	}, []);

	const handleToggleBlock = useCallback((userId: string) => {
		startTransition(async () => {
			const result = await toggleUserBlockAction(userId);
			if (result.success) {
				toast.success(result.isBlocked ? 'User blocked' : 'User unblocked');
				// Query will refetch if we invalidate it, but for now we rely on the action's success
				// Better approach: invalidate queries
			}
		});
	}, []);

	return {
		activeTab,
		setActiveTab,
		users,
		searchQuery,
		setSearchQuery,
		isLoadingStats,
		isLoadingUsers,
		stats,
		subjectPerformance,
		handleSearch,
		handleToggleBlock,
		isPending,
	};
}
