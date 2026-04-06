'use client';

import { Calendar01Icon, CheckmarkCircle01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

interface CalendarSyncStatus {
	connected: boolean;
	provider: string | null;
	calendarId: string | null;
	lastSyncAt: string | null;
	syncEnabled: boolean;
	expiresAt: string | null;
}

async function fetchCalendarSyncStatus(): Promise<{ success: boolean; data: CalendarSyncStatus }> {
	const response = await fetch('/api/calendar/sync/status');
	return response.json();
}

async function disconnectCalendar(): Promise<{ success: boolean }> {
	const response = await fetch('/api/calendar/sync/disconnect', { method: 'POST' });
	return response.json();
}

async function updateSyncEnabled(enabled: boolean): Promise<{ success: boolean }> {
	const response = await fetch('/api/calendar/sync/status', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ syncEnabled: enabled }),
	});
	return response.json();
}

async function triggerPushSync(): Promise<{ success: boolean; data?: { pushedCount: number } }> {
	const response = await fetch('/api/calendar/sync/push', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({}),
	});
	return response.json();
}

export function ConnectCalendarButton() {
	const queryClient = useQueryClient();
	const [isSyncing, setIsSyncing] = useState(false);

	const { data: status, isLoading } = useQuery({
		queryKey: ['calendarSyncStatus'],
		queryFn: fetchCalendarSyncStatus,
		staleTime: 30_000,
	});

	const disconnectMutation = useMutation({
		mutationFn: disconnectCalendar,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calendarSyncStatus'] });
			toast.success('Calendar disconnected');
		},
		onError: () => {
			toast.error('Failed to disconnect calendar');
		},
	});

	const syncEnabledMutation = useMutation({
		mutationFn: updateSyncEnabled,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calendarSyncStatus'] });
			toast.success('Sync settings updated');
		},
		onError: () => {
			toast.error('Failed to update sync settings');
		},
	});

	const pushSyncMutation = useMutation({
		mutationFn: triggerPushSync,
		onSuccess: (data) => {
			setIsSyncing(false);
			if (data.success && data.data) {
				toast.success(`Pushed ${data.data.pushedCount} events to calendar`);
			} else {
				toast.success('Sync completed');
			}
		},
		onError: () => {
			setIsSyncing(false);
			toast.error('Failed to sync events');
		},
	});

	const handleConnect = async () => {
		try {
			const res = await fetch('/api/calendar/sync/auth-url');
			if (!res.ok) throw new Error('Failed to get auth URL');
			const data = await res.json();
			window.location.href = data.authUrl;
		} catch (_error) {
			toast.error('Failed to connect to Google Calendar');
		}
	};

	const handleDisconnect = () => {
		disconnectMutation.mutate();
	};

	const handleSyncToggle = (enabled: boolean) => {
		syncEnabledMutation.mutate(enabled);
	};

	const handleSyncNow = () => {
		setIsSyncing(true);
		pushSyncMutation.mutate();
	};

	const formatLastSync = (dateString: string | null) => {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-ZA', {
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			minute: '2-digit',
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
						Calendar sync
					</CardTitle>
					<CardDescription>Connect your calendar to sync study sessions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const syncStatus = status?.data || {
		connected: false,
		provider: null,
		calendarId: null,
		lastSyncAt: null,
		syncEnabled: false,
		expiresAt: null,
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
					Calendar sync
				</CardTitle>
				<CardDescription>Connect your calendar to sync study sessions</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{syncStatus.connected ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
								<div>
									<p className="font-medium text-green-700 dark:text-green-400">
										Connected to Google Calendar
									</p>
									<p className="text-xs text-green-600 dark:text-green-500">
										Last synced: {formatLastSync(syncStatus.lastSyncAt)}
									</p>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium">Auto-sync</p>
								<p className="text-xs text-muted-foreground">Automatically sync study sessions</p>
							</div>
							<Switch
								checked={syncStatus.syncEnabled}
								onCheckedChange={handleSyncToggle}
								disabled={syncEnabledMutation.isPending}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleSyncNow}
								disabled={isSyncing || !syncStatus.syncEnabled}
								className="gap-2"
							>
								<HugeiconsIcon
									icon={RefreshIcon}
									className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
								/>
								{isSyncing ? 'Syncing...' : 'Sync now'}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDisconnect}
								disabled={disconnectMutation.isPending}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								{disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="p-3 bg-muted rounded-lg border">
							<p className="text-sm text-muted-foreground">
								Connect your Google Calendar to automatically sync your study sessions and prevent
								scheduling conflicts.
							</p>
						</div>

						<Button onClick={handleConnect} className="gap-2">
							<HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
							Connect Google Calendar
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
