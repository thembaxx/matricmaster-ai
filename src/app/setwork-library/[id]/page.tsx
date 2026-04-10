import {
	ArrowLeftIcon,
	BookOpenIcon,
	CoinsIcon,
	FlashIcon,
	QuotesIcon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CharacterList } from '@/components/SetworkLibrary/CharacterList';
import { CharacterMap } from '@/components/SetworkLibrary/CharacterMap';
import { QuoteCard } from '@/components/SetworkLibrary/QuoteCard';
import { ThemeCard } from '@/components/SetworkLibrary/ThemeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSetworkById } from '@/content/setworks';

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
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black">{setwork.title}</h1>
						<p className="text-muted-foreground">
							{setwork.author} ({setwork.year}) ·{' '}
							<span className="capitalize">{setwork.genre}</span> · {setwork.targetLevel}
						</p>
					</div>
					<div className="flex gap-2">
						<Link href={`/setwork-library/quiz?setwork=${setwork.id}`} transitionTypes={['fade']}>
							<Button variant="secondary" size="sm" className="gap-1.5">
								<HugeiconsIcon icon={FlashIcon} className="w-3.5 h-3.5" />
								Quiz
							</Button>
						</Link>
						<Link href={'/setwork-library/essays'} transitionTypes={['fade']}>
							<Button size="sm" className="gap-1.5">
								<HugeiconsIcon icon={BookOpenIcon} className="w-3.5 h-3.5" />
								Study
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-1 p-6 pb-40 overflow-y-auto space-y-8 font-literature">
				<section>
					<h2 className="font-bold text-lg mb-3">Synopsis</h2>
					<Card className="p-4">
						<p className="text-muted-foreground">{setwork.synopsis}</p>
					</Card>
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3">Historical & Cultural Context</h2>
					<Card className="p-4">
						<p className="text-muted-foreground">{setwork.context}</p>
					</Card>
				</section>

				<Tabs defaultValue="map" className="w-full">
					<TabsList>
						<TabsTrigger value="map" className="gap-1.5">
							<HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5" />
							Character Map
						</TabsTrigger>
						<TabsTrigger value="list" className="gap-1.5">
							<HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5" />
							Character List
						</TabsTrigger>
					</TabsList>
					<TabsContent value="map">
						<Card className="p-6">
							<CharacterMap characters={setwork.characters} />
						</Card>
					</TabsContent>
					<TabsContent value="list">
						<CharacterList characters={setwork.characters} />
					</TabsContent>
				</Tabs>

				<section>
					<h2 className="font-bold text-lg mb-3 flex items-center gap-2">
						<HugeiconsIcon icon={CoinsIcon} className="w-5 h-5 text-primary" />
						Themes
					</h2>
					<div className="grid gap-4">
						{setwork.themes.map((theme) => (
							<ThemeCard key={theme.id} theme={theme} />
						))}
					</div>
				</section>

				<section>
					<h2 className="font-bold text-lg mb-3 flex items-center gap-2">
						<HugeiconsIcon icon={QuotesIcon} className="w-5 h-5 text-primary" />
						Key Quotes
					</h2>
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
