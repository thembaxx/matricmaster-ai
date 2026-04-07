'use client';

import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
	BookOpen,
	Calendar,
	FolderOpen,
	GraduationCap,
	Lightbulb,
	Link2Off,
	SearchX,
	Sparkles,
	Trophy,
	User,
	Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateVariant =
	| 'loading'
	| 'empty'
	| 'noResults'
	| 'noData'
	| 'noConnection'
	| 'firstTime'
	| 'noSubjects'
	| 'noFlashcards'
	| 'noPastPapers'
	| 'noLeaderboard'
	| 'noStudyPlan'
	| 'noBuddies';

interface EmptyStateProps {
	variant?: EmptyStateVariant;
	title?: string;
	description?: string;
	icon?: LucideIcon;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

const variantContent: Record<
	EmptyStateVariant,
	{ title: string; description: string; icon: LucideIcon; animation?: boolean }
> = {
	loading: {
		title: 'Preparing your experience...',
		description: 'Just a moment while we curate your data',
		icon: Sparkles,
		animation: true,
	},
	empty: {
		title: 'Your journey starts here',
		description: "You haven't added anything yet. Let's build your first milestone!",
		icon: FolderOpen,
	},
	noResults: {
		title: 'No matches found',
		description: 'Try adjusting your search or filters to find the right material',
		icon: SearchX,
	},
	noData: {
		title: 'No insights yet',
		description: 'Complete a few activities to see your progress mapped out',
		icon: BookOpen,
	},
	noConnection: {
		title: 'Connection lost',
		description: "You're currently offline. Please check your internet to continue",
		icon: Link2Off,
	},
	firstTime: {
		title: 'Welcome to Lumni',
		description: 'Your path to matric mastery begins with choosing your subjects',
		icon: GraduationCap,
	},
	noSubjects: {
		title: 'Set your focus',
		description: 'Select your NSC subjects to unlock targeted practice materials',
		icon: BookOpen,
	},
	noFlashcards: {
		title: 'Build your memory',
		description: 'Start creating flashcard decks to master complex concepts faster',
		icon: Sparkles,
	},
	noPastPapers: {
		title: 'Papers arriving soon',
		description: "We're curating the best past papers for your specific subjects",
		icon: BookOpen,
	},
	noLeaderboard: {
		title: 'Claim the top spot',
		description: 'Complete your first quiz to enter the arena and compete with others',
		icon: Trophy,
	},
	noStudyPlan: {
		title: 'Design your success',
		description: 'Set your goals and let AI build your high-impact study roadmap',
		icon: Calendar,
	},
	noBuddies: {
		title: 'Study better together',
		description: 'Connect with fellow students to tackle the syllabus as a team',
		icon: Users,
	},
};

export function EmptyState({
	variant = 'empty',
	title,
	description,
	icon: Icon,
	actionLabel,
	onAction,
	className,
}: EmptyStateProps) {
	const content = variantContent[variant];
	const finalTitle = title ?? content.title;
	const finalDescription = description ?? content.description;
	const finalIcon = Icon ?? content.icon;
	const IconComponent = finalIcon;

	return (
		<m.div
			initial={{ opacity: 0, y: 20, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			className={cn(
				'flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto',
				className
			)}
		>
			{variant === 'loading' ? (
				<div className="relative w-16 h-16 mb-6">
					<div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
					<div className="absolute inset-0 flex items-center justify-center">
						<IconComponent className="w-6 h-6 text-primary animate-pulse" />
					</div>
				</div>
			) : (
				IconComponent && (
					<div className="relative group mb-6">
						<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full group-hover:bg-primary/20 transition-colors" />
						<div className="relative w-20 h-20 bg-card border border-border/50 rounded-3xl flex items-center justify-center shadow-soft-md backdrop-blur-sm">
							<IconComponent className="w-10 h-10 text-muted-foreground/60 group-hover:text-primary transition-colors" />
						</div>
					</div>
				)
			)}

			<h3 className="text-2xl font-black text-foreground tracking-tight font-display mb-3">
				{finalTitle}
			</h3>

			{finalDescription && (
				<p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-xs mx-auto">
					{finalDescription}
				</p>
			)}

			{actionLabel && onAction && (
				<Button
					onClick={onAction}
					className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 hover:shadow-primary/30"
				>
					{actionLabel}
				</Button>
			)}
		</m.div>
	);
}

export {
	BookOpen,
	Calendar,
	FolderOpen,
	GraduationCap,
	Lightbulb,
	Link2Off,
	SearchX,
	Sparkles,
	Trophy,
	User,
	Users,
};
