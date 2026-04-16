'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	BookmarkIcon,
	BookOpen01Icon,
	Clock01Icon,
	InformationCircleIcon,
	ShareIcon,
	SparklesIcon,
	TargetIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { TTSButton } from '@/components/Lessons/TTSButton';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useAiContext } from '@/hooks/useAiContext';
import type { Lesson } from '@/hooks/useLessons';
import {
	createBookmarkAction,
	deleteBookmarkAction,
	isBookmarkedAction,
} from '@/lib/db/bookmark-actions';
import { completeLessonAction } from '@/lib/db/lesson-progress-actions';

interface LessonDetailModalProps {
	lesson: Lesson | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allLessons?: Lesson[];
	currentIndex?: number;
	onNavigate?: (lesson: Lesson, index: number) => void;
}

export function LessonDetailModal({
	lesson,
	open,
	onOpenChange,
	allLessons = [],
	currentIndex = 0,
	onNavigate,
}: LessonDetailModalProps) {
	const router = useRouter();
	const { setContext } = useAiContext();
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isPending, startTransition] = useTransition();

	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex < allLessons.length - 1;

	// Check bookmark status when lesson changes
	useEffect(() => {
		if (!lesson) return;
		setIsBookmarked(false);
		isBookmarkedAction(lesson.id)
			.then(setIsBookmarked)
			.catch(() => {});
	}, [lesson]);

	useEffect(() => {
		if (!lesson) return;
		setContext({
			type: 'lesson',
			subject: lesson.subject,
			topic: lesson.topic,
			lessonId: lesson.id,
			lastUpdated: Date.now(),
		});
	}, [lesson, setContext]);

	const toggleBookmark = () => {
		if (!lesson) return;
		startTransition(async () => {
			if (isBookmarked) {
				const result = await deleteBookmarkAction(lesson.id);
				if (result.success) {
					setIsBookmarked(false);
					toast.success('Bookmark removed');
				}
			} else {
				const result = await createBookmarkAction('lesson', lesson.id);
				if (result.success) {
					setIsBookmarked(true);
					toast.success('Lesson bookmarked');
				} else {
					toast.error(result.error || 'Failed to bookmark');
				}
			}
		});
	};

	if (!lesson) return null;

	const handleAskAI = () => {
		const contextPrompt = `I'm studying "${lesson.title}" in ${lesson.subject} (topic: ${lesson.topic}). Can you explain this to me?`;
		router.push(`/ai-tutor?context=${encodeURIComponent(contextPrompt)}`);
		onOpenChange(false);
	};

	const handlePracticeTest = async () => {
		// Track that user started practice
		await completeLessonAction(lesson.id, lesson.duration).catch(() => {});

		const contextPrompt = `Generate 5 practice problems on "${lesson.topic}" in ${lesson.subject} for NSC Grade 12. Include the questions and answers.`;
		router.push(`/ai-tutor?context=${encodeURIComponent(contextPrompt)}&practice=true`);
		onOpenChange(false);
	};

	const handleShare = async () => {
		const shareUrl = `${window.location.origin}/learn?lesson=${lesson.id}`;
		if (navigator.share) {
			try {
				await navigator.share({
					title: lesson.title,
					text: `Check out this lesson: ${lesson.title}`,
					url: shareUrl,
				});
			} catch {
				// User cancelled or share failed
			}
		} else {
			await navigator.clipboard.writeText(shareUrl);
			alert('Link copied to clipboard!');
		}
	};

	const handlePrev = () => {
		if (hasPrev && onNavigate) {
			onNavigate(allLessons[currentIndex - 1], currentIndex - 1);
		}
	};

	const handleNext = () => {
		if (hasNext && onNavigate) {
			onNavigate(allLessons[currentIndex + 1], currentIndex + 1);
		}
	};

	// Compute related lessons: same subject, different topic
	const relatedLessons = allLessons
		.filter((l) => l.id !== lesson.id && l.subject === lesson.subject && l.topic !== lesson.topic)
		.slice(0, 3);

	const listenText = `${lesson.title}. ${lesson.content.slice(0, 500)}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-border/50 bg-background">
				<DialogHeader className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<p className="text-[10px] font-black tracking-widest text-primary uppercase mb-2">
								{lesson.subject}
							</p>
							<DialogTitle className="text-2xl font-black text-foreground leading-tight">
								{lesson.title}
							</DialogTitle>
						</div>
						<div
							className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${lesson.color} border border-border shrink-0`}
						>
							{lesson.icon}
						</div>
					</div>
					<DialogDescription className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
						<span className="flex items-center gap-1">
							<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4" />
							{lesson.topic}
						</span>
						<span className="flex items-center gap-1">
							<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
							{lesson.duration} min
						</span>
						<span className="flex items-center gap-1">
							<HugeiconsIcon icon={TargetIcon} className="w-4 h-4" />
							{lesson.difficulty}
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Lesson Content */}
					<div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
						<h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
							<HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-primary" />
							lesson content
						</h4>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{lesson.content.slice(0, 400)}
							{lesson.content.length > 400 && '...'}
						</p>
					</div>

					{/* Learning Objectives */}
					{lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
						<div className="bg-brand-green/5 rounded-2xl p-5 border border-brand-green/20">
							<h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-brand-green" />
								what you will learn
							</h4>
							<ul className="space-y-2">
								{lesson.learning_objectives.slice(0, 3).map((objective, index) => (
									<li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 shrink-0" />
										{objective}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Prerequisites */}
					{lesson.prerequisites && lesson.prerequisites.length > 0 && (
						<div className="bg-brand-amber/5 rounded-2xl p-5 border border-brand-amber/20">
							<h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
								<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-brand-amber" />
								before you begin
							</h4>
							<div className="flex flex-wrap gap-2">
								{lesson.prerequisites.slice(0, 3).map((prereq, index) => (
									<span
										key={index}
										className="text-xs font-medium px-3 py-1.5 bg-brand-amber/10 text-brand-amber rounded-full border border-brand-amber/20"
									>
										{prereq}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Related Lessons */}
					{relatedLessons.length > 0 && (
						<div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
							<h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
								<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-primary" />
								related lessons
							</h4>
							<div className="flex flex-wrap gap-2">
								{relatedLessons.slice(0, 3).map((rel) => (
									<button
										type="button"
										key={rel.id}
										onClick={() => {
											const idx = allLessons.findIndex((l) => l.id === rel.id);
											if (idx >= 0 && onNavigate) {
												onNavigate(rel, idx);
											}
										}}
										className="text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-all text-left"
									>
										{rel.title}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
						<TTSButton
							text={listenText}
							title={lesson.title}
							showPlayer={true}
							className="w-full justify-center"
						/>

						<Button
							variant="outline"
							onClick={handleAskAI}
							className="flex items-center justify-center gap-2 bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20"
						>
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
							ask ai
						</Button>

						<Button
							onClick={handlePracticeTest}
							className="flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
						>
							<HugeiconsIcon icon={TargetIcon} className="w-4 h-4" />
							practice test
						</Button>
					</div>

					{/* Navigation & Additional Info */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
						{/* Estimated Time */}
						<div className="text-xs text-muted-foreground font-medium">
							<span className="text-foreground font-bold">{lesson.duration + 10} min</span> total
							(lesson + practice)
						</div>

						{/* Navigation & Share */}
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleBookmark}
								disabled={isPending}
								className="rounded-full"
							>
								<HugeiconsIcon
									icon={BookmarkIcon}
									className={`w-4 h-4 ${isBookmarked ? 'fill-current text-brand-amber' : ''}`}
								/>
							</Button>
							<Button variant="ghost" size="sm" onClick={handleShare} className="rounded-full">
								<HugeiconsIcon icon={ShareIcon} className="w-4 h-4" />
							</Button>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={handlePrev}
									disabled={!hasPrev}
									className="rounded-full disabled:opacity-30"
								>
									<HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
								</Button>
								<span className="text-xs font-bold text-muted-foreground px-2">
									{currentIndex + 1}/{allLessons.length}
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleNext}
									disabled={!hasNext}
									className="rounded-full disabled:opacity-30"
								>
									<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
