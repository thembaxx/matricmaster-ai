'use client';

import { Flag, Shield01Icon, ViewIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AutoModerationTab } from '@/components/Admin/AutoModerationTab';
import { FlaggedContentList } from '@/components/Admin/FlaggedContentList';
import { ModerationOverview } from '@/components/Admin/ModerationOverview';
import { ModerationStatsCards } from '@/components/Admin/ModerationStatsCards';
import type { ContentFlag, ModerationPattern } from '@/components/Admin/moderation-types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SessionUser } from '@/lib/auth';
import { useSession } from '@/lib/auth-client';

export default function ModerationDashboard() {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState('flags');
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [patterns] = useState<ModerationPattern[]>([]);
	const queryClient = useQueryClient();

	const {
		data: flagsData,
		isLoading,
		isError,
		refetch,
	} = useQuery<ContentFlag[] | null>({
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

	if (isError) {
		return (
			<EmptyState
				icon={AlertCircle}
				title="Failed to load moderation data"
				description="There was an error loading the flagged content. Please try again."
				action={{
					label: 'Retry',
					onClick: () => void refetch(),
				}}
			/>
		);
	}

	if (flags.length === 0) {
		return (
			<EmptyState
				icon={ShieldCheck}
				title="No flagged content"
				description="All clear! There are no flagged items to review at the moment."
			/>
		);
	}

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

			<ModerationStatsCards flags={flags} patterns={patterns} />

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="flags">
						<HugeiconsIcon icon={Flag} className="h-4 w-4 mr-2" />
						Flagged Content
					</TabsTrigger>
					<TabsTrigger value="patterns">
						<HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 mr-2" />
						Auto-Moderation
					</TabsTrigger>
					<TabsTrigger value="stats">
						<HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
						Overview
					</TabsTrigger>
				</TabsList>

				<TabsContent value="flags" className="space-y-4">
					<FlaggedContentList
						filteredFlags={filteredFlags}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						handleAction={handleAction}
					/>
				</TabsContent>

				<TabsContent value="patterns" className="space-y-4">
					<AutoModerationTab patterns={patterns} />
				</TabsContent>

				<TabsContent value="stats">
					<ModerationOverview flagReasons={flagReasons} contentTypes={contentTypes} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
