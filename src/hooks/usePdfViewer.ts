'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export interface Highlight {
	id: string;
	pageNumber: number;
	text: string;
	color: string;
	rects: { x: number; y: number; width: number; height: number }[];
	note?: string;
	createdAt: Date;
}

export const HIGHLIGHT_COLORS = [
	{ name: 'Yellow', value: '#FEF08A' },
	{ name: 'Green', value: '#BBF7D0' },
	{ name: 'Blue', value: '#BFDBFE' },
	{ name: 'Pink', value: '#FBCFE8' },
	{ name: 'Orange', value: '#FED7AA' },
];

export function usePdfViewer(onClose?: () => void) {
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

	const handleZoomIn = useCallback(() => {
		setScale((prev) => Math.min(prev + 0.25, 4));
	}, []);

	const handleZoomOut = useCallback(() => {
		setScale((prev) => Math.max(prev - 0.25, 0.5));
	}, []);

	const handleRotate = useCallback(() => {
		setRotation((r) => (r + 90) % 360);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(isDarkMode ? 'light' : 'dark');
	}, [isDarkMode, setTheme]);

	const addHighlight = useCallback(
		(text: string, color: string) => {
			if (!text) return;

			const newHighlight: Highlight = {
				id: Date.now().toString(),
				pageNumber,
				text,
				color,
				rects: [],
				createdAt: new Date(),
			};

			setHighlights((prev) => [...prev, newHighlight]);
			setSelectedText('');
			setShowNotes(true);
		},
		[pageNumber]
	);

	const addNote = useCallback((highlightId: string, note: string) => {
		setHighlights((prev) => prev.map((h) => (h.id === highlightId ? { ...h, note } : h)));
	}, []);

	const deleteHighlight = useCallback((id: string) => {
		setHighlights((prev) => prev.filter((h) => h.id !== id));
	}, []);

	const handleTextSelection = useCallback(() => {
		const selection = window.getSelection();
		if (selection?.toString().trim()) {
			setSelectedText(selection.toString().trim());
		}
	}, []);

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

	const currentPageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);

	return {
		containerRef,
		numPages,
		setNumPages,
		pageNumber,
		setPageNumber,
		scale,
		setScale,
		rotation,
		setRotation,
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
	};
}
