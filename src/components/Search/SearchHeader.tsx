'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchHeaderProps {
	query: string;
	onQueryChange: (q: string) => void;
}

export const SearchHeader = memo(function SearchHeader({
	query,
	onQueryChange,
}: SearchHeaderProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === '/' &&
				document.activeElement?.tagName !== 'INPUT' &&
				document.activeElement?.tagName !== 'TEXTAREA'
			) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<div className="space-y-1">
			<m.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="relative mt-6"
			>
				<SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
				<Input
					ref={inputRef}
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="What are you looking for?"
					className="pl-14 pr-14 bg-muted/30 h-16 rounded-[1.5rem] border-2 text-lg font-bold focus:ring-primary/20"
					aria-label="Search topics, questions, and past papers"
				/>
				<AnimatePresence>
					{!query && !isFocused && (
						<m.div
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1.5"
						>
							<span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
								Press
							</span>
							<kbd className="h-6 min-w-[24px] px-1.5 rounded-md border-2 border-muted-foreground/20 flex items-center justify-center bg-muted/50 text-[10px] font-black text-muted-foreground shadow-sm">
								/
							</kbd>
						</m.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{query && (
						<m.button
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							title="Clear search"
							aria-label="Clear search"
							type="button"
							onClick={() => onQueryChange('')}
							className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							<X className="w-6 h-6" />
						</m.button>
					)}
				</AnimatePresence>
			</m.div>
		</div>
	);
});
