'use client';

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	Clock01Icon,
	InformationCircleIcon,
	SparklesIcon,
	TargetIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

interface LessonDetailModalProps {
	lesson: Lesson | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LessonDetailModal({ lesson, open, onOpenChange }: LessonDetailModalProps) {
	const router = useRouter();
	const { setContext } = useAiContext();

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

	if (!lesson) return null;

	const handleAskAI = () => {
		const contextPrompt = `I'm studying "${lesson.title}" in ${lesson.subject} (topic: ${lesson.topic}). Can you explain this to me?`;
		router.push(`/ai-tutor?context=${encodeURIComponent(contextPrompt)}`);
		onOpenChange(false);
	};

	const handlePracticeTest = () => {
		const contextPrompt = `Generate 5 practice problems on "${lesson.topic}" in ${lesson.subject} for NSC Grade 12. Include the questions and answers.`;
		router.push(`/ai-tutor?context=${encodeURIComponent(contextPrompt)}`);
		onOpenChange(false);
	};

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
				</div>
			</DialogContent>
		</Dialog>
	);
}
