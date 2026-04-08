export type MasteryState = 'unknown' | 'learning' | 'mastered';

export interface MapNodeData {
	topic: string;
	subject: string;
	mastery: MasteryState;
	isLocked: boolean;
	estimatedHours: number;
	prerequisites: string[];
}

export interface SubjectMapProps {
	onNodeClick?: (topic: string, subject: string) => void;
	masteryOverride?: Record<string, MasteryState>;
	filterSubject?: string;
}
