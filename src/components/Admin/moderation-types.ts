export interface ContentFlag {
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

export interface ModerationPattern {
	id: string;
	pattern: string;
	patternType: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	action: 'flag' | 'block' | 'approve';
	isActive: boolean;
}

export const getSeverityColor = (severity: string) => {
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

export const getStatusColor = (status: string) => {
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
