export interface ExamPreset {
	name: string;
	duration: number;
	description: string;
}

export const EXAM_PRESETS: ExamPreset[] = [
	{ name: 'Mathematics Paper 1', duration: 180, description: '3 hours - Pure Mathematics' },
	{ name: 'Mathematics Paper 2', duration: 180, description: '3 hours - Geometry & Trigonometry' },
	{ name: 'Physical Sciences', duration: 180, description: '3 hours - Physics & Chemistry' },
	{ name: 'Life Sciences', duration: 150, description: '2.5 hours - Biology' },
	{ name: 'Geography', duration: 180, description: '3 hours - Theory & Mapwork' },
	{ name: 'History', duration: 120, description: '2 hours - South Africa & World' },
	{ name: 'Accounting', duration: 180, description: '3 hours - Financial Statements' },
	{ name: 'English Home Language', duration: 180, description: '3 hours - Comprehension & Essay' },
	{ name: 'Custom', duration: 60, description: 'Set your own time' },
];

export function formatTime(seconds: number) {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	if (hrs > 0) {
		return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number) {
	const hrs = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
	if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
	return `${mins} min`;
}
