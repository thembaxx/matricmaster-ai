'use client';

import {
	ActivityIcon,
	AnalyticsUpIcon,
	BookOpen01Icon,
	Loading03Icon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	UserGroupIcon,
	Warning,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AuthSession } from '@/lib/auth';
import {
	getAdminStatsAction,
	getSubjectPerformanceAction,
	getUsersAction,
	toggleUserBlockAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';

// Recent activity mock
const mockRecentActivity = [
	{ id: 1, user: 'John D.', action: 'Completed Math Quiz', score: 85, time: '5 min ago' },
	{
		id: 2,
		user: 'Sarah M.',
		action: 'Unlocked Achievement',
		achievement: 'First Perfect Score',
		time: '12 min ago',
	},
	{ id: 3, user: 'Mike T.', action: 'Started Physics Study Session', time: '18 min ago' },
];

// Mock flagged content
const mockFlaggedContent = [
	{
		id: 1,
		type: 'question',
		content: 'Question #234 - Incorrect answer key',
		severity: 'high',
		reportedBy: 'User123',
		date: '2026-02-17',
	},
];

interface SubjectPerformance {
	subjectId: number;
	subjectName: string;
	questionsAttempted: number;
	averageScore: number;
}

export default function AdminDashboardClient({
	initialSession: _initialSession,
}: {
	initialSession: AuthSession | null;
}) {
	const [activeTab, setActiveTab] = useState('overview');
	const [stats, setStats] = useState({
		totalUsers: 0,
		activeUsers: 0,
		questionsAttempted: 0,
		averageScore: 0,
		questionsCount: 0,
		subjectsCount: 0,
	});
	const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [userFilter, _setUserFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');
	const [, startTransition] = useTransition();

	useEffect(() => {
		const loadStats = async () => {
			try {
				const [statsData, performanceData] = await Promise.all([
					getAdminStatsAction(),
					getSubjectPerformanceAction(),
				]);
				setStats(statsData);
				setSubjectPerformance(performanceData);
			} catch (error) {
				console.debug('Failed to load admin stats:', error);
			} finally {
				setIsLoadingStats(false);
			}
		};
		loadStats();
	}, []);

	const loadUsers = useCallback(async () => {
		setIsLoadingUsers(true);
		try {
			const usersList = await getUsersAction({ search: searchQuery, filter: userFilter });
			setUsers(usersList);
		} catch (error) {
			console.debug('Failed to load users:', error);
			toast.error('Failed to load users');
		} finally {
			setIsLoadingUsers(false);
		}
	}, [searchQuery, userFilter]);

	useEffect(() => {
		if (activeTab === 'users') {
			loadUsers();
		}
	}, [activeTab, loadUsers]);

	const handleSearch = () => {
		loadUsers();
	};

	const handleToggleBlock = (userId: string) => {
		startTransition(async () => {
			const result = await toggleUserBlockAction(userId);
			if (result.success) {
				toast.success(result.isBlocked ? 'User blocked' : 'User unblocked');
				loadUsers();
			}
		});
	};

	return (
		<div className="min-h-screen bg-background py-4 px-6 md:p-8 pb-32">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<HugeiconsIcon icon={Shield01Icon} className="h-8 w-8 text-primary" />
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground">Platform management and analytics</p>
					</div>
					<Button variant="outline" size="sm">
						<HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
						Settings
					</Button>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<HugeiconsIcon
										icon={Loading03Icon}
										className="h-6 w-6 animate-spin text-primary"
									/>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
										<HugeiconsIcon icon={UserGroupIcon} className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
										<p className="text-sm text-muted-foreground">Total Users</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<HugeiconsIcon
										icon={Loading03Icon}
										className="h-6 w-6 animate-spin text-green-500"
									/>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
										<HugeiconsIcon icon={ActivityIcon} className="h-6 w-6 text-green-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
										<p className="text-sm text-muted-foreground">Active</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<HugeiconsIcon
										icon={Loading03Icon}
										className="h-6 w-6 animate-spin text-blue-500"
									/>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
										<HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6 text-blue-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{stats.questionsAttempted.toLocaleString()}
										</p>
										<p className="text-sm text-muted-foreground">Attempts</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<HugeiconsIcon
										icon={Loading03Icon}
										className="h-6 w-6 animate-spin text-amber-500"
									/>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
										<HugeiconsIcon icon={AnalyticsUpIcon} className="h-6 w-6 text-amber-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stats.averageScore}%</p>
										<p className="text-sm text-muted-foreground">Avg Score</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Tabs
					defaultValue="overview"
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-4"
				>
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<HugeiconsIcon icon={ActivityIcon} className="h-5 w-5" />
										Recent Activity
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-75">
										<div className="space-y-4">
											{mockRecentActivity.map((activity) => (
												<div key={activity.id} className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarFallback className="text-xs">
															{activity.user.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<p className="text-sm font-medium">{activity.user}</p>
														<p className="text-xs text-muted-foreground">{activity.action}</p>
													</div>
													<span className="text-xs text-muted-foreground">{activity.time}</span>
												</div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<HugeiconsIcon icon={Warning} className="h-5 w-5 text-amber-500" />
										Flagged Content
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-80">
										<div className="space-y-3">
											{mockFlaggedContent.map((item) => (
												<div key={item.id} className="p-3 border rounded-lg">
													<p className="text-sm">{item.content}</p>
													<p className="text-xs text-muted-foreground mt-1">
														Reported by {item.reportedBy}
													</p>
												</div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="users" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>User Management</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-2 flex-col sm:flex-row">
									<div className="relative flex-1">
										<HugeiconsIcon
											icon={Search01Icon}
											className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
										/>
										<Input
											placeholder="Search users..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
											className="pl-10"
										/>
									</div>
									<Button onClick={handleSearch} disabled={isLoadingUsers}>
										Search
									</Button>
								</div>

								{isLoadingUsers ? (
									<div className="flex items-center justify-center py-8">
										<HugeiconsIcon
											icon={Loading03Icon}
											className="h-8 w-8 animate-spin text-muted-foreground"
										/>
									</div>
								) : (
									<div className="border rounded-lg overflow-hidden">
										<table className="w-full">
											<thead className="bg-muted/50">
												<tr>
													<th className="text-left p-3 text-sm font-medium">User</th>
													<th className="text-left p-3 text-sm font-medium">Email</th>
													<th className="text-right p-3 text-sm font-medium">Actions</th>
												</tr>
											</thead>
											<tbody>
												{users.map((user) => (
													<tr key={user.id} className="border-t hover:bg-muted/30">
														<td className="p-3">
															<div className="flex items-center gap-2">
																<Avatar className="h-8 w-8">
																	<AvatarFallback className="text-xs">
																		{user.name?.charAt(0) || 'U'}
																	</AvatarFallback>
																</Avatar>
																<span className="font-medium">{user.name}</span>
															</div>
														</td>
														<td className="p-3 text-sm text-muted-foreground">{user.email}</td>
														<td className="p-3 text-right">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleToggleBlock(user.id)}
															>
																{user.isBlocked ? 'Unblock' : 'Block'}
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="analytics" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Subject Performance</CardTitle>
							</CardHeader>
							<CardContent>
								{isLoadingStats ? (
									<div className="flex items-center justify-center py-12">
										<HugeiconsIcon
											icon={Loading03Icon}
											className="h-8 w-8 animate-spin text-primary"
										/>
									</div>
								) : subjectPerformance.length > 0 ? (
									<div className="space-y-4">
										{subjectPerformance.map((subject) => (
											<div key={subject.subjectId} className="flex items-center gap-4">
												<div className="w-32 font-medium">{subject.subjectName}</div>
												<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
													<div
														className="h-full bg-primary rounded-full"
														style={{ width: `${subject.averageScore}%` }}
													/>
												</div>
												<div className="w-20 text-right text-sm">
													{subject.questionsAttempted.toLocaleString()} attempts
												</div>
												<div className="w-12 text-right font-medium">{subject.averageScore}%</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<p>No performance data available yet.</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
