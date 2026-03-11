'use client';

import {
	ActivityIcon,
	Add01Icon,
	BookmarkIcon,
	CalculatorIcon as Calculator,
	FlashIcon as Lightning,
	MicroscopeIcon as Microscope,
	AnalyticsUpIcon as TrendUp,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth-client';
import { deleteBookmarkAction, getBookmarksAction } from '@/lib/db/bookmark-actions';
import type { Bookmark as BookmarkType } from '@/lib/db/schema';

// Icon mapping based on bookmark type
const getIconForType = (type: string) => {
	switch (type) {
		case 'math':
		case 'question':
			return Calculator;
		case 'physics':
		case 'past_paper':
			return Lightning;
		case 'life_sciences':
		case 'study_note':
			return Microscope;
		default:
			return TrendUp;
	}
};

const getColorForSubject = (subject: string) => {
	const lower = subject.toLowerCase();
	if (lower.includes('math')) return { color: 'text-blue-500', bg: 'bg-blue-100' };
	if (lower.includes('physics')) return { color: 'text-purple-500', bg: 'bg-purple-100' };
	if (lower.includes('life') || lower.includes('bio'))
		return { color: 'text-green-500', bg: 'bg-green-100' };
	return { color: 'text-orange-500', bg: 'bg-orange-100' };
};

export default function Bookmarks() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [activeTab, setActiveTab] = useState('all');
	const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadBookmarks = async () => {
			if (session?.user?.id) {
				setIsLoading(true);
				const data = await getBookmarksAction();
				setBookmarks(data);
				setIsLoading(false);
			} else {
				setIsLoading(false);
			}
		};
		if (!isPending) {
			loadBookmarks();
		}
	}, [session?.user?.id, isPending]);

	const handleDelete = async (e: React.MouseEvent, bookmarkId: string) => {
		e.stopPropagation();
		if (!session?.user?.id) return;

		const result = await deleteBookmarkAction(bookmarkId);
		if (result.success) {
			setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
			toast.success('Bookmark removed');
		} else {
			toast.error('Failed to remove bookmark');
		}
	};

	const filteredBookmarks =
		activeTab === 'all'
			? bookmarks
			: bookmarks.filter((b) => b.bookmarkType.toLowerCase().includes(activeTab.toLowerCase()));

	// Show placeholder when not logged in
	if (!session) {
		return (
			<div className="flex flex-col h-full bg-background">
				<header className="px-6 pt-12 pb-2 bg-card shrink-0">
					<h1 className="text-3xl font-bold mb-1">Bookmarks</h1>
					<p className="text-sm text-muted-foreground mb-6">Your saved revision questions</p>
				</header>
				<ScrollArea className="flex-1">
					<main className="px-6 py-6 pb-40">
						<div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
							<div className="w-32 h-32 bg-muted rounded-[2.5rem] flex items-center justify-center">
								<HugeiconsIcon icon={BookmarkIcon} className="w-16 h-16 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">Sign in to view bookmarks</h3>
								<p className="text-sm text-muted-foreground max-w-60 mx-auto">
									FloppyDisk difficult questions or important concepts to review them later.
								</p>
							</div>
							<Button onClick={() => router.push('/sign-in')} className="rounded-full px-8">
								Sign In
							</Button>
						</div>
					</main>
				</ScrollArea>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
			{/* Header */}
			<header className="px-6 pt-16 pb-8 shrink-0 max-w-4xl mx-auto w-full">
				<div className="space-y-4 mb-8">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
							<span className="text-xl">🔖</span>
						</div>
						<span className="text-sm font-black uppercase tracking-[0.2em] text-primary">Saved</span>
					</div>
					<h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Your <br />Favorites</h1>
				</div>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="w-full h-16 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] border-none shadow-inner">
						{[
							{ id: 'all', label: 'All' },
							{ id: 'question', label: 'Questions' },
							{ id: 'past_paper', label: 'Papers' },
							{ id: 'study_note', label: 'Notes' },
						].map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="flex-1 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all duration-500"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-40">
					{isLoading ? (
						<div className="flex items-center justify-center py-24">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : filteredBookmarks.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
							{filteredBookmarks.map((bookmark) => {
								const Icon = getIconForType(bookmark.bookmarkType);
								const colors = getColorForSubject(bookmark.bookmarkType);
								return (
									<div
										key={bookmark.id}
										className="p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer rounded-[3rem] bg-zinc-100 dark:bg-zinc-900 border-none flex flex-col h-72 relative group tiimo-block tiimo-block-hover"
										onClick={() =>
											router.push(
												`/${bookmark.bookmarkType === 'past_paper' ? 'past-paper' : 'quiz'}?id=${bookmark.referenceId}`
											)
										}
									>
										<button
											type="button"
											onClick={(e) => handleDelete(e, bookmark.id)}
											className="absolute top-6 right-6 p-3 bg-white dark:bg-zinc-800 text-red-500 shadow-lg rounded-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
											title="Remove bookmark"
											aria-label="Remove bookmark"
										>
											<HugeiconsIcon icon={BookmarkIcon} className="w-5 h-5 fill-current" />
										</button>

										<div className="flex items-start gap-4 mb-6">
											<div
												className={`w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center`}
											>
												<HugeiconsIcon icon={Icon} className={`w-8 h-8 ${colors.color}`} variant="solid" />
											</div>
											<div className="pt-2">
												<p
													className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-1`}
												>
													{bookmark.bookmarkType}
												</p>
												<h3 className="text-xl font-black tracking-tighter uppercase leading-none">
													{bookmark.referenceId}
												</h3>
											</div>
										</div>

										{/* Content Preview */}
										<div className="flex-1 bg-white/50 dark:bg-zinc-800/50 rounded-2xl mb-4 flex items-center justify-center p-4 border border-border/50">
											{bookmark.note ? (
												<span className="text-sm font-bold text-muted-foreground line-clamp-3">
													{bookmark.note}
												</span>
											) : (
												<div className="text-muted-foreground/30">
													<HugeiconsIcon icon={ActivityIcon} className="w-10 h-10" />
												</div>
											)}
										</div>

										<div className="flex justify-between items-center px-2">
											<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
												{bookmark.createdAt
													? new Date(bookmark.createdAt).toLocaleDateString()
													: 'Recently Added'}
											</p>
											<div className="h-2 w-2 rounded-full bg-primary" />
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
							<div className="w-32 h-32 bg-muted rounded-[2.5rem] flex items-center justify-center">
								<HugeiconsIcon icon={BookmarkIcon} className="w-16 h-16 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">Nothing saved yet</h3>
								<p className="text-sm text-muted-foreground max-w-60 mx-auto">
									FloppyDisk difficult questions or important concepts to review them later.
								</p>
							</div>
							<Button onClick={() => router.push('/quiz')} className="rounded-full px-8">
								<HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
								Browse Questions
							</Button>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
