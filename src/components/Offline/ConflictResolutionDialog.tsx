'use client';

import { AlertTriangle, Check, ChevronDown, ChevronRight, Clock, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import type { ConflictResolutionStrategy, SyncConflict } from '@/lib/offline/types';
import { cn } from '@/lib/utils';
import { resolveConflict } from '@/services/offlineQuizSync';

interface ConflictResolutionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	conflicts?: SyncConflict[];
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
	quiz_result: 'Quiz Result',
	progress: 'Progress',
	achievement: 'Achievement',
	quiz_session: 'Quiz Session',
};

const STRATEGY_DESCRIPTIONS: Record<ConflictResolutionStrategy, string> = {
	local: 'Use your offline changes',
	remote: 'Use server data',
	newest: 'Use most recent changes',
	merged: 'Intelligently merge both versions',
};

export function ConflictResolutionDialog({
	open,
	onOpenChange,
	conflicts: propConflicts,
}: ConflictResolutionDialogProps) {
	const { conflicts: contextConflicts, resolveConflicts } = useSyncStatus();
	const conflicts = propConflicts || contextConflicts;

	const [selectedStrategies, setSelectedStrategies] = useState<
		Record<string, ConflictResolutionStrategy>
	>({});

	const [defaultStrategy, setDefaultStrategy] = useState<ConflictResolutionStrategy>('newest');
	const [isResolving, setIsResolving] = useState(false);
	const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
	const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

	const getStrategy = (conflictId: string) => {
		return selectedStrategies[conflictId] || defaultStrategy;
	};

	const handleStrategyChange = (conflictId: string, strategy: ConflictResolutionStrategy) => {
		setSelectedStrategies((prev) => ({ ...prev, [conflictId]: strategy }));
	};

	const handleResolveSingle = async (conflict: SyncConflict) => {
		const strategy = getStrategy(conflict.id);

		try {
			await resolveConflicts([{ conflictId: conflict.id, strategy }]);
			setResolvedIds((prev) => new Set([...prev, conflict.id]));
		} catch (error) {
			console.error('Failed to resolve conflict:', error);
		}
	};

	const handleResolveAll = async () => {
		setIsResolving(true);

		const resolutions = conflicts
			.filter((c) => !resolvedIds.has(c.id))
			.map((c) => ({
				conflictId: c.id,
				strategy: getStrategy(c.id),
			}));

		try {
			await resolveConflicts(resolutions);
			setResolvedIds(new Set(conflicts.map((c) => c.id)));
			setTimeout(() => {
				onOpenChange(false);
				setResolvedIds(new Set());
			}, 500);
		} catch (error) {
			console.error('Failed to resolve conflicts:', error);
		} finally {
			setIsResolving(false);
		}
	};

	const formatValue = (value: unknown, maxLength = 100): string => {
		if (value === null || value === undefined) return 'N/A';
		if (typeof value === 'string')
			return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
		if (typeof value === 'number' || typeof value === 'boolean') return String(value);
		if (Array.isArray(value)) return `Array(${value.length})`;
		const str = JSON.stringify(value);
		return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
	};

	const formatTimestamp = (date: Date) => {
		return new Intl.DateTimeFormat('en-ZA', {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(new Date(date));
	};

	const activeConflicts = conflicts.filter((c) => !resolvedIds.has(c.id));
	const allResolved = activeConflicts.length === 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-amber-500" />
						Resolve Sync Conflicts
					</DialogTitle>
					<DialogDescription>
						{allResolved
							? 'All conflicts have been resolved.'
							: `${activeConflicts.length} conflict${activeConflicts.length > 1 ? 's' : ''} found. Choose how to resolve each one.`}
					</DialogDescription>
				</DialogHeader>

				{!allResolved && (
					<>
						<div className="flex items-center gap-2 py-2 border-b">
							<span className="text-sm font-medium">Default strategy:</span>
							<Select
								value={defaultStrategy}
								onValueChange={(v) => setDefaultStrategy(v as ConflictResolutionStrategy)}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(STRATEGY_DESCRIPTIONS) as ConflictResolutionStrategy[]).map(
										(strategy) => (
											<SelectItem key={strategy} value={strategy}>
												{STRATEGY_DESCRIPTIONS[strategy]}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="flex-1 overflow-y-auto space-y-3 py-2">
							{activeConflicts.map((conflict) => (
								<ConflictItem
									key={conflict.id}
									conflict={conflict}
									strategy={getStrategy(conflict.id)}
									isExpanded={expandedConflict === conflict.id}
									onToggleExpand={() =>
										setExpandedConflict(expandedConflict === conflict.id ? null : conflict.id)
									}
									onStrategyChange={(s) => handleStrategyChange(conflict.id, s)}
									onResolve={() => handleResolveSingle(conflict)}
									formatValue={formatValue}
									formatTimestamp={formatTimestamp}
								/>
							))}
						</div>
					</>
				)}

				<DialogFooter className="gap-2">
					{allResolved ? (
						<Button onClick={() => onOpenChange(false)} className="gap-2">
							<Check className="w-4 h-4" />
							Done
						</Button>
					) : (
						<>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button onClick={handleResolveAll} disabled={isResolving} className="gap-2">
								{isResolving ? (
									<>
										<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Resolving...
									</>
								) : (
									<>Resolve All ({activeConflicts.length})</>
								)}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface ConflictItemProps {
	conflict: SyncConflict;
	strategy: ConflictResolutionStrategy;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onStrategyChange: (strategy: ConflictResolutionStrategy) => void;
	onResolve: () => void;
	formatValue: (value: unknown, maxLength?: number) => string;
	formatTimestamp: (date: Date) => string;
}

function ConflictItem({
	conflict,
	strategy,
	isExpanded,
	onToggleExpand,
	onStrategyChange,
	onResolve,
	formatValue,
	formatTimestamp,
}: ConflictItemProps) {
	const resolvedData = resolveConflict(conflict, strategy);

	return (
		<div className="border rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={onToggleExpand}
				className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
			>
				<div className="flex items-center gap-3">
					{isExpanded ? (
						<ChevronDown className="w-4 h-4 text-muted-foreground" />
					) : (
						<ChevronRight className="w-4 h-4 text-muted-foreground" />
					)}
					<FileText className="w-4 h-4 text-muted-foreground" />
					<div>
						<span className="font-medium text-sm">
							{ENTITY_TYPE_LABELS[conflict.entityType] || conflict.entityType}
						</span>
						<span className="text-xs text-muted-foreground ml-2">
							ID: {conflict.entityId.slice(0, 8)}...
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={strategy === 'local' ? 'default' : 'secondary'}>{strategy}</Badge>
				</div>
			</button>

			{isExpanded && (
				<div className="border-t bg-muted/30 p-3 space-y-3">
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="space-y-1">
							<div className="flex items-center gap-1 text-muted-foreground">
								<Clock className="w-3 h-3" />
								<span className="text-xs">Local ({formatTimestamp(conflict.timestamp.local)})</span>
							</div>
							<div className="p-2 bg-background rounded border text-xs font-mono break-all">
								{formatValue(conflict.localData, 200)}
							</div>
						</div>
						<div className="space-y-1">
							<div className="flex items-center gap-1 text-muted-foreground">
								<Clock className="w-3 h-3" />
								<span className="text-xs">
									Remote ({formatTimestamp(conflict.timestamp.remote)})
								</span>
							</div>
							<div className="p-2 bg-background rounded border text-xs font-mono break-all">
								{formatValue(conflict.remoteData, 200)}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between pt-2 border-t">
						<Select
							value={strategy}
							onValueChange={(v) => onStrategyChange(v as ConflictResolutionStrategy)}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="local">Use Local</SelectItem>
								<SelectItem value="remote">Use Remote</SelectItem>
								<SelectItem value="newest">Use Newest</SelectItem>
								<SelectItem value="merged">Merge</SelectItem>
							</SelectContent>
						</Select>

						<Button size="sm" onClick={onResolve}>
							Resolve
						</Button>
					</div>

					<div className="text-xs text-muted-foreground p-2 bg-muted rounded">
						<strong>Resolved value:</strong> {formatValue(resolvedData.resolvedData, 150)}
					</div>
				</div>
			)}
		</div>
	);
}

function Badge({
	children,
	variant = 'default',
}: {
	children: React.ReactNode;
	variant?: 'default' | 'secondary';
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
				variant === 'default' && 'bg-primary text-primary-foreground',
				variant === 'secondary' && 'bg-secondary text-secondary-foreground'
			)}
		>
			{children}
		</span>
	);
}
