'use client';

import { ArrowLeft02Icon, File01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { PastPaperData } from './useQuestionViewer';

interface QuestionHeaderProps {
	paper: PastPaperData;
	progress: number;
	currentQuestionIndex: number;
	totalQuestions: number;
	zoom?: number;
	onZoomChange?: (zoom: number) => void;
	viewMode?: 'smart' | 'original';
	onViewModeChange?: (mode: 'smart' | 'original') => void;
}

export function QuestionHeader({
	paper,
	progress,
	currentQuestionIndex,
	totalQuestions,
	zoom = 100,
	onZoomChange,
	viewMode = 'smart',
	onViewModeChange,
}: QuestionHeaderProps) {
	const router = useRouter();

	return (
		<header className="px-6 pt-8 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
			<div className="flex flex-col justify-between mb-4 gap-3">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="text-lg font-bold text-foreground">
							{paper.subject} {paper.paper}
						</h1>
						<p className="text-xs text-muted-foreground">
							{paper.month} {paper.year} • {paper.marks} marks
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{onViewModeChange && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onViewModeChange(viewMode === 'smart' ? 'original' : 'smart')}
							className="gap-2 h-8 px-3 text-xs font-bold  tracking-wider text-brand-blue bg-brand-blue/5 rounded-xl border border-brand-blue/10"
						>
							<HugeiconsIcon icon={File01Icon} className="w-3.5 h-3.5" />
							{viewMode === 'smart' ? 'Marked View' : 'Original PDF'}
						</Button>
					)}

					{onZoomChange && (
						<div className="flex gap-1 border-l border-border pl-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => onZoomChange(Math.max(50, zoom - 10))}
							>
								<HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
							</Button>
							<span className="text-sm font-medium w-12 text-center flex items-center justify-center">
								{zoom}%
							</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => onZoomChange(Math.min(200, zoom + 10))}
							>
								<HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
							</Button>
						</div>
					)}
				</div>
			</div>

			{totalQuestions > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							Question {currentQuestionIndex + 1} of {totalQuestions}
						</span>
						<span>{Math.round(progress)}%</span>
					</div>
					<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-brand-blue transition-all duration-500"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}
		</header>
	);
}
