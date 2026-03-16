export interface TimelineTask {
	id: string;
	title: string;
	subject: string;
	subjectEmoji: string;
	subjectColor: string;
	startTime: string;
	endTime: string;
	duration: number;
	completed: boolean;
	priority: 'high' | 'medium' | 'low';
}

export interface TimelineData {
	date: string;
	tasks: TimelineTask[];
	totalTasks: number;
	completedTasks: number;
}
