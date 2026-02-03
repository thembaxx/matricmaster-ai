import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

interface SearchProps {
	onNavigate: (s: Screen) => void;
}

export default function Search({ onNavigate: _ }: SearchProps) {
	const [query, setQuery] = useState('');

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<div className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20">
				<h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Search</h1>
				<div className="relative">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search for topics, questions..."
						className="pl-10 bg-zinc-100 dark:bg-zinc-800 border-none h-12 rounded-2xl"
					/>
				</div>
			</div>

			<ScrollArea className="flex-1 px-6">
				<div className="py-6 text-center text-zinc-500">
					<p>Start typing to search...</p>
				</div>
			</ScrollArea>
		</div>
	);
}
