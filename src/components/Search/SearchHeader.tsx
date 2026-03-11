'use client';

import { Search01Icon as SearchIcon, Cancel01Icon as X } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
		<div className="space-y-4">
			<m.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="relative"
			>
				<SearchIcon size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 stroke-[3px]" />
				<Input
					ref={inputRef}
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="Find knowledge..."
					className="pl-16 pr-16 bg-muted/10 h-20 rounded-[2.5rem] border-none text-xl font-bold placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/5 transition-all"
					aria-label="Search topics, questions, and past papers"
				/>
				<AnimatePresence>
					{!query && !isFocused && (
						<m.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-3"
						>
							<span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
								Press
							</span>
							<kbd className="h-10 min-w-[40px] px-3 rounded-xl border-none flex items-center justify-center bg-white dark:bg-zinc-900 text-sm font-black text-primary shadow-lg">
								/
							</kbd>
						</m.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{query && (
						<Tooltip>
							<TooltipTrigger asChild>
								<m.button
									initial={{ scale: 0.5, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.5, opacity: 0 }}
									aria-label="Clear search"
									type="button"
									onClick={() => onQueryChange('')}
									className="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 bg-muted/10 hover:bg-tiimo-pink hover:text-white rounded-xl transition-all flex items-center justify-center"
								>
									<X size={20} className="stroke-[3px]" />
								</m.button>
							</TooltipTrigger>
							<TooltipContent className="rounded-xl border-none shadow-xl font-black text-xs uppercase tracking-widest">Clear search</TooltipContent>
						</Tooltip>
					)}
				</AnimatePresence>
			</m.div>
		</div>
	);
});
