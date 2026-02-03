import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SearchProps {
	onNavigate: (s: Screen) => void;
}

export default function Search({ onNavigate: _ }: SearchProps) {
	const [query, setQuery] = useState('');

	return (
		<div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-lexend">
			<div className="px-6 pt-12 pb-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="max-w-2xl mx-auto w-full">
					<h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-6">Search</h1>
					<div className="relative">
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Topics, questions, past papers..."
							className="pl-12 bg-zinc-100 dark:bg-zinc-800 border-none h-14 rounded-2xl text-base font-medium focus-visible:ring-2 focus-visible:ring-brand-blue"
						/>
					</div>
				</div>
			</div>

			<ScrollArea className="flex-1 px-6">
				<div className="max-w-2xl mx-auto w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
					<div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center">
						<Sparkles className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
					</div>
					<div className="space-y-1">
						<h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">
							Ready to Explore
						</h3>
						<p className="text-zinc-400 font-bold">Start typing to find your next lesson</p>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
