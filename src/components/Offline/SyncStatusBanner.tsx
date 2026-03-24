'use client';

import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	CloudOff,
	Loader2,
	RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';

interface SyncStatusBannerProps {
	onResolveConflicts?: () => void;
	className?: string;
}

export function SyncStatusBanner({ onResolveConflicts, className }: SyncStatusBannerProps) {
	const { status, lastSyncTime, pendingCount, conflictCount, errorMessage, triggerSync } =
		useSyncStatus();

	if (status === 'idle' && pendingCount === 0) {
		return null;
	}

	const formatLastSync = (date: Date | null) => {
		if (!date) return 'Never';
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return date.toLocaleDateString();
	};

	const statusConfig = {
		idle: {
			icon: CloudOff,
			color: 'text-muted-foreground',
			bg: 'bg-muted/50',
			message: pendingCount > 0 ? `${pendingCount} changes pending` : 'Waiting to sync',
		},
		syncing: {
			icon: Loader2,
			color: 'text-blue-500',
			bg: 'bg-blue-500/10',
			message: 'Syncing...',
		},
		synced: {
			icon: CheckCircle2,
			color: 'text-green-500',
			bg: 'bg-green-500/10',
			message: 'All changes synced',
		},
		conflicts: {
			icon: AlertTriangle,
			color: 'text-amber-500',
			bg: 'bg-amber-500/10',
			message: `${conflictCount} conflict${conflictCount > 1 ? 's' : ''} need${conflictCount === 1 ? 's' : ''} resolution`,
		},
		error: {
			icon: AlertCircle,
			color: 'text-red-500',
			bg: 'bg-red-500/10',
			message: errorMessage || 'Sync error',
		},
	};

	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<div
			className={cn(
				'flex items-center justify-between px-4 py-2 rounded-lg border',
				config.bg,
				className
			)}
			role="status"
			aria-live="polite"
		>
			<div className="flex items-center gap-2">
				<Icon className={cn('w-4 h-4', config.color, status === 'syncing' && 'animate-spin')} />
				<span className={cn('text-sm font-medium', config.color)}>{config.message}</span>
				{lastSyncTime && status !== 'syncing' && (
					<span className="text-xs text-muted-foreground">
						Last sync: {formatLastSync(lastSyncTime)}
					</span>
				)}
			</div>

			<div className="flex items-center gap-2">
				{status === 'conflicts' && onResolveConflicts && (
					<Button variant="outline" size="sm" onClick={onResolveConflicts} className="h-7 text-xs">
						Resolve
					</Button>
				)}

				{status !== 'syncing' && (
					<Button variant="ghost" size="sm" onClick={() => triggerSync()} className="h-7 text-xs">
						<RefreshCw className="w-3 h-3 mr-1" />
						Sync
					</Button>
				)}
			</div>
		</div>
	);
}
