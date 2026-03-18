'use client';

import {
	Cancel01Icon,
	Chat01Icon,
	CodeIcon,
	File01Icon,
	Flag,
	Search01Icon,
	Settings02Icon,
	Shield01Icon,
	Tick01Icon,
	ViewIcon,
	Warning,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SessionUser } from '@/lib/auth';
import { useSession } from '@/lib/auth-client';

interface ContentFlag {
	id: string;
	reporterId: string;
	reporterName: string;
	contentType: string;
	contentId: string;
	contentPreview: string;
	flagReason: string;
	flagDetails?: string;
	status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
	createdAt: string;
	reviewedAt?: string;
	reviewedBy?: string;
}

interface ModerationPattern {
	id: string;
	pattern: string;
	patternType: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	action: 'flag' | 'block' | 'approve';
	isActive: boolean;
}

export default function ModerationDashboard() {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState('flags');
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [patterns] = useState<ModerationPattern[]>([]);
	const queryClient = useQueryClient();

	const { data: flagsData, isLoading } = useQuery<ContentFlag[] | null>({
		queryKey: ['moderation-flags', statusFilter],
		queryFn: async () => {
			if (!session?.user?.id) return null;

			const url = new URL('/api/moderation/flags', window.location.origin);
			if (statusFilter !== 'all') {
				url.searchParams.set('status', statusFilter);
			}

			const response = await fetch(url.toString());
			const result = await response.json();

			if (result.success && result.data) {
				return result.data as ContentFlag[];
			}
			return null;
		},
		enabled: !!session?.user?.id,
	});

	const flags: ContentFlag[] = flagsData ?? [];

	// Session check - in production, add proper admin authorization
	if (!session) {
		return (
			<div className="container mx-auto py-8 text-center">
				<p className="text-muted-foreground">Please sign in to access moderation.</p>
			</div>
		);
	}

	// Admin role check
	const isAdmin = (session?.user as SessionUser | undefined)?.role === 'admin';
	if (!isAdmin) {
		return (
			<div className="container mx-auto py-8 text-center">
				<p className="text-muted-foreground">You don't have permission to access this page.</p>
			</div>
		);
	}

	// Calculate stats from real data
	const flagReasons = flags.reduce(
		(acc: { name: string; count: number }[], flag: { flagReason: string }) => {
			const existing = acc.find((r) => r.name === flag.flagReason);
			if (existing) {
				existing.count++;
			} else {
				acc.push({ name: flag.flagReason, count: 1 });
			}
			return acc;
		},
		[]
	);

	const contentTypes = flags.reduce(
		(acc: { type: string; count: number }[], flag: { contentType: string }) => {
			const existing = acc.find((r) => r.type === flag.contentType);
			if (existing) {
				existing.count++;
			} else {
				acc.push({ type: flag.contentType, count: 1 });
			}
			return acc;
		},
		[]
	);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
			</div>
		);
	}

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'bg-red-600 text-white';
			case 'high':
				return 'bg-red-100 text-red-800';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800';
			case 'low':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-muted text-muted-foreground';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'reviewed':
				return 'bg-blue-100 text-blue-800';
			case 'actioned':
				return 'bg-green-100 text-green-800';
			case 'dismissed':
				return 'bg-muted text-muted-foreground';
			default:
				return 'bg-muted text-muted-foreground';
		}
	};

	const handleAction = async (flagId: string, action: 'remove' | 'dismiss') => {
		try {
			const url = new URL(`/api/moderation/flags/${flagId}/action`, window.location.origin);

			const response = await fetch(url.toString(), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
			});

			const result = await response.json();

			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ['moderation-flags'] });

				if (action === 'dismiss') {
					toast.success(`Flag ${flagId} dismissed`);
				} else if (action === 'remove') {
					toast.success(`Content ${flagId} removed`);
				}
			} else {
				toast.error(result.error || 'Failed to process flag');
			}
		} catch (error) {
			console.debug('Error processing flag:', error);
			toast.error('Failed to process flag');
		}
	};

	const filteredFlags = flags.filter((flag) => {
		const matchesSearch =
			flag.contentPreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
			flag.flagReason.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="container mx-auto py-8 max-w-6xl">
			<div className="flex items-center gap-3 mb-6">
				<HugeiconsIcon icon={Shield01Icon} className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-3xl font-bold">Content Moderation</h1>
					<p className="text-muted-foreground">Review flagged content and manage auto-moderation</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-yellow-100 rounded-lg">
								<HugeiconsIcon icon={Warning} className="h-6 w-6 text-yellow-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{flags.filter((f) => f.status === 'pending').length}
								</p>
								<p className="text-sm text-muted-foreground">Pending Reviews</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<HugeiconsIcon icon={ViewIcon} className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{flags.filter((f) => f.status === 'reviewed').length}
								</p>
								<p className="text-sm text-muted-foreground">Under Review</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<HugeiconsIcon icon={Tick01Icon} className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{flags.filter((f) => f.status === 'actioned').length}
								</p>
								<p className="text-sm text-muted-foreground">Action Taken</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<HugeiconsIcon icon={Settings02Icon} className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">{patterns.filter((p) => p.isActive).length}</p>
								<p className="text-sm text-muted-foreground">Active Filters</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="flags">
						<HugeiconsIcon icon={Flag} className="h-4 w-4 mr-2" />
						Flagged Content
					</TabsTrigger>
					<TabsTrigger value="patterns">
						<HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />
						Auto-Moderation
					</TabsTrigger>
					<TabsTrigger value="stats">
						<HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
						Overview
					</TabsTrigger>
				</TabsList>

				{/* Flagged Content Tab */}
				<TabsContent value="flags" className="space-y-4">
					{/* Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex gap-4">
								<div className="flex-1 relative">
									<HugeiconsIcon
										icon={Search01Icon}
										className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
									/>
									<Input
										placeholder="MagnifyingGlass flagged content..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>
								<select
									title="Status filter"
									className="px-3 py-2 border rounded-md"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="reviewed">Reviewed</option>
									<option value="actioned">Actioned</option>
									<option value="dismissed">Dismissed</option>
								</select>
							</div>
						</CardContent>
					</Card>

					{/* Flagged Items */}
					<div className="space-y-4">
						{filteredFlags.map((flag) => (
							<Card key={flag.id}>
								<CardContent className="pt-6">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-4">
											<div className="p-2 bg-muted rounded-lg">
												{flag.contentType === 'comment' ? (
													<HugeiconsIcon icon={Chat01Icon} className="h-5 w-5" />
												) : (
													<HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
												)}
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<Badge variant="outline">{flag.contentType}</Badge>
													<Badge className={getStatusColor(flag.status)}>{flag.status}</Badge>
													<Badge
														className={getSeverityColor(
															flag.flagReason === 'Spam' ? 'medium' : 'high'
														)}
													>
														{flag.flagReason}
													</Badge>
												</div>
												<p className="text-sm mb-2">"{flag.contentPreview}"</p>
												<p className="text-xs text-muted-foreground">
													Reported by {flag.reporterName} •{' '}
													{new Date(flag.createdAt).toLocaleString()}
												</p>
												{flag.flagDetails && (
													<p className="text-xs text-muted-foreground mt-1">
														Details: {flag.flagDetails}
													</p>
												)}
											</div>
										</div>
										{flag.status === 'pending' && (
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleAction(flag.id, 'remove')}
												>
													<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-1" />
													Remove
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleAction(flag.id, 'dismiss')}
												>
													<HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 mr-1" />
													Dismiss
												</Button>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{filteredFlags.length === 0 && (
						<Card>
							<CardContent className="py-12 text-center">
								<HugeiconsIcon
									icon={Shield01Icon}
									className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
								/>
								<p className="text-muted-foreground">No flagged content to review</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Auto-Moderation Tab */}
				<TabsContent value="patterns" className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-semibold">Moderation Patterns</h2>
						<Button>
							<HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />
							Add Pattern
						</Button>
					</div>

					<div className="space-y-4">
						{patterns.map((pattern) => (
							<Card key={pattern.id}>
								<CardContent className="pt-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="p-2 bg-muted rounded-lg">
												<HugeiconsIcon icon={CodeIcon} className="h-5 w-5" />
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<code className="text-sm bg-muted px-2 py-1 rounded">
														{pattern.pattern}
													</code>
													<Badge variant="outline">{pattern.patternType}</Badge>
													<Badge className={getSeverityColor(pattern.severity)}>
														{pattern.severity}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">Action: {pattern.action}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={pattern.isActive ? 'default' : 'secondary'}>
												{pattern.isActive ? 'Active' : 'Inactive'}
											</Badge>
											<Button size="sm" variant="outline">
												Pencil
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				{/* Overview Tab */}
				<TabsContent value="stats">
					<Card>
						<CardHeader>
							<CardTitle>Moderation Overview</CardTitle>
							<CardDescription>Summary of content moderation activities</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<h3 className="font-medium mb-4">Flag Reasons</h3>
									<div className="space-y-2">
										{flagReasons.map((reason) => (
											<div key={reason.name} className="flex items-center justify-between">
												<span className="text-sm">{reason.name}</span>
												<div className="flex items-center gap-2">
													<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className="h-full bg-primary"
															style={{ width: `${Math.min(reason.count * 5 + 10, 100)}%` }}
														/>
													</div>
													<span className="text-xs text-muted-foreground w-8 text-right">
														{reason.count}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
								<div>
									<h3 className="font-medium mb-4">Content Types Flagged</h3>
									<div className="space-y-2">
										{contentTypes.map((item) => (
											<div key={item.type} className="flex items-center justify-between">
												<span className="text-sm flex items-center gap-2">
													<HugeiconsIcon icon={Chat01Icon} className="h-4 w-4" />
													{item.type}
												</span>
												<div className="flex items-center gap-2">
													<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className="h-full bg-primary"
															style={{ width: `${Math.min(item.count * 5 + 10, 100)}%` }}
														/>
													</div>
													<span className="text-xs text-muted-foreground w-8 text-right">
														{item.count}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
