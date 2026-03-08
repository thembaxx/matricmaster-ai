'use client';

import {
	ArrowClockwise,
	CaretLeft,
	CaretRight,
	CornersIn,
	CornersOut,
	DownloadSimple,
	Highlighter,
	MagnifyingGlass,
	MagnifyingGlassMinus,
	MagnifyingGlassPlus,
	Moon,
	Note,
	Sparkle,
	Sun,
	TextT,
	X,
} from '@phosphor-icons/react';
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Highlight {
	id: string;
	pageNumber: number;
	text: string;
	color: string;
	rects: { x: number; y: number; width: number; height: number }[];
	note?: string;
	createdAt: Date;
}

interface PdfViewerProps {
	url: string;
	onClose?: () => void;
	title?: string;
}

const HIGHLIGHT_COLORS = [
	{ name: 'Yellow', value: '#FEF08A' },
	{ name: 'Green', value: '#BBF7D0' },
	{ name: 'Blue', value: '#BFDBFE' },
	{ name: 'Pink', value: '#FBCFE8' },
	{ name: 'Orange', value: '#FED7AA' },
];

export default function PdfViewer({ url, onClose, title }: PdfViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1);
	const { theme, setTheme } = useThemeStore();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [showNotes, setShowNotes] = useState(false);
	const [highlights, setHighlights] = useState<Highlight[]>([]);
	const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
	const [selectedText, setSelectedText] = useState('');
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [containerWidth, setContainerWidth] = useState(0);
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle system theme changes
	useEffect(() => {
		if (!mounted) return;

		const updateTheme = () => {
			if (theme === 'system') {
				setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
			} else {
				setIsDarkMode(theme === 'dark');
			}
		};

		updateTheme();

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			if (theme === 'system') {
				setIsDarkMode(mediaQuery.matches);
			}
		};
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [theme, mounted]);

	// Handle responsive container
	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.offsetWidth);
			}
		};

		updateWidth();
		const resizeObserver = new ResizeObserver(updateWidth);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => resizeObserver.disconnect();
	}, []);

	const toggleFullscreen = useCallback(async () => {
		if (!document.fullscreenElement) {
			await containerRef.current?.requestFullscreen();
			setIsFullscreen(true);
		} else {
			await document.exitFullscreen();
			setIsFullscreen(false);
		}
	}, []);

	const goToPrevPage = useCallback(() => {
		setPageNumber((prev) => Math.max(prev - 1, 1));
	}, []);

	const goToNextPage = useCallback(() => {
		setPageNumber((prev) => Math.min(prev + 1, numPages));
	}, [numPages]);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			switch (e.key) {
				case 'ArrowRight':
				case 'n':
					setPageNumber((prev) => Math.min(prev + 1, numPages));
					break;
				case 'ArrowLeft':
				case 'p':
					setPageNumber((prev) => Math.max(prev - 1, 1));
					break;
				case '+':
				case '=':
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						setScale((prev) => Math.min(prev + 0.2, 4));
					}
					break;
				case '-':
				case '_':
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						setScale((prev) => Math.max(prev - 0.2, 0.5));
					}
					break;
				case 'f':
					toggleFullscreen();
					break;
				case 'Escape':
					if (isFullscreen) toggleFullscreen();
					else if (onClose) onClose();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [numPages, isFullscreen, onClose, toggleFullscreen]);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
	};

	const handleZoomIn = () => {
		setScale((prev) => Math.min(prev + 0.25, 4));
	};

	const handleZoomOut = () => {
		setScale((prev) => Math.max(prev - 0.25, 0.5));
	};

	const toggleTheme = () => {
		setTheme(isDarkMode ? 'light' : 'dark');
	};

	const handleRotate = () => {
		setRotation((r) => (r + 90) % 360);
	};

	const handleTextSelection = () => {
		const selection = window.getSelection();
		if (selection?.toString().trim()) {
			setSelectedText(selection.toString().trim());
		}
	};

	const addHighlight = () => {
		if (!selectedText) return;

		const newHighlight: Highlight = {
			id: Date.now().toString(),
			pageNumber,
			text: selectedText,
			color: selectedColor,
			rects: [],
			createdAt: new Date(),
		};

		setHighlights((prev) => [...prev, newHighlight]);
		setSelectedText('');
		setShowNotes(true);
	};

	const addNote = (highlightId: string, note: string) => {
		setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)));
	};

	const deleteHighlight = (id: string) => {
		setHighlights((prev) => prev.filter((h) => h.id !== id));
	};

	const currentPageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);

	return (
		<LazyMotion features={domAnimation}>
			<section
				ref={containerRef}
				className="flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-500 relative bg-background/50 text-foreground"
				aria-label="PDF Document Viewer"
			>
				<BackgroundMesh variant="subtle" />
				{/* Professional Toolbar */}
				<header
					className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/50 premium-glass sticky top-0 z-30 transition-all duration-300 shadow-sm"
					role="toolbar"
					aria-label="PDF Viewer Controls"
				>
					{/* Left: Branding & Page Nav */}
					<div className="flex items-center gap-4 md:gap-6">
						{title && (
							<div className="hidden lg:flex flex-col">
								<m.span
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									className="text-[10px] font-black uppercase tracking-widest text-brand-blue"
								>
									Document
								</m.span>
								<m.h2
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.1 }}
									className="text-sm font-bold truncate max-w-[200px]"
								>
									{title}
								</m.h2>
							</div>
						)}

						<div className="flex items-center bg-muted rounded-full p-1 border border-zinc-200 dark:border-zinc-700 shadow-inner">
							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
								onClick={goToPrevPage}
								disabled={pageNumber <= 1}
								aria-label="Previous page"
							>
								<CaretLeft className="w-5 h-5" />
							</Button>
							<div className="px-2 md:px-3 flex items-center gap-1 min-w-[70px] md:min-w-[80px] justify-center">
								<Input
									type="number"
									value={pageNumber}
									onChange={(e) => {
										const val = Number.parseInt(e.target.value, 10);
										if (val >= 1 && val <= numPages) setPageNumber(val);
									}}
									className="w-8 md:w-10 h-7 p-0 text-center bg-transparent border-none font-bold text-sm focus-visible:ring-0 appearance-none"
									aria-label={`Current page: ${pageNumber}`}
								/>
								<span className="text-xs font-medium text-zinc-500">/ {numPages}</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
								onClick={goToNextPage}
								disabled={pageNumber >= numPages}
								aria-label="Next page"
							>
								<CaretRight className="w-5 h-5" />
							</Button>
						</div>
					</div>

					{/* Middle: Zoom Controls */}
					<div className="hidden md:flex items-center gap-2 bg-muted rounded-full p-1 border border-zinc-200 dark:border-zinc-700 shadow-inner">
						<Button
							variant="ghost"
							size="icon"
							className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
							onClick={handleZoomOut}
							aria-label="Zoom out"
						>
							<MagnifyingGlassMinus className="w-5 h-5" />
						</Button>
						<span
							className="text-xs font-bold min-w-[50px] text-center tabular-nums"
							aria-live="polite"
						>
							{Math.round(scale * 100)}%
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
							onClick={handleZoomIn}
							aria-label="Zoom in"
						>
							<MagnifyingGlassPlus className="w-5 h-5" />
						</Button>
						<div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" aria-hidden="true" />
						<Button
							variant="ghost"
							size="icon"
							className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
							onClick={() => setScale(1)}
							title="Reset zoom"
							aria-label="Reset zoom to 100%"
						>
							<ArrowClockwise className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
							onClick={handleRotate}
							title="Rotate 90deg"
							aria-label="Rotate document clockwise"
						>
							<ArrowClockwise className="w-5 h-5 rotate-90" />
						</Button>
					</div>
					{/* Right: Actions */}
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1 bg-muted rounded-full p-1 border border-zinc-200 dark:border-zinc-700 shadow-inner">
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									'h-11 w-11 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-brand-blue',
									showSearch
										? 'bg-white dark:bg-zinc-700 shadow-sm'
										: 'hover:bg-white dark:hover:bg-zinc-700'
								)}
								onClick={() => setShowSearch(!showSearch)}
								aria-label="MagnifyingGlass in document"
								aria-expanded={showSearch}
							>
								<MagnifyingGlass className="w-5 h-5" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className={cn(
									'h-11 w-11 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-brand-blue',
									showNotes
										? 'bg-white dark:bg-zinc-700 shadow-sm'
										: 'hover:bg-white dark:hover:bg-zinc-700'
								)}
								onClick={() => setShowNotes(!showNotes)}
								aria-label="Toggle annotations sidebar"
								aria-expanded={showNotes}
							>
								<Note className="w-5 h-5" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
								onClick={toggleTheme}
								aria-label={mounted && isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
							>
								{mounted && isDarkMode ? (
									<Sun className="w-5 h-5 text-yellow-500" />
								) : (
									<Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
								)}
							</Button>
						</div>

						<div className="hidden sm:flex items-center gap-1 bg-muted rounded-full p-1 border border-zinc-200 dark:border-zinc-700 shadow-inner">
							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
								onClick={toggleFullscreen}
								aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
							>
								{isFullscreen ? (
									<CornersIn className="w-5 h-5" />
								) : (
									<CornersOut className="w-5 h-5" />
								)}
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
								asChild
							>
								<a
									href={url}
									download
									target="_blank"
									rel="noopener noreferrer"
									aria-label="DownloadSimple PDF"
								>
									<DownloadSimple className="w-5 h-5" />
								</a>
							</Button>
						</div>

						{onClose && (
							<Button
								variant="ghost"
								size="icon"
								className="h-11 w-11 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all focus-visible:ring-2 focus-visible:ring-red-500"
								onClick={onClose}
								aria-label="Close viewer"
							>
								<X className="w-5 h-5" />
							</Button>
						)}
					</div>
				</header>

				{/* Floating MagnifyingGlass Bar */}
				<AnimatePresence>
					{showSearch && (
						<m.div
							initial={{ opacity: 0, y: -20, x: '-50%' }}
							animate={{ opacity: 1, y: 0, x: '-50%' }}
							exit={{ opacity: 0, y: -20, x: '-50%' }}
							className="absolute top-20 left-1/2 z-40 w-full max-w-md px-4"
						>
							<div className="premium-glass p-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20 dark:border-zinc-800/50">
								<MagnifyingGlass className="w-4 h-4 text-zinc-400 ml-2" />
								<Input
									type="text"
									placeholder="Find in document..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-9 bg-transparent border-none focus-visible:ring-0 font-medium"
									aria-label="MagnifyingGlass query"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
									onClick={() => setShowSearch(false)}
									aria-label="Close search"
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</m.div>
					)}
				</AnimatePresence>

				{/* Main Content Area */}
				<div className="flex flex-1 overflow-hidden relative">
					{/* PDF Render Container */}
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
									wheel={{ step: 0.1, smoothStep: 0.005 }}
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
												className="relative  rounded-md overflow-hidden bg-white"
												style={{
													transform: `rotate(${rotation}deg)`,
													transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
												}}
											>
												<Document
													file={url}
													onLoadSuccess={onDocumentLoadSuccess}
													loading={
														<div className="flex flex-col items-center justify-center p-20 gap-6 min-h-[600px] w-full max-w-[800px]">
															<div className="relative">
																<div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent" />
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="h-8 w-8 bg-brand-blue/20 rounded-full animate-pulse" />
																</div>
															</div>
															<p className="text-sm font-black text-zinc-500 animate-pulse uppercase tracking-[0.2em]">
																Preparing View...
															</p>
														</div>
													}
													error={
														<div className="flex flex-col items-center justify-center p-20 text-center gap-6 min-h-[600px]">
															<div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center shadow-inner">
																<X className="w-10 h-10 text-red-500" />
															</div>
															<div className="space-y-2">
																<h3 className="font-bold text-xl">Unable to load PDF</h3>
																<p className="text-sm text-zinc-500 max-w-xs">
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

						{/* Selection Action Bubble */}
						<AnimatePresence>
							{selectedText && (
								<m.div
									initial={{ opacity: 0, y: 20, x: '-50%' }}
									animate={{ opacity: 1, y: 0, x: '-50%' }}
									exit={{ opacity: 0, y: 20, x: '-50%' }}
									className="absolute bottom-12 left-1/2 z-50 px-4 w-full max-w-fit"
								>
									<div className="premium-glass p-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-brand-blue/20">
										<div className="px-3 py-1.5 bg-brand-blue/10 rounded-xl max-w-[180px] truncate border border-brand-blue/5">
											<span className="text-[11px] font-bold text-brand-blue italic">
												"{selectedText}"
											</span>
										</div>
										<div className="flex gap-1.5">
											{HIGHLIGHT_COLORS.map((color) => (
												<button
													type="button"
													key={color.value}
													onClick={() => {
														setSelectedColor(color.value);
														addHighlight();
													}}
													className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm transition-all hover:scale-125 active:scale-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
													style={{ backgroundColor: color.value }}
													aria-label={`Highlight with ${color.name}`}
												/>
											))}
										</div>
										<div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
											onClick={() => setSelectedText('')}
											aria-label="Cancel selection"
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</m.div>
							)}
						</AnimatePresence>
					</main>

					{/* Notes Sidebar - Premium Design */}
					<aside
						className={cn(
							'fixed md:relative inset-y-0 right-0 z-50 w-full md:w-[360px] border-l border-border/50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] premium-glass shadow-2xl md:shadow-none',
							showNotes ? 'translate-x-0' : 'translate-x-full'
						)}
						aria-label="Annotations Sidebar"
					>
						<div className="flex flex-col h-full">
							<header className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-transparent z-10">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
										<Note className="w-5 h-5 text-brand-blue" />
									</div>
									<div>
										<h3 className="font-bold tracking-tight text-lg">My Notes</h3>
										<p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
											{highlights.length} Annotations
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-10 w-10 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
									onClick={() => setShowNotes(false)}
									aria-label="Hide sidebar"
								>
									<X className="w-5 h-5" />
								</Button>
							</header>

							<ScrollArea className="flex-1 overflow-auto">
								<div className="p-6 space-y-6">
									{highlights.length > 0 ? (
										highlights.map((highlight) => (
											<div
												key={highlight.id}
												className="group relative p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl hover:border-brand-blue/30 bg-card/50"
												style={{ borderLeftWidth: '8px', borderLeftColor: highlight.color }}
											>
												<div className="flex items-start justify-between gap-4 mb-4">
													<span className="px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 border border-zinc-200 dark:border-zinc-700">
														Page {highlight.pageNumber}
													</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-9 w-9 md:h-8 md:w-8 rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 touch-manipulation"
														onClick={() => deleteHighlight(highlight.id)}
														aria-label="Backspace highlight"
													>
														<X className="w-4 h-4" />
													</Button>
												</div>

												<p className="text-sm font-medium leading-relaxed mb-4 text-zinc-700 dark:text-zinc-300 italic pl-2 border-l-2 border-border">
													"{highlight.text}"
												</p>

												<div className="space-y-4">
													{highlight.note ? (
														<div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border text-sm shadow-inner relative overflow-hidden">
															<div className="absolute top-0 right-0 p-1">
																<Highlighter className="w-3 h-3 text-zinc-300 opacity-50" />
															</div>
															<p className="text-muted-foreground leading-relaxed">
																{highlight.note}
															</p>
														</div>
													) : null}

													<Button
														variant="outline"
														size="sm"
														className="w-full rounded-2xl text-[11px] font-black uppercase tracking-widest gap-2 py-5 border-zinc-200 dark:border-zinc-800 hover:border-brand-blue hover:text-brand-blue transition-all group/btn"
														onClick={() => {
															const note = prompt('Add a note to this highlight:');
															if (note) addNote(highlight.id, note);
														}}
													>
														<TextT className="w-3 h-3 transition-transform group-hover/btn:scale-125" />
														{highlight.note ? 'Pencil My Note' : 'Add a Note'}
													</Button>
												</div>
											</div>
										))
									) : (
										<div className="py-24 flex flex-col items-center justify-center text-center px-4">
											<div className="relative mb-6">
												<div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center transform rotate-6 animate-pulse">
													<Highlighter className="w-10 h-10 text-zinc-300" />
												</div>
												<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-950">
													<Sparkle weight="bold" className="w-4 h-4 text-white" />
												</div>
											</div>
											<h4 className="font-black text-sm uppercase tracking-widest mb-3">
												No highlights yet
											</h4>
											<p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
												Select any text in the document to create a highlight and add notes.
											</p>
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					</aside>
				</div>

				<style>{`
				.pdf-page canvas {
					margin: 0 auto;
					max-width: 100%;
					height: auto !important;
					display: block;
				}
				.pdf-page .textLayer {
					opacity: 0.15;
					mix-blend-mode: multiply;
				}
				.dark .pdf-page .textLayer {
					mix-blend-mode: screen;
					opacity: 0.1;
				}
				.pdf-page .annotationLayer {
					display: none;
				}
				.premium-glass {
					background: rgba(255, 255, 255, 0.7);
					backdrop-filter: blur(20px) saturate(180%);
					-webkit-backdrop-filter: blur(20px) saturate(180%);
				}
				.dark .premium-glass {
					background: rgba(20, 20, 20, 0.7);
					backdrop-filter: blur(20px) saturate(180%);
					-webkit-backdrop-filter: blur(20px) saturate(180%);
				}
				@media (max-width: 768px) {
					.pdf-page canvas {
						width: 100% !important;
					}
				}
			`}</style>
			</section>
		</LazyMotion>
	);
}
