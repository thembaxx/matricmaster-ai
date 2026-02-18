'use client';

import {
	Activity,
	AlertTriangle,
	BarChart3,
	BookOpen,
	Search,
	Settings,
	Shield,
	TrendingUp,
	Users,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';

// Mock data for admin dashboard
const mockStats = {
	totalUsers: 1247,
	activeUsers: 342,
	questionsAttempted: 45623,
	averageScore: 68,
};

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

const mockTopSubjects = [
	{ name: 'Mathematics', attempts: 12453, avgScore: 65 },
	{ name: 'Physics', attempts: 8234, avgScore: 62 },
	{ name: 'Chemistry', attempts: 6123, avgScore: 70 },
	{ name: 'Life Sciences', attempts: 4892, avgScore: 68 },
];

export default function AdminDashboardPage() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState('');

	// In production, check for admin role
	const isAdmin = session?.user?.email?.includes('admin');

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
							<a href="/sign-in">Sign In</a>
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
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Shield className="h-8 w-8 text-primary" />
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground">Platform management and analytics</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<Settings className="h-4 w-4 mr-2" />
							Settings
						</Button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
									<p className="text-sm text-muted-foreground">Total Users</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
									<Activity className="h-6 w-6 text-green-500" />
								</div>
								<div>
									<p className="text-2xl font-bold">{mockStats.activeUsers}</p>
									<p className="text-sm text-muted-foreground">Active Today</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
									<BookOpen className="h-6 w-6 text-blue-500" />
								</div>
								<div>
									<p className="text-2xl font-bold">
										{mockStats.questionsAttempted.toLocaleString()}
									</p>
									<p className="text-sm text-muted-foreground">Questions Attempted</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
									<TrendingUp className="h-6 w-6 text-amber-500" />
								</div>
								<div>
									<p className="text-2xl font-bold">{mockStats.averageScore}%</p>
									<p className="text-sm text-muted-foreground">Average Score</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Activity className="h-5 w-5" />
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

							{/* Flagged Content */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<AlertTriangle className="h-5 w-5 text-amber-500" />
										Flagged Content
									</CardTitle>
									<CardDescription>Items requiring moderation</CardDescription>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-75">
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
								<CardDescription>Search and manage users</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex gap-2 mb-4">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											type="text"
											placeholder="Search users..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border rounded-lg"
										/>
									</div>
									<Button>Search</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									User management features coming soon...
								</p>
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
									<BarChart3 className="h-5 w-5" />
									Subject Performance
								</CardTitle>
								<CardDescription>Average scores by subject</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockTopSubjects.map((subject) => (
										<div key={subject.name} className="flex items-center gap-4">
											<div className="w-32 font-medium">{subject.name}</div>
											<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-primary rounded-full"
													style={{ width: `${subject.avgScore}%` }}
												/>
											</div>
											<div className="w-16 text-right text-sm">
												{subject.attempts.toLocaleString()} attempts
											</div>
											<div className="w-12 text-right font-medium">{subject.avgScore}%</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
