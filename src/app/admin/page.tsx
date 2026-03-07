'use client';

import {
	ActivityIcon,
	ArrowCounterClockwise,
	BookOpen,
	ChartBar,
	CircleNotch,
	DotsThree,
	Gear,
	MagnifyingGlass,
	Shield,
	Trash,
	TrendUp,
	Users,
	Warning,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SessionUser } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import {
	deleteUserAction,
	getAdminStatsAction,
	getSubjectPerformanceAction,
	getUsersAction,
	restoreUserAction,
	toggleUserBlockAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';

// Recent activity mock (for now - would need activity log table)
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
	{ id: 4, user: 'Emily R.', action: 'Completed Chemistry Quiz', score: 72, time: '25 min ago' },
	{ id: 5, user: 'David K.', action: 'Started Study Plan', time: '32 min ago' },
];

// Mock flagged content (for now - would need getContentFlagsAction)
const mockFlaggedContent = [
	{
		id: 1,
		type: 'question',
		content: 'Question #234 - Incorrect answer key',
		severity: 'high',
		reportedBy: 'User123',
		date: '2026-02-17',
	},
	{
		id: 2,
		type: 'comment',
		content: 'Inappropriate comment on Physics Q12',
		severity: 'medium',
		reportedBy: 'User456',
		date: '2026-02-16',
	},
	{
		id: 3,
		type: 'question',
		content: 'Question #567 - Formatting issue',
		severity: 'low',
		reportedBy: 'User789',
		date: '2026-02-15',
	},
];

