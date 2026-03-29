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
		title: 'Loading...',
		description: 'Just a moment while we fetch your data',
		icon: Sparkles,
		animation: true,
	},
	empty: {
		title: 'No items yet',
		description: "You haven't added anything here. Start your learning journey now!",
		icon: FolderOpen,
	},
	noResults: {
		title: 'No results found',
		description: 'Try adjusting your search or filters to find what you need',
		icon: SearchX,
	},
	noData: {
		title: 'No data available',
		description: 'There is no data to display at the moment',
		icon: BookOpen,
	},
	noConnection: {
		title: 'No internet connection',
		description: 'Please check your connection and try again',
		icon: Link2Off,
	},
	firstTime: {
		title: 'Welcome to MatricMaster!',
		description: 'Start your matric journey by selecting your subjects',
		icon: GraduationCap,
	},
	noSubjects: {
		title: 'Choose your subjects',
		description: 'Select your NSC subjects to start practicing',
		icon: BookOpen,
	},
	noFlashcards: {
		title: 'Create your first flashcard deck',
		description: 'Build your memory with AI-generated flashcards',
		icon: Sparkles,
	},
	noPastPapers: {
		title: 'Past papers coming soon',
		description: 'We are adding more past papers for your revision',
		icon: BookOpen,
	},
	noLeaderboard: {
		title: 'Be the first to top the leaderboard',
		description: 'Complete quizzes to earn points and rank among the best',
		icon: Trophy,
	},
	noStudyPlan: {
		title: 'Create your study plan',
		description: 'Set goals and track your progress with a personalized study plan',
		icon: Calendar,
	},
	noBuddies: {
		title: 'Find study buddies',
		description: 'Connect with other students to study together',
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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
		>
			{variant === 'loading' ? (
				<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
			) : (
				IconComponent && (
					<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
						<IconComponent className="w-8 h-8 text-muted-foreground/50" />
					</div>
				)
			)}
			<h3 className="text-lg font-bold text-foreground mb-2">{finalTitle}</h3>
			{finalDescription && (
				<p className="text-sm text-muted-foreground max-w-sm mb-6">{finalDescription}</p>
			)}
			{actionLabel && onAction && (
				<Button onClick={onAction} variant="outline">
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
