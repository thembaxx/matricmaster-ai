export interface SyncQueueItem {
	id: string;
	tableName: string;
	operation: 'INSERT' | 'UPDATE' | 'DELETE';
	recordId: string;
	data: Record<string, unknown>;
	timestamp: number;
	retryCount: number;
	status: 'pending' | 'synced' | 'failed';
}

export interface SyncResult {
	success: boolean;
	syncedCount: number;
	failedCount: number;
	errors: string[];
}

export type ActiveDatabase = 'postgresql' | 'sqlite' | 'none';
