import { toast } from 'sonner';

export interface AchievementToastData {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	points?: number;
}

export function showAchievementUnlocked(data: AchievementToastData) {
	toast.success(`${data.title} Unlocked! 🎉`, {
		description: data.description || `+${data.points || 0} points`,
		duration: 5000,
		icon: '🏆',
	});
}

export function showPointsEarned(points: number, total?: number) {
	toast.success(`+${points} points earned!`, {
		description: total ? `Total: ${total} points` : undefined,
		duration: 3000,
	});
}

export function showStreakMilestone(days: number) {
	toast.success(`🔥 ${days} Day Streak!`, {
		description: "Keep it up! You're on fire!",
		duration: 5000,
	});
}

export function showQuizComplete(score: number, total: number) {
	const percentage = Math.round((score / total) * 100);
	toast.success('Quiz Complete!', {
		description: `You got ${score}/${total} (${percentage}%)`,
		duration: 4000,
	});
}
