'use client';

import { CrownIcon as Crown, MedalIcon as Medal, PlusSignIcon as Plus, StarIcon as Star, PencilEdit01Icon as Pencil, Disk01Icon as FloppyDisk, Cancel01Icon as X } from 'hugeicons-react';
import { m } from 'framer-motion';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ACHIEVEMENTS, getAchievementById } from '@/constants/achievements';

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
				className={cn("p-10 rounded-[2.5rem] border-dashed border-4 border-muted/20 bg-muted/5 flex flex-col items-center text-center space-y-6", className)}
			>
				<div className="w-20 h-20 rounded-[1.5rem] bg-muted/10 flex items-center justify-center">
					<Medal size={40} className="text-muted-foreground/20 stroke-[3px]" />
				</div>
				<div className="space-y-1">
					<p className="text-lg font-black text-muted-foreground/40 uppercase tracking-widest">Showcase Empty</p>
					<p className="text-sm font-bold text-muted-foreground/30 max-w-[200px]">Pin your proudest achievements here!</p>
				</div>
				{unlockedAchievements.length > 0 && (
					<Button
						onClick={() => setIsEditing(true)}
						className="h-12 px-6 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20"
					>
						<Plus size={18} className="mr-2 stroke-[3px]" />
						Select Badges
					</Button>
				)}
			</Card>
		);
	}

	return (
		<div className={className}>
			<div className="flex items-end justify-between mb-8 px-2">
				<div className="space-y-1">
					<h3 className="text-3xl font-black text-foreground tracking-tight leading-none">Showcase</h3>
					<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Pinned Achievements</p>
				</div>
				{unlockedAchievements.length > 0 && !isEditing && (
					<Button
						variant="ghost"
						size="icon"
						className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-primary hover:text-white transition-all shadow-sm"
						onClick={() => setIsEditing(true)}
					>
						<Pencil size={24} className="stroke-[3px]" />
					</Button>
				)}
			</div>

			{!isEditing ? (
				<div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
					{featuredAchievements.map((achievement, index) =>
						achievement ? (
							<m.div
								key={achievement.id}
								initial={{ scale: 0.8, opacity: 0, x: -20 }}
								animate={{ scale: 1, opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1, type: 'spring' }}
								className="group relative shrink-0"
							>
								<Card className="w-48 p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-none shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500">
									<div className="flex flex-col items-center gap-6">
										<div
											className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500"
											style={{ backgroundColor: achievement.iconBg }}
										>
											<span className="text-4xl filter drop-shadow-md" aria-hidden="true">
												{achievement.icon}
											</span>
										</div>
										<div className="space-y-2 text-center">
											<p className="text-lg font-black text-foreground leading-none">
												{achievement.name}
											</p>
											<div className="flex items-center justify-center gap-2">
												<Star size={14} className="text-tiimo-orange fill-tiimo-orange stroke-[3px]" />
												<span className="text-xs font-black text-tiimo-orange uppercase tracking-widest">
													{achievement.points} XP
												</span>
											</div>
										</div>
									</div>
								</Card>

								{index === 0 && (
									<div className="absolute -top-3 -right-3 w-10 h-10 bg-tiimo-orange text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-tiimo-orange/30 border-4 border-white dark:border-zinc-950">
										<Crown size={18} className="stroke-[3px]" />
									</div>
								)}
							</m.div>
						) : null
					)}

					{featuredAchievements.length < maxFeatured && (
						<m.button
							whileHover={{ scale: 1.02, y: -4 }}
							whileTap={{ scale: 0.98 }}
							className="w-48 h-64 rounded-[2.5rem] border-dashed border-4 border-muted/20 bg-muted/5 flex items-center justify-center transition-all hover:bg-muted/10"
							onClick={() => setIsEditing(true)}
						>
							<div className="w-16 h-16 rounded-[1.25rem] bg-muted/10 flex items-center justify-center text-muted-foreground/30">
								<Plus size={32} className="stroke-[4px]" />
							</div>
						</m.button>
					)}
				</div>
			) : (
				<Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.1)]">
					<div className="space-y-8">
						<div className="space-y-1">
							<p className="text-xl font-black text-foreground tracking-tight">Select Featured</p>
							<p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
								{tempFeatured.length} of {maxFeatured} picked
							</p>
						</div>

						<div className="grid grid-cols-4 sm:grid-cols-6 gap-6 max-h-[400px] overflow-y-auto p-2 no-scrollbar">
							{unlockedAchievements.map((achievement) => {
								const isFeatured = tempFeatured.includes(achievement.id);
								return (
									<button
										key={achievement.id}
										type="button"
										onClick={() => handleToggleFeature(achievement.id)}
										aria-label={achievement.name}
										aria-pressed={isFeatured}
										className={cn(
											"relative aspect-square rounded-[1.5rem] flex flex-col items-center justify-center p-4 transition-all duration-300",
											isFeatured
												? 'bg-tiimo-purple text-white shadow-2xl shadow-tiimo-purple/30 scale-105'
												: 'bg-muted/10 hover:bg-muted/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100',
											tempFeatured.length >= maxFeatured && !isFeatured && 'cursor-not-allowed'
										)}
									>
										<span className="text-4xl mb-2" aria-hidden="true">
											{achievement.icon}
										</span>
										<span className="text-[8px] font-black uppercase tracking-widest leading-none text-center line-clamp-1">{achievement.name}</span>
										{isFeatured && (
											<div className="absolute -top-2 -right-2 w-8 h-8 bg-tiimo-orange text-white rounded-xl flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-900">
												<Star size={14} className="stroke-[3px] fill-white/20" />
											</div>
										)}
									</button>
								);
							})}
						</div>

						<div className="flex justify-end gap-4 pt-8 border-t border-muted/10">
							<Button
								variant="ghost"
								onClick={handleCancel}
								className="h-14 px-8 rounded-2xl font-black text-muted-foreground/60 hover:bg-muted/20"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								className="h-14 px-8 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 gap-3"
							>
								<FloppyDisk size={20} className="stroke-[3px]" />
								Save Layout
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
