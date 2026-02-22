'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchHeaderProps {
	query: string;
	onQueryChange: (q: string) => void;
}

export function SearchHeader({ query, onQueryChange }: SearchHeaderProps) {
	return (
		<div className="space-y-1">
			<h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Search</h1>
			<p className="text-muted-foreground font-bold text-sm">
				Find topics, questions, and past papers
			</p>
			<m.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="relative mt-6"
			>
				<SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
				<Input
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="What are you looking for?"
					className="pl-14 bg-muted/30 h-16 rounded-[1.5rem] border-2 text-lg font-bold focus:ring-primary/20"
					aria-label="Search topics, questions, and past papers"
				/>
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
}
