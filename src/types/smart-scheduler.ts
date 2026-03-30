export interface StudyBlock {
	id: string;
	subject: string;
	subjectId?: number;
	topic?: string;
	date: Date;
	startTime: string;
	endTime: string;
	duration: number;
	type: 'study' | 'review' | 'practice' | 'break';
	isCompleted: boolean;
	isAISuggested: boolean;
	calendarEventId?: string;
	optimalStartHour?: number;
	optimalEndHour?: number;
	energyScore?: number;
	urgencyScore?: number;
	urgencyPriority?: 'critical' | 'high' | 'medium' | 'low';
	loadSheddingRisk?: boolean;
}

export interface ExamCountdown {
	id: string;
	subject: string;
	subjectId?: number;
	date: Date;
	daysRemaining: number;
	priority: 'high' | 'medium' | 'low';
}

export interface AISuggestion {
	id: string;
	type: 'add' | 'reschedule' | 'remove';
	block: Partial<StudyBlock>;
	reason: string;
	confidence: number;
}

export interface SmartSchedulerState {
	currentWeek: Date;
	selectedDate: Date;
	viewMode: 'week' | 'day';
	blocks: StudyBlock[];
	suggestions: AISuggestion[];
	exams: ExamCountdown[];
	isLoading: boolean;
	isGenerating: boolean;
	setCurrentWeek: (date: Date) => void;
	setSelectedDate: (date: Date) => void;
	setViewMode: (mode: 'week' | 'day') => void;
	setBlocks: (blocks: StudyBlock[]) => void;
	addBlock: (block: StudyBlock) => void;
	updateBlock: (id: string, updates: Partial<StudyBlock>) => void;
	removeBlock: (id: string) => void;
	toggleBlockComplete: (id: string) => Promise<void>;
	setSuggestions: (suggestions: AISuggestion[]) => void;
	acceptSuggestion: (id: string) => void;
	dismissSuggestion: (id: string) => void;
	setExams: (exams: ExamCountdown[]) => void;
	setLoading: (loading: boolean) => void;
	setGenerating: (generating: boolean) => void;
	loadSchedule: () => Promise<void>;
	generateSchedule: () => Promise<void>;
	optimizeSchedule: () => Promise<void>;
	moveBlock: (blockId: string, newDate: Date, newStartTime?: string) => void;
	checkAdaptiveSchedule: () => Promise<{
		rescheduled?: StudyBlock[];
		newSuggestions?: AISuggestion[];
	} | null>;
	saveBlock: (block: Partial<StudyBlock>) => Promise<void>;
	deleteBlock: (blockId: string) => Promise<void>;
	importStudyPathBlocks: (pathBlocks: StudyBlock[]) => void;
	saveImportedBlocks: (pathBlocks: StudyBlock[]) => Promise<void>;
	rescheduleForEnergy: () => Promise<void>;
	rescheduleForLoadShedding: () => Promise<void>;
	applyBurnoutProtection: () => Promise<void>;
}
