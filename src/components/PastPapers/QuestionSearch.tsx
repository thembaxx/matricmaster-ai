'use client';

import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchResult {
	id: string;
	questionText: string;
	answerText: string | null;
	year: number;
	subject: string;
	paper: string | null;
	month: string | null;
	marks: number | null;
	questionNumber: number | null;
}

export function QuestionSearch() {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSearch = async () => {
		if (!query.trim()) return;

		setIsLoading(true);
		try {
			const response = await fetch('/api/past-paper/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			});

			const data = await response.json();
			setResults(data.results || []);
		} catch (error) {
			console.error('Search failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input
					placeholder="Find questions about... (e.g., Meiosis, Calculus)"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button onClick={handleSearch} disabled={isLoading}>
					<HugeiconsIcon icon={SearchIcon} className="w-4 h-4 mr-2" />
					Search
				</Button>
			</div>

			{results.length > 0 && (
				<div className="space-y-2">
					<h3 className="font-black text-sm">Found {results.length} questions</h3>

					{results.map((result) => (
						<Card key={result.id} className="p-4">
							<div className="flex justify-between items-start mb-2">
								<span className="text-xs font-black text-muted-foreground">
									{result.subject} {result.paper} - {result.month} {result.year}
									{result.questionNumber && ` Q${result.questionNumber}`}
								</span>
								{result.marks && (
									<span className="text-xs font-black text-primary">{result.marks} marks</span>
								)}
							</div>
							<p className="font-medium text-sm">{result.questionText}</p>
							{result.answerText && (
								<details className="mt-2">
									<summary className="text-xs cursor-pointer text-primary">Show answer</summary>
									<p className="text-xs text-muted-foreground mt-1">{result.answerText}</p>
								</details>
							)}
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
