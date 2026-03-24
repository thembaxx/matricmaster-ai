'use client';

export type EntityType = 'quiz_result' | 'progress' | 'achievement' | 'quiz_session';

export type ConflictResolutionStrategy = 'local' | 'remote' | 'newest' | 'merged';

export interface SyncConflict {
	id: string;
	entityType: EntityType;
	entityId: string;
	localData: unknown;
	remoteData: unknown;
	timestamp: {
		local: Date;
		remote: Date;
	};
	resolved: boolean;
	resolution?: ConflictResolutionStrategy;
	createdAt: Date;
}

export interface ConflictResolution {
	conflictId: string;
	strategy: ConflictResolutionStrategy;
}

export interface SyncResult {
	success: boolean;
	synced: number;
	conflicts: SyncConflict[];
	errors: string[];
	timestamp: Date;
}

export interface SyncStatusState {
	status: 'idle' | 'syncing' | 'synced' | 'conflicts' | 'error';
	lastSyncTime: Date | null;
	pendingCount: number;
	conflictCount: number;
	errorMessage?: string;
}

export interface ResolutionPreview {
	conflictId: string;
	field: string;
	localValue: unknown;
	remoteValue: unknown;
	resolvedValue: unknown;
	resolution: ConflictResolutionStrategy;
}

export interface BulkResolutionRequest {
	resolutions: ConflictResolution[];
	defaultStrategy: ConflictResolutionStrategy;
}

export interface BulkResolutionResult {
	success: boolean;
	resolved: number;
	failed: number;
	errors: string[];
}
