'use client';

import { LockIcon, Share01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface ProgressSharingProps {
	userStats?: {
		totalStudyTime?: number;
		quizzesCompleted?: number;
		correctAnswers?: number;
		level?: number;
		streakDays?: number;
		unlockedAchievementIds?: string[];
	};
}

export function ProgressSharing({ userStats }: ProgressSharingProps) {
	const [isPublic, setIsPublic] = useState(false);
	const [shareStats, setShareStats] = useState(true);
	const [shareAchievements, setShareAchievements] = useState(true);
	const [shareStreak, setShareStreak] = useState(false);

	const handleShare = () => {
		if (!userStats) return;

		const shareText = `🚀 Crushing my NSC exams with Lumni AI!\n\n📊 Study Stats:\n${shareStats ? `• ${userStats.totalStudyTime || 0} hours studied\n• ${userStats.quizzesCompleted || 0} quizzes completed\n• ${userStats.correctAnswers || 0} correct answers\n• Level ${userStats.level || 1}\n` : ''}${shareAchievements ? `• ${userStats.unlockedAchievementIds?.length || 0} achievements unlocked\n` : ''}${shareStreak ? `• ${userStats.streakDays || 0} day study streak\n` : ''}\nJoin me at lumni.ai to ace your matric!`;

		if (navigator.share) {
			navigator.share({
				title: 'My Lumni Progress',
				text: shareText,
				url: 'https://lumni.ai',
			});
		} else {
			navigator.clipboard.writeText(`${shareText}\nhttps://lumni.ai`);
			// Could add a toast notification here
		}
	};

	return (
		<Card className="tiimo-card">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={Share01Icon} className="w-5 h-5" />
					Share Your Progress
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="font-medium">Public Profile</p>
						<p className="text-sm text-muted-foreground">
							Allow others to see your achievements and stats
						</p>
					</div>
					<Switch checked={isPublic} onCheckedChange={setIsPublic} />
				</div>

				{isPublic && (
					<div className="space-y-3 pl-4 border-l-2 border-muted">
						<div className="flex items-center justify-between">
							<span className="text-sm">Study Statistics</span>
							<Switch checked={shareStats} onCheckedChange={setShareStats} />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Achievements</span>
							<Switch checked={shareAchievements} onCheckedChange={setShareAchievements} />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Study Streak</span>
							<Switch checked={shareStreak} onCheckedChange={setShareStreak} />
						</div>
					</div>
				)}

				<div className="pt-4">
					<Button
						onClick={handleShare}
						className="w-full"
						disabled={!isPublic || (!shareStats && !shareAchievements && !shareStreak)}
					>
						<HugeiconsIcon icon={Share01Icon} className="w-4 h-4 mr-2" />
						Share Progress
					</Button>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<HugeiconsIcon icon={isPublic ? Share01Icon : LockIcon} className="w-3 h-3" />
					<span>Your privacy settings are {isPublic ? 'public' : 'private'}</span>
				</div>
			</CardContent>
		</Card>
	);
}
