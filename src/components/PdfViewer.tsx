'use client';

import {
	ChevronLeft,
	ChevronRight,
	Download,
	Highlighter,
	Maximize2,
	Minimize2,
	Moon,
	Search,
	StickyNote,
	Sun,
	X,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}

const HIGHLIGHT_COLORS = [
	{ name: 'Yellow', value: '#FEF08A' },
	{ name: 'Green', value: '#BBF7D0' },
	{ name: 'Blue', value: '#BFDBFE' },
	{ name: 'Pink', value: '#FBCFE8' },
	{ name: 'Orange', value: '#FED7AA' },
];

export default function PdfViewer({ url, onClose }: PdfViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1);
	const [isDarkMode, setIsDarkMode] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [showNotes, setShowNotes] = useState(false);
	const [highlights, setHighlights] = useState<Highlight[]>([]);
	const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
	const [selectedText, setSelectedText] = useState('');
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [containerWidth, setContainerWidth] = useState(0);

	// Handle responsive container
	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.offsetWidth);
			}
		};

		updateWidth();
		window.addEventListener('resize', updateWidth);
		return () => window.removeEventListener('resize', updateWidth);
	}, []);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
	};

	const goToPrevPage = () => {
		setPageNumber((prev) => Math.max(prev - 1, 1));
	};

	const goToNextPage = () => {
		setPageNumber((prev) => Math.min(prev + 1, numPages));
	};

	const handleZoomIn = () => {
		setScale((prev) => Math.min(prev + 0.25, 3));
	};

	const handleZoomOut = () => {
		setScale((prev) => Math.max(prev - 0.25, 0.5));
	};

	const toggleTheme = () => {
		setIsDarkMode((prev) => !prev);
	};

	const toggleFullscreen = async () => {
		if (!document.fullscreenElement) {
			await containerRef.current?.requestFullscreen();
			setIsFullscreen(true);
		} else {
			await document.exitFullscreen();
			setIsFullscreen(false);
		}
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
	};

	const addNote = (highlightId: string, note: string) => {
		setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)));
	};

	const deleteHighlight = (id: string) => {
		setHighlights((prev) => prev.filter((h) => h.id !== id));
	};

	const currentPageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);

	return (
		<div
			ref={containerRef}
			className={`flex flex-col h-[100dvh] w-screen overflow-hidden ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}
		>
			{/* Top Toolbar */}
			<div
				className={`shrink-0 flex items-center justify-between px-4 py-2 border-b ${
					isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
				}`}
			>
				<div className="flex items-center gap-2">
					{/* Page Navigation */}
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={goToPrevPage}
							disabled={pageNumber <= 1}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<span className="text-sm font-medium min-w-15 text-center">
							{pageNumber} / {numPages}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={goToNextPage}
							disabled={pageNumber >= numPages}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>

					<div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />

					{/* Zoom Controls */}
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
							<ZoomOut className="w-4 h-4" />
						</Button>
						<span className="text-sm font-medium min-w-12.5 text-center">
							{Math.round(scale * 100)}%
						</span>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
							<ZoomIn className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-1">
					{/* Search */}
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setShowSearch(!showSearch)}
					>
						<Search className="w-4 h-4" />
					</Button>

					{/* Theme Toggle */}
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
						{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
					</Button>

					{/* Fullscreen */}
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
						{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
					</Button>

					{/* Notes */}
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setShowNotes(!showNotes)}
					>
						<StickyNote className="w-4 h-4" />
					</Button>

					{/* Download */}
					<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
						<a href={url} download target="_blank" rel="noopener noreferrer" aria-label="Download">
							<Download className="w-4 h-4" />
						</a>
					</Button>

					{/* Close */}
					{onClose && (
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Search Bar */}
			{showSearch && (
				<div
					className={`px-4 py-2 border-b ${
						isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
					}`}
				>
					<div className="flex items-center gap-2 max-w-md">
						<Input
							type="text"
							placeholder="Search in document..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-8"
						/>
						{searchQuery && (
							<Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* PDF Content */}
				<ScrollArea className="flex-1 flex flex-col">
					<div
						className="flex justify-center p-4 min-h-full grow"
						onMouseUp={handleTextSelection}
						role="document"
					>
						<TransformWrapper
							initialScale={1}
							minScale={0.5}
							maxScale={3}
							centerOnInit
							disabled={false}
						>
							<TransformComponent
								wrapperClass="!w-full h-full"
								contentClass={`${isDarkMode ? 'invert' : ''}`}
							>
								<div className="relative h-full shadow-2xl rounded-lg overflow-hidden">
									<Document
										file={url}
										onLoadSuccess={onDocumentLoadSuccess}
										loading={
											<div className="flex items-center justify-center p-12">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
											</div>
										}
										error={
											<div className="flex items-center justify-center p-12">
												<p className="text-red-500">Failed to load PDF</p>
											</div>
										}
									>
										<Page
											pageNumber={pageNumber}
											scale={scale * (containerWidth > 768 ? 1.2 : 0.9)}
											renderTextLayer={true}
											renderAnnotationLayer={true}
											className="pdf-page"
										/>
									</Document>

									{/* Highlights Overlay */}
									{currentPageHighlights.map((highlight) => (
										<div
											key={highlight.id}
											className="absolute pointer-events-none"
											style={{
												backgroundColor: highlight.color,
												opacity: 0.4,
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
											}}
										/>
									))}
								</div>
							</TransformComponent>
						</TransformWrapper>
					</div>
				</ScrollArea>

				{/* Notes Sidebar */}
				{showNotes && (
					<div
						className={`w-80 border-l shrink-0 ${
							isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
						}`}
					>
						<div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
							<h3 className="font-bold">Notes & Highlights</h3>
						</div>

						<ScrollArea className="h-[calc(100%-60px)]">
							<div className="p-4 space-y-4">
								{/* Add Highlight Section */}
								{selectedText && (
									<div className="space-y-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
										<p className="text-sm font-medium line-clamp-2">"{selectedText}"</p>
										<div className="flex flex-wrap gap-1">
											{HIGHLIGHT_COLORS.map((color) => (
												<button
													type="button"
													aria-label="Set selected color"
													key={color.value}
													onClick={() => setSelectedColor(color.value)}
													className={`w-6 h-6 rounded-full border-2 ${
														selectedColor === color.value
															? 'border-zinc-900 dark:border-white'
															: 'border-transparent'
													}`}
													style={{ backgroundColor: color.value }}
												/>
											))}
										</div>
										<Button size="sm" className="w-full" onClick={addHighlight}>
											<Highlighter className="w-4 h-4 mr-2" />
											Save Highlight
										</Button>
									</div>
								)}

								{/* Highlights List */}
								{highlights.length > 0 ? (
									<div className="space-y-3">
										{highlights.map((highlight) => (
											<div
												key={highlight.id}
												className="p-3 rounded-lg"
												style={{ backgroundColor: `${highlight.color}40` }}
											>
												<div className="flex items-start justify-between gap-2">
													<p className="text-sm line-clamp-3">{highlight.text}</p>
													<button
														type="button"
														onClick={() => deleteHighlight(highlight.id)}
														className="shrink-0"
														aria-label="Delete highlight"
													>
														<X className="w-4 h-4 text-zinc-500" />
													</button>
												</div>
												<div className="mt-2 text-xs text-zinc-500">
													Page {highlight.pageNumber}
												</div>
												{highlight.note && (
													<div className="mt-2 p-2 bg-white dark:bg-zinc-950 rounded text-sm">
														{highlight.note}
													</div>
												)}
												<Button
													variant="ghost"
													size="sm"
													className="mt-2 w-full"
													onClick={() => {
														const note = prompt('Add a note:');
														if (note) addNote(highlight.id, note);
													}}
												>
													<StickyNote className="w-4 h-4 mr-2" />
													{highlight.note ? 'Edit Note' : 'Add Note'}
												</Button>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-zinc-500 text-center py-4">
										Select text in the PDF to create highlights
									</p>
								)}
							</div>
						</ScrollArea>
					</div>
				)}
			</div>

			{/* Mobile Bottom Toolbar */}
			<div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 bg-white dark:bg-zinc-900">
				<div className="flex items-center justify-between">
					<Button variant="ghost" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
						<ChevronLeft className="w-4 h-4 mr-1" />
						Prev
					</Button>
					<span className="text-sm font-medium">
						{pageNumber} / {numPages}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={goToNextPage}
						disabled={pageNumber >= numPages}
					>
						Next
						<ChevronRight className="w-4 h-4 ml-1" />
					</Button>
				</div>
			</div>
		</div>
	);
}
