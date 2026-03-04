'use client';

import {
	ArrowLeft,
	Bookmark,
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	Loader2,
	Sparkles,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PAST_PAPERS } from '@/constants/mock-data';
import { useQuestionExtractor } from '@/hooks/useQuestionExtractor';
import { getPastPaperByIdAction } from '@/lib/db/actions';
import { getExplanation } from '@/services/geminiService';

// Lazy load PdfViewer to avoid SSR issues
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full">
			<Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
		</div>
	),
});

export default function PastPaperViewer({
	initialId,
	initialMode,
}: {
	initialId?: string;
	initialMode?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const paperId = initialId || searchParams.get('id');
	const mode = initialMode || searchParams.get('mode');

	const [zoom, setZoom] = useState(100);
	const [activeTab, setActiveTab] = useState('questions');
	const [rotation, setRotation] = useState(0);
	const [isSaved, setIsSaved] = useState(false);
	const [paper, setPaper] = useState<any>(PAST_PAPERS[0]);
	const [showAiExplanation, setShowAiExplanation] = useState(false);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const [showPdfFallback, setShowPdfFallback] = useState(mode === 'read');

	const {
		extractedPaper,
		currentQuestion,
		currentQuestionIndex,
		isLoading,
		error,
		hasMoreQuestions,
		hasPreviousQuestions,
		totalQuestions,
		extractQuestions,
		nextQuestion,
		previousQuestion,
		goToQuestion,
	} = useQuestionExtractor();

	// Find paper data
	useEffect(() => {
		const loadPaper = async () => {
			if (!paperId) return;

			// Try DB first
			try {
				const dbPaper = await getPastPaperByIdAction(paperId);
				if (dbPaper) {
					const paperData = {
						id: dbPaper.id,
						paperId: dbPaper.paperId,
						subject: dbPaper.subject,
						paper: dbPaper.paper,
						year: dbPaper.year,
						month: dbPaper.month,
						marks: dbPaper.totalMarks || 0,
						downloadUrl: dbPaper.storedPdfUrl || dbPaper.originalPdfUrl,
					};
					setPaper(paperData);
					if (mode !== 'read') {
						extractQuestions(
							paperData.paperId,
							paperData.downloadUrl,
							paperData.subject,
							paperData.paper,
							paperData.year,
							paperData.month
						);
					}
					return;
				}
			} catch (err) {
				console.error('Failed to load paper from DB:', err);
			}

			// Fallback to mock data
			const found = PAST_PAPERS.find((p) => p.id === paperId);
			if (found) {
				setPaper(found);
				if (mode !== 'read') {
					extractQuestions(
						found.id,
						found.downloadUrl,
						found.subject,
						found.paper,
						found.year,
						found.month
					);
				}
			}
		};

		loadPaper();
	}, [paperId, extractQuestions, mode]);

	const handleDownload = () => {
		window.open(paper.downloadUrl, '_blank');
	};

	const handleRotate = () => {
		setRotation((r) => (r + 90) % 360);
	};

	const handleSave = () => {
		setIsSaved(!isSaved);
	};

	const handleConvertToInteractive = () => {
		router.push(`/interactive-quiz?id=${paper.id}`);
	};

	const handleExplainQuestion = useCallback(async () => {
		if (!currentQuestion) return;
		setIsExplaining(true);
		setShowAiExplanation(true);
		try {
			const explanation = await getExplanation(paper.subject, currentQuestion.questionText);
			setAiExplanation(
				explanation ?? "I'm sorry, I couldn't generate an explanation for this question."
			);
		} catch (err) {
			console.error('Failed to get AI explanation:', err);
			setAiExplanation('Sorry, I could not generate an explanation right now.');
		} finally {
			setIsExplaining(false);
		}
	}, [currentQuestion, paper.subject]);

	const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

	// Render loading state
	if (isLoading && !extractedPaper) {
		return (
			<div className="flex flex-col h-full bg-background relative grow overflow-hidden">
				<div className="flex-1 flex flex-col items-center justify-center p-6">
					<div className="text-center space-y-4">
						<Loader2 className="w-12 h-12 animate-spin text-brand-blue mx-auto" />
						<div className="space-y-2">
							<h3 className="font-bold text-zinc-900 dark:text-white">Extracting Questions...</h3>
							<p className="text-sm text-zinc-500">Using AI to parse the exam paper</p>
						</div>
						<div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-brand-blue animate-pulse rounded-full"
								style={{ width: '60%' }}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Render PDF fallback viewer - full screen mode
	if (showPdfFallback) {
		return (
			<div className="fixed inset-0 z-[200] bg-background overflow-hidden animate-in fade-in duration-300">
				<PdfViewer
					url={paper.downloadUrl}
					title={`${paper.subject} ${paper.paper} (${paper.year})`}
					onClose={() => setShowPdfFallback(false)}
				/>
			</div>
		);
	}

	// Render error state
	if (error && !extractedPaper) {
		return (
			<div className="flex flex-col h-full bg-background relative">
				<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon" onClick={() => router.back()}>
								<ArrowLeft className="w-5 h-5" />
							</Button>
							<h1 className="text-lg font-bold text-zinc-900 dark:text-white">
								{paper.subject} {paper.paper}
							</h1>
						</div>
					</div>
				</header>
				<div className="flex-1 flex flex-col items-center justify-center p-6">
					<div className="text-center space-y-4 max-w-sm">
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
							<Sparkles className="w-8 h-8 text-red-500" />
						</div>
						<div className="space-y-2">
							<h3 className="font-bold text-zinc-900 dark:text-white">Extraction Failed</h3>
							<p className="text-sm text-zinc-500">{error}</p>
						</div>
						<div className="flex flex-col gap-2">
							<Button
								className="bg-brand-blue text-white"
								onClick={() =>
									extractQuestions(
										paper.id,
										paper.downloadUrl,
										paper.subject,
										paper.paper,
										paper.year,
										paper.month
									)
								}
							>
								Try Again
							</Button>
							<Button variant="outline" onClick={() => setShowPdfFallback(true)} className="gap-2">
								<FileText className="w-4 h-4" />
								View Original PDF
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background relative">
			{/* Header */}
			<header className="px-6 pt-8 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
				<div className="flex flex-col items-center justify-between mb-4 gap-3">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.back()}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div>
							<h1 className="text-lg font-bold text-zinc-900 dark:text-white">
								{paper.subject} {paper.paper}
							</h1>
							<p className="text-xs text-zinc-500">
								{paper.month} {paper.year} • {paper.marks} marks
							</p>
						</div>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setZoom((z) => Math.max(50, z - 10))}
						>
							<ZoomOut className="w-4 h-4" />
						</Button>
						<span className="text-sm font-medium w-12 text-center flex items-center justify-center">
							{zoom}%
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setZoom((z) => Math.min(200, z + 10))}
						>
							<ZoomIn className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate}>
							<Download className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
							<Bookmark className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
							<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-brand-blue' : ''}`} />
						</Button>
					</div>
				</div>

				{/* Progress Bar */}
				{totalQuestions > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs text-zinc-500">
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

			<div className="grow overflow-hidden">
				<main
					className="px-6 py-6 mobile-safe-bottom transition-transform duration-300"
					style={{
						transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
						transformOrigin: 'top center',
						// minHeight: '100vh',
					}}
				>
					{/* Instructions */}
					{extractedPaper?.instructions && (
						<Card className="p-6 mb-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem]">
							<h3 className="font-bold text-zinc-900 dark:text-white mb-3 text-sm">
								INSTRUCTIONS AND INFORMATION
							</h3>
							<p className="text-xs text-muted-foreground whitespace-pre-wrap">
								{extractedPaper.instructions}
							</p>
						</Card>
					)}

					{/* Question Navigation - Jump to Question */}
					{totalQuestions > 0 && (
						<div className="mb-6">
							<h3 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest mb-3 px-1">
								Jump to Question
							</h3>
							<div className="flex flex-wrap gap-2">
								{extractedPaper?.questions.map((q, idx) => (
									<button
										type="button"
										key={q.id}
										onClick={() => goToQuestion(idx)}
										className={`w-10 h-10 p-0 rounded-xl font-bold border-2 transition-all ${
											currentQuestionIndex === idx
												? 'border-brand-blue bg-brand-blue text-white'
												: 'border-zinc-200 dark:border-zinc-700 text-muted-foreground hover:border-brand-blue'
										}`}
									>
										{q.questionNumber}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Current Question Display */}
					{currentQuestion && (
						<Card className="p-6 rounded-[2rem] border-none shadow-sm bg-card relative overflow-hidden">
							<div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
								<Image
									src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"
									alt="Paper texture"
									fill
									sizes="(max-width: 768px) 100vw, 800px"
									className="object-cover"
								/>
							</div>

							{/* Question Header */}
							<div className="flex flex-col gap-3 items-start mb-6 relative z-10">
								<Badge className="bg-brand-blue text-white rounded-lg px-3 py-1.5 text-[10px]">
									QUESTION {currentQuestion.questionNumber}
								</Badge>
								<div className="flex items-center gap-3">
									{currentQuestion.topic && (
										<Badge variant="outline" className="rounded-full text-xs dark:bg-zinc-900">
											{currentQuestion.topic}
										</Badge>
									)}
									<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
										({currentQuestion.marks} marks)
									</span>
								</div>
							</div>

							{/* Main Question Text */}
							<div className="space-y-4 text-zinc-800 dark:text-zinc-200 font-medium relative z-10">
								<p className="text-lg leading-relaxed">{currentQuestion.questionText}</p>

								{/* Sub-questions */}
								{currentQuestion.subQuestions && currentQuestion.subQuestions.length > 0 && (
									<div className="space-y-4 ml-2 mt-6 pt-4 border-t border-border">
										{currentQuestion.subQuestions.map((sq) => (
											<div key={sq.id} className="space-y-2">
												<p className="font-semibold text-sm dark:text-zinc-300 text-pretty">
													{sq.id}. {sq.text}
													{sq.marks && (
														<span className="text-xs text-zinc-400 ml-2">({sq.marks} marks)</span>
													)}
												</p>
											</div>
										))}
									</div>
								)}
							</div>

							{/* AI Explain Button */}
							<div className="mt-8 pt-6 border-t border-border relative z-10">
								<Button
									variant="outline"
									className="w-full border-brand-blue/20 hover:bg-brand-blue/5 text-sm"
									onClick={handleExplainQuestion}
									disabled={isExplaining}
								>
									{isExplaining ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<Sparkles className="w-4 h-4 mr-2 text-brand-blue" />
									)}
									{isExplaining ? 'Getting Explanation...' : 'Explain This Question'}
								</Button>

								{/* AI Explanation Display */}
								{showAiExplanation && aiExplanation && (
									<div className="mt-4 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
										<div className="flex items-center gap-2 mb-2">
											<Sparkles className="w-4 h-4 text-brand-blue" />
											<span className="text-sm font-bold text-brand-blue">AI Explanation</span>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
											{aiExplanation}
										</p>
									</div>
								)}
							</div>
						</Card>
					)}

					{/* Conversion Banner */}
					<Card
						className="p-6 mt-6 bg-brand-blue/5 w-full border-brand-blue/20 rounded-[2rem] flex flex-col gap-3 group cursor-pointer hover:bg-brand-blue/10 transition-colors"
						onClick={handleConvertToInteractive}
					>
						<div className="flex flex-col gap-4">
							<div>
								<h4 className="font-bold text-zinc-900 dark:text-zinc-300">
									Convert to Interactive
								</h4>
								<p className="text-xs font-semibold text-zinc-500">
									Practice this paper with AI-powered feedback
								</p>
							</div>
						</div>
						<Button
							size="sm"
							className="bg-brand-blue text-white rounded-xl font-black text-[11px] uppercase tracking-wider"
						>
							<Sparkles className="w-6 h-6" />
							Start Quiz
						</Button>
					</Card>
				</main>
			</div>

			{/* Pagination Footer */}
			{extractedPaper && totalQuestions > 0 && (
				<footer className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-8 z-30">
					<div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
						<Button
							variant="outline"
							size="sm"
							disabled={!hasPreviousQuestions}
							onClick={previousQuestion}
							className="gap-2"
						>
							<ChevronLeft className="w-4 h-4" />
							Previous
						</Button>

						<div className="flex items-center gap-2">
							{/* Show first few and last few pages with ellipsis */}
							{Array.from({ length: totalQuestions }, (_, i) => i)
								.filter((i) => {
									// Show first 3, last 3, and around current
									if (i < 3 || i >= totalQuestions - 3) return true;
									if (Math.abs(i - currentQuestionIndex) <= 1) return true;
									return false;
								})
								.map((i, _, arr) => {
									const showEllipsis =
										i > 0 && !arr.includes(i - 1) && !(Math.abs(i - currentQuestionIndex) <= 1);
									return (
										<>
											{showEllipsis && (
												<span key={`ellipsis-${i}`} className="text-zinc-400">
													...
												</span>
											)}
											<button
												type="button"
												key={i}
												onClick={() => goToQuestion(i)}
												className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
													currentQuestionIndex === i
														? 'bg-brand-blue text-white'
														: 'bg-muted text-muted-foreground hover:bg-brand-blue/10'
												}`}
											>
												{i + 1}
											</button>
										</>
									);
								})}
						</div>

						<Button
							variant="outline"
							size="sm"
							disabled={!hasMoreQuestions}
							onClick={nextQuestion}
							className="gap-2"
						>
							Next
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</footer>
			)}

			{/* Bottom Toolbar (for tabs) */}
			<div className="px-6 relative rounded-2xl absolute bottom-0 mb-32 left-0 right-0">
				<nav className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-border px-4 py-4">
					<div className="flex justify-around items-center">
						{[
							{ id: 'questions', label: 'Questions' },
							{ id: 'formulae', label: 'Formulae' },
							{ id: 'saved', label: 'Saved' },
							{ id: 'profile', label: 'Profile' },
						].map((item) => (
							<button
								type="button"
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={`flex flex-col items-center gap-1 transition-all duration-300 ${
									activeTab === item.id ? 'text-brand-blue scale-110' : 'text-zinc-400'
								}`}
							>
								<span
									className={`text-[10px] font-black uppercase tracking-wider ${
										activeTab === item.id ? 'text-brand-blue' : ''
									}`}
								>
									{item.label}
								</span>
							</button>
						))}
					</div>
				</nav>
			</div>
		</div>
	);
}
