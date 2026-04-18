'use client';

import { Add01Icon, CrownIcon, Medal01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ACHIEVEMENTS, getAchievementById } from '@/content';

interface BadgeShowcaseProps {
	unlockedIds: string[];
	featuredIds?: string[];
	onUpdateFeatured?: (ids: string[]) => void;
	maxFeatured?: number;
	className?: string;
}

export const BadgeShowcase = memo(function BadgeShowcase({
	unlockedIds,
	featuredIds = [],
	onUpdateFeatured,
	maxFeatured = 3,
	className = '',
}: BadgeShowcaseProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [tempFeatured, setTempFeatured] = useState<string[]>(featuredIds);

	const unlockedSet = new Set(unlockedIds);
	const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id));
	const featuredAchievements = featuredIds.map((id) => getAchievementById(id)).filter(Boolean);

	const handleToggleFeature = (achievementId: string) => {
		if (tempFeatured.includes(achievementId)) {
			setTempFeatured(tempFeatured.filter((id) => id !== achievementId));
		} else if (tempFeatured.length < maxFeatured) {
			setTempFeatured([...tempFeatured, achievementId]);
		}
	};

	const handleSave = () => {
		onUpdateFeatured?.(tempFeatured);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setTempFeatured(featuredIds);
		setIsEditing(false);
	};

	if (featuredAchievements.length === 0 && !isEditing) {
		return (
			<Card
				className={`p-6 rounded-2xl border-dashed border-2 border-muted-foreground/20 ${className}`}
			>
				<div className="flex flex-col items-center text-center">
					<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
						<HugeiconsIcon icon={Medal01Icon} className="w-6 h-6 text-muted-foreground" />
					</div>
					<p className="text-sm font-bold text-muted-foreground mb-2">No featured badges</p>
					{unlockedAchievements.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditing(true)}
							aria-label="Add featured badges"
						>
							<HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" />
							Add Badges
						</Button>
					)}
				</div>
			</Card>
		);
	}

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={CrownIcon} className="w-5 h-5 text-brand-amber" />
					<h3 className="text-lg font-black text-foreground">Featured Badges</h3>
				</div>
				{unlockedAchievements.length > 0 && !isEditing && (
					<Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
						Pencil
					</Button>
				)}
			</div>

			{!isEditing ? (
				<div className="flex items-center gap-4">
					{featuredAchievements.map((achievement, index) =>
						achievement ? (
							<m.div
								key={achievement.id}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: index * 0.1 }}
								className="group relative"
							>
								<Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-brand-amber/30 shadow-lg shadow-brand-amber/10">
									<div className="flex flex-col items-center">
										<div
											className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
											style={{ backgroundColor: achievement.iconBg }}
										>
											<span className="text-3xl" aria-hidden="true">
												{achievement.icon}
											</span>
										</div>
										<p className="text-sm font-bold text-foreground text-center">
											{achievement.name}
										</p>
										<div className="flex items-center gap-1 mt-1">
											<HugeiconsIcon icon={StarIcon} className="w-3 h-3 text-brand-amber" />
											<span className="text-xs font-bold text-brand-amber">
												{achievement.points} XP
											</span>
										</div>
									</div>
								</Card>

								{index === 0 && (
									<div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-amber rounded-full flex items-center justify-center shadow-md">
										<HugeiconsIcon icon={CrownIcon} className="w-3 h-3 text-white" />
									</div>
								)}
							</m.div>
						) : null
					)}

					{featuredAchievements.length < maxFeatured && (
						<Button
							variant="outline"
							size="lg"
							className="w-24 h-32 rounded-2xl border-dashed"
							onClick={() => setIsEditing(true)}
							aria-label="Add more featured badges"
						>
							<HugeiconsIcon icon={Add01Icon} className="w-6 h-6 text-muted-foreground" />
						</Button>
					)}
				</div>
			) : (
				<Card className="p-6 rounded-2xl">
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Select up to {maxFeatured} badges to feature on your profile ({tempFeatured.length}/
							{maxFeatured} selected)
						</p>

						<div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto">
							{unlockedAchievements.map((achievement) => {
								const isFeatured = tempFeatured.includes(achievement.id);
								return (
									<button
										key={achievement.id}
										type="button"
										onClick={() => handleToggleFeature(achievement.id)}
										aria-label={achievement.name}
										aria-pressed={isFeatured}
										className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
											isFeatured
												? 'bg-brand-amber/20 border-2 border-brand-amber shadow-md'
												: 'bg-muted/50 border-2 border-transparent hover:border-muted-foreground/30'
										} ${tempFeatured.length >= maxFeatured && !isFeatured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
									>
										<span className="text-2xl" aria-hidden="true">
											{achievement.icon}
										</span>
										{isFeatured && (
											<div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-amber rounded-full flex items-center justify-center">
												<HugeiconsIcon icon={StarIcon} className="w-3 h-3 text-white" />
											</div>
										)}
									</button>
								);
							})}
						</div>

						<div className="flex justify-end gap-2 pt-2 border-t">
							<Button variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								className="bg-brand-amber text-zinc-900 hover:bg-brand-amber/90"
							>
								FloppyDisk Changes
							</Button>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
});

export const BadgeShowcaseCompact = memo(function BadgeShowcaseCompact({
	unlockedIds: _unlockedIds,
	featuredIds = [],
	onClick,
}: {
	unlockedIds: string[];
	featuredIds?: string[];
	onClick?: () => void;
}) {
	const featuredAchievements = featuredIds.map((id) => getAchievementById(id)).filter(Boolean);

	if (featuredAchievements.length === 0) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label="View featured badges"
			className="flex items-center gap-1 hover:opacity-80 transition-opacity"
		>
			{featuredAchievements.slice(0, 3).map((achievement, index) =>
				achievement ? (
					<m.div
						key={achievement.id}
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: index * 0.05 }}
						className="-ml-1 first:ml-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background shadow-sm"
						style={{ backgroundColor: achievement.iconBg }}
					>
						<span className="text-sm" aria-hidden="true">
							{achievement.icon}
						</span>
					</m.div>
				) : null
			)}
		</button>
	);
});
