import { ChampionIcon, LockIcon, Share08Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface BadgeData {
	id: string;
	name: string;
	icon: string | null;
	iconBg: string;
	unlocked: boolean;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	description?: string;
	points?: number;
	unlockedAt?: Date;
}

const RARE_THRESHOLD = 200;

function getRarity(points?: number): { label: string; color: string } | null {
	if (!points) return null;
	if (points >= 1000) return { label: 'Legendary', color: '#f59e0b' };
	if (points >= 500) return { label: 'Epic', color: '#a855f7' };
	if (points >= RARE_THRESHOLD) return { label: 'Rare', color: '#3b82f6' };
	return null;
}

export function BadgesGridSection({ filteredBadges }: { filteredBadges: BadgeData[] }) {
	return (
		<AnimatePresence mode="wait">
			{filteredBadges.length === 0 ? (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="text-center py-32 space-y-4 opacity-50"
				>
					<HugeiconsIcon
						icon={LockIcon}
						aria-hidden="true"
						className="w-16 h-16 mx-auto text-muted-foreground"
					/>
					<p className="text-xl font-bold uppercase tracking-widest">No achievements yet.</p>
				</m.div>
			) : (
				<m.div
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8"
				>
					{filteredBadges.map((badge) => (
						<m.div key={badge.id} variants={STAGGER_ITEM}>
							<AchievementBadge badge={badge} />
						</m.div>
					))}
				</m.div>
			)}
		</AnimatePresence>
	);
}

function AchievementBadge({ badge }: { badge: BadgeData }) {
	const rarity = getRarity(badge.points);
	const prefersReducedMotion = useReducedMotion();

	const handleShare = () => {
		const text = badge.unlocked
			? `I just unlocked "${badge.name}" on MatricMaster AI! ${badge.icon || ''} #MatricMaster #Achievement`
			: `Working towards "${badge.name}" on MatricMaster AI!`;

		if (navigator.share) {
			navigator.share({ title: badge.name, text }).catch((err) => {
				console.warn('Failed to share achievement:', err);
			});
		} else {
			navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard!');
		}
	};

	return (
		<Card
			className={cn(
				'group relative h-full flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
				badge.unlocked
					? 'bg-card border-border hover:border-primary/20 hover:shadow-primary/5'
					: 'bg-muted/30 border-dashed border-muted-foreground/20 opacity-60'
			)}
		>
			{rarity && badge.unlocked && (
				<div
					className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider z-10"
					style={{
						backgroundColor: `${rarity.color}15`,
						color: rarity.color,
						border: `1px solid ${rarity.color}30`,
					}}
				>
					{rarity.label}
				</div>
			)}

			<div
				className={cn(
					'w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] flex items-center justify-center relative transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
					badge.unlocked ? 'shadow-xl' : 'grayscale'
				)}
				style={{
					backgroundColor: badge.unlocked ? badge.iconBg : 'var(--muted)',
				}}
			>
				{badge.unlocked ? (
					badge.icon ? (
						<span aria-hidden="true" className="text-5xl lg:text-6xl drop-shadow-xl">
							{badge.icon}
						</span>
					) : (
						<HugeiconsIcon
							icon={ChampionIcon}
							aria-hidden="true"
							className="w-12 h-12 text-primary"
						/>
					)
				) : (
					<HugeiconsIcon
						icon={LockIcon}
						aria-hidden="true"
						className="w-10 h-10 text-muted-foreground/30"
					/>
				)}

				{badge.unlocked &&
					badge.points &&
					badge.points >= RARE_THRESHOLD &&
					!prefersReducedMotion && (
						<m.div
							animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							className="absolute inset-0 rounded-[2rem]"
							style={{
								boxShadow: `0 0 20px ${rarity?.color}40`,
							}}
						/>
					)}
			</div>

			<div className="text-center space-y-2">
				<h3
					className={cn(
						'text-lg font-black tracking-tighter leading-none',
						badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
					)}
				>
					{badge.name}
				</h3>
				<p
					className={cn(
						'text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 inline-block',
						badge.unlocked
							? 'text-primary border-primary/20 bg-primary/5'
							: 'text-muted-foreground/50 border-muted-foreground/10'
					)}
				>
					{badge.unlocked ? 'Mastered' : 'Locked'}
				</p>
				{badge.unlocked && badge.points && (
					<p className="text-[10px] font-bold text-brand-amber">+{badge.points} XP</p>
				)}
			</div>

			<div className="absolute inset-0 bg-primary rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
				<p className="text-primary-foreground font-black text-sm uppercase tracking-widest mb-2">
					{badge.name}
				</p>
				<p className="text-primary-foreground/80 text-xs font-bold leading-relaxed mb-4">
					{badge.description || 'Complete challenges to unlock this achievement!'}
				</p>
				{badge.unlocked && (
					<Button
						size="sm"
						variant="secondary"
						onClick={(e) => {
							e.stopPropagation();
							handleShare();
						}}
						className="rounded-full text-xs font-bold pointer-events-auto"
					>
						<HugeiconsIcon icon={Share08Icon} className="w-3.5 h-3.5 mr-1.5" />
						Share
					</Button>
				)}
			</div>
		</Card>
	);
}
