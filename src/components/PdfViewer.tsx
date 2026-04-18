'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { toast } from 'sonner';
import { FlashcardModal } from '@/components/AI/FlashcardModal';
import { PdfSelectionBubble } from '@/components/PdfViewer/PdfSelectionBubble';
import { PdfSidebar } from '@/components/PdfViewer/PdfSidebar';
import { PdfToolbar } from '@/components/PdfViewer/PdfToolbar';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePdfViewer } from '@/hooks/usePdfViewer';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
	url: string;
	onClose?: () => void;
	title?: string;
}

export default function PdfViewer({ url, onClose, title }: PdfViewerProps) {
	const {
		containerRef,
		numPages,
		setNumPages,
		pageNumber,
		setPageNumber,
		scale,
		setScale,
		rotation,
		isDarkMode,
		mounted,
		searchQuery,
		setSearchQuery,
		showSearch,
		setShowSearch,
		showNotes,
		setShowNotes,
		highlights,
		selectedText,
		setSelectedText,
		isFullscreen,
		toggleFullscreen,
		containerWidth,
		goToPrevPage,
		goToNextPage,
		handleZoomIn,
		handleZoomOut,
		handleRotate,
		toggleTheme,
		addHighlight,
		addNote,
		deleteHighlight,
		handleTextSelection,
		currentPageHighlights,
	} = usePdfViewer(onClose);

	const [showFlashcardModal, setShowFlashcardModal] = useState(false);
	const [extractedFlashcards, setExtractedFlashcards] = useState<
		{ id: string; front: string; back: string; tags: string[] }[]
	>([]);

	const handleExtractFlashcards = async (content: string) => {
		if (!content.trim()) return;

		const toastId = toast.loading('Extracting flashcards...');
		try {
			const response = await fetch('/api/ai-tutor/flashcards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: content,
					context: 'Generate flashcards from selected PDF content',
				}),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.flashcards && data.flashcards.length > 0) {
					setExtractedFlashcards(
						data.flashcards.map((card: { front: string; back: string }, i: number) => ({
							id: `extracted-${Date.now()}-${i}`,
							front: card.front,
							back: card.back,
							tags: ['pdf-extracted'],
						}))
					);
					toast.success(`Generated ${data.flashcards.length} flashcards!`, { id: toastId });
					setShowFlashcardModal(true);
				} else {
					toast.error('No flashcards could be generated from this content', { id: toastId });
				}
			} else {
				toast.error('Failed to generate flashcards', { id: toastId });
			}
		} catch (error) {
			console.debug('Error extracting flashcards:', error);
			toast.error('Failed to extract flashcards', { id: toastId });
		}
	};

	return (
		<LazyMotion features={domAnimation}>
			<section
				ref={containerRef}
				className="flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-500 relative bg-background/50 text-foreground"
				aria-label="PDF Document Viewer"
				suppressHydrationWarning
			>
				<BackgroundMesh variant="subtle" />

				<PdfToolbar
					title={title}
					pageNumber={pageNumber}
					numPages={numPages}
					setPageNumber={setPageNumber}
					goToPrevPage={goToPrevPage}
					goToNextPage={goToNextPage}
					scale={scale}
					handleZoomIn={handleZoomIn}
					handleZoomOut={handleZoomOut}
					resetZoom={() => setScale(1)}
					handleRotate={handleRotate}
					toggleFullscreen={toggleFullscreen}
					isFullscreen={isFullscreen}
					showSearch={showSearch}
					setShowSearch={setShowSearch}
					showNotes={showNotes}
					setShowNotes={setShowNotes}
					isDarkMode={isDarkMode}
					toggleTheme={toggleTheme}
					url={url}
					onClose={onClose}
				/>

				{/* Floating Search Bar */}
				<AnimatePresence>
					{showSearch && (
						<m.div
							initial={{ opacity: 0, y: -20, x: '-50%' }}
							animate={{ opacity: 1, y: 0, x: '-50%' }}
							exit={{ opacity: 0, y: -20, x: '-50%' }}
							className="absolute top-20 left-1/2 z-40 w-full max-w-md px-4"
						>
							<div className="premium-glass p-2 rounded-2xl flex items-center gap-2 shadow-soft-lg border border-white/20 dark:border-zinc-800/50">
								<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 text-muted-foreground ml-2" />
								<Input
									type="text"
									placeholder="Find in document..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-9 bg-transparent border-none focus-visible:ring-0 font-medium"
									aria-label="Search query"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
									onClick={() => setShowSearch(false)}
									aria-label="Close search"
								>
									<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
								</Button>
							</div>
						</m.div>
					)}
				</AnimatePresence>

				{/* Main Content Area */}
				<div className="flex flex-1 overflow-hidden relative">
					<main
						className="flex-1 overflow-hidden bg-muted/30 dark:bg-muted/10 relative grid place-items-center"
						aria-label="PDF Content"
					>
						<ScrollArea className="h-full w-full overflow-y-auto">
							<div
								className="min-h-full flex items-center justify-center p-4 md:p-8 lg:p-12"
								onMouseUp={handleTextSelection}
								role="document"
							>
								<TransformWrapper
									initialScale={1}
									minScale={0.5}
									maxScale={5}
									centerOnInit
									wheel={{ step: 0.1 }}
									doubleClick={{ disabled: false }}
									panning={{ velocityDisabled: false }}
								>
									{() => (
										<TransformComponent
											wrapperClass="!w-full !h-full"
											contentClass={cn(
												'transition-transform duration-200 ease-out will-change-transform',
												mounted &&
													isDarkMode &&
													'invert-[0.9] brightness-90 contrast-125 hue-rotate-180'
											)}
										>
											<div
												className="relative rounded-md overflow-hidden bg-white"
												style={{
													transform: `rotate(${rotation}deg)`,
													transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
												}}
											>
												<Document
													file={url}
													onLoadSuccess={({ numPages }) => setNumPages(numPages)}
													loading={
														<div className="flex flex-col items-center justify-center p-20 gap-6 min-h-[600px] w-full max-w-[800px]">
															<div className="relative">
																<div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent" />
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="h-8 w-8 bg-brand-blue/20 rounded-full animate-pulse" />
																</div>
															</div>
															<p className="text-sm font-black text-muted-foreground animate-pulse  tracking-[0.2em]">
																Preparing View...
															</p>
														</div>
													}
													error={
														<div className="flex flex-col items-center justify-center p-20 text-center gap-6 min-h-[600px]">
															<div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center shadow-inner">
																<HugeiconsIcon
																	icon={Cancel01Icon}
																	className="w-10 h-10 text-red-500"
																/>
															</div>
															<div className="space-y-2">
																<h3 className="font-bold text-xl">Unable to load PDF</h3>
																<p className="text-sm text-muted-foreground max-w-xs">
																	There was an error fetching the document. Please check your
																	connection.
																</p>
															</div>
															<Button
																variant="default"
																className="bg-brand-blue hover:bg-brand-blue/90 rounded-full px-8 transition-transform hover:scale-105 active:scale-95 shadow-lg"
																onClick={() => window.location.reload()}
															>
																Retry Now
															</Button>
														</div>
													}
												>
													<Page
														pageNumber={pageNumber}
														scale={
															scale *
															(containerWidth > 1280
																? 1.6
																: containerWidth > 1024
																	? 1.4
																	: containerWidth > 768
																		? 1.1
																		: 0.75)
														}
														renderTextLayer={true}
														renderAnnotationLayer={true}
														className="pdf-page transition-opacity duration-500"
													/>
												</Document>

												{/* Highlights Visualization */}
												{currentPageHighlights.map((highlight) => (
													<div
														key={highlight.id}
														className="absolute pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-opacity"
														style={{
															backgroundColor: highlight.color,
															opacity: 0.35,
															inset: 0,
														}}
													/>
												))}
											</div>
										</TransformComponent>
									)}
								</TransformWrapper>
							</div>
						</ScrollArea>

						<PdfSelectionBubble
							selectedText={selectedText}
							setSelectedText={setSelectedText}
							addHighlight={addHighlight}
							onExtract={handleExtractFlashcards}
						/>
					</main>

					<PdfSidebar
						showNotes={showNotes}
						setShowNotes={setShowNotes}
						highlights={highlights}
						deleteHighlight={deleteHighlight}
						addNote={addNote}
					/>
				</div>
			</section>

			<FlashcardModal
				open={showFlashcardModal}
				onOpenChange={setShowFlashcardModal}
				flashcards={extractedFlashcards}
			/>
		</LazyMotion>
	);
}