export default function AdminDashboardPage() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState('overview');

	// Stats state
	const [stats, setStats] = useState({
		totalUsers: 0,
		activeUsers: 0,
		questionsAttempted: 0,
		averageScore: 0,
		questionsCount: 0,
		subjectsCount: 0,
	});
	const [subjectPerformance, setSubjectPerformance] = useState<
		{ subjectId: number; subjectName: string; questionsAttempted: number; averageScore: number }[]
	>([]);
	const [isLoadingStats, setIsLoadingStats] = useState(true);

	// User management state
	const [users, setUsers] = useState<User[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');
	const [, startTransition] = useTransition();

	const isAdmin = (session?.user as SessionUser | undefined)?.role === 'admin';

	// Load stats on mount
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
				console.error('Failed to load admin stats:', error);
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
			console.error('Failed to load users:', error);
			toast.error('Failed to load users');
		} finally {
			setIsLoadingUsers(false);
		}
	}, [searchQuery, userFilter]);

	// Load users when tab changes to users
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
			} else {
				toast.error('Failed to update user status');
			}
		});
	};

	const handleDeleteUser = (userId: string) => {
		startTransition(async () => {
			const result = await deleteUserAction(userId);
			if (result.success) {
				toast.success('User deleted');
				loadUsers();
			} else {
				toast.error('Failed to delete user');
			}
		});
	};

	const handleRestoreUser = (userId: string) => {
		startTransition(async () => {
			const result = await restoreUserAction(userId);
			if (result.success) {
				toast.success('User restored');
				loadUsers();
			} else {
				toast.error('Failed to restore user');
			}
		});
	};

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Admin Dashboard</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">Please sign in to access the admin dashboard.</p>
						<Button asChild className="mt-4">
							<Link href="/sign-in">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-destructive" />
							Access Denied
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">You don't have permission to access this page.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background py-4 px-6 md:p-8 pb-32">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Shield className="h-8 w-8 text-primary" />
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground">Platform management and analytics</p>
					</div>
					<Button variant="outline" size="sm">
						<Gear className="h-4 w-4 mr-2" />
						Gear
					</Button>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<CircleNotch className="h-6 w-6 animate-spin text-primary" />
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
										<Users className="h-6 w-6 text-primary" />
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
									<CircleNotch className="h-6 w-6 animate-spin text-green-500" />
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
										<ActivityIcon className="h-6 w-6 text-green-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
										<p className="text-sm text-muted-foreground">Active (7 days)</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<CircleNotch className="h-6 w-6 animate-spin text-blue-500" />
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
										<BookOpen className="h-6 w-6 text-blue-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{stats.questionsAttempted.toLocaleString()}
										</p>
										<p className="text-sm text-muted-foreground">Questions Attempted</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							{isLoadingStats ? (
								<div className="flex items-center justify-center h-20">
									<CircleNotch className="h-6 w-6 animate-spin text-amber-500" />
								</div>
							) : (
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
										<TrendUp className="h-6 w-6 text-amber-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stats.averageScore}%</p>
										<p className="text-sm text-muted-foreground">Average Score</p>
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
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ActivityIcon className="h-5 w-5" />
										Recent ActivityIcon
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
													{activity.score != null && (
														<Badge variant="outline">{activity.score}%</Badge>
													)}
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
										<Warning className="h-5 w-5 text-amber-500" />
										Flagged Content
									</CardTitle>
									<CardDescription>Items requiring moderation</CardDescription>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-80">
										<div className="space-y-3">
											{mockFlaggedContent.map((item) => (
												<div key={item.id} className="p-3 border rounded-lg">
													<div className="flex items-center justify-between mb-2">
														<Badge variant={item.severity === 'high' ? 'destructive' : 'outline'}>
															{item.severity}
														</Badge>
														<span className="text-xs text-muted-foreground">{item.date}</span>
													</div>
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
								<CardDescription>MagnifyingGlass and manage users</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-2 flex-col sm:flex-row">
									<div className="relative flex-1">
										<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="MagnifyingGlass users by name or email..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
											className="pl-10"
										/>
									</div>
									<Select
										value={userFilter}
										onValueChange={(value) => setUserFilter(value as typeof userFilter)}
									>
										<SelectTrigger className="w-45">
											<SelectValue placeholder="Faders users" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Users</SelectItem>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="blocked">Blocked</SelectItem>
											<SelectItem value="deleted">Deleted</SelectItem>
										</SelectContent>
									</Select>
									<Button onClick={handleSearch} disabled={isLoadingUsers}>
										{isLoadingUsers ? (
											<CircleNotch className="h-4 w-4 animate-spin" />
										) : (
											'MagnifyingGlass'
										)}
									</Button>
								</div>

								{isLoadingUsers ? (
									<div className="flex items-center justify-center py-8">
										<CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
									</div>
								) : users.length === 0 ? (
									<p className="text-center text-muted-foreground py-8">No users found</p>
								) : (
									<div className="border rounded-lg overflow-hidden">
										<table className="w-full">
											<thead className="bg-muted/50">
												<tr>
													<th className="text-left p-3 text-sm font-medium">User</th>
													<th className="text-left p-3 text-sm font-medium">Email</th>
													<th className="text-left p-3 text-sm font-medium">Status</th>
													<th className="text-left p-3 text-sm font-medium">Created</th>
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
																		{user.name?.charAt(0)?.toUpperCase() || 'U'}
																	</AvatarFallback>
																</Avatar>
																<span className="font-medium">{user.name || 'Unknown'}</span>
															</div>
														</td>
														<td className="p-3 text-sm text-muted-foreground">{user.email}</td>
														<td className="p-3">
															{user.deletedAt ? (
																<Badge variant="destructive">Deleted</Badge>
															) : user.isBlocked ? (
																<Badge variant="secondary">Blocked</Badge>
															) : (
																<Badge variant="outline">Active</Badge>
															)}
														</td>
														<td className="p-3 text-sm text-muted-foreground">
															{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
														</td>
														<td className="p-3 text-right">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="sm">
																		<DotsThree className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	{user.deletedAt ? (
																		<DropdownMenuItem onClick={() => handleRestoreUser(user.id)}>
																			<ArrowCounterClockwise className="mr-2 h-4 w-4" />
																			Restore
																		</DropdownMenuItem>
																	) : (
																		<>
																			<DropdownMenuItem onClick={() => handleToggleBlock(user.id)}>
																				{user.isBlocked ? 'Unblock' : 'Block'}
																			</DropdownMenuItem>
																			<DropdownMenuItem
																				onClick={() => handleDeleteUser(user.id)}
																				className="text-destructive"
																			>
																				<Trash className="mr-2 h-4 w-4" />
																				Backspace
																			</DropdownMenuItem>
																		</>
																	)}
																</DropdownMenuContent>
															</DropdownMenu>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
								{users.length > 0 && (
									<p className="text-sm text-muted-foreground mt-2">
										Showing {users.length} user{users.length !== 1 ? 's' : ''}
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="content" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Content Management</CardTitle>
								<CardDescription>
									Manage questions, past papers, and study materials
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Content management features coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="analytics" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ChartBar className="h-5 w-5" />
									Subject Performance
								</CardTitle>
								<CardDescription>Questions attempted and average scores by subject</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingStats ? (
									<div className="flex items-center justify-center py-12">
										<CircleNotch className="h-8 w-8 animate-spin text-primary" />
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
										<p className="text-sm">Students need to complete quizzes for data to appear.</p>
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
