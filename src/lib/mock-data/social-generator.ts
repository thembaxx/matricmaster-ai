import type { DateRange } from './distributions';
import type { SeededRandom } from './seeded-random';

export interface GeneratedChannel {
	id: string;
	name: string;
	description?: string;
	subjectId?: number;
	createdBy: string;
	isPublic: boolean;
	memberCount: number;
	createdAt: Date;
}

export interface GeneratedChannelMember {
	channelId: string;
	userId: string;
	role: string;
	joinedAt: Date;
}

export interface GeneratedCalendarEvent {
	id: string;
	userId: string;
	title: string;
	description?: string;
	eventType: string;
	subjectId?: number;
	startTime: Date;
	endTime: Date;
	isAllDay: boolean;
	isCompleted: boolean;
	createdAt: Date;
}

export interface GeneratedNotification {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	data?: string;
	isRead: boolean;
	createdAt: Date;
}

export interface GeneratedStudyBuddyRequest {
	id: string;
	requesterId: string;
	recipientId: string;
	status: 'pending' | 'accepted' | 'rejected';
	message?: string;
	createdAt: Date;
	respondedAt?: Date;
}

export interface GeneratedAIConversation {
	id: string;
	userId: string;
	title: string;
	subject?: string;
	messageCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export class SocialGenerator {
	private rng: SeededRandom;
	private dateRange: DateRange;

	constructor(rng: SeededRandom, dateRange: DateRange) {
		this.rng = rng;
		this.dateRange = dateRange;
	}

	generateChannel(userIds: string[], subjectIds: Map<string, number>): GeneratedChannel {
		const subjects = Array.from(subjectIds.keys());
		const namePrefixes = [
			'Math Masters',
			'Physics Pioneers',
			'History Heroes',
			'Science Squad',
			'Exam Prep',
			'Study Group',
			'Tutoring Team',
		];
		const nameSuffixes = ['2025', 'Grade 12', 'NSC', 'Advanced', ' Beginners', ' Elite'];

		const subjectId = this.rng.pick(subjects);
		const subjectSlug = subjectId;

		return {
			id: this.rng.uuid(),
			name: `${this.rng.pick(namePrefixes)} ${this.rng.pick(nameSuffixes)}`,
			description: `Study group for ${subjectSlug} preparation`,
			subjectId: subjectIds.get(subjectSlug),
			createdBy: this.rng.pick(userIds),
			isPublic: this.rng.boolean(0.8),
			memberCount: this.rng.nextInt(2, 25),
			createdAt: this.randomDate(),
		};
	}

	generateChannelMembers(channelId: string, userIds: string[]): GeneratedChannelMember[] {
		const memberCount = this.rng.nextInt(3, 15);
		const memberUserIds = this.rng.shuffle(userIds).slice(0, memberCount);

		return memberUserIds.map((userId, index) => ({
			channelId,
			userId,
			role: index === 0 ? 'admin' : 'member',
			joinedAt: this.randomDate(),
		}));
	}

	generateCalendarEvents(
		userId: string,
		subjectIds: Map<string, number>
	): GeneratedCalendarEvent[] {
		const events: GeneratedCalendarEvent[] = [];
		const eventTypes = ['study-session', 'exam', 'tutoring', 'revision'];
		const subjects = Array.from(subjectIds.keys());

		for (let i = 0; i < 10; i++) {
			const eventType = this.rng.pick(eventTypes);
			const startTime = this.randomDate();

			let duration = 60;
			if (eventType === 'exam') {
				duration = this.rng.nextInt(120, 180);
			} else if (eventType === 'tutoring') {
				duration = this.rng.nextInt(45, 90);
			}

			const endTime = new Date(startTime);
			endTime.setMinutes(endTime.getMinutes() + duration);

			events.push({
				id: this.rng.uuid(),
				userId,
				title: this.generateEventTitle(eventType),
				description: `Scheduled ${eventType}`,
				eventType,
				subjectId: subjectIds.get(this.rng.pick(subjects)),
				startTime,
				endTime,
				isAllDay: eventType === 'exam',
				isCompleted: startTime < new Date(),
				createdAt: this.randomDate(),
			});
		}

		return events;
	}

	generateNotifications(userId: string): GeneratedNotification[] {
		const notifications: GeneratedNotification[] = [];
		const types = [
			'achievement',
			'streak',
			'study-reminder',
			'buddy-request',
			'channel-invite',
			'exam-reminder',
		];

		const templates: Record<string, { title: string; message: string }[]> = {
			achievement: [
				{
					title: 'Achievement Unlocked!',
					message: 'You earned the "Week Warrior" badge!',
				},
				{
					title: 'New Badge',
					message: 'You mastered 10 topics!',
				},
			],
			streak: [
				{
					title: 'Streak Update',
					message: 'You have a 7-day study streak!',
				},
				{
					title: 'Streak Milestone',
					message: 'Keep it up! 14 days and counting.',
				},
			],
			'study-reminder': [
				{
					title: 'Time to Study!',
					message: 'Your daily practice awaits.',
				},
				{
					title: 'Keep Your Streak',
					message: "Don't break your 5-day streak!",
				},
			],
			'buddy-request': [
				{
					title: 'New Buddy Request',
					message: 'Someone wants to study with you!',
				},
			],
			'channel-invite': [
				{
					title: 'Channel Invitation',
					message: 'You have been invited to join a study channel.',
				},
			],
			'exam-reminder': [
				{
					title: 'Exam Countdown',
					message: 'Your exams are in 30 days!',
				},
			],
		};

		for (let i = 0; i < 15; i++) {
			const type = this.rng.pick(types);
			const template = this.rng.pick(templates[type]);

			notifications.push({
				id: this.rng.uuid(),
				userId,
				type,
				title: template.title,
				message: template.message,
				isRead: this.rng.boolean(0.6),
				createdAt: this.randomDate(),
			});
		}

		return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	generateStudyBuddyRequest(userIds: string[]): GeneratedStudyBuddyRequest | null {
		const shuffled = this.rng.shuffle(userIds);
		if (shuffled.length < 2) return null;

		const statuses = ['accepted', 'pending', 'rejected'] as const;
		const weights = [0.5, 0.3, 0.2];

		return {
			id: this.rng.uuid(),
			requesterId: shuffled[0],
			recipientId: shuffled[1],
			status: this.rng.pickWeighted([...statuses], weights),
			message: 'Hey! Want to study together?',
			createdAt: this.randomDate(),
		};
	}

	generateAIConversation(userId: string): GeneratedAIConversation {
		const subjects = ['Mathematics', 'Physics', 'History', 'English', 'Life Sciences'];
		const titles = [
			'Help with quadratic equations',
			'Physics problem discussion',
			'History essay review',
			'Grammar questions',
			'Biology concepts',
		];

		return {
			id: this.rng.uuid(),
			userId,
			title: this.rng.pick(titles),
			subject: this.rng.pick(subjects),
			messageCount: this.rng.nextInt(5, 30),
			createdAt: this.randomDate(),
			updatedAt: this.randomDate(),
		};
	}

	private randomDate(): Date {
		const start = this.dateRange.start.getTime();
		const end = this.dateRange.end.getTime();
		return new Date(start + this.rng.next() * (end - start));
	}

	private generateEventTitle(eventType: string): string {
		const titles: Record<string, string[]> = {
			'study-session': ['Math Practice', 'Physics Review', 'History Reading', 'English Essay'],
			exam: ['Math Paper 1', 'Physics Paper 2', 'History Paper 3'],
			tutoring: ['Tutoring Session', 'One-on-One Help', 'Group Session'],
			revision: ['Quick Revision', 'Topic Recap', 'Practice Questions'],
		};
		return this.rng.pick(titles[eventType] ?? ['Study Session']);
	}
}
