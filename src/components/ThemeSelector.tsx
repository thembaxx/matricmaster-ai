'use client';

import { Checkmark, LockIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { Card } from '@/components/ui/card';
import { DEFAULT_THEME, UNLOCKABLE_THEMES, type UnlockableTheme } from '@/constants/themes';
import { useUnlockableThemes } from '@/stores/useUnlockableThemes';

interface ThemeWithProgress extends UnlockableTheme {
	isUnlocked: boolean;
	progress: number;
	current: number;
}

interface ThemeSelectorProps {
	userStats: {
		streak: number;
		points: number;
		quizzes: number;
		achievements: number;
	};
}

export function ThemeSelector({ userStats }: ThemeSelectorProps) {
	const { activeTheme, unlockedThemes, applyTheme, getThemeProgress } = useUnlockableThemes();

	const themesWithProgress: ThemeWithProgress[] = getThemeProgress(
		userStats
	) as ThemeWithProgress[];
	const allThemes = [DEFAULT_THEME, ...UNLOCKABLE_THEMES];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{allThemes.map((theme) => {
					const progress = themesWithProgress.find((t) => t.id === theme.id);
					const isUnlocked = unlockedThemes.includes(theme.id);
					const isActive = activeTheme.id === theme.id;

					return (
						<m.div
							key={theme.id}
							whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
							whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
						>
							<Card
								className={`
									relative overflow-hidden cursor-pointer transition-all
									${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
									${!isUnlocked ? 'opacity-60' : ''}
								`}
								onClick={() => isUnlocked && applyTheme(theme)}
							>
								{!isUnlocked && progress && (
									<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
										<HugeiconsIcon icon={LockIcon} className="w-8 h-8 text-muted-foreground mb-2" />
										<p className="text-xs font-bold text-center text-muted-foreground mb-2">
											{progress.current}/{progress.unlockRequirement.value}{' '}
											{progress.unlockRequirement.type}
										</p>
										<div className="w-full max-w-[100px] h-1.5 bg-secondary rounded-full overflow-hidden">
											<div
												className="h-full bg-primary rounded-full transition-all"
												style={{ width: `${progress.progress}%` }}
											/>
										</div>
									</div>
								)}

								<div
									className="h-24 p-3"
									style={{
										background: theme.cssVariables['--background'] || theme.preview,
									}}
								>
									<div className="flex items-center justify-between h-full">
										{isActive && (
											<div className="bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-full">
												<span className="text-[10px] font-black  tracking-wider text-primary">
													Active
												</span>
											</div>
										)}
										{isUnlocked && !isActive && (
											<HugeiconsIcon icon={Checkmark} className="w-5 h-5 text-green-500" />
										)}
									</div>
								</div>

								<div className="p-3">
									<h4 className="font-bold text-sm">{theme.name}</h4>
									<p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
								</div>
							</Card>
						</m.div>
					);
				})}
			</div>

			<div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
				<div className="flex items-center gap-2 mb-2">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
					<h4 className="font-bold text-sm">Unlock More Themes</h4>
				</div>
				<p className="text-xs text-muted-foreground">
					Earn achievements, maintain study streaks, and complete quizzes to unlock new aesthetic
					themes!
				</p>
			</div>
		</div>
	);
}
