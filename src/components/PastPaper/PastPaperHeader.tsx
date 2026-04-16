'use client';

import {
	ArrowLeft02Icon,
	Camera01Icon,
	CheckmarkCircle02Icon,
	Download01Icon,
	File01Icon,
	QuestionIcon,
	Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AIQuestionPopup } from '@/components/AIQuestionPopup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PastPaperHeaderProps {
	paper: any;
	viewMode: 'smart' | 'original';
	setViewMode: (
		mode: 'smart' | 'original' | ((prev: 'smart' | 'original') => 'smart' | 'original')
	) => void;
	zoom: number;
	setZoom: (zoom: number | ((prev: number) => number)) => void;
	onBack: () => void;
	progress: number;
	currentQuestionIndex: number;
	totalQuestions: number;
	isOfflineAvailable?: boolean;
	isDownloading?: boolean;
	onDownloadOffline?: () => void;
	onUploadScanned?: () => void;
	currentQuestionText?: string;
}

export function PastPaperHeader({
	paper,
	viewMode,
	setViewMode,
	zoom,
	setZoom,
	onBack,
	progress,
	currentQuestionIndex,
	totalQuestions,
	isOfflineAvailable = false,
	isDownloading = false,
	onDownloadOffline,
	onUploadScanned,
	currentQuestionText,
}: PastPaperHeaderProps) {
	return (
		<header className="px-6 pt-8 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
			<div className="flex flex-col justify-between mb-4 gap-3">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
					</Button>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<h1 className="text-lg font-bold text-foreground">
								{paper.subject} {paper.paper}
							</h1>
							{isOfflineAvailable && (
								<Badge
									variant="secondary"
									className="bg-green-500/10 text-green-600 gap-1 h-5 px-2"
								>
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3" />
									Offline
								</Badge>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{paper.month} {paper.year} • {paper.marks} marks
						</p>
					</div>
					{onDownloadOffline && (
						<Button
							variant="outline"
							size="sm"
							onClick={onDownloadOffline}
							disabled={isOfflineAvailable || isDownloading}
							className="h-8 gap-1.5"
						>
							<HugeiconsIcon
								icon={isOfflineAvailable ? CheckmarkCircle02Icon : Download01Icon}
								className="w-4 h-4"
							/>
							{isDownloading ? 'Saving...' : isOfflineAvailable ? 'Saved' : 'Save Offline'}
						</Button>
					)}
					{onUploadScanned && (
						<Button variant="outline" size="sm" onClick={onUploadScanned} className="h-8 gap-1.5">
							<HugeiconsIcon icon={Camera01Icon} className="w-4 h-4" />
							upload scanned
						</Button>
					)}
					<AIQuestionPopup
						paperId={paper.id}
						questionText={currentQuestionText}
						subject={paper.subject}
						paper={paper.paper}
						year={paper.year}
						month={paper.month}
					>
						<Button
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 bg-primary/5 border-primary/10"
						>
							<HugeiconsIcon icon={QuestionIcon} className="w-4 h-4" />
							Ask AI
						</Button>
					</AIQuestionPopup>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setViewMode((v) => (v === 'smart' ? 'original' : 'smart'))}
						className="gap-2 h-8 px-3 text-xs font-bold  tracking-wider text-brand-blue bg-brand-blue/5 rounded-xl border border-brand-blue/10"
					>
						<HugeiconsIcon icon={File01Icon} className="w-3.5 h-3.5" />
						{viewMode === 'smart' ? 'Marked View' : 'Original PDF'}
					</Button>

					<div className="flex gap-1 border-l border-border pl-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setZoom((z) => Math.max(50, z - 10))}
							aria-label="Zoom out"
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
							onClick={() => setZoom((z) => Math.min(200, z + 10))}
							aria-label="Zoom in"
						>
							<HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
						</Button>
					</div>
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
