'use client';

import { AlertCircle, CheckCircle, Cloud, CloudOff, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';

interface SyncStatusBannerProps {
	className?: string;
}

/**
 * SyncStatusBanner
 *
 * Shows:
 * - Online/offline status
 * - Pending sync items count
 * - Conflict alert with resolution prompt
 * - Manual sync trigger
 */
export function SyncStatusBanner({ className }: SyncStatusBannerProps) {
	const { isOnline, pendingCount, conflictCount, conflicts } = useSyncStatus();
	const [showConflictDialog, setShowConflictDialog] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);

	const handleManualSync = async () => {
		setIsSyncing(true);
		// TODO: Trigger sync process
		// await triggerSync();
		setTimeout(() => setIsSyncing(false), 2000);
	};

	// No banner needed if everything is synced
	if (!isOnline && pendingCount === 0 && conflictCount === 0) {
		return null;
	}

	return (
		<>
			<div className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', className)}>
				{/* Offline Banner */}
				{!isOnline && (
					<div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2">
						<CloudOff className="w-4 h-4" />
						<span className="text-sm font-medium">You're offline</span>
						<span className="text-xs">Changes will sync when you're back online</span>
					</div>
				)}

				{/* Back Online Banner */}
				{isOnline && pendingCount > 0 && (
					<div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-2">
						<Cloud className="w-4 h-4" />
						<span className="text-sm font-medium">
							{pendingCount} item{pendingCount > 1 ? 's' : ''} waiting to sync
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleManualSync}
							disabled={isSyncing}
							className="h-6 px-2 text-xs bg-white/20 hover:bg-white/30"
						>
							{isSyncing ? (
								<>
									<RefreshCw className="w-3 h-3 mr-1 animate-spin" />
									Syncing...
								</>
							) : (
								<>
									<RefreshCw className="w-3 h-3 mr-1" />
									Sync Now
								</>
							)}
						</Button>
					</div>
				)}

				{/* Conflict Alert Banner */}
				{isOnline && conflictCount > 0 && (
					<div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2">
						<AlertCircle className="w-4 h-4" />
						<span className="text-sm font-medium">
							{conflictCount} sync conflict{conflictCount > 1 ? 's' : ''} detected
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowConflictDialog(true)}
							className="h-6 px-2 text-xs bg-white/20 hover:bg-white/30"
						>
							<Shield className="w-3 h-3 mr-1" />
							Resolve
						</Button>
					</div>
				)}

				{/* Synced Confirmation */}
				{isOnline && pendingCount === 0 && conflictCount === 0 && (
					<div className="bg-green-500 text-white px-4 py-2 flex items-center justify-center gap-2">
						<CheckCircle className="w-4 h-4" />
						<span className="text-sm font-medium">All changes synced</span>
					</div>
				)}
			</div>

			{/* Conflict Resolution Dialog */}
			<ConflictResolutionDialog
				open={showConflictDialog}
				onOpenChange={setShowConflictDialog}
				conflicts={conflicts}
			/>
		</>
	);
}

/**
 * SyncStatusIndicator
 *
 * Compact indicator for use in headers/nav bars
 */
export function SyncStatusIndicator({ className }: { className?: string }) {
	const { isOnline, pendingCount, conflictCount } = useSyncStatus();

	return (
		<div
			className={cn('flex items-center gap-1', className)}
			title={`Sync status: ${isOnline ? 'Online' : 'Offline'}`}
		>
			{isOnline ? (
				<Cloud className="w-4 h-4 text-green-500" />
			) : (
				<CloudOff className="w-4 h-4 text-amber-500" />
			)}

			{pendingCount > 0 && <span className="text-xs text-muted-foreground">{pendingCount}</span>}

			{conflictCount > 0 && <span className="text-xs text-red-500 font-bold">{conflictCount}</span>}
		</div>
	);
}
