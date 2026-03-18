import { ArrowLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CharacterList } from '@/components/SetworkLibrary/CharacterList';
import { QuoteCard } from '@/components/SetworkLibrary/QuoteCard';
import { ThemeCard } from '@/components/SetworkLibrary/ThemeCard';
import { Card } from '@/components/ui/card';
import { getSetworkById } from '@/data/setworks';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function SetworkDetailPage({ params }: PageProps) {
	const { id } = await params;
	const setwork = getSetworkById(id);

	if (!setwork) {
		notFound();
	}

	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<Link
					href="/setwork-library"
					className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
				>
					<HugeiconsIcon icon={ArrowLeftIcon} className="w-4 h-4" />
					Back to Library
				</Link>
				<h1 className="text-2xl font-black">{setwork.title}</h1>
				<p className="text-muted-foreground">
					{setwork.author} ({setwork.year})
				</p>
			</header>

			<main className="flex-1 p-6 overflow-y-auto space-y-8">
				<section>
					<h2 className="font-bold text-lg mb-3">Synopsis</h2>
					<Card className="p-4">
						<p>{setwork.synopsis}</p>
					</Card>
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3">Historical & Cultural Context</h2>
					<Card className="p-4">
						<p>{setwork.context}</p>
					</Card>
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3">Characters</h2>
					<CharacterList characters={setwork.characters} />
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3">Themes</h2>
					<div className="grid gap-4">
						{setwork.themes.map((theme) => (
							<ThemeCard key={theme.id} theme={theme} />
						))}
					</div>
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3">Key Quotes</h2>
					<div className="space-y-3">
						{setwork.quotes.map((quote) => (
							<QuoteCard key={quote.id} quote={quote} />
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
