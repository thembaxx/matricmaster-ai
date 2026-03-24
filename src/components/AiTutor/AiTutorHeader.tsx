'use client';

import {
	BookOpen01Icon,
	Loading03Icon,
	SaveIcon,
	SparklesIcon,
	ViewIcon,
	ViewOffIcon,
	WorkoutSportIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface AiTutorHeaderProps {
	isGeneratingFlashcards: boolean;
	isGeneratingPractice: boolean;
	messagesLength: number;
	showSources: boolean;
	handleGenerateFlashcards: () => void;
	handleGeneratePractice: () => void;
	handleSave: () => void;
	handleToggleSources: () => void;
}

export function AiTutorHeader({
	isGeneratingFlashcards,
	isGeneratingPractice,
	messagesLength,
	showSources,
	handleGenerateFlashcards,
	handleGeneratePractice,
	handleSave,
	handleToggleSources,
}: AiTutorHeaderProps) {
	return (
		<header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-10 px-4 py-3 md:px-6 md:py-4">
			<div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
				<div className="flex items-center gap-3 md:gap-4">
					<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
						<HugeiconsIcon
							icon={SparklesIcon}
							className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse-soft"
						/>
					</div>
					<div>
						<h1 className="text-lg md:text-xl font-black font-lexend tracking-tight">
							Study Helper
						</h1>
						<div className="flex items-center gap-2">
							<span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
							<p className="text-xs font-bold text-muted-foreground  tracking-widest">Online</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-1 md:gap-2">
					<Button
						variant={showSources ? 'default' : 'outline'}
						size="sm"
						className="rounded-xl border-border/50 bg-surface-elevated/50 px-2 md:px-3"
						onClick={handleToggleSources}
					>
						<HugeiconsIcon icon={showSources ? ViewOffIcon : ViewIcon} className="h-4 w-4" />
						<span className="hidden md:inline ml-2">Sources</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="rounded-xl border-border/50 bg-surface-elevated/50 px-2 md:px-3"
						onClick={handleGenerateFlashcards}
						disabled={isGeneratingFlashcards || messagesLength <= 1}
					>
						{isGeneratingFlashcards ? (
							<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
						) : (
							<HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
						)}
						<span className="hidden md:inline ml-2">Flashcards</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="rounded-xl border-border/50 bg-surface-elevated/50 px-2 md:px-3"
						onClick={handleGeneratePractice}
						disabled={isGeneratingPractice || messagesLength <= 1}
					>
						{isGeneratingPractice ? (
							<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
						) : (
							<HugeiconsIcon icon={WorkoutSportIcon} className="h-4 w-4" />
						)}
						<span className="hidden md:inline ml-2">Practice</span>
					</Button>
					<Button variant="default" size="sm" className="rounded-xl" onClick={handleSave}>
						<HugeiconsIcon icon={SaveIcon} className="h-4 w-4" />
						<span className="hidden md:inline ml-2">Save</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
