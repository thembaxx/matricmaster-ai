import { type ExamDateEntry, NSC_EXAM_DATES } from '@/content';

export interface ScheduledEvent {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
	conflictsWithExam?: boolean;
	examDate?: ExamDateEntry;
}

export interface ExamConflictResult {
	hasConflict: boolean;
	conflicts: Array<{
		event: ScheduledEvent;
		exam: ExamDateEntry;
		message: string;
	}>;
	warnings: string[];
}

const EXAM_PREP_DAYS = 3;
const EXAM_BUFFER_DAYS = 1;

export function getExamDatesForSubject(subjectKey: string): ExamDateEntry[] {
	return NSC_EXAM_DATES.filter(
		(exam) => exam.subjectKey.toLowerCase() === subjectKey.toLowerCase()
	);
}

export function isExamPeriod(date: Date, subjectKey?: string): boolean {
	const exams = subjectKey ? getExamDatesForSubject(subjectKey) : NSC_EXAM_DATES;

	for (const exam of exams) {
		const examDate = new Date(exam.date);
		const prepStart = new Date(examDate);
		prepStart.setDate(prepStart.getDate() - EXAM_PREP_DAYS);

		const examEnd = new Date(examDate);
		examEnd.setDate(examEnd.getDate() + EXAM_BUFFER_DAYS);

		if (date >= prepStart && date <= examEnd) {
			return true;
		}
	}

	return false;
}

export function checkExamConflicts(
	events: ScheduledEvent[],
	subjectFilter?: string
): ExamConflictResult {
	const conflicts: Array<{
		event: ScheduledEvent;
		exam: ExamDateEntry;
		message: string;
	}> = [];
	const warnings: string[] = [];

	const relevantExams = subjectFilter
		? NSC_EXAM_DATES.filter((e) => e.subjectKey.toLowerCase() === subjectFilter.toLowerCase())
		: NSC_EXAM_DATES;

	for (const event of events) {
		if (!event.startTime || !event.endTime) continue;

		for (const exam of relevantExams) {
			const examDate = new Date(exam.date);
			const examDayStart = new Date(examDate);
			examDayStart.setHours(9, 0, 0, 0);
			const examDayEnd = new Date(examDate);
			examDayEnd.setHours(17, 0, 0, 0);

			const eventStart = new Date(event.startTime);
			const eventEnd = new Date(event.endTime);

			if (eventStart < examDayEnd && eventEnd > examDayStart) {
				conflicts.push({
					event,
					exam,
					message: `"${event.title}" conflicts with ${exam.subject} ${exam.paper} on ${exam.date}`,
				});
			}

			const prepStart = new Date(examDate);
			prepStart.setDate(prepStart.getDate() - EXAM_PREP_DAYS);

			if (eventStart >= prepStart && eventStart < examDayStart) {
				warnings.push(
					`"${event.title}" is scheduled during ${exam.subject} exam prep period (${prepStart.toLocaleDateString()} - ${exam.date})`
				);
			}
		}
	}

	return {
		hasConflict: conflicts.length > 0,
		conflicts,
		warnings,
	};
}

export function getUpcomingExams(daysAhead = 30): ExamDateEntry[] {
	const now = new Date();
	const cutoff = new Date(now);
	cutoff.setDate(cutoff.getDate() + daysAhead);

	return NSC_EXAM_DATES.filter((exam) => {
		const examDate = new Date(exam.date);
		return examDate >= now && examDate <= cutoff;
	}).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getStudyRecommendationsForExam(
	exam: ExamDateEntry,
	_currentTopics: string[]
): string[] {
	const recommendations: string[] = [];
	const daysUntilExam = Math.ceil(
		(new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
	);

	if (daysUntilExam <= 7) {
		recommendations.push('Focus exclusively on this subject this week');
		recommendations.push('Review past papers for this exam');
		recommendations.push('Avoid scheduling non-essential activities');
	} else if (daysUntilExam <= 14) {
		recommendations.push('Increase study time for this subject');
		recommendations.push('Start concentrated review sessions');
		recommendations.push('Schedule practice tests under exam conditions');
	} else {
		recommendations.push('Include this subject in your regular study rotation');
		recommendations.push('Identify weak topics to focus on');
	}

	return recommendations;
}

export function suggestOptimalStudySchedule(
	examDates: ExamDateEntry[],
	availableHoursPerWeek: number
): Array<{
	subject: string;
	hoursPerWeek: number;
	priority: 'high' | 'medium' | 'low';
	reason: string;
}> {
	const now = new Date();
	const schedule: Array<{
		subject: string;
		hoursPerWeek: number;
		priority: 'high' | 'medium' | 'low';
		reason: string;
	}> = [];

	const subjectExamDates: Record<string, Date> = {};
	for (const exam of examDates) {
		const examDate = new Date(exam.date);
		if (!subjectExamDates[exam.subject] || examDate < subjectExamDates[exam.subject]) {
			subjectExamDates[exam.subject] = examDate;
		}
	}

	const subjectDaysUntil: Array<{ subject: string; days: number }> = [];
	for (const [subject, date] of Object.entries(subjectExamDates)) {
		const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		subjectDaysUntil.push({ subject, days: Math.max(0, days) });
	}

	subjectDaysUntil.sort((a, b) => a.days - b.days);

	let remainingHours = availableHoursPerWeek;
	const highPrioritySubjects = subjectDaysUntil.filter((s) => s.days <= 14);
	const mediumPrioritySubjects = subjectDaysUntil.filter((s) => s.days > 14 && s.days <= 30);
	const lowPrioritySubjects = subjectDaysUntil.filter((s) => s.days > 30);

	for (const sub of highPrioritySubjects) {
		const hours = Math.min(remainingHours * 0.5, 12);
		schedule.push({
			subject: sub.subject,
			hoursPerWeek: Math.round(hours * 10) / 10,
			priority: 'high',
			reason: `Exam in ${sub.days} days - prioritize this subject`,
		});
		remainingHours -= hours;
	}

	for (const sub of mediumPrioritySubjects) {
		const hours = Math.min(remainingHours / 2, 6);
		schedule.push({
			subject: sub.subject,
			hoursPerWeek: Math.round(hours * 10) / 10,
			priority: 'medium',
			reason: `Exam in ${sub.days} days - maintain regular study`,
		});
		remainingHours -= hours;
	}

	for (const sub of lowPrioritySubjects) {
		const hours = Math.min(remainingHours / Math.max(1, lowPrioritySubjects.length), 4);
		schedule.push({
			subject: sub.subject,
			hoursPerWeek: Math.round(hours * 10) / 10,
			priority: 'low',
			reason: `Exam in ${sub.days} days - keep familiar`,
		});
		remainingHours -= hours;
	}

	return schedule;
}
