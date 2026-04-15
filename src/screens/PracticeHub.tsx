'use client';

import {
	ArrowRight01Icon,
	File01Icon,
	FilterIcon,
	Layers01Icon,
	QuestionIcon,
	Search01Icon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePastPapers } from '@/hooks/usePastPapers';

const PastPapersBrowser = dynamic(
	() => import('@/components/PastPapers/PastPapersList').then((mod) => mod.PastPapersBrowser),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const QuizPreview = dynamic(
	() => import('@/components/Quiz/QuizList').then((mod) => mod.default || mod),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const FlashcardsPreview = dynamic(
	() => import('@/components/Flashcards/FlashcardDeckList').then((mod) => mod.default || mod),
	{
		ssr: false,
		loading: () => <div className="h-96 animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

type PracticeView = 'papers' | 'quizzes' | 'flashcards';

export default function PracticeHub() {
	const router = useRouter();
	const [currentView, setCurrentView] = useState<PracticeView>('papers');
	const [searchQuery, setSearchQuery] = useState('');

	const { filterState, filterDispatch, activeFilterCount } = usePastPapers();

	return (
		<div className="flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
			{/* Header */}
			<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
				<div className="space-y-1">
					<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
						practice lab
					</h1>
					<p className="text-muted-foreground font-medium text-sm">
						sharpen your skills with exam-level resources.
					</p>
				</div>

				<div className="mt-8 flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<HugeiconsIcon
							icon={Search01Icon}
							className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
						/>
						<Input
							placeholder="search papers, quizzes, or topics..."
							className="pl-11 h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						{currentView === 'papers' && (
							<Button
								variant={filterState.bookmarkedOnly ? 'default' : 'outline'}
								className={`h-12 px-4 rounded-2xl gap-2 ${
									filterState.bookmarkedOnly
										? 'bg-brand-orange text-white'
										: 'bg-card border-border/50'
								}`}
								onClick={() => filterDispatch({ type: 'TOGGLE_BOOKMARKED' })}
							>
								<HugeiconsIcon icon={StarIcon} className="w-4 h-4" />
								<span className="hidden sm:inline font-bold">bookmarks</span>
							</Button>
						)}
						<Button
							variant="outline"
							className="h-12 w-12 sm:w-auto px-4 rounded-2xl gap-2 bg-card border-border/50"
						>
							<HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
							<span className="hidden sm:inline font-bold">filters</span>
							{activeFilterCount > 0 && (
								<span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
									{activeFilterCount}
								</span>
							)}
						</Button>
					</div>
				</div>

				{/* View Switcher */}
				<div className="flex p-1 bg-muted/50 rounded-full w-fit mt-8 border border-border/50">
					{[
						{ id: 'papers', label: 'past papers', icon: File01Icon },
						{ id: 'quizzes', label: 'quizzes', icon: QuestionIcon },
						{ id: 'flashcards', label: 'flashcards', icon: Layers01Icon },
					].map((view) => (
						<Button
							key={view.id}
							variant="ghost"
							onClick={() => setCurrentView(view.id as PracticeView)}
							className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
								currentView === view.id
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<HugeiconsIcon icon={view.icon} className="w-3.5 h-3.5" />
							{view.label}
						</Button>
					))}
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4">
					{currentView === 'papers' && <PastPapersBrowser searchQuery={searchQuery} />}
					{currentView === 'quizzes' && <QuizPreview searchQuery={searchQuery} />}
					{currentView === 'flashcards' && <FlashcardsPreview searchQuery={searchQuery} />}

					{/* Quick Actions / Tips */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pb-32">
						<Card
							className="p-6 rounded-[2rem] bg-brand-navy border-none text-white space-y-4 group cursor-pointer hover:scale-[1.02] transition-transform"
							onClick={() => router.push('/exam-timer')}
						>
							<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
								<HugeiconsIcon icon={File01Icon} className="w-6 h-6 text-brand-orange" />
							</div>
							<div className="space-y-1">
								<h3 className="text-lg font-black tracking-tight">exam timer</h3>
								<p className="text-white/60 text-xs font-medium">
									simulate real exam conditions with our countdown timer.
								</p>
							</div>
							<div className="flex items-center gap-2 text-brand-orange font-bold text-xs uppercase tracking-widest pt-2">
								launch timer{' '}
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="w-3 h-3 transition-transform group-hover:translate-x-1"
								/>
							</div>
						</Card>

						<Card
							className="p-6 rounded-[2rem] bg-muted/20 border-border/50 space-y-4 group cursor-pointer hover:scale-[1.02] transition-transform"
							onClick={() => router.push('/snap-and-solve')}
						>
							<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
								<HugeiconsIcon icon={Search01Icon} className="w-6 h-6 text-primary" />
							</div>
							<div className="space-y-1">
								<h3 className="text-lg font-black tracking-tight">snap & solve</h3>
								<p className="text-muted-foreground text-xs font-medium">
									take a photo of any tough question and get a step-by-step solution instantly.
								</p>
							</div>
							<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest pt-2">
								open camera{' '}
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="w-3 h-3 transition-transform group-hover:translate-x-1"
								/>
							</div>
						</Card>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
