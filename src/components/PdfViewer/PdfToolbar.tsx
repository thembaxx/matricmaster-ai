'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Cancel01Icon,
	Download01Icon,
	MaximizeIcon,
	MinimizeIcon,
	MoonIcon,
	Note01Icon,
	Refresh01Icon,
	Search01Icon,
	Sun01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PdfToolbarProps {
	title?: string;
	pageNumber: number;
	numPages: number;
	setPageNumber: (page: number) => void;
	goToPrevPage: () => void;
	goToNextPage: () => void;
	scale: number;
	handleZoomIn: () => void;
	handleZoomOut: () => void;
	resetZoom: () => void;
	handleRotate: () => void;
	toggleFullscreen: () => void;
	isFullscreen: boolean;
	showSearch: boolean;
	setShowSearch: (show: boolean) => void;
	showNotes: boolean;
	setShowNotes: (show: boolean) => void;
	isDarkMode: boolean;
	toggleTheme: () => void;
	url: string;
	onClose?: () => void;
}

export function PdfToolbar({
	title,
	pageNumber,
	numPages,
	setPageNumber,
	goToPrevPage,
	goToNextPage,
	scale,
	handleZoomIn,
	handleZoomOut,
	resetZoom,
	handleRotate,
	toggleFullscreen,
	isFullscreen,
	showSearch,
	setShowSearch,
	showNotes,
	setShowNotes,
	isDarkMode,
	toggleTheme,
	url,
	onClose,
}: PdfToolbarProps) {
	return (
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
							className="text-[10px] font-black  tracking-widest text-brand-blue"
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

				<div className="flex items-center bg-muted rounded-full p-1 border border-border shadow-inner">
					<Button
						variant="ghost"
						size="icon"
						className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
						onClick={goToPrevPage}
						disabled={pageNumber <= 1}
						aria-label="Previous page"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
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
						<span className="text-xs font-medium text-muted-foreground">/ {numPages}</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
						onClick={goToNextPage}
						disabled={pageNumber >= numPages}
						aria-label="Next page"
					>
						<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
					</Button>
				</div>
			</div>

			{/* Middle: Zoom Controls */}
			<div className="hidden md:flex items-center gap-2 bg-muted rounded-full p-1 border border-border shadow-inner">
				<Button
					variant="ghost"
					size="icon"
					className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
					onClick={handleZoomOut}
					aria-label="Zoom out"
				>
					<HugeiconsIcon icon={Search01Icon} className="w-5 h-5" />
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
					<HugeiconsIcon icon={Search01Icon} className="w-5 h-5" />
				</Button>
				<div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" aria-hidden="true" />
				<Button
					variant="ghost"
					size="icon"
					className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
					onClick={resetZoom}
					title="Reset zoom"
					aria-label="Reset zoom to 100%"
				>
					<HugeiconsIcon icon={Refresh01Icon} className="w-5 h-5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
					onClick={handleRotate}
					title="Rotate 90deg"
					aria-label="Rotate document clockwise"
				>
					<HugeiconsIcon icon={Refresh01Icon} className="w-5 h-5 rotate-90" />
				</Button>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1 bg-muted rounded-full p-1 border border-border shadow-inner">
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
						aria-label="Search in document"
						aria-expanded={showSearch}
					>
						<HugeiconsIcon icon={Search01Icon} className="w-5 h-5" />
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
						<HugeiconsIcon icon={Note01Icon} className="w-5 h-5" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
						onClick={toggleTheme}
						aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{isDarkMode ? (
							<HugeiconsIcon icon={Sun01Icon} className="w-5 h-5 text-yellow-500" />
						) : (
							<HugeiconsIcon
								icon={MoonIcon}
								className="w-5 h-5 text-zinc-600 dark:text-muted-foreground"
							/>
						)}
					</Button>
				</div>

				<div className="hidden sm:flex items-center gap-1 bg-muted rounded-full p-1 border border-border shadow-inner">
					<Button
						variant="ghost"
						size="icon"
						className="h-11 w-11 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-blue"
						onClick={toggleFullscreen}
						aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
					>
						{isFullscreen ? (
							<HugeiconsIcon icon={MinimizeIcon} className="w-5 h-5" />
						) : (
							<HugeiconsIcon icon={MaximizeIcon} className="w-5 h-5" />
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
							aria-label="Download PDF"
						>
							<HugeiconsIcon icon={Download01Icon} className="w-5 h-5" />
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
						<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
					</Button>
				)}
			</div>
		</header>
	);
}
