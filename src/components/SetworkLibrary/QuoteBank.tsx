'use client';

import { BookOpenIcon, CopyIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { Quote, Setwork } from '@/content/setworks/types';

interface QuoteBankProps {
	setworks: Setwork[];
}

export function QuoteBank({ setworks }: QuoteBankProps) {
	const [search, setSearch] = useState('');
	const [setworkFilter, setSetworkFilter] = useState('all');
	const [themeFilter, setThemeFilter] = useState('all');

	const allThemes = new Map<string, string>();
	for (const sw of setworks) {
		for (const theme of sw.themes) {
			allThemes.set(theme.id, theme.name);
		}
	}

	const allQuotes: (Quote & { setworkId: string; setworkTitle: string })[] = [];
	for (const sw of setworks) {
		for (const quote of sw.quotes) {
			allQuotes.push({
				...quote,
				setworkId: sw.id,
				setworkTitle: sw.title,
			});
		}
	}

	const filtered = allQuotes.filter((q) => {
		const matchesSearch =
			search === '' ||
			q.text.toLowerCase().includes(search.toLowerCase()) ||
			q.speaker.toLowerCase().includes(search.toLowerCase()) ||
			q.context.toLowerCase().includes(search.toLowerCase());
		const matchesSetwork = setworkFilter === 'all' || q.setworkId === setworkFilter;
		const matchesTheme = themeFilter === 'all' || q.themeIds.includes(themeFilter);
		return matchesSearch && matchesSetwork && matchesTheme;
	});

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success('Quote copied to clipboard');
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
					/>
					<Input
						placeholder="Search quotes..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={setworkFilter} onValueChange={setSetworkFilter}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Filter by work" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All setworks</SelectItem>
						{setworks.map((s) => (
							<SelectItem key={s.id} value={s.id}>
								{s.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={themeFilter} onValueChange={setThemeFilter}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Filter by theme" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All themes</SelectItem>
						{[...allThemes.entries()].map(([id, name]) => (
							<SelectItem key={id} value={id}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<p className="text-xs text-muted-foreground">
				{filtered.length} quote{filtered.length !== 1 ? 's' : ''} found
			</p>

			<div className="space-y-3">
				{filtered.map((quote) => (
					<Card key={`${quote.setworkId}-${quote.id}`} className="p-4">
						<div className="flex gap-3">
							<p className="flex-1">
								<span className="font-medium italic">"{quote.text}"</span>
							</p>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => handleCopy(quote.text)}
								className="shrink-0 p-1.5 rounded-md hover:bg-secondary"
								title="Copy quote"
							>
								<HugeiconsIcon icon={CopyIcon} className="w-4 h-4" />
							</Button>
						</div>
						<div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
							<span className="text-muted-foreground">— {quote.speaker}</span>
							<span className="text-muted-foreground">·</span>
							<span className="text-muted-foreground flex items-center gap-1">
								<HugeiconsIcon icon={BookOpenIcon} className="w-3 h-3" />
								{quote.setworkTitle}
							</span>
						</div>
						<p className="mt-1.5 text-xs text-muted-foreground">{quote.context}</p>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{quote.themeIds.map((tid) => (
								<span
									key={tid}
									className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
								>
									{allThemes.get(tid) || tid}
								</span>
							))}
						</div>
					</Card>
				))}
				{filtered.length === 0 && (
					<p className="text-center text-muted-foreground py-8">No quotes match your filters.</p>
				)}
			</div>
		</div>
	);
}
